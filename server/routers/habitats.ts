import { and, desc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { privateHabitats } from "../../drizzle/schema";
import {
  aquariumDetailsSchema,
  plantDetailsSchema,
  privateHabitatInputSchema,
  privateHabitatKindSchema,
  terrariumDetailsSchema,
} from "../../shared/blackwaterleaf-contract-v1";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";

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

function serializeHabitat(record: typeof privateHabitats.$inferSelect) {
  return {
    id: String(record.id),
    ownerId: String(record.userId),
    kind: record.kind,
    name: record.name,
    details: parseDetails(record),
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
    return rows.map(serializeHabitat);
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

  countByKind: protectedProcedure.query(async ({ ctx }) => {
    const db = await requireDatabase();
    const rows = await db
      .select({ kind: privateHabitats.kind })
      .from(privateHabitats)
      .where(eq(privateHabitats.userId, ctx.user.id));
    return privateHabitatKindSchema.array().parse(rows.map(row => row.kind));
  }),
});
