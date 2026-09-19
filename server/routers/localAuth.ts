import { TRPCError } from "@trpc/server";
import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { localAuthTokens, localCredentials, users } from "../../drizzle/schema";
import { COOKIE_NAME } from "../../shared/const";
import { getSessionCookieOptions } from "../_core/cookies";
import { sdk } from "../_core/sdk";
import { getDb } from "../db";
import {
  createOneTimeToken,
  getTokenExpiry,
  hashOneTimeToken,
  hashPassword,
  normalizeEmail,
  sendLocalAuthEmail,
  validatePassword,
  verifyPassword,
  type LocalTokenPurpose,
} from "../localAuth";
import { getLocalAuthEmailConfig } from "../localAuthConfig";
import { localAuthProcedure, router } from "../_core/trpc";

const emailInput = z.string().trim().email().max(320);
const passwordInput = z.string().min(1).max(256);
const genericDeliveryMessage = "Wenn ein passendes Konto vorhanden ist, wurde eine E-Mail versendet.";

async function requireDatabase() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "database_unavailable" });
  return db;
}

async function issueToken(input: {
  userId: number;
  email: string;
  displayName?: string | null;
  purpose: LocalTokenPurpose;
}) {
  const db = await requireDatabase();
  const now = new Date();
  const { token, tokenHash } = createOneTimeToken();
  await db
    .update(localAuthTokens)
    .set({ usedAt: now })
    .where(and(eq(localAuthTokens.userId, input.userId), eq(localAuthTokens.purpose, input.purpose), isNull(localAuthTokens.usedAt)));
  await db.insert(localAuthTokens).values({
    userId: input.userId,
    purpose: input.purpose,
    tokenHash,
    expiresAt: getTokenExpiry(input.purpose),
  });
  await sendLocalAuthEmail({ to: input.email, purpose: input.purpose, token, displayName: input.displayName });
}

async function setLocalSession(input: { res: { cookie: Function }; req: Parameters<typeof getSessionCookieOptions>[0]; openId: string; name?: string | null }) {
  const sessionToken = await sdk.createLocalSessionToken(input.openId, { name: input.name ?? "", expiresInMs: 30 * 24 * 60 * 60 * 1_000 });
  input.res.cookie(COOKIE_NAME, sessionToken, { ...getSessionCookieOptions(input.req), maxAge: 30 * 24 * 60 * 60 * 1_000 });
}

