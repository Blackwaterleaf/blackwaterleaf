import { createHash } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import { parse as parseCookieHeader } from "cookie";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { ForbiddenError } from "@shared/_core/errors";
import { userSessions } from "../drizzle/schema";
import { getDb } from "./db";

type RequestLike = {
  headers: {
    cookie?: string;
    authorization?: string;
    "user-agent"?: string;
    "x-bwl-device-id"?: string;
  };
};

type SessionRegistration = {
  token: string;
  userId: number;
  provider: "manus" | "local";
  issuedAt: number | null;
  request: RequestLike;
  expiresAt?: number | null;
};

export function sessionHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function sessionTokenFromRequest(request: RequestLike): string | null {
  const cookies = parseCookieHeader(request.headers.cookie ?? "");
  const cookieToken = cookies[COOKIE_NAME];
  if (cookieToken) return cookieToken;
  const authorization = request.headers.authorization;
  return typeof authorization === "string" && authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;
}

function safeDeviceId(request: RequestLike) {
  const value = request.headers["x-bwl-device-id"];
  return typeof value === "string" && /^[A-Za-z0-9._~-]{1,128}$/.test(value) ? value : null;
}

/** Registers the verified JWT after user resolution and enforces server-side revocation. */
export async function assertActiveSession(input: SessionRegistration) {
  const db = await getDb();
  if (!db) throw ForbiddenError("Session registry unavailable");
  const hash = sessionHash(input.token);
  const now = new Date();
  const expiresAt = new Date(input.expiresAt && input.expiresAt > Date.now() ? input.expiresAt : (input.issuedAt ?? Date.now()) + ONE_YEAR_MS);
  const existing = await db.select().from(userSessions).where(eq(userSessions.sessionHash, hash)).limit(1);
  if (existing[0]) {
    const row = existing[0];
    if (row.userId !== input.userId || row.provider !== input.provider || row.revokedAt || row.expiresAt.getTime() <= now.getTime()) {
      throw ForbiddenError("Session revoked or expired");
    }
    await db.update(userSessions).set({ lastSeenAt: now }).where(eq(userSessions.id, row.id));
    return;
  }
  await db.insert(userSessions).values({
    userId: input.userId,
    sessionHash: hash,
    provider: input.provider,
    deviceId: safeDeviceId(input.request),
    clientAgent: typeof input.request.headers["user-agent"] === "string" ? input.request.headers["user-agent"].slice(0, 512) : null,
    issuedAt: input.issuedAt ? new Date(input.issuedAt) : null,
    expiresAt,
    lastSeenAt: now,
  });
}

export async function revokeSessionForRequest(request: RequestLike, userId: number) {
  const db = await getDb();
  if (!db) throw ForbiddenError("Session registry unavailable");
  const token = sessionTokenFromRequest(request);
  if (!token) return false;
  const result = await db.update(userSessions).set({ revokedAt: new Date() }).where(and(eq(userSessions.userId, userId), eq(userSessions.sessionHash, sessionHash(token)), isNull(userSessions.revokedAt)));
  return Number(result[0]?.affectedRows ?? 0) > 0;
}

export async function revokeAllSessions(userId: number) {
  const db = await getDb();
  if (!db) throw ForbiddenError("Session registry unavailable");
  const result = await db.update(userSessions).set({ revokedAt: new Date() }).where(and(eq(userSessions.userId, userId), isNull(userSessions.revokedAt)));
  return Number(result[0]?.affectedRows ?? 0);
}

export async function listActiveSessions(userId: number) {
  const db = await getDb();
  if (!db) throw ForbiddenError("Session registry unavailable");
  const now = new Date();
  const rows = await db
    .select({
      id: userSessions.id,
      provider: userSessions.provider,
      deviceId: userSessions.deviceId,
      clientAgent: userSessions.clientAgent,
      issuedAt: userSessions.issuedAt,
      lastSeenAt: userSessions.lastSeenAt,
      expiresAt: userSessions.expiresAt,
    })
    .from(userSessions)
    .where(and(eq(userSessions.userId, userId), isNull(userSessions.revokedAt)));
  return rows.filter(row => row.expiresAt.getTime() > now.getTime()).sort((a, b) => b.lastSeenAt.getTime() - a.lastSeenAt.getTime());
}
