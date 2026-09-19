import { TRPCError } from "@trpc/server";
import { and, desc, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { notifications, users } from "../../drizzle/schema";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";

async function requireDatabase() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "database_unavailable" });
  return db;
}

export const notificationsRouter = router({
  feed: protectedProcedure.query(async ({ ctx }) => {
    const db = await requireDatabase();
    const rows = await db
      .select({
        id: notifications.id,
        type: notifications.type,
        postId: notifications.postId,
        commentId: notifications.commentId,
        message: notifications.message,
        readAt: notifications.readAt,
        createdAt: notifications.createdAt,
        actorName: users.name,
        actorUsername: users.username,
      })
      .from(notifications)
      .innerJoin(users, eq(notifications.actorId, users.id))
      .where(eq(notifications.recipientId, ctx.user.id))
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
    const rows = await db
      .select({ id: notifications.id })
      .from(notifications)
      .where(and(eq(notifications.recipientId, ctx.user.id), isNull(notifications.readAt)))
      .limit(100);
    return { count: rows.length } as const;
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