export const localAuthRouter = router({
  status: localAuthProcedure.query(() => ({
    emailDeliveryConfigured: Boolean(getLocalAuthEmailConfig()),
    passwordMinimumLength: 12,
    accountMode: "local_email_password" as const,
  })),

  register: localAuthProcedure
    .input(z.object({ email: emailInput, password: passwordInput, displayName: z.string().trim().min(2).max(160).optional() }))
    .mutation(async ({ input }) => {
      if (!getLocalAuthEmailConfig()) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "local_auth_email_not_configured" });
      const passwordProblem = validatePassword(input.password);
      if (passwordProblem) throw new TRPCError({ code: "BAD_REQUEST", message: passwordProblem });
      const db = await requireDatabase();
      const normalizedEmail = normalizeEmail(input.email);
      const existingCredential = await db.select({ id: localCredentials.id }).from(localCredentials).where(eq(localCredentials.normalizedEmail, normalizedEmail)).limit(1);
      if (existingCredential[0]) throw new TRPCError({ code: "CONFLICT", message: "email_already_registered" });

      const matchingUsers = await db.select().from(users).where(sql`lower(${users.email}) = ${normalizedEmail}`).limit(2);
      if (matchingUsers.length > 1) throw new TRPCError({ code: "CONFLICT", message: "account_migration_conflict" });
      const passwordHash = await hashPassword(input.password);
      let user = matchingUsers[0];
      if (!user) {
        const openId = `local_${createOneTimeToken().token.slice(0, 42)}`;
        await db.insert(users).values({ openId, name: input.displayName ?? null, email: input.email.trim(), loginMethod: "local" });
        const created = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
        user = created[0];
      }
      if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "local_account_create_failed" });
      await db.insert(localCredentials).values({ userId: user.id, email: input.email.trim(), normalizedEmail, passwordHash });
      await issueToken({ userId: user.id, email: input.email.trim(), displayName: user.name, purpose: "email_verification" });
      return { message: "confirmation_email_sent" as const };
    }),

  login: localAuthProcedure
    .input(z.object({ email: emailInput, password: passwordInput }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDatabase();
      const credentialRows = await db
        .select({ credential: localCredentials, user: users })
        .from(localCredentials)
        .innerJoin(users, eq(localCredentials.userId, users.id))
        .where(eq(localCredentials.normalizedEmail, normalizeEmail(input.email)))
        .limit(1);
      const record = credentialRows[0];
      if (!record || !(await verifyPassword(input.password, record.credential.passwordHash))) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "invalid_email_or_password" });
      }
      if (!record.credential.emailVerifiedAt) throw new TRPCError({ code: "FORBIDDEN", message: "email_not_verified" });
      if (record.user.status !== "active") throw new TRPCError({ code: "FORBIDDEN", message: "account_not_active" });
      const now = new Date();
      await db.update(localCredentials).set({ lastSignedInAt: now }).where(eq(localCredentials.id, record.credential.id));
      await db.update(users).set({ lastSignedIn: now, loginMethod: "local" }).where(eq(users.id, record.user.id));
      await setLocalSession({ res: ctx.res, req: ctx.req, openId: record.user.openId, name: record.user.name });
      return { success: true } as const;
    }),

  requestPasswordReset: localAuthProcedure.input(z.object({ email: emailInput })).mutation(async ({ input }) => {
    if (!getLocalAuthEmailConfig()) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "local_auth_email_not_configured" });
    const db = await requireDatabase();
    const records = await db
      .select({ credential: localCredentials, user: users })
      .from(localCredentials)
      .innerJoin(users, eq(localCredentials.userId, users.id))
      .where(eq(localCredentials.normalizedEmail, normalizeEmail(input.email)))
      .limit(1);
    const record = records[0];
    if (record?.credential.emailVerifiedAt && record.user.status === "active") {
      await issueToken({ userId: record.user.id, email: record.credential.email, displayName: record.user.name, purpose: "password_reset" });
    }
    return { message: genericDeliveryMessage };
  }),

  verifyEmail: localAuthProcedure.input(z.object({ token: z.string().min(32).max(256) })).mutation(async ({ ctx, input }) => {
    const db = await requireDatabase();
    const tokenRows = await db
      .select()
      .from(localAuthTokens)
      .where(and(eq(localAuthTokens.tokenHash, hashOneTimeToken(input.token)), eq(localAuthTokens.purpose, "email_verification"), isNull(localAuthTokens.usedAt), gt(localAuthTokens.expiresAt, new Date())))
      .limit(1);
    const token = tokenRows[0];
    if (!token) throw new TRPCError({ code: "BAD_REQUEST", message: "invalid_or_expired_token" });
    const credentials = await db.select().from(localCredentials).where(eq(localCredentials.userId, token.userId)).limit(1);
    const credential = credentials[0];
    const account = await db.select().from(users).where(eq(users.id, token.userId)).limit(1);
    const user = account[0];
    if (!credential || !user) throw new TRPCError({ code: "NOT_FOUND", message: "local_account_not_found" });
    const now = new Date();
    await db.update(localAuthTokens).set({ usedAt: now }).where(eq(localAuthTokens.id, token.id));
    await db.update(localCredentials).set({ emailVerifiedAt: now }).where(eq(localCredentials.id, credential.id));
    await db.update(users).set({ loginMethod: "local", lastSignedIn: now }).where(eq(users.id, user.id));
    await setLocalSession({ res: ctx.res, req: ctx.req, openId: user.openId, name: user.name });
    return { success: true } as const;
  }),

  resetPassword: localAuthProcedure.input(z.object({ token: z.string().min(32).max(256), password: passwordInput })).mutation(async ({ ctx, input }) => {
    const passwordProblem = validatePassword(input.password);
    if (passwordProblem) throw new TRPCError({ code: "BAD_REQUEST", message: passwordProblem });
    const db = await requireDatabase();
    const tokenRows = await db
      .select()
      .from(localAuthTokens)
      .where(and(eq(localAuthTokens.tokenHash, hashOneTimeToken(input.token)), eq(localAuthTokens.purpose, "password_reset"), isNull(localAuthTokens.usedAt), gt(localAuthTokens.expiresAt, new Date())))
      .limit(1);
    const token = tokenRows[0];
    if (!token) throw new TRPCError({ code: "BAD_REQUEST", message: "invalid_or_expired_token" });
    const credentials = await db.select().from(localCredentials).where(eq(localCredentials.userId, token.userId)).limit(1);
    const credential = credentials[0];
    const account = await db.select().from(users).where(eq(users.id, token.userId)).limit(1);
    const user = account[0];
    if (!credential || !user) throw new TRPCError({ code: "NOT_FOUND", message: "local_account_not_found" });
    const now = new Date();
    await db.update(localAuthTokens).set({ usedAt: now }).where(eq(localAuthTokens.id, token.id));
    await db.update(localCredentials).set({ passwordHash: await hashPassword(input.password), passwordChangedAt: now }).where(eq(localCredentials.id, credential.id));
    await db.update(users).set({ loginMethod: "local", lastSignedIn: now }).where(eq(users.id, user.id));
    await setLocalSession({ res: ctx.res, req: ctx.req, openId: user.openId, name: user.name });
    return { success: true } as const;
  }),

  resendVerification: localAuthProcedure.input(z.object({ email: emailInput })).mutation(async ({ input }) => {
    if (!getLocalAuthEmailConfig()) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "local_auth_email_not_configured" });
    const db = await requireDatabase();
    const records = await db
      .select({ credential: localCredentials, user: users })
      .from(localCredentials)
      .innerJoin(users, eq(localCredentials.userId, users.id))
      .where(eq(localCredentials.normalizedEmail, normalizeEmail(input.email)))
      .limit(1);
    const record = records[0];
    if (record && !record.credential.emailVerifiedAt && record.user.status === "active") {
      await issueToken({ userId: record.user.id, email: record.credential.email, displayName: record.user.name, purpose: "email_verification" });
    }
    return { message: genericDeliveryMessage };
  }),
});
