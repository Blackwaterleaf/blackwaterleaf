import { TRPCError } from "@trpc/server";
import { getAssistantReadiness } from "../assistantReadiness";
import { getDb } from "../db";
import { awardXpIfReady, dayKey, getExperienceSummary, XP_REWARDS } from "../gamification";
import { users, xpEvents } from "../../drizzle/schema";
import { desc, eq, sql } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";

async function requireDatabase() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "database_unavailable" });
  return db;
}

export const gamificationRouter = router({
  summary: protectedProcedure.query(async ({ ctx }) => {
    const readiness = await getAssistantReadiness();
    if (readiness.reason === "pending_migration") {
      return {
        status: "pending_migration" as const,
        totalXp: 0,
        level: 1,
        nextLevelXp: 100,
        recentEvents: [],
      };
    }
    const db = await requireDatabase();
    return { status: "ready" as const, ...(await getExperienceSummary(db, ctx.user.id)) };
  }),

  leaderboard: protectedProcedure.query(async () => {
    const db = await requireDatabase();
    const rows = await db
      .select({ userId: users.id, name: users.name, username: users.username, totalXp: sql<number>`COALESCE(SUM(${xpEvents.points}), 0)` })
      .from(users)
      .innerJoin(xpEvents, eq(xpEvents.userId, users.id))
      .where(eq(users.status, "active"))
      .groupBy(users.id, users.name, users.username)
      .orderBy(desc(sql`SUM(${xpEvents.points})`))
      .limit(25);
    return rows.map((row, index) => ({ rank: index + 1, userId: String(row.userId), name: row.name ?? row.username ?? "BlackWaterLeaf-Nutzer", totalXp: Number(row.totalXp ?? 0) }));
  }),

  dailyCheckIn: protectedProcedure.mutation(async ({ ctx }) => {
    const readiness = await getAssistantReadiness();
    if (readiness.reason === "pending_migration") {
      throw new TRPCError({ code: "PRECONDITION_FAILED", message: "xp_pending_migration" });
    }
    const db = await requireDatabase();
    const reward = await awardXpIfReady(db, {
      userId: ctx.user.id,
      eventType: "daily_login",
      eventKey: `xp:${ctx.user.id}:daily:${dayKey()}`,
      points: XP_REWARDS.dailyCheckIn,
      sourceType: "session",
      sourceId: dayKey(),
    });
    return reward;
  }),
});
