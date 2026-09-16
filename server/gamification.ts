import { and, desc, eq, gte, sql } from "drizzle-orm";
import { assistantUsage, xpEvents } from "../drizzle/schema";
import { getDb } from "./db";

export const XP_REWARDS = {
  dailyCheckIn: 5,
  observationPhoto: 10,
  assistantResponse: 3,
} as const;

export type XpEventType = "daily_check_in" | "observation_photo" | "assistant_response";

type Database = NonNullable<Awaited<ReturnType<typeof getDb>>>;

export function dayKey(at = new Date()) {
  return at.toISOString().slice(0, 10);
}

export function levelForXp(totalXp: number) {
  return Math.floor(Math.max(0, totalXp) / 100) + 1;
}

function isMissingXpSchema(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /xp_events|doesn't exist|ER_NO_SUCH_TABLE/i.test(message);
}

/**
 * Grants XP once for a server-defined event key. No client-provided XP values are accepted.
 * If the staged schema has not been applied yet, feature actions still succeed without XP.
 */
export async function awardXpIfReady(
  db: Database,
  input: { userId: number; eventType: XpEventType; eventKey: string; amount: number; metadata?: Record<string, unknown> },
) {
  try {
    const existing = await db
      .select({ id: xpEvents.id })
      .from(xpEvents)
      .where(and(eq(xpEvents.userId, input.userId), eq(xpEvents.eventKey, input.eventKey)))
      .limit(1);
    if (existing[0]) return { awarded: false, amount: 0 } as const;

    await db.insert(xpEvents).values({
      userId: input.userId,
      eventType: input.eventType,
      eventKey: input.eventKey,
      amount: input.amount,
      metadata: input.metadata ?? null,
    });
    return { awarded: true, amount: input.amount } as const;
  } catch (error) {
    if (isMissingXpSchema(error)) return { awarded: false, amount: 0 } as const;
    if (/duplicate|ER_DUP_ENTRY/i.test(error instanceof Error ? error.message : String(error))) {
      return { awarded: false, amount: 0 } as const;
    }
    throw error;
  }
}

export async function getExperienceSummary(db: Database, userId: number) {
  const totals = await db
    .select({ totalXp: sql<number>`COALESCE(SUM(${xpEvents.amount}), 0)` })
    .from(xpEvents)
    .where(eq(xpEvents.userId, userId));
  const totalXp = Number(totals[0]?.totalXp ?? 0);
  const level = levelForXp(totalXp);
  const recentEvents = await db
    .select({
      id: xpEvents.id,
      eventType: xpEvents.eventType,
      amount: xpEvents.amount,
      createdAt: xpEvents.createdAt,
    })
    .from(xpEvents)
    .where(eq(xpEvents.userId, userId))
    .orderBy(desc(xpEvents.createdAt))
    .limit(8);

  return {
    totalXp,
    level,
    nextLevelXp: level * 100,
    recentEvents: recentEvents.map(event => ({
      id: String(event.id),
      eventType: event.eventType,
      amount: event.amount,
      createdAt: event.createdAt.toISOString(),
    })),
  };
}

export async function hasAssistantCallsToday(db: Database, userId: number, maxCalls = 10) {
  const startOfToday = new Date(`${dayKey()}T00:00:00.000Z`);
  const rows = await db
    .select({ id: assistantUsage.id })
    .from(assistantUsage)
    .where(
      and(
        eq(assistantUsage.userId, userId),
        gte(assistantUsage.createdAt, startOfToday),
      ),
    )
    .limit(maxCalls);
  return rows.length >= maxCalls;
}
