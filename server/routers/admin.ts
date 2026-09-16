import { TRPCError } from "@trpc/server";
import { and, count, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { communityPosts, users } from "../../drizzle/schema";
import { appendAuditEntry, getRecentAuditEntries } from "../auditLedger";
import { getDb } from "../db";
import { adminProcedure, router, staffProcedure } from "../_core/trpc";

const accountRole = z.enum(["user", "moderator", "admin"]);
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

      await db.update(communityPosts).set({ status: input.status }).where(eq(communityPosts.id, input.id));
      await appendAuditEntry({
        actorId: ctx.user.id,
        action: "community_post_moderated",
        targetType: "community_post",
        targetId: input.id,
        payload: { after: input.status, before: "published", visibility: "public" },
      });
      return { id: input.id, status: input.status } as const;
    }),

  accounts: adminProcedure.query(async () => {
    const db = await requireDatabase();
    return db
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

  auditTrail: adminProcedure.query(async () => {
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
