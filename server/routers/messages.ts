import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, gt, isNull, lt, ne, or } from "drizzle-orm";
import { z } from "zod";
import { directConversations, directMessages, notifications, userBlocks, users } from "../../drizzle/schema";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";

async function requireDatabase() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "database_unavailable" });
  return db;
}

function orderedParticipants(firstId: number, secondId: number) {
  return firstId < secondId
    ? { participantOneId: firstId, participantTwoId: secondId }
    : { participantOneId: secondId, participantTwoId: firstId };
}

async function assertNotBlocked(db: Awaited<ReturnType<typeof requireDatabase>>, firstId: number, secondId: number) {
  const blocked = await db
    .select({ id: userBlocks.id })
    .from(userBlocks)
    .where(
      or(
        and(eq(userBlocks.blockerId, firstId), eq(userBlocks.blockedId, secondId)),
        and(eq(userBlocks.blockerId, secondId), eq(userBlocks.blockedId, firstId)),
      ),
    )
    .limit(1);
  if (blocked[0]) throw new TRPCError({ code: "FORBIDDEN", message: "messaging_blocked" });
}

async function assertRecipient(db: Awaited<ReturnType<typeof requireDatabase>>, senderId: number, recipientId: number) {
  if (senderId === recipientId) throw new TRPCError({ code: "BAD_REQUEST", message: "cannot_message_self" });
  const [recipient] = await db
    .select({ id: users.id, name: users.name, username: users.username, status: users.status })
    .from(users)
    .where(eq(users.id, recipientId))
    .limit(1);
  if (!recipient || recipient.status !== "active") throw new TRPCError({ code: "NOT_FOUND", message: "recipient_not_available" });
  await assertNotBlocked(db, senderId, recipientId);
  return recipient;
}

async function assertMessageAllowed(db: Awaited<ReturnType<typeof requireDatabase>>, userId: number, content: string) {
  const prohibited = /\b(?:sex|porno|pornografie|porn|xxx|onlyfans|ficken|vergewaltig|nackt|nacktbilder|intimfoto|sexuell)\w*\b/i;
  if (prohibited.test(content.normalize("NFKC"))) {
    await db.update(users).set({ status: "suspended" }).where(eq(users.id, userId));
    throw new TRPCError({ code: "FORBIDDEN", message: "messaging_content_policy_violation_account_suspended" });
  }
}

async function assertMessageRateLimit(db: Awaited<ReturnType<typeof requireDatabase>>, userId: number) {
  const since = new Date(Date.now() - 60 * 60 * 1_000);
  const [row] = await db
    .select({ total: count() })
    .from(directMessages)
    .where(and(eq(directMessages.senderId, userId), eq(directMessages.status, "visible"), gt(directMessages.createdAt, since)));
  if (Number(row?.total ?? 0) >= 100) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "messaging_rate_limit" });
}

async function getConversationForMember(db: Awaited<ReturnType<typeof requireDatabase>>, userId: number, conversationId: number) {
  const [conversation] = await db
    .select()
    .from(directConversations)
    .where(
      and(
        eq(directConversations.id, conversationId),
        or(eq(directConversations.participantOneId, userId), eq(directConversations.participantTwoId, userId)),
      ),
    )
    .limit(1);
  if (!conversation) throw new TRPCError({ code: "NOT_FOUND", message: "conversation_not_found" });
  const otherId = conversation.participantOneId === userId ? conversation.participantTwoId : conversation.participantOneId;
  await assertNotBlocked(db, userId, otherId);
  return { conversation, otherId } as const;
}

function publicMember(user: { id: number; name: string | null; username: string | null; avatarUrl: string | null }) {
  return { id: String(user.id), name: user.name ?? user.username ?? "BlackWaterLeaf-Nutzer", username: user.username, avatarUrl: user.avatarUrl } as const;
}

const unreadForUser = (userId: number) => or(
  and(eq(directConversations.participantOneId, userId), eq(directMessages.senderId, directConversations.participantTwoId)),
  and(eq(directConversations.participantTwoId, userId), eq(directMessages.senderId, directConversations.participantOneId)),
);

