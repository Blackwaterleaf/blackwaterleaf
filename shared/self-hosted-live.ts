import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const SELF_HOSTED_STREAM_PREFIX = "bwl-live-v1";
export const SELF_HOSTED_STREAM_PATH = /^bwl-live-v1-(\d+)-([a-z0-9_-]{12,32})$/;
const TOKEN_TTL_MS = 10 * 60_000;

export type SelfHostedViewerTicket = {
  path: string;
  sessionId: number;
  expiresAt: number;
  nonce: string;
};

export function createSelfHostedStreamPath(sessionId: number) {
  if (!Number.isSafeInteger(sessionId) || sessionId <= 0) throw new Error("invalid_live_session_id");
  return `${SELF_HOSTED_STREAM_PREFIX}-${sessionId}-${randomBytes(9).toString("base64url").toLowerCase()}`;
}

export function sessionIdFromSelfHostedStreamPath(path: string) {
  const match = SELF_HOSTED_STREAM_PATH.exec(path);
  if (!match) return null;
  const sessionId = Number(match[1]);
  return Number.isSafeInteger(sessionId) && sessionId > 0 ? sessionId : null;
}

export function createIngestKey() {
  return randomBytes(32).toString("base64url");
}

export function hashIngestKey(key: string) {
  return createHash("sha256").update(key).digest("hex");
}

export function safeIngestKeyMatch(expectedHash: string | null | undefined, receivedKey: string | null | undefined) {
  if (!expectedHash || !receivedKey) return false;
  const receivedHash = hashIngestKey(receivedKey);
  const expected = Buffer.from(expectedHash, "utf8");
  const received = Buffer.from(receivedHash, "utf8");
  return expected.length === received.length && timingSafeEqual(expected, received);
}

function ticketPayload(ticket: SelfHostedViewerTicket) {
  return `${ticket.path}.${ticket.sessionId}.${ticket.expiresAt}.${ticket.nonce}`;
}

export function createViewerTicket(path: string, sessionId: number, secret: string, now = Date.now()) {
  if (!secret || secret.length < 32) throw new Error("media_control_secret_unavailable");
  if (sessionIdFromSelfHostedStreamPath(path) !== sessionId) throw new Error("stream_path_session_mismatch");
  const ticket: SelfHostedViewerTicket = { path, sessionId, expiresAt: now + TOKEN_TTL_MS, nonce: randomBytes(12).toString("base64url") };
  const payload = ticketPayload(ticket);
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return Buffer.from(JSON.stringify({ ...ticket, signature })).toString("base64url");
}

export function verifyViewerTicket(token: string, secret: string, now = Date.now()): SelfHostedViewerTicket | null {
  if (!secret || secret.length < 32 || !token) return null;
  try {
    const parsed = JSON.parse(Buffer.from(token, "base64url").toString("utf8")) as SelfHostedViewerTicket & { signature?: string };
    if (!parsed.signature || !parsed.path || !parsed.nonce || !Number.isSafeInteger(parsed.sessionId) || !Number.isSafeInteger(parsed.expiresAt)) return null;
    if (parsed.expiresAt <= now || sessionIdFromSelfHostedStreamPath(parsed.path) !== parsed.sessionId) return null;
    const expected = createHmac("sha256", secret).update(ticketPayload(parsed)).digest("base64url");
    const received = Buffer.from(parsed.signature, "utf8");
    const calculated = Buffer.from(expected, "utf8");
    if (received.length !== calculated.length || !timingSafeEqual(received, calculated)) return null;
    return { path: parsed.path, sessionId: parsed.sessionId, expiresAt: parsed.expiresAt, nonce: parsed.nonce };
  } catch {
    return null;
  }
}
