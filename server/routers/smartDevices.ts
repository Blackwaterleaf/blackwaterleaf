import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { privateHabitats, smartDeviceConnections, smartDeviceMeasurements } from "../../drizzle/schema";
import {
  smartDeviceConnectionSchema,
  smartDeviceSelectionInputSchema,
  smartMeasurementSchema,
} from "../../shared/blackwaterleaf-contract-v1";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { smartMeasurementInputSchema, unitForSmartMetric } from "../smartMeasurements";

async function requireDatabase() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "database_unavailable" });
  return db;
}

function serializeConnection(record: typeof smartDeviceConnections.$inferSelect) {
  return smartDeviceConnectionSchema.parse({
    id: String(record.id),
    habitatId: record.habitatId,
    provider: record.provider,
    modelLabel: record.modelLabel,
    requestedMetrics: record.requestedMetrics,
    // Device selections never claim a working integration before an authorization flow exists.
    status: record.status === "connected" ? "connected" : "awaiting_authorization",
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  });
}

function serializeMeasurement(record: typeof smartDeviceMeasurements.$inferSelect) {
  return smartMeasurementSchema.parse({
    id: String(record.id),
    habitatId: String(record.habitatId),
    deviceConnectionId: record.deviceConnectionId === null ? null : String(record.deviceConnectionId),
    metric: record.metric,
    value: Number(record.valueDecimal),
    unit: record.unit,
    source: record.source,
    quality: record.quality,
    observedAt: record.observedAt.toISOString(),
    receivedAt: record.receivedAt.toISOString(),
  });
}

async function assertOwnedAquarium(userId: number, habitatId: number | null) {
  if (habitatId === null) return;
  const db = await requireDatabase();
  const owned = await db
    .select({ id: privateHabitats.id })
    .from(privateHabitats)
    .where(
      and(
        eq(privateHabitats.id, habitatId),
        eq(privateHabitats.userId, userId),
        eq(privateHabitats.kind, "aquarium"),
      ),
    )
    .limit(1);
  if (!owned[0]) throw new TRPCError({ code: "NOT_FOUND", message: "aquarium_not_found" });
}

const measurementListInput = z.object({
  habitatId: z.number().int().positive(),
  metric: z.enum(["temperatureC", "ph", "gh", "kh", "nitriteMgL", "nitrateMgL", "conductivityUs"]).optional(),
  limit: z.number().int().min(1).max(120).default(30),
});

export const smartDevicesRouter = router({
  mine: protectedProcedure.query(async ({ ctx }) => {
    const db = await requireDatabase();
    const rows = await db
      .select()
      .from(smartDeviceConnections)
      .where(eq(smartDeviceConnections.userId, ctx.user.id))
      .orderBy(desc(smartDeviceConnections.updatedAt));
    return rows.map(serializeConnection);
  }),

  measurements: protectedProcedure.input(measurementListInput).query(async ({ ctx, input }) => {
    await assertOwnedAquarium(ctx.user.id, input.habitatId);
    const db = await requireDatabase();
    const conditions = [
      eq(smartDeviceMeasurements.userId, ctx.user.id),
      eq(smartDeviceMeasurements.habitatId, input.habitatId),
      ...(input.metric ? [eq(smartDeviceMeasurements.metric, input.metric)] : []),
    ];
    const rows = await db
      .select()
      .from(smartDeviceMeasurements)
      .where(and(...conditions))
      .orderBy(desc(smartDeviceMeasurements.observedAt))
      .limit(input.limit);
    return rows.map(serializeMeasurement);
  }),

  recordManualMeasurement: protectedProcedure.input(smartMeasurementInputSchema).mutation(async ({ ctx, input }) => {
    await assertOwnedAquarium(ctx.user.id, input.habitatId);
    if (input.deviceConnectionId !== null && input.deviceConnectionId !== undefined) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "manual_measurements_cannot_claim_device_sync" });
    }
    const db = await requireDatabase();
    const observedAt = input.observedAt ? new Date(input.observedAt) : new Date();
    const inserted = await db.insert(smartDeviceMeasurements).values({
      userId: ctx.user.id,
      habitatId: input.habitatId,
      deviceConnectionId: null,
      metric: input.metric,
      valueDecimal: input.value.toFixed(4),
      unit: unitForSmartMetric(input.metric),
      source: "manual",
      quality: "reported",
      observedAt,
    });
    const rows = await db
      .select()
      .from(smartDeviceMeasurements)
      .where(
        and(
          eq(smartDeviceMeasurements.id, Number(inserted[0].insertId)),
          eq(smartDeviceMeasurements.userId, ctx.user.id),
        ),
      )
      .limit(1);
    if (!rows[0]) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "measurement_create_failed" });
    return serializeMeasurement(rows[0]);
  }),

  select: protectedProcedure.input(smartDeviceSelectionInputSchema).mutation(async ({ ctx, input }) => {
    await assertOwnedAquarium(ctx.user.id, input.habitatId);
    const db = await requireDatabase();
    const result = await db.insert(smartDeviceConnections).values({
      userId: ctx.user.id,
      habitatId: input.habitatId,
      provider: input.provider,
      modelLabel: input.modelLabel,
      requestedMetrics: input.requestedMetrics,
      status: "awaiting_authorization",
    });
    const created = await db
      .select()
      .from(smartDeviceConnections)
      .where(
        and(
          eq(smartDeviceConnections.id, Number(result[0].insertId)),
          eq(smartDeviceConnections.userId, ctx.user.id),
        ),
      )
      .limit(1);
    if (!created[0]) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "smart_device_selection_failed" });
    return serializeConnection(created[0]);
  }),

  remove: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    const db = await requireDatabase();
    const result = await db.delete(smartDeviceConnections).where(
      and(eq(smartDeviceConnections.id, input.id), eq(smartDeviceConnections.userId, ctx.user.id)),
    );
    if (result[0].affectedRows !== 1) throw new TRPCError({ code: "NOT_FOUND", message: "smart_device_not_found" });
    return { success: true } as const;
  }),
});
