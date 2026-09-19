import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, gt, notInArray, or } from "drizzle-orm";
import { z } from "zod";
import { liveSessionMessages, liveSessions, userBlocks, users } from "../../drizzle/schema";
import { protectedProcedure, router, staffProcedure } from "../_core/trpc";
import { appendAuditEntry } from "../auditLedger";
import { getDb } from "../db";

const realmSchema = z.enum(["botany", "aquarium", "terrarium"]);
const trackSchema = z.enum(["community", "expert"]);
const statusSchema = z.enum(["scheduled", "live", "ended", "cancelled"]);
const httpsUrl = z.string().url().max(1_000).refine(value => new URL(value).protocol === "https:", "https_stream_url_required");

async function requireDatabase() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "database_unavailable" });
  return db;
}

async function blockedUserIds(db: Awaited<ReturnType<typeof requireDatabase>>, viewerId: number) {
  const rows = await db.select({ blockerId: userBlocks.blockerId, blockedId: userBlocks.blockedId }).from(userBlocks).where(or(eq(userBlocks.blockerId, viewerId), eq(userBlocks.blockedId, viewerId)));
  return rows.map(row => row.blockerId === viewerId ? row.blockedId : row.blockerId);
}

function asSession(row: { session: typeof liveSessions.$inferSelect; host: typeof users.$inferSelect }) {
  return {
    id: String(row.session.id),
    track: row.session.track,
    title: row.session.title,
    description: row.session.description,
    realm: row.session.realm,
    presenterName: row.session.presenterName,
    presenterCredential: row.session.track === "expert" ? row.session.presenterCredential : null,
    streamUrl: row.session.streamUrl,
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

  create: staffProcedure.input(z.object({ track: trackSchema, title: z.string().trim().min(3).max(180), description: z.string().trim().min(10).max(10_000), realm: realmSchema.nullable().optional(), presenterName: z.string().trim().min(2).max(160), presenterCredential: z.string().trim().min(2).max(160).nullable().optional(), streamUrl: httpsUrl.nullable().optional(), status: z.enum(["scheduled", "live"]).default("scheduled"), startsAt: z.coerce.date(), endsAt: z.coerce.date().nullable().optional() })).mutation(async ({ ctx, input }) => {
    if (input.track === "expert" && !input.presenterCredential) throw new TRPCError({ code: "BAD_REQUEST", message: "expert_credential_required" });
    if (input.endsAt && input.endsAt <= input.startsAt) throw new TRPCError({ code: "BAD_REQUEST", message: "live_end_must_follow_start" });
    const db = await requireDatabase();
    const inserted = await db.insert(liveSessions).values({ hostUserId: ctx.user.id, track: input.track, title: input.title.trim(), description: input.description.trim(), realm: input.realm ?? null, presenterName: input.presenterName.trim(), presenterCredential: input.track === "expert" ? input.presenterCredential?.trim() ?? null : null, streamUrl: input.streamUrl ?? null, status: input.status, startsAt: input.startsAt, endsAt: input.endsAt ?? null });
    const id = Number(inserted[0].insertId);
    await appendAuditEntry({ actorId: ctx.user.id, action: "live_session_created", targetType: "live_session", targetId: id, payload: { track: input.track, status: input.status, hasStreamUrl: Boolean(input.streamUrl), hasCredential: Boolean(input.presenterCredential) } });
    return { id: String(id), created: true } as const;
  }),

  update: staffProcedure.input(z.object({ id: z.number().int().positive(), streamUrl: httpsUrl.nullable().optional(), status: statusSchema.optional(), endsAt: z.coerce.date().nullable().optional() })).mutation(async ({ ctx, input }) => {
    const db = await requireDatabase();
    const [session] = await db.select({ id: liveSessions.id, startsAt: liveSessions.startsAt }).from(liveSessions).where(eq(liveSessions.id, input.id)).limit(1);
    if (!session) throw new TRPCError({ code: "NOT_FOUND", message: "live_session_not_found" });
    if (input.endsAt && input.endsAt <= session.startsAt) throw new TRPCError({ code: "BAD_REQUEST", message: "live_end_must_follow_start" });
    await db.update(liveSessions).set({ ...(input.streamUrl !== undefined ? { streamUrl: input.streamUrl } : {}), ...(input.status ? { status: input.status } : {}), ...(input.endsAt !== undefined ? { endsAt: input.endsAt } : {}) }).where(eq(liveSessions.id, input.id));
    await appendAuditEntry({ actorId: ctx.user.id, action: "live_session_updated", targetType: "live_session", targetId: input.id, payload: { status: input.status ?? null, streamChanged: input.streamUrl !== undefined, endChanged: input.endsAt !== undefined } });
    return { id: String(input.id), updated: true } as const;
  }),
});
