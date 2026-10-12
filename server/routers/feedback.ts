import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { feedbackEntries, notificationPreferences, notifications, users } from "../../drizzle/schema";
import { protectedProcedure, router, staffProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { sendStaffResponseEmail } from "../localAuth";

async function requireDatabase() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "database_unavailable" });
  return db;
}

const preferenceSchema = z.object({
  community: z.boolean(),
  messages: z.boolean(),
  moderation: z.boolean(),
  system: z.boolean(),
});

export const feedbackRouter = router({
  submit: protectedProcedure
    .input(z.object({
      kind: z.enum(["feedback", "problem", "wish"]),
      message: z.string().trim().min(3).max(4000),
      page: z.string().trim().max(255).nullable().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDatabase();
      const result = await db.transaction(async tx => {
        const inserted = await tx.insert(feedbackEntries).values({ userId: ctx.user.id, kind: input.kind, message: input.message, page: input.page ?? null });
        const id = Number(inserted[0].insertId);
        const staff = await tx.select({ id: users.id }).from(users).where(and(eq(users.status, "active"), eq(users.role, "admin")));
        const recipients = staff.filter(recipient => recipient.id !== ctx.user.id);
        if (recipients.length) {
          await tx.insert(notifications).values(recipients.map(recipient => ({
            recipientId: recipient.id,
            actorId: ctx.user.id,
            type: "feedback" as const,
            feedbackId: id,
            message: `Neue ${input.kind === "problem" ? "Problemmeldung" : input.kind === "wish" ? "Verbesserungsidee" : "Feedback"} #${id} wartet auf deine Antwort.`,
          })));
        }
        return id;
      });
      return { id: result, status: "received" as const };
    }),
  mine: protectedProcedure.query(async ({ ctx }) => {
    const db = await requireDatabase();
    return db.select({ id: feedbackEntries.id, kind: feedbackEntries.kind, message: feedbackEntries.message, status: feedbackEntries.status, responseMessage: feedbackEntries.responseMessage, createdAt: feedbackEntries.createdAt, updatedAt: feedbackEntries.updatedAt })
      .from(feedbackEntries).where(eq(feedbackEntries.userId, ctx.user.id)).orderBy(desc(feedbackEntries.createdAt)).limit(20);
  }),
  preferences: protectedProcedure.query(async ({ ctx }) => {
    const db = await requireDatabase();
    const [row] = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, ctx.user.id)).limit(1);
    return row ? { community: row.community, messages: row.messages, moderation: row.moderation, system: row.system } : { community: true, messages: true, moderation: true, system: true };
  }),
  updatePreferences: protectedProcedure.input(preferenceSchema).mutation(async ({ ctx, input }) => {
    const db = await requireDatabase();
    const [existing] = await db.select({ id: notificationPreferences.id }).from(notificationPreferences).where(eq(notificationPreferences.userId, ctx.user.id)).limit(1);
    if (existing) await db.update(notificationPreferences).set(input).where(eq(notificationPreferences.id, existing.id));
    else await db.insert(notificationPreferences).values({ userId: ctx.user.id, ...input });
    return { success: true as const, ...input };
  }),
  staffQueue: staffProcedure.query(async () => {
    const db = await requireDatabase();
    return db.select({ id: feedbackEntries.id, userId: feedbackEntries.userId, kind: feedbackEntries.kind, message: feedbackEntries.message, page: feedbackEntries.page, status: feedbackEntries.status, adminNote: feedbackEntries.adminNote, responseMessage: feedbackEntries.responseMessage, createdAt: feedbackEntries.createdAt, updatedAt: feedbackEntries.updatedAt, userName: users.name, userEmail: users.email }).from(feedbackEntries).leftJoin(users, eq(feedbackEntries.userId, users.id)).orderBy(desc(feedbackEntries.createdAt)).limit(100);
  }),
  updateStaffEntry: staffProcedure
    .input(z.object({ id: z.number().int().positive(), status: z.enum(["received", "reviewing", "resolved"]), adminNote: z.string().trim().max(2000).nullable().optional(), responseMessage: z.string().trim().max(4000).nullable().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDatabase();
      const [entry] = await db.select({ id: feedbackEntries.id, userId: feedbackEntries.userId }).from(feedbackEntries).where(eq(feedbackEntries.id, input.id)).limit(1);
      if (!entry) throw new TRPCError({ code: "NOT_FOUND", message: "feedback_not_found" });
      const response = input.responseMessage?.trim() || null;
      await db.transaction(async tx => {
        await tx.update(feedbackEntries).set({ status: input.status, adminNote: input.adminNote?.trim() || null, responseMessage: response }).where(eq(feedbackEntries.id, input.id));
        if (response) await tx.insert(notifications).values({ recipientId: entry.userId, actorId: ctx.user.id, type: "feedback", feedbackId: input.id, message: `Antwort zu deiner Rückmeldung #${input.id}: ${response.slice(0, 180)}` });
      });
      if (response) {
        const [recipient] = await db.select({ email: users.email }).from(users).where(eq(users.id, entry.userId)).limit(1);
        if (recipient?.email) void sendStaffResponseEmail({ to: recipient.email, subject: `Antwort zu deiner Rückmeldung #${input.id} · BlackWaterLeaf`, message: response }).catch(() => undefined);
      }
      return { id: input.id, status: input.status } as const;
    }),
});
