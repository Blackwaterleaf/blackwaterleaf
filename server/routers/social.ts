import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, or } from "drizzle-orm";
import { z } from "zod";
import { aquariumTaxa, communityPosts, knowledgeArticles, partnerProfiles, partnerProducts, plantTaxa, savedItems, userBlocks, userFollows, users } from "../../drizzle/schema";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";

const targetTypeSchema = z.enum(["post", "knowledge", "plant_taxon", "aquarium_taxon", "product", "profile"]);
const idInput = z.object({ id: z.number().int().positive() });
const targetInput = z.object({ targetType: targetTypeSchema, targetId: z.number().int().positive() });

async function requireDatabase() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "database_unavailable" });
  return db;
}

async function assertPublicTarget(db: Awaited<ReturnType<typeof requireDatabase>>, targetType: z.infer<typeof targetTypeSchema>, targetId: number) {
  if (targetType === "post") {
    const row = await db.select({ id: communityPosts.id }).from(communityPosts).where(and(eq(communityPosts.id, targetId), eq(communityPosts.status, "published"), eq(communityPosts.visibility, "public"))).limit(1);
    if (!row[0]) throw new TRPCError({ code: "NOT_FOUND", message: "public_post_not_found" });
  } else if (targetType === "knowledge") {
    const row = await db.select({ id: knowledgeArticles.id }).from(knowledgeArticles).where(and(eq(knowledgeArticles.id, targetId), eq(knowledgeArticles.isPublished, true))).limit(1);
    if (!row[0]) throw new TRPCError({ code: "NOT_FOUND", message: "knowledge_not_found" });
  } else if (targetType === "plant_taxon") {
    const row = await db.select({ id: plantTaxa.id }).from(plantTaxa).where(and(eq(plantTaxa.id, targetId), eq(plantTaxa.status, "published"))).limit(1);
    if (!row[0]) throw new TRPCError({ code: "NOT_FOUND", message: "plant_taxon_not_found" });
  } else if (targetType === "aquarium_taxon") {
    const row = await db.select({ id: aquariumTaxa.id }).from(aquariumTaxa).where(and(eq(aquariumTaxa.id, targetId), eq(aquariumTaxa.status, "published"))).limit(1);
    if (!row[0]) throw new TRPCError({ code: "NOT_FOUND", message: "aquarium_taxon_not_found" });
  } else if (targetType === "product") {
    const row = await db.select({ id: partnerProducts.id }).from(partnerProducts).innerJoin(partnerProfiles, eq(partnerProducts.partnerId, partnerProfiles.id)).where(and(eq(partnerProducts.id, targetId), eq(partnerProducts.status, "active"), eq(partnerProfiles.status, "approved"))).limit(1);
    if (!row[0]) throw new TRPCError({ code: "NOT_FOUND", message: "product_not_found" });
  } else {
    const row = await db.select({ id: users.id }).from(users).where(and(eq(users.id, targetId), eq(users.status, "active"), eq(users.profileVisibility, "public"))).limit(1);
    if (!row[0]) throw new TRPCError({ code: "NOT_FOUND", message: "public_profile_not_found" });
  }
}

async function assertNotBlocked(db: Awaited<ReturnType<typeof requireDatabase>>, viewerId: number, targetId: number) {
  const rows = await db.select({ id: userBlocks.id }).from(userBlocks).where(or(
    and(eq(userBlocks.blockerId, viewerId), eq(userBlocks.blockedId, targetId)),
    and(eq(userBlocks.blockerId, targetId), eq(userBlocks.blockedId, viewerId)),
  )).limit(1);
  if (rows[0]) throw new TRPCError({ code: "FORBIDDEN", message: "social_relationship_blocked" });
}

