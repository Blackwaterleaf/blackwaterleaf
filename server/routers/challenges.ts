import { TRPCError } from "@trpc/server";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { z } from "zod";
import { challengeProgress, challenges, xpEvents } from "../../drizzle/schema";
import { observationRealmSchema } from "../../shared/blackwaterleaf-contract-v1";
import { protectedProcedure, router, staffProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";

async function requireDatabase() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "database_unavailable" });
  return db;
}

const challengeId = z.object({ challengeId: z.number().int().positive() });

export const challengesRouter = router({
  listPublished: publicProcedure.input(z.object({ realm: observationRealmSchema.optional() }).default({})).query(async ({ input }) => {
    const db = await requireDatabase();
    return db.select({ id: challenges.id, title: challenges.title, description: challenges.description, realm: challenges.realm, ruleText: challenges.ruleText, startsAt: challenges.startsAt, endsAt: challenges.endsAt, rewardPoints: challenges.rewardPoints }).from(challenges).where(and(
      eq(challenges.status, "published"),
      gte(challenges.endsAt, new Date()),
      input.realm ? eq(challenges.realm, input.realm) : undefined,
    )).orderBy(challenges.startsAt).limit(50);
  }),

  myProgress: protectedProcedure.query(async ({ ctx }) => {
    const db = await requireDatabase();
    return db.select({ challengeId: challengeProgress.challengeId, title: challenges.title, realm: challenges.realm, progress: challengeProgress.progress, status: challengeProgress.status, endsAt: challenges.endsAt }).from(challengeProgress).innerJoin(challenges, eq(challengeProgress.challengeId, challenges.id)).where(and(eq(challengeProgress.userId, ctx.user.id), eq(challenges.status, "published"))).orderBy(desc(challengeProgress.updatedAt)).limit(100);
  }),

  join: protectedProcedure.input(challengeId).mutation(async ({ ctx, input }) => {
    const db = await requireDatabase();
    const challenge = await db.select({ id: challenges.id }).from(challenges).where(and(eq(challenges.id, input.challengeId), eq(challenges.status, "published"), gte(challenges.endsAt, new Date()))).limit(1);
    if (!challenge[0]) throw new TRPCError({ code: "NOT_FOUND", message: "challenge_not_available" });
    await db.insert(challengeProgress).values({ challengeId: input.challengeId, userId: ctx.user.id, status: "joined", progress: 0 }).onDuplicateKeyUpdate({ set: { status: "joined", updatedAt: new Date() } });
    return { joined: true } as const;
  }),

  leave: protectedProcedure.input(challengeId).mutation(async ({ ctx, input }) => {
    const db = await requireDatabase();
    await db.update(challengeProgress).set({ status: "withdrawn", updatedAt: new Date() }).where(and(eq(challengeProgress.challengeId, input.challengeId), eq(challengeProgress.userId, ctx.user.id)));
    return { joined: false } as const;
  }),

  refreshProgress: protectedProcedure.input(challengeId).mutation(async ({ ctx, input }) => {
    const db = await requireDatabase();
    const challenge = await db.select({ startsAt: challenges.startsAt, endsAt: challenges.endsAt }).from(challenges).innerJoin(challengeProgress, eq(challengeProgress.challengeId, challenges.id)).where(and(eq(challenges.id, input.challengeId), eq(challengeProgress.userId, ctx.user.id))).limit(1);
    if (!challenge[0]) throw new TRPCError({ code: "NOT_FOUND", message: "challenge_not_joined" });
    const events = await db.select({ count: sql<number>`COUNT(*)` }).from(xpEvents).where(and(eq(xpEvents.userId, ctx.user.id), gte(xpEvents.createdAt, challenge[0].startsAt), lte(xpEvents.createdAt, challenge[0].endsAt)));
    const progress = Math.min(100, Number(events[0]?.count ?? 0) * 10);
    const status = progress >= 100 ? "completed" : "joined";
    await db.update(challengeProgress).set({ progress, status, updatedAt: new Date() }).where(and(eq(challengeProgress.challengeId, input.challengeId), eq(challengeProgress.userId, ctx.user.id)));
    return { progress, status } as const;
  }),

  createDraft: staffProcedure.input(z.object({ title: z.string().trim().min(3).max(180), description: z.string().trim().min(1).max(10_000), realm: observationRealmSchema.nullable().optional(), ruleText: z.string().trim().min(1).max(10_000), startsAt: z.coerce.date(), endsAt: z.coerce.date(), rewardPoints: z.number().int().min(0).max(100_000) })).mutation(async ({ ctx, input }) => {
    if (input.endsAt <= input.startsAt) throw new TRPCError({ code: "BAD_REQUEST", message: "challenge_window_invalid" });
    const db = await requireDatabase();
    const inserted = await db.insert(challenges).values({ ...input, realm: input.realm ?? null, status: "draft", createdByUserId: ctx.user.id }).$returningId();
    return { id: inserted[0]?.id } as const;
  }),

  publish: staffProcedure.input(challengeId).mutation(async ({ input }) => {
    const db = await requireDatabase();
    await db.update(challenges).set({ status: "published" }).where(eq(challenges.id, input.challengeId));
    return { published: true } as const;
  }),
});
