import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.

// ─── Gamification helpers ────────────────────────────────────────────────────
import { userStats, userBadges, badges } from "../drizzle/schema";

/** Level thresholds (cumulative XP needed to reach a level). */
export const LEVELS: { level: number; minXp: number; title: string }[] = [
  { level: 1, minXp: 0, title: "Anfänger" },
  { level: 2, minXp: 100, title: "Pflanzenfreund" },
  { level: 3, minXp: 300, title: "Sammler" },
  { level: 4, minXp: 700, title: "Experte" },
  { level: 5, minXp: 1500, title: "Legende" },
];

export function levelForXp(xp: number) {
  let current = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.minXp) current = l;
  }
  const next = LEVELS.find((l) => l.minXp > xp);
  return {
    level: current.level,
    title: current.title,
    minXp: current.minXp,
    nextLevelXp: next ? next.minXp : null,
    nextTitle: next ? next.title : null,
  };
}

/** Ensure a user_stats row exists; returns it. */
export async function ensureUserStats(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const existing = await db.select().from(userStats).where(eq(userStats.userId, userId)).limit(1);
  if (existing.length > 0) return existing[0];
  await db.insert(userStats).values({ userId }).onDuplicateKeyUpdate({ set: { userId } });
  const created = await db.select().from(userStats).where(eq(userStats.userId, userId)).limit(1);
  return created[0] ?? null;
}

/** Award XP and recompute level. Returns updated stats. */
export async function awardXp(userId: number, amount: number) {
  const db = await getDb();
  if (!db) return null;
  const stats = await ensureUserStats(userId);
  if (!stats) return null;
  const newXp = stats.xp + amount;
  const newLevel = levelForXp(newXp).level;
  await db.update(userStats)
    .set({ xp: newXp, level: newLevel, points: stats.points + amount })
    .where(eq(userStats.userId, userId));
  return { ...stats, xp: newXp, level: newLevel, points: stats.points + amount };
}

/** Grant a badge by code if the user does not already have it. */
export async function grantBadge(userId: number, code: string) {
  const db = await getDb();
  if (!db) return;
  const badge = await db.select().from(badges).where(eq(badges.code, code)).limit(1);
  if (badge.length === 0) return;
  const already = await db.select().from(userBadges)
    .where(and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badge[0].id)))
    .limit(1);
  if (already.length > 0) return;
  await db.insert(userBadges).values({ userId, badgeId: badge[0].id });
}

import { and } from "drizzle-orm";
