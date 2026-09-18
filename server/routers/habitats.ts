import { and, desc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { mediaAssets, privateHabitats } from "../../drizzle/schema";
import {
  aquariumDetailsSchema,
  plantDetailsSchema,
  privateHabitatInputSchema,
  privateHabitatKindSchema,
  terrariumDetailsSchema,
} from "../../shared/blackwaterleaf-contract-v1";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { storageGetSignedUrl, storagePut } from "../storage";
import { validateImageUpload } from "../uploadValidation";
import { assertValidMediaContext } from "../mediaIntegrity";
import { hasCurrentConsent } from "../consents";

async function requireDatabase() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "database_unavailable" });
  return db;
}

function parseDetails(record: typeof privateHabitats.$inferSelect) {
  switch (record.kind) {
    case "aquarium":
      return aquariumDetailsSchema.parse(record.details);
    case "plant":
      return plantDetailsSchema.parse(record.details);
    case "terrarium":
      return terrariumDetailsSchema.parse(record.details);
  }
}

async function serializeHabitat(record: typeof privateHabitats.$inferSelect) {
  const db = await requireDatabase();
  const images = await db
    .select()
    .from(mediaAssets)
    .where(and(eq(mediaAssets.habitatId, record.id), eq(mediaAssets.userId, record.userId)))
    .orderBy(desc(mediaAssets.createdAt));
  return {
    id: String(record.id),
    ownerId: String(record.userId),
    kind: record.kind,
    name: record.name,
    details: parseDetails(record),
    images: await Promise.all(images.map(async image => ({
      id: String(image.id),
      accessUrl: await storageGetSignedUrl(image.storageKey),
      mimeType: image.mimeType,
      createdAt: image.createdAt.toISOString(),
    }))),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export const habitatsRouter = router({
  mine: protectedProcedure.query(async ({ ctx }) => {
    const db = await requireDatabase();
    const rows = await db
      .select()
      .from(privateHabitats)
      .where(eq(privateHabitats.userId, ctx.user.id))
      .orderBy(desc(privateHabitats.updatedAt));
    return Promise.all(rows.map(serializeHabitat));
  }),

  create: protectedProcedure.input(privateHabitatInputSchema).mutation(async ({ ctx, input }) => {
    const db = await requireDatabase();
    const inserted = await db.insert(privateHabitats).values({
      userId: ctx.user.id,
      kind: input.kind,
      name: input.name,
      details: input.details,
    });
    const rows = await db
      .select()
      .from(privateHabitats)
      .where(and(eq(privateHabitats.id, Number(inserted[0].insertId)), eq(privateHabitats.userId, ctx.user.id)))
      .limit(1);
    if (!rows[0]) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "habitat_create_failed" });
    return serializeHabitat(rows[0]);
  }),

  update: protectedProcedure
    .input(privateHabitatInputSchema.and(z.object({ id: z.number().int().positive() })))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDatabase();
      const current = await db
        .select()
        .from(privateHabitats)
        .where(and(eq(privateHabitats.id, input.id), eq(privateHabitats.userId, ctx.user.id)))
        .limit(1);
      if (!current[0]) throw new TRPCError({ code: "NOT_FOUND", message: "habitat_not_found" });

      await db
        .update(privateHabitats)
        .set({ kind: input.kind, name: input.name, details: input.details })
        .where(and(eq(privateHabitats.id, input.id), eq(privateHabitats.userId, ctx.user.id)));
      const updated = await db.select().from(privateHabitats).where(eq(privateHabitats.id, input.id)).limit(1);
      if (!updated[0]) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "habitat_update_failed" });
      return serializeHabitat(updated[0]);
    }),

  uploadImage: protectedProcedure
    .input(z.object({ habitatId: z.number().int().positive(), base64: z.string().min(1), mimeType: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDatabase();
      const rows = await db.select().from(privateHabitats).where(and(eq(privateHabitats.id, input.habitatId), eq(privateHabitats.userId, ctx.user.id))).limit(1);
      const habitat = rows[0];
      if (!habitat) throw new TRPCError({ code: "FORBIDDEN", message: "habitat_ownership_required" });
      if (!(await hasCurrentConsent(db, ctx.user.id, "media_processing"))) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "media_processing_consent_required" });
      }
      const image = validateImageUpload(input.base64, input.mimeType);
      assertValidMediaContext({ kind: "habitat_image", observationId: null, postId: null, habitatId: habitat.id });
      const stored = await storagePut(`users/${ctx.user.id}/habitats/${habitat.id}/image-${Date.now()}.${image.extension}`, image.buffer, image.mimeType);
      const inserted = await db.insert(mediaAssets).values({
        userId: ctx.user.id,
        habitatId: habitat.id,
        kind: "habitat_image",
        mimeType: image.mimeType,
        byteSize: image.byteSize,
        accessUrl: stored.url,
        storageKey: stored.key,
        visibility: "private",
      });
      return { id: String(inserted[0].insertId), accessUrl: await storageGetSignedUrl(stored.key) };
    }),

  deleteImage: protectedProcedure
    .input(z.object({ habitatId: z.number().int().positive(), imageId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDatabase();
      const rows = await db.select({ id: mediaAssets.id })
        .from(mediaAssets)
        .where(and(eq(mediaAssets.id, input.imageId), eq(mediaAssets.habitatId, input.habitatId), eq(mediaAssets.userId, ctx.user.id)))
        .limit(1);
      if (!rows[0]) throw new TRPCError({ code: "NOT_FOUND", message: "habitat_image_not_found" });
      await db.delete(mediaAssets).where(and(eq(mediaAssets.id, input.imageId), eq(mediaAssets.habitatId, input.habitatId), eq(mediaAssets.userId, ctx.user.id)));
      return { success: true } as const;
    }),

  countByKind: protectedProcedure.query(async ({ ctx }) => {
    const db = await requireDatabase();
    const rows = await db
      .select({ kind: privateHabitats.kind })
      .from(privateHabitats)
      .where(eq(privateHabitats.userId, ctx.user.id));
    return privateHabitatKindSchema.array().parse(rows.map(row => row.kind));
  }),
});
