import type { NextFunction, Request, Response } from "express";
import { timingSafeEqual } from "node:crypto";
import { and, eq, notInArray, or } from "drizzle-orm";
import { liveSessions, userBlocks, users } from "../drizzle/schema";
import { createViewerTicket, sessionIdFromSelfHostedStreamPath, safeIngestKeyMatch } from "../shared/self-hosted-live";
import { ENV } from "./_core/env";
import { sdk } from "./_core/sdk";
import { getDb } from "./db";

const MEDIA_ACTIONS = new Set(["publish", "read"]);

type MediaAuthRequest = {
  user?: unknown;
  password?: unknown;
  token?: unknown;
  action?: unknown;
  path?: unknown;
  protocol?: unknown;
};

function mediaControlReady() {
  try {
    const origin = new URL(ENV.selfHostedMediaOrigin);
    return origin.protocol === "https:" && ENV.selfHostedMediaControlSecret.length >= 32;
  } catch {
    return false;
  }
}

export function selfHostedMediaCapabilities() {
  const enabled = mediaControlReady();
  const origin = enabled ? new URL(ENV.selfHostedMediaOrigin) : null;
  return {
    enabled,
    origin: origin?.origin ?? null,
    ingestServer: origin ? `rtmps://${origin.hostname}:1936` : null,
  } as const;
}

function suppliedSecret(req: { get(name: string): string | undefined }) {
  const header = req.get("x-bwl-media-secret");
  if (typeof header === "string" && header) return header;
  const query = (req as Request).query?.secret;
  return typeof query === "string" ? query : "";
}

function controlSecretMatches(value: string) {
  const expected = Buffer.from(ENV.selfHostedMediaControlSecret, "utf8");
  const received = Buffer.from(value, "utf8");
  return expected.length > 0 && expected.length === received.length && timingSafeEqual(expected, received);
}

export function requireMediaControlSecret(req: Request, res: Response, next: NextFunction) {
  if (!mediaControlReady() || !controlSecretMatches(suppliedSecret(req))) {
    res.status(401).json({ allowed: false });
    return;
  }
  next();
}

export async function authorizeMediaTransport(req: Request<unknown, unknown, MediaAuthRequest>, res: Response) {
  if (!mediaControlReady() || !controlSecretMatches(suppliedSecret(req))) {
    res.status(401).json({ allowed: false });
    return;
  }

  const action = typeof req.body?.action === "string" ? req.body.action : "";
  const path = typeof req.body?.path === "string" ? req.body.path : "";
  const key = typeof req.body?.password === "string" ? req.body.password : typeof req.body?.token === "string" ? req.body.token : "";
  const sessionId = sessionIdFromSelfHostedStreamPath(path);
  if (action !== "publish" || !MEDIA_ACTIONS.has(action) || !sessionId || !key) {
    res.status(403).json({ allowed: false });
    return;
  }

  const db = await getDb();
  if (!db) {
    res.status(503).json({ allowed: false });
    return;
  }
  const [session] = await db.select({ id: liveSessions.id, streamUrl: liveSessions.streamUrl, selfHostedIngestKeyHash: liveSessions.selfHostedIngestKeyHash, status: liveSessions.status }).from(liveSessions).where(and(eq(liveSessions.id, sessionId), eq(liveSessions.streamUrl, `bwl-live://${path}`))).limit(1);
  const allowed = Boolean(session && session.status !== "cancelled" && safeIngestKeyMatch(session.selfHostedIngestKeyHash, key));
  res.status(allowed ? 204 : 403).end();
}

export async function acceptMediaState(req: Request<{ sessionId: string }, unknown, { state?: unknown; path?: unknown }>, res: Response) {
  if (!mediaControlReady() || !controlSecretMatches(suppliedSecret(req))) {
    res.status(401).json({ accepted: false });
    return;
  }
  const sessionId = Number(req.params.sessionId);
  const state = req.body?.state;
  const path = req.body?.path;
  if (!Number.isSafeInteger(sessionId) || sessionId <= 0 || (state !== "online" && state !== "offline") || typeof path !== "string" || sessionIdFromSelfHostedStreamPath(path) !== sessionId) {
    res.status(400).json({ accepted: false });
    return;
  }
  const db = await getDb();
  if (!db) {
    res.status(503).json({ accepted: false });
    return;
  }
  const [session] = await db.select({ id: liveSessions.id, status: liveSessions.status, streamUrl: liveSessions.streamUrl }).from(liveSessions).where(and(eq(liveSessions.id, sessionId), eq(liveSessions.streamUrl, `bwl-live://${path}`))).limit(1);
  if (!session || session.status === "cancelled" || session.status === "ended") {
    res.status(404).json({ accepted: false });
    return;
  }
  await db.update(liveSessions).set({ status: state === "online" ? "live" : "scheduled" }).where(eq(liveSessions.id, sessionId));
  res.status(204).end();
}

export async function redirectMemberToMediaPlayer(req: Request<{ sessionId: string }>, res: Response) {
  const sessionId = Number(req.params.sessionId);
  const capabilities = selfHostedMediaCapabilities();
  const user = await sdk.authenticateRequest(req).catch(() => null);
  if (!user || user.status !== "active") {
    res.status(401).json({ code: "LIVE_MEDIA_AUTH_REQUIRED" });
    return;
  }
  if (!Number.isSafeInteger(sessionId) || sessionId <= 0 || !capabilities.enabled || !capabilities.origin) {
    res.status(404).json({ code: "LIVE_MEDIA_UNAVAILABLE" });
    return;
  }
  const db = await getDb();
  if (!db) {
    res.status(503).json({ code: "LIVE_MEDIA_UNAVAILABLE" });
    return;
  }
  const blocks = await db.select({ blockerId: userBlocks.blockerId, blockedId: userBlocks.blockedId }).from(userBlocks).where(or(eq(userBlocks.blockerId, user.id), eq(userBlocks.blockedId, user.id)));
  const blockedHostIds = blocks.map(block => block.blockerId === user.id ? block.blockedId : block.blockerId);
  const [session] = await db.select({ id: liveSessions.id, streamUrl: liveSessions.streamUrl }).from(liveSessions).innerJoin(users, eq(liveSessions.hostUserId, users.id)).where(and(eq(liveSessions.id, sessionId), eq(liveSessions.status, "live"), eq(users.status, "active"), ...(blockedHostIds.length ? [notInArray(liveSessions.hostUserId, blockedHostIds)] : []))).limit(1);
  const path = session?.streamUrl?.startsWith("bwl-live://") ? session.streamUrl.slice("bwl-live://".length) : null;
  if (!session || !path || sessionIdFromSelfHostedStreamPath(path) !== session.id) {
    res.status(404).json({ code: "LIVE_MEDIA_UNAVAILABLE" });
    return;
  }
  const ticket = createViewerTicket(path, session.id, ENV.selfHostedMediaControlSecret);
  res.setHeader("Cache-Control", "no-store, private");
  res.redirect(302, `${capabilities.origin}/auth?ticket=${encodeURIComponent(ticket)}`);
}
