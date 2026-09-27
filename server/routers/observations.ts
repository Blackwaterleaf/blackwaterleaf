import { TRPCError } from "@trpc/server";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { z } from "zod";
import { mediaAssets, observations, users } from "../../drizzle/schema";
import {
  BLACKWATERLEAF_CONTRACT_VERSION,
  createObservationInputSchema,
  observationBasisOfRecordSchema,
  evidenceStateSchema,
  observationGeoprivacySchema,
  observationMetricSchema,
  observationRealmSchema,
  observationWildStatusSchema,
  visibilitySchema,
} from "../../shared/blackwaterleaf-contract-v1";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { awardXpIfReady, XP_REWARDS } from "../gamification";
import { storageGetSignedUrl, storagePut } from "../storage";
import { validateImageUpload } from "../uploadValidation";
import { canReadMedia, canReadObservation, isResourceOwner } from "../accessPolicy";
import { hasCurrentConsent } from "../consents";
import { assertValidMediaContext } from "../mediaIntegrity";
import { assertSafetyGateAllows } from "../safetyGates";

async function requireDatabase() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "database_unavailable" });
  return db;
}

async function hasConsent(userId: number, purpose: "observation_publishing" | "media_processing") {
  const db = await requireDatabase();
  return hasCurrentConsent(db, userId, purpose);
}

const toDecimal = (value: number | null | undefined) => (value === null || value === undefined ? null : String(value));

function assertGeoPolicy(input: {
  visibility: "private" | "unlisted" | "public";
  geoprivacy: "private" | "obscured" | "public" | "embargoed";
  publicLatitude: number | null | undefined;
  publicLongitude: number | null | undefined;
  embargoUntil: string | Date | null | undefined;
}) {
  if (input.visibility !== "public") return;
  if (["obscured", "public", "embargoed"].includes(input.geoprivacy) && (input.publicLatitude == null || input.publicLongitude == null)) {
    throw new TRPCError({ code: "PRECONDITION_FAILED", message: "public_generalized_coordinates_required" });
  }
  if (input.geoprivacy === "embargoed" && !input.embargoUntil) {
    throw new TRPCError({ code: "PRECONDITION_FAILED", message: "observation_embargo_date_required" });
  }
}