export const socialRouter = router({
  adminProfile: publicProcedure.query(async ({ ctx }) => {
    const db = await requireDatabase();
    const admin = await db.select({ id: users.id, name: users.name, username: users.username, bio: users.bio, avatarUrl: users.avatarUrl }).from(users).where(and(eq(users.role, "admin"), eq(users.status, "active"))).orderBy(users.id).limit(1);
    const target = admin[0];
    if (!target) throw new TRPCError({ code: "NOT_FOUND", message: "admin_profile_not_found" });
    const [followers, relationship] = await Promise.all([
      db.select({ value: count() }).from(userFollows).where(and(eq(userFollows.followingId, target.id), eq(userFollows.status, "active"))),
      ctx.user ? db.select({ status: userFollows.status }).from(userFollows).where(and(eq(userFollows.followerId, ctx.user.id), eq(userFollows.followingId, target.id))).limit(1) : Promise.resolve([]),
    ]);
    return { ...target, id: String(target.id), followers: Number(followers[0]?.value ?? 0), isFollowing: relationship[0]?.status === "active" } as const;
  }),

  relationship: publicProcedure.input(idInput).query(async ({ ctx, input }) => {
    const db = await requireDatabase();
    const [followers, following, relationship, block] = await Promise.all([
      db.select({ value: count() }).from(userFollows).where(and(eq(userFollows.followingId, input.id), eq(userFollows.status, "active"))),
      db.select({ value: count() }).from(userFollows).where(and(eq(userFollows.followerId, input.id), eq(userFollows.status, "active"))),
      ctx.user ? db.select({ status: userFollows.status }).from(userFollows).where(and(eq(userFollows.followerId, ctx.user.id), eq(userFollows.followingId, input.id))).limit(1) : Promise.resolve([]),
      ctx.user ? db.select({ id: userBlocks.id }).from(userBlocks).where(and(eq(userBlocks.blockerId, ctx.user.id), eq(userBlocks.blockedId, input.id))).limit(1) : Promise.resolve([]),
    ]);
    return { followers: Number(followers[0]?.value ?? 0), following: Number(following[0]?.value ?? 0), isFollowing: relationship[0]?.status === "active", isBlockedByMe: Boolean(block[0]) } as const;
  }),

  follow: protectedProcedure.input(idInput).mutation(async ({ ctx, input }) => {
    if (ctx.user.id === input.id) throw new TRPCError({ code: "BAD_REQUEST", message: "cannot_follow_self" });
    const db = await requireDatabase();
    await assertPublicTarget(db, "profile", input.id);
    await assertNotBlocked(db, ctx.user.id, input.id);
    await db.insert(userFollows).values({ followerId: ctx.user.id, followingId: input.id, status: "active" }).onDuplicateKeyUpdate({ set: { status: "active", updatedAt: new Date() } });
    return { following: true } as const;
  }),

  unfollow: protectedProcedure.input(idInput).mutation(async ({ ctx, input }) => {
    const db = await requireDatabase();
    await db.update(userFollows).set({ status: "removed", updatedAt: new Date() }).where(and(eq(userFollows.followerId, ctx.user.id), eq(userFollows.followingId, input.id)));
    return { following: false } as const;
  }),

  block: protectedProcedure.input(idInput).mutation(async ({ ctx, input }) => {
    if (ctx.user.id === input.id) throw new TRPCError({ code: "BAD_REQUEST", message: "cannot_block_self" });
    const db = await requireDatabase();
    await db.insert(userBlocks).values({ blockerId: ctx.user.id, blockedId: input.id }).onDuplicateKeyUpdate({ set: { createdAt: new Date() } });
    await db.update(userFollows).set({ status: "removed", updatedAt: new Date() }).where(or(and(eq(userFollows.followerId, ctx.user.id), eq(userFollows.followingId, input.id)), and(eq(userFollows.followerId, input.id), eq(userFollows.followingId, ctx.user.id))));
    return { blocked: true } as const;
  }),

  unblock: protectedProcedure.input(idInput).mutation(async ({ ctx, input }) => {
    const db = await requireDatabase();
    await db.delete(userBlocks).where(and(eq(userBlocks.blockerId, ctx.user.id), eq(userBlocks.blockedId, input.id)));
    return { blocked: false } as const;
  }),

  blocked: protectedProcedure.query(async ({ ctx }) => {
    const db = await requireDatabase();
    const rows = await db.select({ id: users.id, name: users.name, username: users.username, avatarUrl: users.avatarUrl, blockedAt: userBlocks.createdAt }).from(userBlocks).innerJoin(users, eq(userBlocks.blockedId, users.id)).where(eq(userBlocks.blockerId, ctx.user.id)).orderBy(desc(userBlocks.createdAt)).limit(200);
    return rows.map(row => ({ ...row, id: String(row.id), blockedAt: row.blockedAt.toISOString() }));
  }),

  save: protectedProcedure.input(targetInput).mutation(async ({ ctx, input }) => {
    const db = await requireDatabase();
    await assertPublicTarget(db, input.targetType, input.targetId);
    await db.insert(savedItems).values({ userId: ctx.user.id, targetType: input.targetType, targetId: input.targetId }).onDuplicateKeyUpdate({ set: { createdAt: new Date() } });
    return { saved: true } as const;
  }),

  unsave: protectedProcedure.input(targetInput).mutation(async ({ ctx, input }) => {
    const db = await requireDatabase();
    await db.delete(savedItems).where(and(eq(savedItems.userId, ctx.user.id), eq(savedItems.targetType, input.targetType), eq(savedItems.targetId, input.targetId)));
    return { saved: false } as const;
  }),

  saved: protectedProcedure.query(async ({ ctx }) => {
    const db = await requireDatabase();
    return db.select({ id: savedItems.id, targetType: savedItems.targetType, targetId: savedItems.targetId, createdAt: savedItems.createdAt }).from(savedItems).where(eq(savedItems.userId, ctx.user.id)).orderBy(desc(savedItems.createdAt)).limit(200);
  }),
});
