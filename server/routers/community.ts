/**
 * Community-Module für BlackwaterLeaf.
 *
 * Modular aufgebaut gemäß Developer Master Handbook: Jedes Modul ist ein
 * eigenständiger tRPC-Router, der in `appRouter` eingehängt wird. So lassen
 * sich weitere Module (V2/V3) ohne Umbau ergänzen.
 *
 * Enthaltene Module:
 *  - social      → öffentliche Profile, Folgen/Entfolgen, Follower-Listen
 *  - threads     → threaded Kommentare (Antworten) + Kommentar-Likes
 *  - groups      → Fachgruppen (Pflanzen/Aquaristik/Terraristik), Beitritt, Gruppen-Feed
 *  - messaging   → private 1:1- und Gruppen-Konversationen + Nachrichten
 *  - moderation  → Melden von Inhalten, Melde-Queue, Rollen-Aktionen, Audit-Log
 *  - admin       → KPI-Dashboard mit echten DB-Kennzahlen (nur Admin)
 */

import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "../db";
import {
  users, posts, comments, commentLikes, follows,
  groups, groupMembers, conversations, conversationParticipants, messages,
  reports, moderationLogs, notifications, likes, plants, aquariums,
} from "../../drizzle/schema";
import { eq, desc, and, or, like, sql, inArray, ne } from "drizzle-orm";
import { storagePut } from "../storage";
import { awardXp } from "../db";

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

/** Wirft, wenn keine DB verfügbar ist; gibt sonst die Instanz zurück. */
async function requireDb() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });
  return db;
}

/** Erzeugt einen Notifications-Eintrag defensiv (Fehler werden verschluckt). */
async function notify(
  db: Awaited<ReturnType<typeof requireDb>>,
  entry: {
    userId: number;
    type: "like" | "comment" | "reply" | "follow" | "mention" | "message" | "group_invite" | "group_post" | "moderation" | "care_reminder" | "system";
    title: string;
    message: string;
    relatedPostId?: number;
    relatedUserId?: number;
    relatedCommentId?: number;
    relatedGroupId?: number;
    relatedConversationId?: number;
  },
) {
  try {
    await db.insert(notifications).values(entry);
  } catch {
    /* Benachrichtigung ist nicht kritisch */
  }
}

/** Slug aus einem Namen erzeugen (a-z0-9-). */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || `gruppe-${Date.now()}`;
}

