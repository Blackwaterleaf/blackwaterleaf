import { createHash, randomBytes } from "node:crypto";
import type { Express, Request, Response } from "express";
import { parse as parseCookieHeader } from "cookie";
import * as db from "../db";
import { sendStudioEmail } from "../resendGateway";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import { ONE_YEAR_MS } from "@shared/const";

export const LOCAL_SESSION_COOKIE = "studio_session";
const CHALLENGE_TTL_MS = 15 * 60 * 1000;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function hashAuthToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function secureCookieOptions(req: Request) {
  const base = getSessionCookieOptions(req);
  return { ...base, sameSite: base.secure ? "none" as const : "lax" as const };
}

export async function issueMagicLink(email: string) {
  if (!ENV.localAuthEnabled) throw new Error("LOCAL_AUTH_DISABLED");
  if (!ENV.resendApiKey || !ENV.resendFromEmail || !ENV.studioPublicUrl) throw new Error("LOCAL_AUTH_EMAIL_NOT_CONFIGURED");
  const normalizedEmail = normalizeEmail(email);
  const rawToken = randomBytes(32).toString("base64url");
  await db.createAuthChallenge({ email: normalizedEmail, tokenHash: hashAuthToken(rawToken), expiresAt: new Date(Date.now() + CHALLENGE_TTL_MS) });
  const verifyUrl = new URL("/api/auth/verify", ENV.studioPublicUrl);
  verifyUrl.searchParams.set("email", normalizedEmail);
  verifyUrl.searchParams.set("token", rawToken);
  await sendStudioEmail({
    to: normalizedEmail,
    subject: "Dein BlackWaterLeaf Studio Login",
    text: `Öffne diesen Link innerhalb von 15 Minuten, um dich im Studio anzumelden: ${verifyUrl.toString()}`,
    html: `<p>Öffne den folgenden Link innerhalb von 15 Minuten, um dich im Studio anzumelden:</p><p><a href="${verifyUrl.toString()}">Studio öffnen</a></p><p>Wenn du diese Anfrage nicht gestellt hast, kannst du diese E-Mail ignorieren.</p>`,
  });
}

export async function createLocalSession(userId: number, req: Request, res: Response) {
  const rawToken = randomBytes(48).toString("base64url");
  await db.createAuthSession({ userId, sessionHash: hashAuthToken(rawToken), expiresAt: new Date(Date.now() + ONE_YEAR_MS) });
  res.cookie(LOCAL_SESSION_COOKIE, rawToken, { ...secureCookieOptions(req), maxAge: ONE_YEAR_MS });
}

export function getLocalSessionToken(req: Request) {
  return parseCookieHeader(req.headers.cookie ?? "")[LOCAL_SESSION_COOKIE];
}

export async function revokeLocalSession(req: Request) {
  const token = getLocalSessionToken(req);
  if (token) await db.revokeAuthSession(hashAuthToken(token));
}

export function registerLocalAuthRoutes(app: Express) {
  app.get("/api/auth/verify", async (req: Request, res: Response) => {
    if (!ENV.localAuthEnabled) {
      res.status(404).send("Local authentication is disabled");
      return;
    }
    const email = typeof req.query.email === "string" ? normalizeEmail(req.query.email) : "";
    const token = typeof req.query.token === "string" ? req.query.token : "";
    if (!email || !token || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      res.status(400).send("Invalid login link");
      return;
    }
    try {
      const consumed = await db.consumeAuthChallenge({ email, tokenHash: hashAuthToken(token) });
      if (!consumed) {
        res.status(410).send("This login link is invalid or expired");
        return;
      }
      const firstLocalUser = !(await db.hasLocalUsers());
      const user = await db.createOrGetLocalUser(email, firstLocalUser && ENV.localAuthBootstrapFirstUser ? "admin" : "user");
      if (!user) {
        res.status(500).send("Could not create the Studio user");
        return;
      }
      await createLocalSession(user.id, req, res);
      res.redirect(302, "/");
    } catch (error) {
      console.error("[LocalAuth] Verification failed", error instanceof Error ? error.message : "unknown");
      res.status(500).send("Login is temporarily unavailable");
    }
  });
}
