import { TRPCError } from "@trpc/server";
import { and, count, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { aiIdentificationCorrections, communityPosts, communityReports, mediaAssets, notifications, userRoles, users } from "../../drizzle/schema";
import { appendAuditEntry, getRecentAuditEntries } from "../auditLedger";
import { getDb } from "../db";
import { adminProcedure, router, staffProcedure } from "../_core/trpc";

const accountRole = z.enum(["user", "moderator", "admin"]);
const selectableRole = z.enum(["admin", "moderator", "merchant"]);
const accountStatus = z.enum(["active", "suspended", "banned"]);

async function requireDatabase() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "database_unavailable" });
  return db;
}

export const adminRouter = router({
  overview: staffProcedure.query(async () => {
    const db = await requireDatabase();
    const [accountCount] = await db.select({ total: count() }).from(users);
    const [activeCount] = await db.select({ total: count() }).from(users).where(eq(users.status, "active"));
    const [publishedPosts] = await db
      .select({ total: count() })
      .from(communityPosts)
      .where(and(eq(communityPosts.status, "published"), eq(communityPosts.visibility, "public")));
    const [hiddenPosts] = await db.select({ total: count() }).from(communityPosts).where(eq(communityPosts.status, "hidden"));

    return {
      accounts: Number(accountCount?.total ?? 0),
      activeAccounts: Number(activeCount?.total ?? 0),
      publicPosts: Number(publishedPosts?.total ?? 0),
      hiddenPosts: Number(hiddenPosts?.total ?? 0),
    };
  }),

  broadcast: adminProcedure
    .input(z.object({ content: z.string().trim().min(1).max(10_000), realm: z.enum(["botany", "aquarium", "terrarium"]).nullable(), publishAt: z.coerce.date().optional(), expiresAt: z.coerce.date().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDatabase();
      const publishAt = input.publishAt ?? new Date();
      const status = publishAt > new Date() ? "draft" : "published";
      const [inserted] = await db.insert(communityPosts).values({ userId: ctx.user.id, content: input.content, realm: input.realm, visibility: "public", status, publishAt, expiresAt: input.expiresAt }).$returningId();
      const postId = Number(inserted?.id);
      if (!postId) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "broadcast_not_created" });
      await appendAuditEntry({ actorId: ctx.user.id, action: "admin_feed_broadcast_created", targetType: "community_post", targetId: postId, payload: { realm: input.realm ?? "all", visibility: "public" } });
      return { id: postId, realm: input.realm, visibility: "public", status, publishAt: publishAt.toISOString(), expiresAt: input.expiresAt?.toISOString() ?? null } as const;
    }),

  broadcasts: adminProcedure.query(async ({ ctx }) => {
    const db = await requireDatabase();
    return db.select({ id: communityPosts.id, content: communityPosts.content, realm: communityPosts.realm, status: communityPosts.status, publishAt: communityPosts.publishAt, expiresAt: communityPosts.expiresAt, createdAt: communityPosts.createdAt, updatedAt: communityPosts.updatedAt }).from(communityPosts).where(eq(communityPosts.userId, ctx.user.id)).orderBy(desc(communityPosts.createdAt)).limit(50);
  }),

  updateBroadcast: adminProcedure
    .input(z.object({ id: z.number().int().positive(), content: z.string().trim().min(1).max(10_000), realm: z.enum(["botany", "aquarium", "terrarium"]).nullable() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDatabase();
      const result = await db.update(communityPosts).set({ content: input.content, realm: input.realm }).where(and(eq(communityPosts.id, input.id), eq(communityPosts.userId, ctx.user.id)));
      await appendAuditEntry({ actorId: ctx.user.id, action: "admin_feed_broadcast_updated", targetType: "community_post", targetId: input.id, payload: { realm: input.realm ?? "all" } });
      return { id: input.id, updated: result[0].affectedRows > 0 };
    }),

  retractBroadcast: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDatabase();
      const result = await db.update(communityPosts).set({ status: "hidden", visibility: "private" }).where(and(eq(communityPosts.id, input.id), eq(communityPosts.userId, ctx.user.id), eq(communityPosts.status, "published")));
      await appendAuditEntry({ actorId: ctx.user.id, action: "admin_feed_broadcast_retracted", targetType: "community_post", targetId: input.id, payload: { after: "hidden" } });
      return { id: input.id, retracted: result[0].affectedRows > 0 };
    }),

  publicPosts: staffProcedure.query(async () => {
    const db = await requireDatabase();
    return db
      .select({
        id: communityPosts.id,
        userId: communityPosts.userId,
        content: communityPosts.content,
        realm: communityPosts.realm,
        createdAt: communityPosts.createdAt,
        status: communityPosts.status,
        visibility: communityPosts.visibility,
      })
      .from(communityPosts)
      .where(and(eq(communityPosts.status, "published"), eq(communityPosts.visibility, "public")))
      .orderBy(desc(communityPosts.createdAt))
      .limit(50);
  }),

  setPublicPostStatus: staffProcedure
    .input(z.object({ id: z.number().int().positive(), status: z.enum(["hidden", "removed"]) }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDatabase();
      const [post] = await db
        .select({ id: communityPosts.id, status: communityPosts.status, visibility: communityPosts.visibility })
        .from(communityPosts)
        .where(eq(communityPosts.id, input.id))
        .limit(1);
      if (!post || post.status !== "published" || post.visibility !== "public") {
        throw new TRPCError({ code: "NOT_FOUND", message: "public_post_not_found" });
      }

      await db.transaction(async tx => {
        await tx.update(communityPosts).set({ status: input.status }).where(eq(communityPosts.id, input.id));
        await tx.update(mediaAssets).set({ visibility: "private" }).where(eq(mediaAssets.postId, input.id));
      });
      await appendAuditEntry({
        actorId: ctx.user.id,
        action: "community_post_moderated",
        targetType: "community_post",
        targetId: input.id,
        payload: { after: input.status, before: "published", visibility: "public" },
      });
      return { id: input.id, status: input.status } as const;
    }),

  deletePublicPost: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDatabase();
      const [post] = await db.select({ id: communityPosts.id, status: communityPosts.status, visibility: communityPosts.visibility }).from(communityPosts).where(eq(communityPosts.id, input.id)).limit(1);
      if (!post || post.status !== "published" || post.visibility !== "public") throw new TRPCError({ code: "NOT_FOUND", message: "public_post_not_found" });
      await db.transaction(async tx => {
        await tx.update(communityPosts).set({ status: "removed", visibility: "private" }).where(eq(communityPosts.id, input.id));
        await tx.update(mediaAssets).set({ visibility: "private" }).where(eq(mediaAssets.postId, input.id));
      });
      await appendAuditEntry({ actorId: ctx.user.id, action: "community_post_deleted_by_admin", targetType: "community_post", targetId: input.id, payload: { before: "published/public", after: "removed/private" } });
      return { id: input.id, status: "removed" } as const;
    }),

  plantCorrections: staffProcedure.query(async () => {
    const db = await requireDatabase();
    return db
      .select({
        id: aiIdentificationCorrections.id,
        userId: aiIdentificationCorrections.userId,
        userName: users.name,
        userEmail: users.email,
        assistantUsageId: aiIdentificationCorrections.assistantUsageId,
        originalAnswer: aiIdentificationCorrections.originalAnswer,
        correctedName: aiIdentificationCorrections.correctedName,
        correctionNote: aiIdentificationCorrections.correctionNote,
        status: aiIdentificationCorrections.status,
        reviewedAt: aiIdentificationCorrections.reviewedAt,
        createdAt: aiIdentificationCorrections.createdAt,
      })
      .from(aiIdentificationCorrections)
      .leftJoin(users, eq(aiIdentificationCorrections.userId, users.id))
      .where(eq(aiIdentificationCorrections.status, "pending"))
      .orderBy(desc(aiIdentificationCorrections.createdAt))
      .limit(100);
  }),

  reviewPlantCorrection: staffProcedure
    .input(z.object({ id: z.number().int().positive(), status: z.enum(["approved", "rejected"]), note: z.string().trim().max(1_000).optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDatabase();
      const [correction] = await db.select({ id: aiIdentificationCorrections.id, userId: aiIdentificationCorrections.userId, status: aiIdentificationCorrections.status, correctedName: aiIdentificationCorrections.correctedName }).from(aiIdentificationCorrections).where(eq(aiIdentificationCorrections.id, input.id)).limit(1);
      if (!correction) throw new TRPCError({ code: "NOT_FOUND", message: "plant_correction_not_found" });
      if (correction.status !== "pending") throw new TRPCError({ code: "CONFLICT", message: "plant_correction_already_reviewed" });
      await db.update(aiIdentificationCorrections).set({ status: input.status, reviewedByUserId: ctx.user.id, reviewedAt: new Date() }).where(eq(aiIdentificationCorrections.id, input.id));
      await db.insert(notifications).values({ recipientId: correction.userId, actorId: ctx.user.id, type: "moderation", message: `Deine Pflanzenkorrektur #${input.id} wurde ${input.status === "approved" ? "bestätigt" : "abgelehnt"}.` });
      await appendAuditEntry({ actorId: ctx.user.id, action: "ai_identification_correction_reviewed", targetType: "ai_identification_correction", targetId: input.id, payload: { after: input.status, correctedName: correction.correctedName, noteProvided: Boolean(input.note?.trim()) } });
      return { id: input.id, status: input.status } as const;
    }),

  accounts: adminProcedure.query(async () => {
    const db = await requireDatabase();
    const accounts = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        email: users.email,
        role: users.role,
        status: users.status,
        lastSignedIn: users.lastSignedIn,
      })
      .from(users)
      .orderBy(desc(users.lastSignedIn))
      .limit(100);
    const assignments = await db.select({ userId: userRoles.userId, role: userRoles.role }).from(userRoles);
    const rolesByUser = new Map<number, Array<"admin" | "moderator" | "merchant">>();
    for (const assignment of assignments) {
      const roles = rolesByUser.get(assignment.userId) ?? [];
      roles.push(assignment.role);
      rolesByUser.set(assignment.userId, roles);
    }
    return accounts.map(account => ({
      ...account,
      roles: Array.from(new Set([
        ...(rolesByUser.get(account.id) ?? []),
        ...(account.role === "admin" || account.role === "moderator" ? [account.role] : []),
      ])),
    }));
  }),

  setAccountStatus: adminProcedure
    .input(z.object({ id: z.number().int().positive(), status: accountStatus }))
    .mutation(async ({ ctx, input }) => {
      if (input.id === ctx.user.id && input.status !== "active") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "cannot_deactivate_current_admin" });
      }
      const db = await requireDatabase();
      const [target] = await db
        .select({ id: users.id, status: users.status })
        .from(users)
        .where(eq(users.id, input.id))
        .limit(1);
      if (!target) throw new TRPCError({ code: "NOT_FOUND", message: "account_not_found" });
      if (target.status === input.status) return { id: input.id, status: input.status, changed: false } as const;

      await db.update(users).set({ status: input.status }).where(eq(users.id, input.id));
      await appendAuditEntry({
        actorId: ctx.user.id,
        action: "account_status_changed",
        targetType: "user",
        targetId: input.id,
        payload: { after: input.status, before: target.status },
      });
      return { id: input.id, status: input.status, changed: true } as const;
    }),

  setAccountRole: adminProcedure
    .input(z.object({ id: z.number().int().positive(), role: accountRole }))
    .mutation(async ({ ctx, input }) => {
      if (input.id === ctx.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "cannot_change_current_admin_role" });
      }
      const db = await requireDatabase();
      const [target] = await db
        .select({ id: users.id, role: users.role, status: users.status })
        .from(users)
        .where(eq(users.id, input.id))
        .limit(1);
      if (!target) throw new TRPCError({ code: "NOT_FOUND", message: "account_not_found" });
      if (target.role === input.role) return { id: input.id, role: input.role, changed: false } as const;

      await db.update(users).set({ role: input.role }).where(eq(users.id, input.id));
      await appendAuditEntry({
        actorId: ctx.user.id,
        action: "account_role_changed",
        targetType: "user",
        targetId: input.id,
        payload: { after: input.role, before: target.role, targetStatus: target.status },
      });
      return { id: input.id, role: input.role, changed: true } as const;
    }),

  setAccountRoles: adminProcedure
    .input(z.object({ id: z.number().int().positive(), roles: z.array(selectableRole).max(3) }))
    .mutation(async ({ ctx, input }) => {
      if (input.id === ctx.user.id) throw new TRPCError({ code: "BAD_REQUEST", message: "cannot_change_current_admin_roles" });
      const db = await requireDatabase();
      const [target] = await db.select({ id: users.id, role: users.role, status: users.status }).from(users).where(eq(users.id, input.id)).limit(1);
      if (!target) throw new TRPCError({ code: "NOT_FOUND", message: "account_not_found" });
      const roles = Array.from(new Set(input.roles));
      const primaryRole = roles.includes("admin") ? "admin" : roles.includes("moderator") ? "moderator" : "user";
      await db.delete(userRoles).where(eq(userRoles.userId, input.id));
      if (roles.length) await db.insert(userRoles).values(roles.map(role => ({ userId: input.id, role, assignedBy: ctx.user.id })));
      if (target.role !== primaryRole) await db.update(users).set({ role: primaryRole }).where(eq(users.id, input.id));
      await appendAuditEntry({ actorId: ctx.user.id, action: "account_roles_changed", targetType: "user", targetId: input.id, payload: { before: target.role, after: primaryRole, roles } });
      return { id: input.id, roles, primaryRole, changed: true } as const;
    }),

  communityReports: staffProcedure.query(async () => {
    const db = await requireDatabase();
    return db
      .select({
        id: communityReports.id,
        reporterId: communityReports.reporterId,
        reporterName: users.name,
        postId: communityReports.postId,
        commentId: communityReports.commentId,
        reason: communityReports.reason,
        note: communityReports.note,
        status: communityReports.status,
        createdAt: communityReports.createdAt,
      })
      .from(communityReports)
      .leftJoin(users, eq(communityReports.reporterId, users.id))
      .where(eq(communityReports.status, "pending"))
      .orderBy(desc(communityReports.createdAt))
      .limit(100);
  }),

  reviewCommunityReport: staffProcedure
    .input(z.object({ id: z.number().int().positive(), status: z.enum(["reviewed", "dismissed"]), note: z.string().trim().max(1_000).optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDatabase();
      const [report] = await db.select({ id: communityReports.id, reporterId: communityReports.reporterId, postId: communityReports.postId, commentId: communityReports.commentId, status: communityReports.status, reason: communityReports.reason }).from(communityReports).where(eq(communityReports.id, input.id)).limit(1);
      if (!report) throw new TRPCError({ code: "NOT_FOUND", message: "community_report_not_found" });
      if (report.status !== "pending") throw new TRPCError({ code: "CONFLICT", message: "community_report_already_reviewed" });
      await db.transaction(async tx => {
        await tx.update(communityReports).set({ status: input.status, note: input.note?.trim() || null }).where(eq(communityReports.id, input.id));
        await tx.insert(notifications).values({
          recipientId: report.reporterId,
          actorId: ctx.user.id,
          type: "moderation",
          postId: report.postId,
          commentId: report.commentId,
          message: input.status === "reviewed" ? "Deine Community-Meldung wurde geprüft." : "Deine Community-Meldung wurde geschlossen.",
        });
      });
      await appendAuditEntry({ actorId: ctx.user.id, action: "community_report_reviewed", targetType: "community_report", targetId: input.id, payload: { after: input.status, reason: report.reason, noteProvided: Boolean(input.note?.trim()) } });
      return { id: input.id, status: input.status } as const;
    }),

  auditTrail: staffProcedure.query(async () => {
    const entries = await getRecentAuditEntries(50);
    return entries.map(entry => ({
      id: entry.id,
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId,
      createdAt: entry.createdAt,
      entryHash: entry.entryHash,
    }));
  }),
});
