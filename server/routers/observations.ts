import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { mediaAssets, observations, users } from "../../drizzle/schema";
import {
  BLACKWATERLEAF_CONTRACT_VERSION,
  createObservationInputSchema,
  evidenceStateSchema,
  observationMetricSchema,
  observationRealmSchema,
  visibilitySchema,
} from "../../shared/blackwaterleaf-contract-v1";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { awardXpIfReady, XP_REWARDS } from "../gamification";
import { storageGetSignedUrl, storagePut } from "../storage";
import { validateImageUpload } from "../uploadValidation";
import { canReadObservation, isResourceOwner } from "../accessPolicy";
import { hasCurrentConsent } from "../consents";
import { assertValidMediaContext } from "../mediaIntegrity";

async function requireDatabase() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "database_unavailable" });
  return db;
}

async function hasConsent(userId: number, purpose: "observation_publishing" | "media_processing") {
  const db = await requireDatabase();
  return hasCurrentConsent(db, userId, purpose);
}

async function serializeObservation(record: typeof observations.$inferSelect, canReadPrivate: boolean) {
  const db = await requireDatabase();
  const mediaRows = await db
    .select()
    .from(mediaAssets)
    .where(and(eq(mediaAssets.observationId, record.id), eq(mediaAssets.userId, record.userId)))
    .orderBy(desc(mediaAssets.createdAt));

  const media = await Promise.all(
    mediaRows.map(async item => ({
      id: String(item.id),
      ownerId: String(item.userId),
      kind: item.kind,
      mimeType: item.mimeType,
      byteSize: item.byteSize,
      width: item.width,
      height: item.height,
      accessUrl:
        canReadPrivate || item.visibility === "public"
          ? await storageGetSignedUrl(item.storageKey)
          : "",
      visibility: item.visibility,
      createdAt: item.createdAt.toISOString(),
    })),
  );

  return {
    contractVersion: BLACKWATERLEAF_CONTRACT_VERSION,
    id: String(record.id),
    clientId: record.clientId,
    ownerId: String(record.userId),
    realm: record.realm,
    subject: record.subject,
    scientificName: record.scientificName,
    note: record.note,
    metrics: observationMetricSchema.array().parse(record.metrics),
    media: media.filter(item => item.accessUrl),
    evidenceState: record.evidenceState,
    visibility: record.visibility,
    syncState: record.syncState,
    revision: record.revision,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export const observationsRouter = router({
  mine: protectedProcedure
    .input(z.object({ realm: observationRealmSchema.optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await requireDatabase();
      const condition = input?.realm
        ? and(eq(observations.userId, ctx.user.id), eq(observations.realm, input.realm))
        : eq(observations.userId, ctx.user.id);
      const rows = await db.select().from(observations).where(condition).orderBy(desc(observations.updatedAt));
      return Promise.all(rows.map(record => serializeObservation(record, true)));
    }),

  publicFeed: publicProcedure
    .input(z.object({ realm: observationRealmSchema.optional(), limit: z.number().int().min(1).max(50).default(20) }))
    .query(async ({ input }) => {
      const db = await requireDatabase();
      const conditions = [eq(observations.visibility, "public"), eq(users.status, "active")] as const;
      const rows = await db
        .select({ observation: observations })
        .from(observations)
        .innerJoin(users, eq(observations.userId, users.id))
        .where(
          input.realm
            ? and(conditions[0], conditions[1], eq(observations.realm, input.realm))
            : and(conditions[0], conditions[1]),
        )
        .orderBy(desc(observations.updatedAt))
        .limit(input.limit);
      return Promise.all(
        rows
          .filter(row =>
            canReadObservation({
              viewerId: null,
              ownerId: row.observation.userId,
              ownerStatus: "active",
              visibility: row.observation.visibility,
            }),
          )
          .map(row => serializeObservation(row.observation, false)),
      );
    }),

  create: protectedProcedure.input(createObservationInputSchema).mutation(async ({ ctx, input }) => {
    const db = await requireDatabase();
    const existing = await db
      .select()
      .from(observations)
      .where(and(eq(observations.userId, ctx.user.id), eq(observations.clientId, input.clientId)))
      .limit(1);
    if (existing[0]) return serializeObservation(existing[0], true);

    if (input.visibility === "public" && !(await hasConsent(ctx.user.id, "observation_publishing"))) {
      throw new TRPCError({ code: "PRECONDITION_FAILED", message: "observation_publishing_consent_required" });
    }

    const inserted = await db.insert(observations).values({
      clientId: input.clientId,
      userId: ctx.user.id,
      realm: input.realm,
      subject: input.subject,
      scientificName: input.scientificName,
      note: input.note,
      metrics: input.metrics,
      evidenceState: input.evidenceState,
      visibility: input.visibility,
      syncState: "synced",
      revision: 1,
    });
    const rows = await db.select().from(observations).where(eq(observations.id, Number(inserted[0].insertId))).limit(1);
    if (!rows[0]) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "observation_create_failed" });
    return serializeObservation(rows[0], true);
  }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        expectedRevision: z.number().int().positive(),
        subject: z.string().max(128).nullable().optional(),
        scientificName: z.string().max(160).nullable().optional(),
        note: z.string().max(2_000).nullable().optional(),
        metrics: z.array(observationMetricSchema).max(64).optional(),
        evidenceState: evidenceStateSchema.optional(),
        visibility: visibilitySchema.optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = await requireDatabase();
      const rows = await db
        .select()
        .from(observations)
        .where(and(eq(observations.id, input.id), eq(observations.userId, ctx.user.id)))
        .limit(1);
      const current = rows[0];
      if (!current || !isResourceOwner(ctx.user.id, current.userId)) {
        throw new TRPCError({ code: "NOT_FOUND", message: "observation_not_found" });
      }
      if (current.revision !== input.expectedRevision) {
        throw new TRPCError({ code: "CONFLICT", message: "observation_revision_conflict" });
      }
      if (input.visibility === "public" && !(await hasConsent(ctx.user.id, "observation_publishing"))) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "observation_publishing_consent_required" });
      }
      const { id, expectedRevision, ...changes } = input;
      await db
        .update(observations)
        .set({ ...changes, syncState: "synced", revision: current.revision + 1 })
        .where(and(eq(observations.id, id), eq(observations.userId, ctx.user.id), eq(observations.revision, expectedRevision)));
      const updated = await db.select().from(observations).where(eq(observations.id, id)).limit(1);
      if (!updated[0]) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "observation_update_failed" });
      return serializeObservation(updated[0], true);
    }),

  uploadImage: protectedProcedure
    .input(
      z.object({
        observationId: z.number().int().positive(),
        base64: z.string().min(1),
        mimeType: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = await requireDatabase();
      const rows = await db
        .select()
        .from(observations)
        .where(and(eq(observations.id, input.observationId), eq(observations.userId, ctx.user.id)))
        .limit(1);
      const observation = rows[0];
      if (!observation) throw new TRPCError({ code: "FORBIDDEN", message: "observation_ownership_required" });
      if (!(await hasConsent(ctx.user.id, "media_processing"))) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "media_processing_consent_required" });
      }

      const image = validateImageUpload(input.base64, input.mimeType);
      assertValidMediaContext({ kind: "observation_image", observationId: observation.id, postId: null });
      const stored = await storagePut(
        `users/${ctx.user.id}/observations/${observation.id}/image.${image.extension}`,
        image.buffer,
        image.mimeType,
      );
      const inserted = await db.insert(mediaAssets).values({
        userId: ctx.user.id,
        observationId: observation.id,
        kind: "observation_image",
        mimeType: image.mimeType,
        byteSize: image.byteSize,
        accessUrl: stored.url,
        storageKey: stored.key,
        visibility: observation.visibility,
      });
      const reward = await awardXpIfReady(db, {
        userId: ctx.user.id,
        eventType: "photo_upload",
        eventKey: `xp:${ctx.user.id}:observation-photo:${observation.id}`,
        points: XP_REWARDS.observationPhoto,
        sourceType: "media_asset",
        sourceId: String(inserted[0].insertId),
      });
      return {
        id: String(inserted[0].insertId),
        accessUrl: await storageGetSignedUrl(stored.key),
        xpAwarded: reward.amount,
      };
    }),
});
