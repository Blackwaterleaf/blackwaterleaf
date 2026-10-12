import { and, desc, eq, gt, gte, sql } from "drizzle-orm";
import { aiIdentificationCorrections, assistantUsage, xpEvents } from "../drizzle/schema";
import { getDb } from "./db";

export const XP_REWARDS = {
  dailyCheckIn: 5,
  observationPhoto: 10,
  communityPhoto: 10,
  assistantResponse: 3,
  verifiedPlantCorrection: 25,
} as const;

export const XP_POLICY_VERSION = "xp-2026-09-16-v1";

export type XpEventType = "daily_login" | "photo_upload" | "ai_use" | "donation_support";
export type XpSourceType = "session" | "media_asset" | "ai_request" | "stripe_donation";

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
  input: {
    userId: number;
    eventType: XpEventType;
    eventKey: string;
    points: number;
    sourceType: XpSourceType;
    sourceId: string;
  },
) {
  try {
    const existing = await db
      .select({ id: xpEvents.id })
      .from(xpEvents)
      .where(eq(xpEvents.eventKey, input.eventKey))
      .limit(1);
    if (existing[0]) return { awarded: false, amount: 0 } as const;

    await db.insert(xpEvents).values({
      userId: input.userId,
      eventType: input.eventType,
      points: input.points,
      eventKey: input.eventKey,
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      dayKey: dayKey(),
      policyVersion: XP_POLICY_VERSION,
    });
    return { awarded: true, amount: input.points } as const;
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
    .select({ totalXp: sql<number>`COALESCE(SUM(${xpEvents.points}), 0)` })
    .from(xpEvents)
    .where(eq(xpEvents.userId, userId));
  const totalXp = Number(totals[0]?.totalXp ?? 0);
  const level = levelForXp(totalXp);
  const recentEvents = await db
    .select({
      id: xpEvents.id,
      eventType: xpEvents.eventType,
      points: xpEvents.points,
      createdAt: xpEvents.createdAt,
    })
    .from(xpEvents)
    .where(eq(xpEvents.userId, userId))
    .orderBy(desc(xpEvents.createdAt))
    .limit(8);
  const correctionRows = await db
    .select({ total: sql<number>`COUNT(*)` })
    .from(aiIdentificationCorrections)
    .where(and(eq(aiIdentificationCorrections.userId, userId), eq(aiIdentificationCorrections.status, "approved")));
  const verifiedPlantCorrections = Number(correctionRows[0]?.total ?? 0);
  const qualityAchievements = [
    { key: "first_verified_correction", title: "ERSTE FACHKORREKTUR", description: "Eine Pflanzenkorrektur wurde vom Team bestätigt.", threshold: 1 },
    { key: "taxonomy_contributor", title: "TAXONOMIE-BEITRAG", description: "Drei Pflanzenkorrekturen wurden vom Team bestätigt.", threshold: 3 },
    { key: "evidence_steward", title: "EVIDENZ-HÜTER", description: "Zehn Pflanzenkorrekturen wurden vom Team bestätigt.", threshold: 10 },
  ].map(achievement => ({ ...achievement, progress: Math.min(verifiedPlantCorrections, achievement.threshold), achieved: verifiedPlantCorrections >= achievement.threshold }));

  return {
    totalXp,
    level,
    nextLevelXp: level * 100,
    qualityAchievements,
    recentEvents: recentEvents.map(event => ({
      id: String(event.id),
      eventType: event.eventType === "daily_login" ? "daily_check_in" : event.eventType === "photo_upload" ? "observation_photo" : event.eventType === "donation_support" ? "donation_support" : "assistant_response",
      amount: event.points,
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
        eq(assistantUsage.provider, "ionos-ai-model-hub"),
        gte(assistantUsage.createdAt, startOfToday),
        gt(assistantUsage.completionChars, 0),
      ),
    )
    .limit(maxCalls);
  return rows.length >= maxCalls;
}