async function serializeObservation(record: typeof observations.$inferSelect, canReadPrivate: boolean) {
  const db = await requireDatabase();
  const mediaRows = await db
    .select()
    .from(mediaAssets)
    .where(and(eq(mediaAssets.observationId, record.id), eq(mediaAssets.userId, record.userId)))
    .orderBy(desc(mediaAssets.createdAt));

  const media = await Promise.all(
    mediaRows
      .filter(item => canReadMedia({
        viewerId: canReadPrivate ? record.userId : null,
        ownerId: item.userId,
        ownerStatus: "active",
        assetVisibility: item.visibility,
        parentVisibility: record.visibility,
      }))
      .map(async item => ({
      id: String(item.id),
      ownerId: String(item.userId),
      kind: item.kind,
      mimeType: item.mimeType,
      byteSize: item.byteSize,
      width: item.width,
      height: item.height,
      accessUrl: await storageGetSignedUrl(item.storageKey),
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
    taxonRank: record.taxonRank,
    observedAt: record.observedAt?.toISOString() ?? null,
    basisOfRecord: record.basisOfRecord,
    wildStatus: record.wildStatus,
    latitude: canReadPrivate ? (record.latitude === null ? null : Number(record.latitude)) : null,
    longitude: canReadPrivate ? (record.longitude === null ? null : Number(record.longitude)) : null,
    coordinateUncertaintyM: canReadPrivate ? (record.coordinateUncertaintyM === null ? null : Number(record.coordinateUncertaintyM)) : null,
    publicLatitude: record.geoprivacy === "public" && record.visibility === "public" && (!record.embargoUntil || record.embargoUntil <= new Date()) ? (record.publicLatitude === null ? null : Number(record.publicLatitude)) : null,
    publicLongitude: record.geoprivacy === "public" && record.visibility === "public" && (!record.embargoUntil || record.embargoUntil <= new Date()) ? (record.publicLongitude === null ? null : Number(record.publicLongitude)) : null,
    geoprivacy: record.geoprivacy,
    embargoUntil: canReadPrivate ? (record.embargoUntil?.toISOString() ?? null) : null,
    note: record.note,
    metrics: observationMetricSchema.array().parse(record.metrics),
    media,
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

  map: publicProcedure
    .input(z.object({ realm: observationRealmSchema.optional(), limit: z.number().int().min(1).max(500).default(200) }))
    .query(async ({ input }) => {
      const db = await requireDatabase();
      const rows = await db
        .select({ observation: observations })
        .from(observations)
        .innerJoin(users, eq(observations.userId, users.id))
        .where(
          input.realm
            ? and(
                eq(observations.visibility, "public"),
                eq(users.status, "active"),
                eq(observations.realm, input.realm),
                isNotNull(observations.publicLatitude),
                isNotNull(observations.publicLongitude),
              )
            : and(
                eq(observations.visibility, "public"),
                eq(users.status, "active"),
                isNotNull(observations.publicLatitude),
                isNotNull(observations.publicLongitude),
              ),
        )
        .orderBy(desc(observations.observedAt), desc(observations.updatedAt))
        .limit(input.limit);
      const now = new Date();
      return rows
        .map(({ observation }) => observation)
        .filter(record => record.geoprivacy !== "private" && (!record.embargoUntil || record.embargoUntil <= now))
        .map(record => ({
          id: String(record.id),
          realm: record.realm,
          label: record.scientificName ?? record.subject ?? "Unbestimmte Beobachtung",
          evidenceState: record.evidenceState,
          observedAt: record.observedAt?.toISOString() ?? null,
          latitude: Number(record.publicLatitude),
          longitude: Number(record.publicLongitude),
          coordinateUncertaintyM: record.coordinateUncertaintyM === null ? null : Number(record.coordinateUncertaintyM),
          geoprivacy: record.geoprivacy,
        }));
    }),

  create: protectedProcedure.input(createObservationInputSchema).mutation(async ({ ctx, input }) => {
    if (input.visibility === "public") assertSafetyGateAllows("publicPublication");
    assertGeoPolicy(input);
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
      taxonRank: input.taxonRank,
      observedAt: input.observedAt ? new Date(input.observedAt) : null,
      basisOfRecord: input.basisOfRecord,
      wildStatus: input.wildStatus,
      latitude: toDecimal(input.latitude),
      longitude: toDecimal(input.longitude),
      coordinateUncertaintyM: toDecimal(input.coordinateUncertaintyM),
      publicLatitude: toDecimal(input.publicLatitude),
      publicLongitude: toDecimal(input.publicLongitude),
      geoprivacy: input.geoprivacy,
      embargoUntil: input.embargoUntil ? new Date(input.embargoUntil) : null,
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
        taxonRank: z.string().max(32).nullable().optional(),
        observedAt: z.string().datetime().nullable().optional(),
        basisOfRecord: observationBasisOfRecordSchema.optional(),
        wildStatus: observationWildStatusSchema.optional(),
        latitude: z.number().finite().min(-90).max(90).nullable().optional(),
        longitude: z.number().finite().min(-180).max(180).nullable().optional(),
        coordinateUncertaintyM: z.number().finite().min(0).max(20_000_000).nullable().optional(),
        publicLatitude: z.number().finite().min(-90).max(90).nullable().optional(),
        publicLongitude: z.number().finite().min(-180).max(180).nullable().optional(),
        geoprivacy: observationGeoprivacySchema.optional(),
        embargoUntil: z.string().datetime().nullable().optional(),
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
      if (input.visibility === "public") assertSafetyGateAllows("publicPublication");
      if (input.visibility === "public" && !(await hasConsent(ctx.user.id, "observation_publishing"))) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "observation_publishing_consent_required" });
      }
      assertGeoPolicy({
        visibility: input.visibility ?? current.visibility,
        geoprivacy: input.geoprivacy ?? current.geoprivacy,
        publicLatitude: input.publicLatitude ?? (current.publicLatitude === null ? null : Number(current.publicLatitude)),
        publicLongitude: input.publicLongitude ?? (current.publicLongitude === null ? null : Number(current.publicLongitude)),
        embargoUntil: input.embargoUntil ?? current.embargoUntil,
      });
      const {
        id,
        expectedRevision,
        observedAt,
        embargoUntil,
        latitude,
        longitude,
        coordinateUncertaintyM,
        publicLatitude,
        publicLongitude,
        ...changes
      } = input;
      const normalizedChanges = {
        ...changes,
        ...(observedAt !== undefined ? { observedAt: observedAt ? new Date(observedAt) : null } : {}),
        ...(embargoUntil !== undefined ? { embargoUntil: embargoUntil ? new Date(embargoUntil) : null } : {}),
        ...(latitude !== undefined ? { latitude: toDecimal(latitude) } : {}),
        ...(longitude !== undefined ? { longitude: toDecimal(longitude) } : {}),
        ...(coordinateUncertaintyM !== undefined ? { coordinateUncertaintyM: toDecimal(coordinateUncertaintyM) } : {}),
        ...(publicLatitude !== undefined ? { publicLatitude: toDecimal(publicLatitude) } : {}),
        ...(publicLongitude !== undefined ? { publicLongitude: toDecimal(publicLongitude) } : {}),
      } as Partial<typeof observations.$inferInsert>;
      await db.transaction(async tx => {
        await tx
          .update(observations)
          .set({ ...normalizedChanges, syncState: "synced", revision: current.revision + 1 })
          .where(and(eq(observations.id, id), eq(observations.userId, ctx.user.id), eq(observations.revision, expectedRevision)));
        if (input.visibility) {
          await tx
            .update(mediaAssets)
            .set({ visibility: input.visibility })
            .where(and(eq(mediaAssets.observationId, id), eq(mediaAssets.userId, ctx.user.id)));
        }
      });
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
      assertSafetyGateAllows("mediaUpload");
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
      assertValidMediaContext({ kind: "observation_image", observationId: observation.id, postId: null, habitatId: null });
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
