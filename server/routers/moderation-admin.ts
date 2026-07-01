/**
 * Moderations-, Admin- und Suche-Module für BlackwaterLeaf.
 *
 *  - moderation → Inhalte melden, Melde-Queue, Rollen-/Status-Aktionen, Audit-Log
 *  - admin      → KPI-Dashboard mit echten DB-Kennzahlen, Nutzerverwaltung
 *  - search     → erweiterte Suche über Nutzer und Gruppen (ergänzt discover.search)
 *
 * Rollenmodell: user < moderator < admin.
 */

import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "../db";
import {
  users, posts, comments, groups, reports, moderationLogs, notifications,
  plants, aquariums, messages, follows,
} from "../../drizzle/schema";
import { eq, desc, and, or, like, sql, gte, inArray } from "drizzle-orm";
import { requireDb, notify } from "./community";

// ─── Rollen-geschützte Prozeduren ───────────────────────────────────────────
const staffProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin" && ctx.user.role !== "moderator") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Moderator- oder Admin-Rechte erforderlich." });
  }
  return next({ ctx });
});

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin-Rechte erforderlich." });
  }
  return next({ ctx });
});

// ════════════════════════════════════════════════════════════════════════════
// MODUL: moderation — Melden & Bearbeiten
// ════════════════════════════════════════════════════════════════════════════
const moderationRouter = router({
  /** Inhalt melden (jeder angemeldete Nutzer). */
  report: protectedProcedure
    .input(z.object({
      targetType: z.enum(["post", "comment", "user", "message", "group"]),
      targetId: z.number(),
      reason: z.enum(["spam", "harassment", "misinformation", "inappropriate", "illegal", "other"]),
      details: z.string().max(1000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      // Doppelmeldung desselben Inhalts durch denselben Nutzer vermeiden.
      const existing = await db.select().from(reports)
        .where(and(
          eq(reports.reporterId, ctx.user.id),
          eq(reports.targetType, input.targetType),
          eq(reports.targetId, input.targetId),
          eq(reports.status, "open"),
        )).limit(1);
      if (existing.length > 0) return { success: true, alreadyReported: true };
      await db.insert(reports).values({
        reporterId: ctx.user.id, targetType: input.targetType,
        targetId: input.targetId, reason: input.reason, details: input.details,
      });
      return { success: true, alreadyReported: false };
    }),

  /** Melde-Queue (Moderator/Admin). Optional nach Status gefiltert. */
  queue: staffProcedure
    .input(z.object({
      status: z.enum(["open", "reviewing", "resolved", "dismissed"]).optional(),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ input }) => {
      const db = await requireDb();
      return db.select({
        id: reports.id, targetType: reports.targetType, targetId: reports.targetId,
        reason: reports.reason, details: reports.details, status: reports.status,
        createdAt: reports.createdAt, handledBy: reports.handledBy,
        reporterId: reports.reporterId, reporterName: users.name,
      }).from(reports)
        .leftJoin(users, eq(reports.reporterId, users.id))
        .where(input.status ? eq(reports.status, input.status) : undefined)
        .orderBy(desc(reports.createdAt))
        .limit(input.limit);
    }),

  /** Meldung bearbeiten: Status setzen + optionale Aktion + Audit-Log. */
  resolve: staffProcedure
    .input(z.object({
      reportId: z.number(),
      status: z.enum(["reviewing", "resolved", "dismissed"]),
      action: z.enum(["none", "delete_content", "suspend_user", "ban_user"]).default("none"),
      note: z.string().max(1000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const rows = await db.select().from(reports).where(eq(reports.id, input.reportId)).limit(1);
      const report = rows[0];
      if (!report) throw new TRPCError({ code: "NOT_FOUND" });

      // Optionale Durchsetzungs-Aktion.
      if (input.action === "delete_content") {
        if (report.targetType === "post") await db.delete(posts).where(eq(posts.id, report.targetId));
        if (report.targetType === "comment") await db.delete(comments).where(eq(comments.id, report.targetId));
        if (report.targetType === "message") await db.delete(messages).where(eq(messages.id, report.targetId));
      } else if (input.action === "suspend_user" || input.action === "ban_user") {
        const newStatus = input.action === "ban_user" ? "banned" : "suspended";
        // Nutzer ermitteln (bei user-Meldung direkt, sonst Autor des Inhalts).
        let targetUserId: number | null = null;
        if (report.targetType === "user") targetUserId = report.targetId;
        else if (report.targetType === "post") {
          const p = await db.select().from(posts).where(eq(posts.id, report.targetId)).limit(1);
          targetUserId = p[0]?.userId ?? null;
        } else if (report.targetType === "comment") {
          const c = await db.select().from(comments).where(eq(comments.id, report.targetId)).limit(1);
          targetUserId = c[0]?.userId ?? null;
        }
        if (targetUserId) {
          await db.update(users).set({ status: newStatus }).where(eq(users.id, targetUserId));
          await notify(db, {
            userId: targetUserId, type: "moderation",
            title: newStatus === "banned" ? "Konto gesperrt" : "Konto eingeschränkt",
            message: input.note ?? "Ein Moderator hat eine Maßnahme gegen dein Konto ergriffen.",
          });
        }
      }

      await db.update(reports).set({
        status: input.status, handledBy: ctx.user.id, resolutionNote: input.note,
      }).where(eq(reports.id, input.reportId));

      // Audit-Log.
      await db.insert(moderationLogs).values({
        actorId: ctx.user.id, action: `report_${input.status}_${input.action}`,
        targetType: report.targetType, targetId: report.targetId, note: input.note,
      });
      return { success: true };
    }),

  /** Audit-Log (Admin). */
  auditLog: adminProcedure
    .input(z.object({ limit: z.number().min(1).max(200).default(100) }))
    .query(async ({ input }) => {
      const db = await requireDb();
      return db.select({
        id: moderationLogs.id, action: moderationLogs.action,
        targetType: moderationLogs.targetType, targetId: moderationLogs.targetId,
        note: moderationLogs.note, createdAt: moderationLogs.createdAt,
        actorId: moderationLogs.actorId, actorName: users.name,
      }).from(moderationLogs)
        .leftJoin(users, eq(moderationLogs.actorId, users.id))
        .orderBy(desc(moderationLogs.createdAt))
        .limit(input.limit);
    }),
});

// ════════════════════════════════════════════════════════════════════════════
// MODUL: admin — KPI-Dashboard & Nutzerverwaltung (echte Daten)
// ════════════════════════════════════════════════════════════════════════════
const adminRouter = router({
  /** Kennzahlen für das Admin-Dashboard – ausschließlich aus echten DB-Daten. */
  stats: adminProcedure.query(async () => {
    const db = await requireDb();
    const now = Date.now();
    const dayAgo = new Date(now - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const count = async (q: Promise<{ c: number }[]>) => Number((await q)[0]?.c ?? 0);

    const [
      totalUsers, newUsersWeek, activeUsersMonth,
      totalPosts, postsWeek, totalComments,
      totalPlants, totalAquariums, totalGroups,
      openReports, totalMessages,
    ] = await Promise.all([
      count(db.select({ c: sql<number>`COUNT(*)` }).from(users)),
      count(db.select({ c: sql<number>`COUNT(*)` }).from(users).where(gte(users.createdAt, weekAgo))),
      count(db.select({ c: sql<number>`COUNT(*)` }).from(users).where(gte(users.lastSignedIn, monthAgo))),
      count(db.select({ c: sql<number>`COUNT(*)` }).from(posts)),
      count(db.select({ c: sql<number>`COUNT(*)` }).from(posts).where(gte(posts.createdAt, weekAgo))),
      count(db.select({ c: sql<number>`COUNT(*)` }).from(comments)),
      count(db.select({ c: sql<number>`COUNT(*)` }).from(plants)),
      count(db.select({ c: sql<number>`COUNT(*)` }).from(aquariums)),
      count(db.select({ c: sql<number>`COUNT(*)` }).from(groups)),
      count(db.select({ c: sql<number>`COUNT(*)` }).from(reports).where(eq(reports.status, "open"))),
      count(db.select({ c: sql<number>`COUNT(*)` }).from(messages)),
    ]);

    return {
      users: { total: totalUsers, newThisWeek: newUsersWeek, activeThisMonth: activeUsersMonth },
      content: { posts: totalPosts, postsThisWeek: postsWeek, comments: totalComments, plants: totalPlants, aquariums: totalAquariums, groups: totalGroups, messages: totalMessages },
      moderation: { openReports },
      generatedAt: new Date(),
    };
  }),

  /** Nutzerliste mit Suche (Admin). */
  users: adminProcedure
    .input(z.object({ query: z.string().max(100).optional(), limit: z.number().min(1).max(100).default(50) }))
    .query(async ({ input }) => {
      const db = await requireDb();
      const q = input.query ? `%${input.query}%` : undefined;
      return db.select({
        id: users.id, name: users.name, username: users.username, email: users.email,
        role: users.role, status: users.status, plan: users.plan,
        followersCount: users.followersCount, createdAt: users.createdAt, lastSignedIn: users.lastSignedIn,
      }).from(users)
        .where(q ? or(like(users.name, q), like(users.username, q), like(users.email, q)) : undefined)
        .orderBy(desc(users.createdAt))
        .limit(input.limit);
    }),

  /** Rolle eines Nutzers setzen (Admin). */
  setRole: adminProcedure
    .input(z.object({ userId: z.number(), role: z.enum(["user", "moderator", "admin"]) }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      await db.update(users).set({ role: input.role }).where(eq(users.id, input.userId));
      await db.insert(moderationLogs).values({
        actorId: ctx.user.id, action: `set_role_${input.role}`,
        targetType: "user", targetId: input.userId,
      });
      return { success: true };
    }),

  /** Kontostatus setzen (Admin): active/suspended/banned. */
  setStatus: adminProcedure
    .input(z.object({ userId: z.number(), status: z.enum(["active", "suspended", "banned"]), note: z.string().max(500).optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      await db.update(users).set({ status: input.status }).where(eq(users.id, input.userId));
      await db.insert(moderationLogs).values({
        actorId: ctx.user.id, action: `set_status_${input.status}`,
        targetType: "user", targetId: input.userId, note: input.note,
      });
      return { success: true };
    }),
});

// ════════════════════════════════════════════════════════════════════════════
// MODUL: search — Erweiterte Suche über Nutzer und Gruppen
// ════════════════════════════════════════════════════════════════════════════
const searchRouter = router({
  /** Kombinierte Suche über Nutzer und Gruppen (ergänzt discover.search). */
  usersAndGroups: publicProcedure
    .input(z.object({ query: z.string().min(1).max(100), limit: z.number().min(1).max(50).default(20) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { users: [], groups: [] };
      const q = `%${input.query}%`;
      const [userResults, groupResults] = await Promise.all([
        db.select({
          id: users.id, name: users.name, username: users.username,
          avatarUrl: users.avatarUrl, bio: users.bio, followersCount: users.followersCount,
        }).from(users)
          .where(or(like(users.name, q), like(users.username, q)))
          .orderBy(desc(users.followersCount)).limit(input.limit),
        db.select({
          id: groups.id, slug: groups.slug, name: groups.name,
          description: groups.description, topic: groups.topic,
          membersCount: groups.membersCount, isOfficial: groups.isOfficial,
        }).from(groups)
          .where(or(like(groups.name, q), like(groups.description, q)))
          .orderBy(desc(groups.membersCount)).limit(input.limit),
      ]);
      return { users: userResults, groups: groupResults };
    }),
});

export { moderationRouter, adminRouter, searchRouter };
