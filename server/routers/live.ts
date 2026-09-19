import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, gt, notInArray, or } from "drizzle-orm";
import { z } from "zod";
import { liveSessionMessages, liveSessions, userBlocks, users } from "../../drizzle/schema";
import { LIVE_STREAM_PROVIDERS, parseStoredLiveStream, resolveLiveStreamReference, type LiveStreamReference } from "../../shared/live-stream-embed";
import { createIngestKey, createSelfHostedStreamPath, hashIngestKey } from "../../shared/self-hosted-live";
import { protectedProcedure, router, staffProcedure } from "../_core/trpc";
import { appendAuditEntry } from "../auditLedger";
import { getDb } from "../db";
import { selfHostedMediaCapabilities } from "../selfHostedLiveMedia";

const realmSchema = z.enum(["botany", "aquarium", "terrarium"]);
const trackSchema = z.enum(["community", "expert"]);
const statusSchema = z.enum(["scheduled", "live", "ended", "cancelled"]);
const streamInputSchema = z.object({
  provider: z.enum(LIVE_STREAM_PROVIDERS),
  source: z.string().trim().min(1).max(1_000),
});
type StreamInput = z.infer<typeof streamInputSchema>;

async function requireDatabase() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "database_unavailable" });
  return db;
}

function resolveStream(input: StreamInput | null | undefined): LiveStreamReference | null {
  if (input === null || input === undefined) return null;
  const stream = resolveLiveStreamReference(input.provider, input.source);
  if (!stream) throw new TRPCError({ code: "BAD_REQUEST", message: "unsupported_or_invalid_stream_source" });
  return stream;
}

function selfHostedPathFor(session: { streamUrl: string | null }) {
  const stream = parseStoredLiveStream(session.streamUrl);
  return stream?.provider === "self_hosted" ? stream.identifier : null;
}

async function blockedUserIds(db: Awaited<ReturnType<typeof requireDatabase>>, viewerId: number) {
  const rows = await db.select({ blockerId: userBlocks.blockerId, blockedId: userBlocks.blockedId }).from(userBlocks).where(or(eq(userBlocks.blockerId, viewerId), eq(userBlocks.blockedId, viewerId)));
  return rows.map(row => row.blockerId === viewerId ? row.blockedId : row.blockerId);
}

function asSession(row: { session: typeof liveSessions.$inferSelect; host: typeof users.$inferSelect }) {
  const stream = parseStoredLiveStream(row.session.streamUrl);
  return {
    id: String(row.session.id),
    track: row.session.track,
    title: row.session.title,
    description: row.session.description,
    realm: row.session.realm,
    presenterName: row.session.presenterName,
    presenterCredential: row.session.track === "expert" ? row.session.presenterCredential : null,
    stream: stream ? { provider: stream.provider, identifier: stream.identifier, canonicalUrl: stream.canonicalUrl } : null,
    status: row.session.status,
    startsAt: row.session.startsAt.toISOString(),
    endsAt: row.session.endsAt?.toISOString() ?? null,
    host: {
      id: String(row.host.id),
      name: row.host.name,
      username: row.host.username,
      role: row.host.role,
      roleOrigin: "server_verified" as const,
    },
  } as const;
}

async function readableSession(db: Awaited<ReturnType<typeof requireDatabase>>, viewerId: number, sessionId: number) {
  const blockedIds = await blockedUserIds(db, viewerId);
  const [row] = await db.select({ session: liveSessions, host: users }).from(liveSessions).innerJoin(users, eq(liveSessions.hostUserId, users.id)).where(and(eq(liveSessions.id, sessionId), eq(users.status, "active"), ...(blockedIds.length ? [notInArray(liveSessions.hostUserId, blockedIds)] : []))).limit(1);
  if (!row || row.session.status === "cancelled") throw new TRPCError({ code: "NOT_FOUND", message: "live_session_not_found" });
  return row;
}

