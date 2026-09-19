import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, gte, lte } from "drizzle-orm";
import { z } from "zod";
import { careEvents, careJournal, carePlans, careTasks, privateHabitats } from "../../drizzle/schema";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";

const realm = z.enum(["botany", "aquarium", "terrarium"]);
const taskStatus = z.enum(["open", "done", "snoozed", "skipped"]);

async function requireDatabase() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "database_unavailable" });
  return db;
}

function serializeTask(task: typeof careTasks.$inferSelect) {
  return { ...task, id: String(task.id), planId: String(task.planId), habitatId: task.habitatId ? String(task.habitatId) : null, dueAt: task.dueAt.toISOString(), completedAt: task.completedAt?.toISOString() ?? null, createdAt: task.createdAt.toISOString(), updatedAt: task.updatedAt.toISOString() };
}

export const careRouter = router({
  today: protectedProcedure
    .input(z.object({ from: z.coerce.date().optional(), to: z.coerce.date().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await requireDatabase();
      const now = new Date();
      const from = input?.from ?? new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const to = input?.to ?? new Date(from.getTime() + 24 * 60 * 60 * 1000);
      const tasks = await db.select().from(careTasks).where(and(eq(careTasks.userId, ctx.user.id), gte(careTasks.dueAt, from), lte(careTasks.dueAt, to))).orderBy(asc(careTasks.dueAt));
      return { date: from.toISOString().slice(0, 10), tasks: tasks.map(serializeTask) };
    }),

  mine: protectedProcedure.query(async ({ ctx }) => {
    const db = await requireDatabase();
    const plans = await db.select().from(carePlans).where(eq(carePlans.userId, ctx.user.id)).orderBy(desc(carePlans.updatedAt));
    const tasks = await db.select().from(careTasks).where(eq(careTasks.userId, ctx.user.id)).orderBy(asc(careTasks.dueAt)).limit(200);
    const journal = await db.select().from(careJournal).where(eq(careJournal.userId, ctx.user.id)).orderBy(desc(careJournal.observedAt)).limit(50);
    return { plans, tasks: tasks.map(serializeTask), journal };
  }),

  createPlan: protectedProcedure.input(z.object({ realm, title: z.string().trim().min(1).max(160), habitatId: z.number().int().positive().nullable().optional(), timezone: z.string().max(64).default("Europe/Berlin") })).mutation(async ({ ctx, input }) => {
    const db = await requireDatabase();
    if (input.habitatId) {
      const habitat = await db.select({ id: privateHabitats.id }).from(privateHabitats).where(and(eq(privateHabitats.id, input.habitatId), eq(privateHabitats.userId, ctx.user.id))).limit(1);
      if (!habitat[0]) throw new TRPCError({ code: "FORBIDDEN", message: "habitat_ownership_required" });
    }
    const inserted = await db.insert(carePlans).values({ userId: ctx.user.id, realm: input.realm, title: input.title, habitatId: input.habitatId ?? null, timezone: input.timezone });
    const rows = await db.select().from(carePlans).where(eq(carePlans.id, Number(inserted[0].insertId))).limit(1);
    return rows[0];
  }),

  createTask: protectedProcedure.input(z.object({ planId: z.number().int().positive(), title: z.string().trim().min(1).max(160), dueAt: z.coerce.date(), habitatId: z.number().int().positive().nullable().optional() })).mutation(async ({ ctx, input }) => {
    const db = await requireDatabase();
    const plan = await db.select().from(carePlans).where(and(eq(carePlans.id, input.planId), eq(carePlans.userId, ctx.user.id))).limit(1);
    if (!plan[0]) throw new TRPCError({ code: "NOT_FOUND", message: "care_plan_not_found" });
    const inserted = await db.insert(careTasks).values({ userId: ctx.user.id, planId: input.planId, habitatId: input.habitatId ?? plan[0].habitatId ?? null, title: input.title, dueAt: input.dueAt, status: "open" });
    const id = Number(inserted[0].insertId);
    await db.insert(careEvents).values({ userId: ctx.user.id, taskId: id, eventType: "created" });
    const rows = await db.select().from(careTasks).where(eq(careTasks.id, id)).limit(1);
    return rows[0] ? serializeTask(rows[0]) : null;
  }),

  updateTask: protectedProcedure.input(z.object({ taskId: z.number().int().positive(), status: taskStatus, reason: z.string().trim().max(160).nullable().optional(), dueAt: z.coerce.date().optional() })).mutation(async ({ ctx, input }) => {
    const db = await requireDatabase();
    const current = await db.select().from(careTasks).where(and(eq(careTasks.id, input.taskId), eq(careTasks.userId, ctx.user.id))).limit(1);
    if (!current[0]) throw new TRPCError({ code: "NOT_FOUND", message: "care_task_not_found" });
    const eventType = input.status === "done" ? "completed" : input.status === "snoozed" ? "snoozed" : input.status === "skipped" ? "skipped" : "reopened";
    await db.update(careTasks).set({ status: input.status, skipReason: input.reason ?? null, dueAt: input.dueAt ?? current[0].dueAt, completedAt: input.status === "done" ? new Date() : null }).where(and(eq(careTasks.id, input.taskId), eq(careTasks.userId, ctx.user.id)));
    await db.insert(careEvents).values({ userId: ctx.user.id, taskId: input.taskId, eventType, reason: input.reason ?? null });
    const updated = await db.select().from(careTasks).where(eq(careTasks.id, input.taskId)).limit(1);
    return updated[0] ? serializeTask(updated[0]) : null;
  }),

  addJournal: protectedProcedure.input(z.object({ note: z.string().trim().min(1).max(4_000), habitatId: z.number().int().positive().nullable().optional(), taskId: z.number().int().positive().nullable().optional(), observedAt: z.coerce.date().optional() })).mutation(async ({ ctx, input }) => {
    const db = await requireDatabase();
    const inserted = await db.insert(careJournal).values({ userId: ctx.user.id, note: input.note, habitatId: input.habitatId ?? null, taskId: input.taskId ?? null, observedAt: input.observedAt ?? new Date() });
    const rows = await db.select().from(careJournal).where(eq(careJournal.id, Number(inserted[0].insertId))).limit(1);
    return rows[0] ?? null;
  }),
});

export type CareRouter = typeof careRouter;
