/**
 * Fachgruppen- und Messaging-Module für BlackwaterLeaf.
 *
 *  - groups    → Fachgruppen (Pflanzen/Aquaristik/Terraristik), Beitritt, Gruppen-Feed
 *  - messaging → private 1:1- und Gruppen-Konversationen + Nachrichten (Polling-basiert)
 */

import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "../db";
import {
  users, posts, likes,
  groups, groupMembers, conversations, conversationParticipants, messages,
} from "../../drizzle/schema";
import { eq, desc, and, or, inArray, sql, ne } from "drizzle-orm";
import { requireDb, notify, slugify } from "./community";
import { awardXp } from "../db";
import { storagePut } from "../storage";

// ════════════════════════════════════════════════════════════════════════════
// MODUL: groups — Fachgruppen
// ════════════════════════════════════════════════════════════════════════════
const groupsRouter = router({
  /** Alle Gruppen auflisten, optional nach Thema gefiltert. */
  list: publicProcedure
    .input(z.object({
      topic: z.enum(["plants", "aquaristics", "terraristics", "general"]).optional(),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const rows = await db.select().from(groups)
        .where(input.topic ? eq(groups.topic, input.topic) : undefined)
        .orderBy(desc(groups.isOfficial), desc(groups.membersCount))
        .limit(input.limit);

      // Mitgliedschaftsstatus des aktuellen Nutzers anreichern.
      let memberOf = new Set<number>();
      if (ctx.user) {
        const m = await db.select({ groupId: groupMembers.groupId })
          .from(groupMembers).where(eq(groupMembers.userId, ctx.user.id));
        memberOf = new Set(m.map(x => x.groupId));
      }
      return rows.map(g => ({ ...g, isMember: memberOf.has(g.id) }));
    }),

  /** Eine Gruppe per Slug oder ID abrufen. */
  get: publicProcedure
    .input(z.object({ id: z.number().optional(), slug: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;
      if (!input.id && !input.slug) return null;
      const rows = await db.select().from(groups)
        .where(input.id ? eq(groups.id, input.id) : eq(groups.slug, input.slug!)).limit(1);
      const g = rows[0];
      if (!g) return null;
      let isMember = false;
      let memberRole: string | null = null;
      if (ctx.user) {
        const m = await db.select().from(groupMembers)
          .where(and(eq(groupMembers.groupId, g.id), eq(groupMembers.userId, ctx.user.id))).limit(1);
        isMember = m.length > 0;
        memberRole = m[0]?.role ?? null;
      }
      return { ...g, isMember, memberRole };
    }),

  /** Neue Gruppe erstellen. Ersteller wird Owner. */
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(2).max(128),
      description: z.string().max(2000).optional(),
      topic: z.enum(["plants", "aquaristics", "terraristics", "general"]).default("general"),
      visibility: z.enum(["public", "private"]).default("public"),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      let slug = slugify(input.name);
      // Slug-Kollision vermeiden.
      const clash = await db.select().from(groups).where(eq(groups.slug, slug)).limit(1);
      if (clash.length > 0) slug = `${slug}-${Date.now().toString(36)}`;
      const result = await db.insert(groups).values({
        slug, name: input.name, description: input.description,
        topic: input.topic, visibility: input.visibility,
        createdBy: ctx.user.id, membersCount: 1,
      });
      const groupId = Number(result[0].insertId);
      await db.insert(groupMembers).values({ groupId, userId: ctx.user.id, role: "owner" });
      try { await awardXp(ctx.user.id, 10); } catch {}
      return { id: groupId, slug };
    }),

  /** Gruppe beitreten. Idempotent. */
  join: protectedProcedure
    .input(z.object({ groupId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const existing = await db.select().from(groupMembers)
        .where(and(eq(groupMembers.groupId, input.groupId), eq(groupMembers.userId, ctx.user.id))).limit(1);
      if (existing.length > 0) return { joined: true };
      await db.insert(groupMembers).values({ groupId: input.groupId, userId: ctx.user.id, role: "member" });
      await db.update(groups).set({ membersCount: sql`${groups.membersCount} + 1` }).where(eq(groups.id, input.groupId));
      return { joined: true };
    }),

  /** Gruppe verlassen. Owner kann nicht einfach austreten (Schutz). */
  leave: protectedProcedure
    .input(z.object({ groupId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const m = await db.select().from(groupMembers)
        .where(and(eq(groupMembers.groupId, input.groupId), eq(groupMembers.userId, ctx.user.id))).limit(1);
      if (m.length === 0) return { joined: false };
      if (m[0].role === "owner") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Als Eigentümer kannst du die Gruppe nicht verlassen." });
      }
      await db.delete(groupMembers).where(and(eq(groupMembers.groupId, input.groupId), eq(groupMembers.userId, ctx.user.id)));
      await db.update(groups).set({ membersCount: sql`GREATEST(${groups.membersCount} - 1, 0)` }).where(eq(groups.id, input.groupId));
      return { joined: false };
    }),

  /** Mitglieder einer Gruppe. */
  members: publicProcedure
    .input(z.object({ groupId: z.number(), limit: z.number().min(1).max(100).default(50) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select({
        id: users.id, name: users.name, username: users.username,
        avatarUrl: users.avatarUrl, role: groupMembers.role, joinedAt: groupMembers.joinedAt,
      }).from(groupMembers)
        .innerJoin(users, eq(groupMembers.userId, users.id))
        .where(eq(groupMembers.groupId, input.groupId))
        .orderBy(desc(groupMembers.joinedAt))
        .limit(input.limit);
    }),

  /** Beiträge einer Gruppe (Gruppen-Feed). */
  feed: publicProcedure
    .input(z.object({ groupId: z.number(), limit: z.number().min(1).max(50).default(20), offset: z.number().min(0).default(0) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { posts: [], total: 0 };
      const postList = await db.select({
        id: posts.id, userId: posts.userId, content: posts.content,
        imageUrl: posts.imageUrl, videoUrl: posts.videoUrl, mediaType: posts.mediaType,
        category: posts.category, likesCount: posts.likesCount, commentsCount: posts.commentsCount,
        createdAt: posts.createdAt, userName: users.name, userAvatarUrl: users.avatarUrl,
      }).from(posts)
        .leftJoin(users, eq(posts.userId, users.id))
        .where(eq(posts.groupId, input.groupId))
        .orderBy(desc(posts.createdAt))
        .limit(input.limit).offset(input.offset);
      let liked = new Set<number>();
      if (ctx.user) {
        const ul = await db.select({ postId: likes.postId }).from(likes).where(eq(likes.userId, ctx.user.id));
        liked = new Set(ul.map(l => l.postId));
      }
      return { posts: postList.map(p => ({ ...p, isLiked: liked.has(p.id) })), total: postList.length };
    }),
});

// ════════════════════════════════════════════════════════════════════════════
// MODUL: messaging — Private Nachrichten & Gruppenchats
// ════════════════════════════════════════════════════════════════════════════
const messagingRouter = router({
  /** Konversationen des aktuellen Nutzers mit letzter Nachricht + Ungelesen-Flag. */
  conversations: protectedProcedure.query(async ({ ctx }) => {
    const db = await requireDb();
    const parts = await db.select({
      conversationId: conversationParticipants.conversationId,
      lastReadAt: conversationParticipants.lastReadAt,
    }).from(conversationParticipants).where(eq(conversationParticipants.userId, ctx.user.id));
    const convIds = parts.map(p => p.conversationId);
    if (convIds.length === 0) return [];
    const lastReadMap = new Map(parts.map(p => [p.conversationId, p.lastReadAt]));

    const convs = await db.select().from(conversations)
      .where(inArray(conversations.id, convIds))
      .orderBy(desc(conversations.lastMessageAt));

    // Für jede Konversation: Gegenüber (bei direct), letzte Nachricht, Ungelesen.
    const result = [];
    for (const c of convs) {
      const otherParts = await db.select({
        userId: conversationParticipants.userId,
        name: users.name, username: users.username, avatarUrl: users.avatarUrl,
      }).from(conversationParticipants)
        .innerJoin(users, eq(conversationParticipants.userId, users.id))
        .where(and(eq(conversationParticipants.conversationId, c.id), ne(conversationParticipants.userId, ctx.user.id)));
      const lastMsgRows = await db.select().from(messages)
        .where(eq(messages.conversationId, c.id)).orderBy(desc(messages.createdAt)).limit(1);
      const lastMsg = lastMsgRows[0] ?? null;
      const lastRead = lastReadMap.get(c.id);
      const unread = !!lastMsg && lastMsg.senderId !== ctx.user.id && (!lastRead || new Date(lastMsg.createdAt) > new Date(lastRead));
      result.push({
        id: c.id, kind: c.kind,
        title: c.kind === "group" ? c.title : (otherParts[0]?.name ?? "Unbekannt"),
        avatarUrl: c.kind === "direct" ? (otherParts[0]?.avatarUrl ?? null) : null,
        otherUserId: c.kind === "direct" ? (otherParts[0]?.userId ?? null) : null,
        participants: otherParts,
        lastMessage: lastMsg ? { content: lastMsg.content, createdAt: lastMsg.createdAt, senderId: lastMsg.senderId } : null,
        lastMessageAt: c.lastMessageAt,
        unread,
      });
    }
    return result;
  }),

  /** Bestehende 1:1-Konversation finden oder neu anlegen. */
  openDirect: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (input.userId === ctx.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Kein Chat mit dir selbst." });
      }
      const db = await requireDb();
      // Vorhandene direkte Konversation suchen (beide Teilnehmer).
      const mine = await db.select({ id: conversationParticipants.conversationId })
        .from(conversationParticipants).where(eq(conversationParticipants.userId, ctx.user.id));
      const myIds = mine.map(m => m.id);
      if (myIds.length > 0) {
        const shared = await db.select({ id: conversationParticipants.conversationId })
          .from(conversationParticipants)
          .where(and(eq(conversationParticipants.userId, input.userId), inArray(conversationParticipants.conversationId, myIds)));
        for (const s of shared) {
          const conv = await db.select().from(conversations).where(and(eq(conversations.id, s.id), eq(conversations.kind, "direct"))).limit(1);
          if (conv[0]) return { conversationId: conv[0].id };
        }
      }
      // Neu anlegen.
      const result = await db.insert(conversations).values({ kind: "direct", createdBy: ctx.user.id });
      const conversationId = Number(result[0].insertId);
      await db.insert(conversationParticipants).values([
        { conversationId, userId: ctx.user.id },
        { conversationId, userId: input.userId },
      ]);
      return { conversationId };
    }),

  /** Nachrichten einer Konversation abrufen (Teilnehmer-Check). */
  messages: protectedProcedure
    .input(z.object({ conversationId: z.number(), limit: z.number().min(1).max(100).default(50) }))
    .query(async ({ ctx, input }) => {
      const db = await requireDb();
      const part = await db.select().from(conversationParticipants)
        .where(and(eq(conversationParticipants.conversationId, input.conversationId), eq(conversationParticipants.userId, ctx.user.id))).limit(1);
      if (part.length === 0) throw new TRPCError({ code: "FORBIDDEN" });
      const rows = await db.select({
        id: messages.id, conversationId: messages.conversationId, senderId: messages.senderId,
        content: messages.content, imageUrl: messages.imageUrl, createdAt: messages.createdAt,
        senderName: users.name, senderAvatarUrl: users.avatarUrl,
      }).from(messages)
        .leftJoin(users, eq(messages.senderId, users.id))
        .where(eq(messages.conversationId, input.conversationId))
        .orderBy(desc(messages.createdAt))
        .limit(input.limit);
      // Chronologisch zurückgeben.
      return rows.reverse();
    }),

  /** Nachricht senden (Teilnehmer-Check + Benachrichtigung an andere). */
  send: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
      content: z.string().min(1).max(2000),
      imageBase64: z.string().optional(),
      imageMimeType: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const part = await db.select().from(conversationParticipants)
        .where(and(eq(conversationParticipants.conversationId, input.conversationId), eq(conversationParticipants.userId, ctx.user.id))).limit(1);
      if (part.length === 0) throw new TRPCError({ code: "FORBIDDEN" });

      let imageUrl: string | undefined;
      let storageKey: string | undefined;
      if (input.imageBase64 && input.imageMimeType) {
        const buffer = Buffer.from(input.imageBase64, "base64");
        const ext = input.imageMimeType.split("/")[1] ?? "jpg";
        const key = `messages/${input.conversationId}/${Date.now()}.${ext}`;
        const stored = await storagePut(key, buffer, input.imageMimeType);
        imageUrl = stored.url; storageKey = key;
      }

      const result = await db.insert(messages).values({
        conversationId: input.conversationId, senderId: ctx.user.id,
        content: input.content, imageUrl, storageKey,
      });
      await db.update(conversations).set({ lastMessageAt: new Date() }).where(eq(conversations.id, input.conversationId));
      // Sender als gelesen markieren.
      await db.update(conversationParticipants).set({ lastReadAt: new Date() })
        .where(and(eq(conversationParticipants.conversationId, input.conversationId), eq(conversationParticipants.userId, ctx.user.id)));

      // Andere Teilnehmer benachrichtigen.
      const others = await db.select().from(conversationParticipants)
        .where(and(eq(conversationParticipants.conversationId, input.conversationId), ne(conversationParticipants.userId, ctx.user.id)));
      for (const o of others) {
        await notify(db, {
          userId: o.userId, type: "message",
          title: "Neue Nachricht",
          message: `${ctx.user.name ?? "Jemand"}: ${input.content.substring(0, 60)}`,
          relatedUserId: ctx.user.id, relatedConversationId: input.conversationId,
        });
      }
      return { id: Number(result[0].insertId), imageUrl };
    }),

  /** Konversation als gelesen markieren. */
  markRead: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      await db.update(conversationParticipants).set({ lastReadAt: new Date() })
        .where(and(eq(conversationParticipants.conversationId, input.conversationId), eq(conversationParticipants.userId, ctx.user.id)));
      return { success: true };
    }),

  /** Anzahl Konversationen mit ungelesenen Nachrichten. */
  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { count: 0 };
    const parts = await db.select({
      conversationId: conversationParticipants.conversationId,
      lastReadAt: conversationParticipants.lastReadAt,
    }).from(conversationParticipants).where(eq(conversationParticipants.userId, ctx.user.id));
    let count = 0;
    for (const p of parts) {
      const lastMsg = await db.select().from(messages)
        .where(eq(messages.conversationId, p.conversationId)).orderBy(desc(messages.createdAt)).limit(1);
      const m = lastMsg[0];
      if (m && m.senderId !== ctx.user.id && (!p.lastReadAt || new Date(m.createdAt) > new Date(p.lastReadAt))) count++;
    }
    return { count };
  }),
});

export { groupsRouter, messagingRouter };