// ════════════════════════════════════════════════════════════════════════════
// MODUL: social — Profile & Folgen
// ════════════════════════════════════════════════════════════════════════════
const socialRouter = router({
  /** Öffentliches Profil inkl. Zähler und (falls angemeldet) Follow-Status. */
  publicProfile: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;
      const rows = await db.select({
        id: users.id, name: users.name, username: users.username,
        avatarUrl: users.avatarUrl, bio: users.bio, location: users.location,
        role: users.role, plan: users.plan,
        followersCount: users.followersCount, followingCount: users.followingCount,
        createdAt: users.createdAt,
      }).from(users).where(eq(users.id, input.userId)).limit(1);
      const profile = rows[0];
      if (!profile) return null;

      // Zähler für Beiträge/Pflanzen/Aquarien (öffentlich).
      const [postCountRows, plantCountRows, aquaCountRows] = await Promise.all([
        db.select({ c: sql<number>`COUNT(*)` }).from(posts).where(eq(posts.userId, input.userId)),
        db.select({ c: sql<number>`COUNT(*)` }).from(plants).where(and(eq(plants.userId, input.userId), eq(plants.isPublic, true))),
        db.select({ c: sql<number>`COUNT(*)` }).from(aquariums).where(and(eq(aquariums.userId, input.userId), eq(aquariums.isPublic, true))),
      ]);

      let isFollowing = false;
      if (ctx.user && ctx.user.id !== input.userId) {
        const f = await db.select().from(follows)
          .where(and(eq(follows.followerId, ctx.user.id), eq(follows.followingId, input.userId))).limit(1);
        isFollowing = f.length > 0;
      }

      return {
        ...profile,
        postsCount: Number(postCountRows[0]?.c ?? 0),
        plantsCount: Number(plantCountRows[0]?.c ?? 0),
        aquariumsCount: Number(aquaCountRows[0]?.c ?? 0),
        isFollowing,
        isSelf: ctx.user?.id === input.userId,
      };
    }),

  /** Einem Nutzer folgen. Idempotent. */
  follow: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (input.userId === ctx.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Du kannst dir nicht selbst folgen." });
      }
      const db = await requireDb();
      const existing = await db.select().from(follows)
        .where(and(eq(follows.followerId, ctx.user.id), eq(follows.followingId, input.userId))).limit(1);
      if (existing.length > 0) return { following: true };
      await db.insert(follows).values({ followerId: ctx.user.id, followingId: input.userId });
      await db.update(users).set({ followingCount: sql`${users.followingCount} + 1` }).where(eq(users.id, ctx.user.id));
      await db.update(users).set({ followersCount: sql`${users.followersCount} + 1` }).where(eq(users.id, input.userId));
      await notify(db, {
        userId: input.userId, type: "follow",
        title: "Neuer Follower",
        message: `${ctx.user.name ?? "Jemand"} folgt dir jetzt.`,
        relatedUserId: ctx.user.id,
      });
      try { await awardXp(ctx.user.id, 2); } catch {}
      return { following: true };
    }),

  /** Einem Nutzer entfolgen. Idempotent. */
  unfollow: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const existing = await db.select().from(follows)
        .where(and(eq(follows.followerId, ctx.user.id), eq(follows.followingId, input.userId))).limit(1);
      if (existing.length === 0) return { following: false };
      await db.delete(follows).where(and(eq(follows.followerId, ctx.user.id), eq(follows.followingId, input.userId)));
      await db.update(users).set({ followingCount: sql`GREATEST(${users.followingCount} - 1, 0)` }).where(eq(users.id, ctx.user.id));
      await db.update(users).set({ followersCount: sql`GREATEST(${users.followersCount} - 1, 0)` }).where(eq(users.id, input.userId));
      return { following: false };
    }),

  /** Follower eines Nutzers auflisten. */
  followers: publicProcedure
    .input(z.object({ userId: z.number(), limit: z.number().min(1).max(100).default(50) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select({
        id: users.id, name: users.name, username: users.username,
        avatarUrl: users.avatarUrl, bio: users.bio,
        followersCount: users.followersCount,
      }).from(follows)
        .innerJoin(users, eq(follows.followerId, users.id))
        .where(eq(follows.followingId, input.userId))
        .orderBy(desc(follows.createdAt))
        .limit(input.limit);
    }),

  /** Nutzer, denen ein Nutzer folgt. */
  following: publicProcedure
    .input(z.object({ userId: z.number(), limit: z.number().min(1).max(100).default(50) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select({
        id: users.id, name: users.name, username: users.username,
        avatarUrl: users.avatarUrl, bio: users.bio,
        followersCount: users.followersCount,
      }).from(follows)
        .innerJoin(users, eq(follows.followingId, users.id))
        .where(eq(follows.followerId, input.userId))
        .orderBy(desc(follows.createdAt))
        .limit(input.limit);
    }),

  /** Personalisierter Feed: Beiträge von Nutzern, denen man folgt. */
  followingFeed: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(20), offset: z.number().min(0).default(0) }))
    .query(async ({ ctx, input }) => {
      const db = await requireDb();
      const followingRows = await db.select({ id: follows.followingId })
        .from(follows).where(eq(follows.followerId, ctx.user.id));
      const ids = followingRows.map(r => r.id);
      if (ids.length === 0) return { posts: [], total: 0 };
      const postList = await db.select({
        id: posts.id, userId: posts.userId, content: posts.content,
        imageUrl: posts.imageUrl, videoUrl: posts.videoUrl, mediaType: posts.mediaType,
        category: posts.category, likesCount: posts.likesCount, commentsCount: posts.commentsCount,
        createdAt: posts.createdAt, userName: users.name, userAvatarUrl: users.avatarUrl,
      }).from(posts)
        .leftJoin(users, eq(posts.userId, users.id))
        .where(inArray(posts.userId, ids))
        .orderBy(desc(posts.createdAt))
        .limit(input.limit).offset(input.offset);
      const userLikes = await db.select({ postId: likes.postId }).from(likes).where(eq(likes.userId, ctx.user.id));
      const liked = new Set(userLikes.map(l => l.postId));
      return { posts: postList.map(p => ({ ...p, isLiked: liked.has(p.id) })), total: postList.length };
    }),
});

