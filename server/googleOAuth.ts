import { createHash, randomBytes } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import type { Request } from "express";
import { externalAuthIdentities, users } from "../drizzle/schema";
import { getDb } from "./db";

export const GOOGLE_ISSUER = "https://accounts.google.com";

export type GoogleOAuthConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

export type GoogleIdentity = {
  subject: string;
  email: string;
  name: string;
  picture: string | null;
};

function normalized(value: string | undefined) {
  return value?.trim() ?? "";
}

export function getGoogleOAuthConfig(env: NodeJS.ProcessEnv = process.env): GoogleOAuthConfig | null {
  const clientId = normalized(env.GOOGLE_OAUTH_CLIENT_ID);
  const clientSecret = normalized(env.GOOGLE_OAUTH_CLIENT_SECRET);
  const redirectUri = normalized(env.GOOGLE_OAUTH_REDIRECT_URI);
  if (!clientId || !clientSecret || !redirectUri) return null;

  try {
    const url = new URL(redirectUri);
    if (url.protocol !== "https:" || url.search || url.hash) return null;
  } catch {
    return null;
  }

  return { clientId, clientSecret, redirectUri };
}

export function createGoogleStateNonce() {
  return randomBytes(32).toString("base64url");
}

export function googleAuthorizationUrl(config: GoogleOAuthConfig, input: { state: string; codeChallenge: string; prompt?: "select_account" }) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", input.state);
  url.searchParams.set("code_challenge", input.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("include_granted_scopes", "true");
  if (input.prompt === "select_account") url.searchParams.set("prompt", "select_account");
  return url.toString();
}

export function createServerCodeVerifier() {
  return randomBytes(48).toString("base64url");
}

export function createCodeChallenge(verifier: string) {
  return createHash("sha256").update(verifier).digest("base64url");
}

export async function exchangeGoogleAuthorizationCode(input: { code: string; codeVerifier: string; config?: GoogleOAuthConfig | null }): Promise<GoogleIdentity> {
  const config = input.config ?? getGoogleOAuthConfig();
  if (!config) throw new Error("google_oauth_not_configured");
  if (!/^[A-Za-z0-9._~\-]{43,128}$/.test(input.codeVerifier) || input.code.length < 8 || input.code.length > 4096) {
    throw new Error("invalid_google_oauth_code");
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: input.code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: "authorization_code",
      code_verifier: input.codeVerifier,
    }),
  });
  if (!tokenResponse.ok) throw new Error("google_oauth_exchange_failed");
  const token = await tokenResponse.json() as { access_token?: unknown; token_type?: unknown };
  if (typeof token.access_token !== "string" || token.access_token.length < 16 || String(token.token_type ?? "").toLowerCase() !== "bearer") {
    throw new Error("google_oauth_exchange_failed");
  }

  const userInfoResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!userInfoResponse.ok) throw new Error("google_oauth_userinfo_failed");
  const profile = await userInfoResponse.json() as Record<string, unknown>;
  const subject = typeof profile.sub === "string" ? profile.sub : "";
  const email = typeof profile.email === "string" ? profile.email.trim().toLocaleLowerCase("en-US") : "";
  const verified = profile.email_verified === true || profile.email_verified === "true";
  const name = typeof profile.name === "string" && profile.name.trim() ? profile.name.trim().slice(0, 512) : email;
  const picture = typeof profile.picture === "string" && /^https:\/\//.test(profile.picture) ? profile.picture.slice(0, 2048) : null;
  if (!subject || subject.length > 255 || !email || email.length > 320 || !verified || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("google_email_not_verified");
  }
  return { subject, email, name, picture };
}

function googleOpenId(subject: string) {
  return `google_${createHash("sha256").update(`${GOOGLE_ISSUER}:${subject}`).digest("hex").slice(0, 48)}`;
}

/**
 * Resolves one Google identity to exactly one BWL account. An existing account is
 * linked only when Google has verified the same email address. Provider access
 * tokens are never persisted.
 */
export async function resolveGoogleAccount(identity: GoogleIdentity) {
  const db = await getDb();
  if (!db) throw new Error("database_unavailable");
  const now = new Date();

  return db.transaction(async tx => {
    const linked = await tx
      .select({ user: users })
      .from(externalAuthIdentities)
      .innerJoin(users, eq(externalAuthIdentities.userId, users.id))
      .where(and(
        eq(externalAuthIdentities.provider, "google"),
        eq(externalAuthIdentities.issuer, GOOGLE_ISSUER),
        eq(externalAuthIdentities.subject, identity.subject),
      ))
      .limit(1);
    if (linked[0]?.user) {
      if (linked[0].user.status !== "active") throw new Error("account_not_active");
      await tx.update(externalAuthIdentities)
        .set({ normalizedEmail: identity.email, emailVerified: true, lastSignedInAt: now })
        .where(and(
          eq(externalAuthIdentities.provider, "google"),
          eq(externalAuthIdentities.issuer, GOOGLE_ISSUER),
          eq(externalAuthIdentities.subject, identity.subject),
        ));
      await tx.update(users).set({ lastSignedIn: now }).where(eq(users.id, linked[0].user.id));
      return linked[0].user;
    }

    const matchingUsers = await tx.select().from(users).where(sql`lower(${users.email}) = ${identity.email}`).limit(2);
    if (matchingUsers.length > 1) throw new Error("account_migration_conflict");
    let account = matchingUsers[0];
    if (account && account.status !== "active") throw new Error("account_not_active");
    if (!account) {
      const openId = googleOpenId(identity.subject);
      await tx.insert(users).values({ openId, name: identity.name, email: identity.email, loginMethod: "google", lastSignedIn: now });
      const created = await tx.select().from(users).where(eq(users.openId, openId)).limit(1);
      account = created[0];
    }
    if (!account) throw new Error("google_account_create_failed");

    await tx.insert(externalAuthIdentities).values({
      userId: account.id,
      provider: "google",
      issuer: GOOGLE_ISSUER,
      subject: identity.subject,
      normalizedEmail: identity.email,
      emailVerified: true,
      lastSignedInAt: now,
    });
    await tx.update(users).set({ lastSignedIn: now }).where(eq(users.id, account.id));
    return account;
  });
}

export function trustedOriginFromRequest(req: Request, allowedOrigins: ReadonlySet<string>, localOrigins: ReadonlySet<string>, production: boolean): string | null {
  const value = typeof req.query.origin === "string" ? req.query.origin : "";
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.username || url.password || url.pathname !== "/" || url.search || url.hash) return null;
    if (allowedOrigins.has(url.origin) || (!production && localOrigins.has(url.origin))) return url.origin;
  } catch {
    return null;
  }
  return null;
}
