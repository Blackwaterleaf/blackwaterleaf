import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, inArray, isNull, lt } from "drizzle-orm";
import { z } from "zod";
import { notificationPreferences, notifications, users } from "../../drizzle/schema";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";

async function requireDatabase() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "database_unavailable" });
  return db;
}
async function enabledTypes(db: Awaited<ReturnType<typeof requireDatabase>>, userId: number, role: string) {
  const [prefs] = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId)).limit(1);
  if (!prefs) return null;
  const feedbackType = role === "admin" || role === "moderator" ? "feedback" : "feedback";
  return [prefs.community ? "comment" : null, prefs.community ? "like" : null, prefs.community ? "report" : null, prefs.moderation ? "moderation" : null, feedbackType, "partner_inquiry", prefs.system ? "system" : null, prefs.messages ? "message" : null].filter(Boolean) as Array<"comment" | "like" | "report" | "moderation" | "feedback" | "partner_inquiry" | "system" | "message">;
}

export const notificationsRouter = router({
  feed: protectedProcedure.query(async ({ ctx }) => {
    const db = await requireDatabase();
    const types = await enabledTypes(db, ctx.user.id, ctx.user.role);
    const rows = await db
      .select({
        id: notifications.id,
          type: notifications.type,
          postId: notifications.postId,
          commentId: notifications.commentId,
          feedbackId: notifications.feedbackId,
          partnerInquiryId: notifications.partnerInquiryId,
          message: notifications.message,
        readAt: notifications.readAt,
        createdAt: notifications.createdAt,
        actorName: users.name,
        actorUsername: users.username,
      })
      .from(notifications)
      .innerJoin(users, eq(notifications.actorId, users.id))
      .where(and(eq(notifications.recipientId, ctx.user.id), ...(types ? [inArray(notifications.type, types)] : [])))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
    return rows.map(row => ({
      ...row,
      actorName: row.actorName ?? row.actorUsername ?? "BlackWaterLeaf-Nutzer",
      isRead: Boolean(row.readAt),
    }));
  }),

  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    const db = await requireDatabase();
    const types = await enabledTypes(db, ctx.user.id, ctx.user.role);
    const [row] = await db
      .select({ total: count() })
      .from(notifications)
      .where(and(eq(notifications.recipientId, ctx.user.id), isNull(notifications.readAt), ...(types ? [inArray(notifications.type, types)] : [])));
    return { count: Number(row?.total ?? 0) } as const;
  }),

  feedPage: protectedProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(20), beforeId: z.number().int().positive().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await requireDatabase();
      const types = await enabledTypes(db, ctx.user.id, ctx.user.role);
      const rows = await db
        .select({
          id: notifications.id,
          type: notifications.type,
          postId: notifications.postId,
          commentId: notifications.commentId,
          feedbackId: notifications.feedbackId,
          partnerInquiryId: notifications.partnerInquiryId,
          message: notifications.message,
          readAt: notifications.readAt,
          createdAt: notifications.createdAt,
          actorName: users.name,
          actorUsername: users.username,
        })
        .from(notifications)
        .innerJoin(users, eq(notifications.actorId, users.id))
        .where(and(eq(notifications.recipientId, ctx.user.id), ...(types ? [inArray(notifications.type, types)] : []), ...(input.beforeId ? [lt(notifications.id, input.beforeId)] : [])))
        .orderBy(desc(notifications.id))
        .limit(input.limit + 1);
      const hasMore = rows.length > input.limit;
      const page = (hasMore ? rows.slice(0, input.limit) : rows).map(row => ({
        ...row,
        actorName: row.actorName ?? row.actorUsername ?? "BlackWaterLeaf-Nutzer",
        isRead: Boolean(row.readAt),
      }));
      return { items: page, nextCursor: hasMore ? page.at(-1)?.id ?? null : null } as const;
    }),

  markRead: protectedProcedure
    .input(z.object({ notificationId: z.number().int().positive().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDatabase();
      const where = input.notificationId
        ? and(eq(notifications.id, input.notificationId), eq(notifications.recipientId, ctx.user.id))
        : eq(notifications.recipientId, ctx.user.id);
      await db.update(notifications).set({ readAt: new Date() }).where(where);
      return { success: true } as const;
    }),
});