// ════════════════════════════════════════════════════════════════════════════
// MODUL: threads — Threaded Kommentare & Kommentar-Likes
// ════════════════════════════════════════════════════════════════════════════
const threadsRouter = router({
  /** Alle Kommentare eines Beitrags inkl. Verschachtelung (flach mit parentId). */
  list: publicProcedure
    .input(z.object({ postId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const rows = await db.select({
        id: comments.id, userId: comments.userId, postId: comments.postId,
        parentId: comments.parentId, content: comments.content,
        likesCount: comments.likesCount, repliesCount: comments.repliesCount,
        createdAt: comments.createdAt,
        userName: users.name, userAvatarUrl: users.avatarUrl,
      }).from(comments)
        .leftJoin(users, eq(comments.userId, users.id))
        .where(eq(comments.postId, input.postId))
        .orderBy(comments.createdAt);

      let likedIds = new Set<number>();
      if (ctx.user) {
        const cl = await db.select({ commentId: commentLikes.commentId })
          .from(commentLikes).where(eq(commentLikes.userId, ctx.user.id));
        likedIds = new Set(cl.map(c => c.commentId));
      }
      return rows.map(r => ({ ...r, isLiked: likedIds.has(r.id) }));
    }),

  /** Antwort/Kommentar hinzufügen. parentId optional (→ Antwort). */
  add: protectedProcedure
    .input(z.object({
      postId: z.number(),
      parentId: z.number().optional(),
      content: z.string().min(1).max(1000),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const result = await db.insert(comments).values({
        userId: ctx.user.id, postId: input.postId,
        parentId: input.parentId ?? null, content: input.content,
      });
      await db.update(posts).set({ commentsCount: sql`${posts.commentsCount} + 1` }).where(eq(posts.id, input.postId));

      if (input.parentId) {
        // Reply-Zähler am Eltern-Kommentar erhöhen + Autor benachrichtigen.
        await db.update(comments).set({ repliesCount: sql`${comments.repliesCount} + 1` }).where(eq(comments.id, input.parentId));
        const parent = await db.select().from(comments).where(eq(comments.id, input.parentId)).limit(1);
        if (parent[0] && parent[0].userId !== ctx.user.id) {
          await notify(db, {
            userId: parent[0].userId, type: "reply",
            title: "Neue Antwort",
            message: `${ctx.user.name ?? "Jemand"} hat auf deinen Kommentar geantwortet.`,
            relatedPostId: input.postId, relatedUserId: ctx.user.id, relatedCommentId: input.parentId,
          });
        }
      } else {
        // Top-Level-Kommentar: Beitragsautor benachrichtigen.
        const post = await db.select().from(posts).where(eq(posts.id, input.postId)).limit(1);
        if (post[0] && post[0].userId !== ctx.user.id) {
          await notify(db, {
            userId: post[0].userId, type: "comment",
            title: "Neuer Kommentar",
            message: `${ctx.user.name ?? "Jemand"} hat deinen Beitrag kommentiert.`,
            relatedPostId: input.postId, relatedUserId: ctx.user.id,
          });
        }
      }
      try { await awardXp(ctx.user.id, 3); } catch {}
      return { id: Number(result[0].insertId) };
    }),

  /** Eigenen Kommentar löschen (nur Autor oder Moderator/Admin). */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const rows = await db.select().from(comments).where(eq(comments.id, input.id)).limit(1);
      const c = rows[0];
      if (!c) return { success: true };
      const isOwner = c.userId === ctx.user.id;
      const isStaff = ctx.user.role === "admin" || ctx.user.role === "moderator";
      if (!isOwner && !isStaff) throw new TRPCError({ code: "FORBIDDEN" });
      await db.delete(comments).where(eq(comments.id, input.id));
      await db.update(posts).set({ commentsCount: sql`GREATEST(${posts.commentsCount} - 1, 0)` }).where(eq(posts.id, c.postId));
      if (c.parentId) {
        await db.update(comments).set({ repliesCount: sql`GREATEST(${comments.repliesCount} - 1, 0)` }).where(eq(comments.id, c.parentId));
      }
      return { success: true };
    }),

  /** Kommentar liken/entliken (Toggle). */
  toggleLike: protectedProcedure
    .input(z.object({ commentId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const existing = await db.select().from(commentLikes)
        .where(and(eq(commentLikes.userId, ctx.user.id), eq(commentLikes.commentId, input.commentId))).limit(1);
      if (existing.length > 0) {
        await db.delete(commentLikes).where(and(eq(commentLikes.userId, ctx.user.id), eq(commentLikes.commentId, input.commentId)));
        await db.update(comments).set({ likesCount: sql`GREATEST(${comments.likesCount} - 1, 0)` }).where(eq(comments.id, input.commentId));
        return { liked: false };
      }
      await db.insert(commentLikes).values({ userId: ctx.user.id, commentId: input.commentId });
      await db.update(comments).set({ likesCount: sql`${comments.likesCount} + 1` }).where(eq(comments.id, input.commentId));
      return { liked: true };
    }),
});

export { socialRouter, threadsRouter, requireDb, notify, slugify };