export const liveRouter = router({
  capabilities: protectedProcedure.query(() => selfHostedMediaCapabilities()),

  list: protectedProcedure.input(z.object({ track: trackSchema.optional(), limit: z.number().int().min(1).max(50).default(24) })).query(async ({ ctx, input }) => {
    const db = await requireDatabase();
    const blockedIds = await blockedUserIds(db, ctx.user.id);
    const rows = await db.select({ session: liveSessions, host: users }).from(liveSessions).innerJoin(users, eq(liveSessions.hostUserId, users.id)).where(and(eq(users.status, "active"), ...(input.track ? [eq(liveSessions.track, input.track)] : []), ...(blockedIds.length ? [notInArray(liveSessions.hostUserId, blockedIds)] : []))).orderBy(desc(liveSessions.status), desc(liveSessions.startsAt)).limit(input.limit);
    return rows.filter(row => row.session.status !== "cancelled").map(asSession);
  }),

  byId: protectedProcedure.input(z.object({ id: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const db = await requireDatabase();
    return asSession(await readableSession(db, ctx.user.id, input.id));
  }),

  messages: protectedProcedure.input(z.object({ sessionId: z.number().int().positive(), limit: z.number().int().min(1).max(200).default(100) })).query(async ({ ctx, input }) => {
    const db = await requireDatabase();
    await readableSession(db, ctx.user.id, input.sessionId);
    const blockedIds = await blockedUserIds(db, ctx.user.id);
    const rows = await db.select({ id: liveSessionMessages.id, content: liveSessionMessages.content, createdAt: liveSessionMessages.createdAt, authorId: users.id, authorName: users.name, authorUsername: users.username, authorRole: users.role }).from(liveSessionMessages).innerJoin(users, eq(liveSessionMessages.userId, users.id)).where(and(eq(liveSessionMessages.sessionId, input.sessionId), eq(liveSessionMessages.status, "visible"), eq(users.status, "active"), ...(blockedIds.length ? [notInArray(liveSessionMessages.userId, blockedIds)] : []))).orderBy(desc(liveSessionMessages.createdAt)).limit(input.limit);
    return rows.reverse().map(row => ({ ...row, createdAt: row.createdAt.toISOString(), authorId: String(row.authorId), authorRoleOrigin: "server_verified" as const }));
  }),

  sendMessage: protectedProcedure.input(z.object({ sessionId: z.number().int().positive(), content: z.string().trim().min(1).max(2_000) })).mutation(async ({ ctx, input }) => {
    const db = await requireDatabase();
    const session = await readableSession(db, ctx.user.id, input.sessionId);
    if (session.session.status !== "live") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "live_session_not_active" });
    const since = new Date(Date.now() - 60_000);
    const [recent] = await db.select({ value: count() }).from(liveSessionMessages).where(and(eq(liveSessionMessages.userId, ctx.user.id), gt(liveSessionMessages.createdAt, since)));
    if (Number(recent?.value ?? 0) >= 6) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "live_chat_rate_limited" });
    const inserted = await db.insert(liveSessionMessages).values({ sessionId: input.sessionId, userId: ctx.user.id, content: input.content.trim() });
    await appendAuditEntry({ actorId: ctx.user.id, action: "live_message_sent", targetType: "live_session", targetId: input.sessionId, payload: { messageId: Number(inserted[0].insertId), contentLength: input.content.trim().length } });
    return { id: String(inserted[0].insertId), sent: true } as const;
  }),

  create: staffProcedure.input(z.object({ track: trackSchema, title: z.string().trim().min(3).max(180), description: z.string().trim().min(10).max(10_000), realm: realmSchema.nullable().optional(), presenterName: z.string().trim().min(2).max(160), presenterCredential: z.string().trim().min(2).max(160).nullable().optional(), stream: streamInputSchema.nullable().optional(), status: z.enum(["scheduled", "live"]).default("scheduled"), startsAt: z.coerce.date(), endsAt: z.coerce.date().nullable().optional() })).mutation(async ({ ctx, input }) => {
    if (input.track === "expert" && !input.presenterCredential) throw new TRPCError({ code: "BAD_REQUEST", message: "expert_credential_required" });
    if (input.endsAt && input.endsAt <= input.startsAt) throw new TRPCError({ code: "BAD_REQUEST", message: "live_end_must_follow_start" });
    const db = await requireDatabase();
    const requestedSelfHosted = input.stream?.provider === "self_hosted";
    const stream = requestedSelfHosted ? null : resolveStream(input.stream);
    const inserted = await db.insert(liveSessions).values({ hostUserId: ctx.user.id, track: input.track, title: input.title.trim(), description: input.description.trim(), realm: input.realm ?? null, presenterName: input.presenterName.trim(), presenterCredential: input.track === "expert" ? input.presenterCredential?.trim() ?? null : null, streamUrl: stream?.canonicalUrl ?? null, status: input.status, startsAt: input.startsAt, endsAt: input.endsAt ?? null });
    const id = Number(inserted[0].insertId);
    const ingestKey = requestedSelfHosted ? createIngestKey() : null;
    const selfHostedPath = requestedSelfHosted ? createSelfHostedStreamPath(id) : null;
    if (selfHostedPath && ingestKey) {
      await db.update(liveSessions).set({ streamUrl: `bwl-live://${selfHostedPath}`, selfHostedIngestKeyHash: hashIngestKey(ingestKey), selfHostedKeyVersion: 1 }).where(eq(liveSessions.id, id));
    }
    await appendAuditEntry({ actorId: ctx.user.id, action: "live_session_created", targetType: "live_session", targetId: id, payload: { track: input.track, status: input.status, streamProvider: requestedSelfHosted ? "self_hosted" : stream?.provider ?? null, hasCredential: Boolean(input.presenterCredential) } });
    return { id: String(id), created: true, ingest: selfHostedPath && ingestKey ? { path: selfHostedPath, key: ingestKey, keyVersion: 1 } : null } as const;
  }),

  update: staffProcedure.input(z.object({ id: z.number().int().positive(), stream: streamInputSchema.nullable().optional(), status: statusSchema.optional(), endsAt: z.coerce.date().nullable().optional() })).mutation(async ({ ctx, input }) => {
    const db = await requireDatabase();
    if (input.stream?.provider === "self_hosted") throw new TRPCError({ code: "BAD_REQUEST", message: "self_hosted_stream_requires_control_deck" });
    const [session] = await db.select({ id: liveSessions.id, startsAt: liveSessions.startsAt }).from(liveSessions).where(eq(liveSessions.id, input.id)).limit(1);
    if (!session) throw new TRPCError({ code: "NOT_FOUND", message: "live_session_not_found" });
    if (input.endsAt && input.endsAt <= session.startsAt) throw new TRPCError({ code: "BAD_REQUEST", message: "live_end_must_follow_start" });
    const stream = input.stream === undefined ? undefined : resolveStream(input.stream);
    await db.update(liveSessions).set({ ...(input.stream !== undefined ? { streamUrl: stream?.canonicalUrl ?? null } : {}), ...(input.status ? { status: input.status } : {}), ...(input.endsAt !== undefined ? { endsAt: input.endsAt } : {}) }).where(eq(liveSessions.id, input.id));
    await appendAuditEntry({ actorId: ctx.user.id, action: "live_session_updated", targetType: "live_session", targetId: input.id, payload: { status: input.status ?? null, streamProvider: stream?.provider ?? null, streamChanged: input.stream !== undefined, endChanged: input.endsAt !== undefined } });
    return { id: String(input.id), updated: true } as const;
  }),

  rotateSelfHostedKey: staffProcedure.input(z.object({ sessionId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    const db = await requireDatabase();
    const [session] = await db.select({ id: liveSessions.id, streamUrl: liveSessions.streamUrl, selfHostedKeyVersion: liveSessions.selfHostedKeyVersion, status: liveSessions.status }).from(liveSessions).where(eq(liveSessions.id, input.sessionId)).limit(1);
    const path = session ? selfHostedPathFor(session) : null;
    if (!session || !path) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "self_hosted_stream_not_configured" });
    if (session.status === "cancelled" || session.status === "ended") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "self_hosted_key_rotation_not_available" });
    const key = createIngestKey();
    const keyVersion = session.selfHostedKeyVersion + 1;
    await db.update(liveSessions).set({ selfHostedIngestKeyHash: hashIngestKey(key), selfHostedKeyVersion: keyVersion }).where(eq(liveSessions.id, session.id));
    await appendAuditEntry({ actorId: ctx.user.id, action: "live_self_hosted_key_rotated", targetType: "live_session", targetId: session.id, payload: { keyVersion } });
    return { path, key, keyVersion } as const;
  }),

  viewerTicket: protectedProcedure.input(z.object({ sessionId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const db = await requireDatabase();
    const session = await readableSession(db, ctx.user.id, input.sessionId);
    const path = selfHostedPathFor(session.session);
    const capabilities = selfHostedMediaCapabilities();
    if (!path) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "self_hosted_stream_not_configured" });
    if (!capabilities.enabled || !capabilities.origin) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "self_hosted_media_not_deployed" });
    return { url: `/api/live-media/session/${session.session.id}/watch`, expiresAt: new Date(Date.now() + 10 * 60_000).toISOString() } as const;
  }),
});
