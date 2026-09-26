import { and, asc, count, countDistinct, desc, eq, gte, sql } from "drizzle-orm";
import { analyticsEvents, users } from "../drizzle/schema";
import type { TrpcContext } from "./_core/context";
import { getDb } from "./db";

export type AnalyticsEventType = "page_view" | "page_view_end" | "session_start" | "login_success";

function countryFromRequest(req: TrpcContext["req"]): string | null {
  const value = req.headers["cf-ipcountry"] ?? req.headers["x-vercel-ip-country"] ?? req.headers["x-country"];
  const country = Array.isArray(value) ? value[0] : value;
  return typeof country === "string" && /^[A-Za-z]{2}$/.test(country) ? country.toUpperCase() : null;
}

export async function recordAnalyticsEvent(input: {
  ctx: TrpcContext;
  sessionKey: string;
  eventType: AnalyticsEventType;
  path?: string | null;
  durationSeconds?: number;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(analyticsEvents).values({
    sessionKey: input.sessionKey,
    eventType: input.eventType,
    path: input.path ?? null,
    countryCode: countryFromRequest(input.ctx.req),
    durationSeconds: Math.round(input.durationSeconds ?? 0),
  });
}

export async function getAnalyticsOverview(days: 1 | 7 | 30) {
  const db = await getDb();
  if (!db) throw new Error("database_unavailable");
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const where = gte(analyticsEvents.occurredAt, since);
  const [summary] = await db.select({
    pageViews: sql<number>`coalesce(sum(case when ${analyticsEvents.eventType} = 'page_view' then 1 else 0 end), 0)`,
    visitors: countDistinct(analyticsEvents.sessionKey),
    durationSeconds: sql<number>`coalesce(sum(case when ${analyticsEvents.eventType} = 'page_view_end' then ${analyticsEvents.durationSeconds} else 0 end), 0)`,
  }).from(analyticsEvents).where(where);

  const [pageRows, countryRows, loginRows, accountRows] = await Promise.all([
    db.select({ path: analyticsEvents.path, views: count() })
      .from(analyticsEvents).where(and(where, eq(analyticsEvents.eventType, "page_view")))
      .groupBy(analyticsEvents.path).orderBy(desc(count())).limit(12),
    db.select({ countryCode: analyticsEvents.countryCode, visitors: countDistinct(analyticsEvents.sessionKey), views: count() })
      .from(analyticsEvents).where(where).groupBy(analyticsEvents.countryCode).orderBy(desc(countDistinct(analyticsEvents.sessionKey))).limit(20),
    db.select({ total: count() }).from(users).where(gte(users.lastSignedIn, since)),
    db.select({ total: count() }).from(users),
  ]);

  const pageViews = Number(summary?.pageViews ?? 0);
  const visitors = Number(summary?.visitors ?? 0);
  const durationSeconds = Number(summary?.durationSeconds ?? 0);
  const averageDurationSeconds = pageViews ? Math.round(durationSeconds / pageViews) : 0;
  const bouncedViews = await db.select({ total: count() }).from(analyticsEvents).where(and(where, eq(analyticsEvents.eventType, "page_view"), eq(analyticsEvents.durationSeconds, 0)));
  const bounceRate = pageViews ? Math.round((Number(bouncedViews[0]?.total ?? 0) / pageViews) * 100) : 0;

  return {
    days, pageViews, visitors, registeredAccounts: Number(accountRows[0]?.total ?? 0), loginCount: Number(loginRows[0]?.total ?? 0), averageDurationSeconds, bounceRate,
    pages: pageRows.map(row => ({ path: row.path ?? "(unbekannt)", views: Number(row.views) })),
    countries: countryRows.map(row => ({ countryCode: row.countryCode ?? "UN", visitors: Number(row.visitors), views: Number(row.views) })),
    since,
  };
}

export function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${Math.max(0, seconds % 60)}s`;
}

export function normalizeSessionKey(value: string) {
  return value.trim();
}

export const analyticsCountryOrder = asc(analyticsEvents.countryCode);