export const messagesRouter = router({
  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    const db = await requireDatabase();
    const [row] = await db
      .select({ total: count() })
      .from(directMessages)
      .innerJoin(directConversations, eq(directMessages.conversationId, directConversations.id))
      .where(
        and(
          or(eq(directConversations.participantOneId, ctx.user.id), eq(directConversations.participantTwoId, ctx.user.id)),
          eq(directMessages.status, "visible"),
          isNull(directMessages.readAt),
          unreadForUser(ctx.user.id),
        ),
      );
    return { count: Number(row?.total ?? 0) } as const;
  }),

  conversations: protectedProcedure.query(async ({ ctx }) => {
    const db = await requireDatabase();
    const rows = await db
      .select()
      .from(directConversations)
      .where(or(eq(directConversations.participantOneId, ctx.user.id), eq(directConversations.participantTwoId, ctx.user.id)))
      .orderBy(desc(directConversations.lastMessageAt))
      .limit(50);
    const items = await Promise.all(
      rows.map(async conversation => {
        const otherId = conversation.participantOneId === ctx.user.id ? conversation.participantTwoId : conversation.participantOneId;
        try {
          await assertNotBlocked(db, ctx.user.id, otherId);
        } catch {
          return null;
        }
        const [[other], [last], [unread]] = await Promise.all([
          db.select({ id: users.id, name: users.name, username: users.username, avatarUrl: users.avatarUrl }).from(users).where(and(eq(users.id, otherId), eq(users.status, "active"))).limit(1),
          db.select({ id: directMessages.id, senderId: directMessages.senderId, content: directMessages.content, createdAt: directMessages.createdAt }).from(directMessages).where(and(eq(directMessages.conversationId, conversation.id), eq(directMessages.status, "visible"))).orderBy(desc(directMessages.id)).limit(1),
          db.select({ total: count() }).from(directMessages).where(and(eq(directMessages.conversationId, conversation.id), eq(directMessages.status, "visible"), isNull(directMessages.readAt), ne(directMessages.senderId, ctx.user.id))),
        ]);
        if (!other) return null;
        return {
          id: String(conversation.id),
          member: publicMember(other),
          lastMessage: last ? { id: String(last.id), content: last.content, senderId: String(last.senderId), createdAt: last.createdAt.toISOString() } : null,
          unreadCount: Number(unread?.total ?? 0),
          updatedAt: conversation.updatedAt.toISOString(),
        } as const;
      }),
    );
    return items.filter((item): item is NonNullable<typeof item> => Boolean(item));
  }),

  messages: protectedProcedure
    .input(z.object({ conversationId: z.number().int().positive(), limit: z.number().int().min(1).max(50).default(50), beforeId: z.number().int().positive().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await requireDatabase();
      await getConversationForMember(db, ctx.user.id, input.conversationId);
      const rows = await db
        .select({ id: directMessages.id, senderId: directMessages.senderId, content: directMessages.content, createdAt: directMessages.createdAt })
        .from(directMessages)
        .where(and(eq(directMessages.conversationId, input.conversationId), eq(directMessages.status, "visible"), ...(input.beforeId ? [lt(directMessages.id, input.beforeId)] : [])))
        .orderBy(desc(directMessages.id))
        .limit(input.limit + 1);
      const hasMore = rows.length > input.limit;
      const page = (hasMore ? rows.slice(0, input.limit) : rows).reverse();
      return { items: page.map(row => ({ ...row, id: String(row.id), senderId: String(row.senderId), createdAt: row.createdAt.toISOString() })), nextCursor: hasMore ? page[0]?.id ?? null : null } as const;
    }),

  start: protectedProcedure
    .input(z.object({ recipientId: z.number().int().positive(), content: z.string().trim().min(1).max(2_000) }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDatabase();
      await assertMessageAllowed(db, ctx.user.id, input.content);
      await assertMessageRateLimit(db, ctx.user.id);
      const recipient = await assertRecipient(db, ctx.user.id, input.recipientId);
      const pair = orderedParticipants(ctx.user.id, input.recipientId);
      await db.insert(directConversations).values(pair).onDuplicateKeyUpdate({ set: { updatedAt: new Date() } });
      const [conversation] = await db.select().from(directConversations).where(and(eq(directConversations.participantOneId, pair.participantOneId), eq(directConversations.participantTwoId, pair.participantTwoId))).limit(1);
      if (!conversation) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "conversation_create_failed" });
      const result = await db.transaction(async tx => {
        const inserted = await tx.insert(directMessages).values({ conversationId: conversation.id, senderId: ctx.user.id, content: input.content });
        await tx.update(directConversations).set({ lastMessageAt: new Date(), updatedAt: new Date() }).where(eq(directConversations.id, conversation.id));
        await tx.insert(notifications).values({ recipientId: recipient.id, actorId: ctx.user.id, type: "message", message: "Neue private Nachricht erhalten." });
        return Number(inserted[0].insertId);
      });
      return { conversationId: String(conversation.id), messageId: String(result) } as const;
    }),

  send: protectedProcedure
    .input(z.object({ conversationId: z.number().int().positive(), content: z.string().trim().min(1).max(2_000) }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDatabase();
      await assertMessageAllowed(db, ctx.user.id, input.content);
      await assertMessageRateLimit(db, ctx.user.id);
      const { conversation, otherId } = await getConversationForMember(db, ctx.user.id, input.conversationId);
      const recipient = await assertRecipient(db, ctx.user.id, otherId);
      const result = await db.transaction(async tx => {
        const inserted = await tx.insert(directMessages).values({ conversationId: conversation.id, senderId: ctx.user.id, content: input.content });
        await tx.update(directConversations).set({ lastMessageAt: new Date(), updatedAt: new Date() }).where(eq(directConversations.id, conversation.id));
        await tx.insert(notifications).values({ recipientId: recipient.id, actorId: ctx.user.id, type: "message", message: "Neue private Nachricht erhalten." });
        return Number(inserted[0].insertId);
      });
      return { messageId: String(result), sent: true } as const;
    }),

  markRead: protectedProcedure
    .input(z.object({ conversationId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDatabase();
      const { conversation } = await getConversationForMember(db, ctx.user.id, input.conversationId);
      await db.update(directMessages).set({ readAt: new Date() }).where(and(eq(directMessages.conversationId, conversation.id), eq(directMessages.status, "visible"), isNull(directMessages.readAt), ne(directMessages.senderId, ctx.user.id)));
      return { success: true } as const;
    }),
});
