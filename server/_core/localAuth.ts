import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { Express, Request, Response } from "express";
import { parse as parseCookieHeader } from "cookie";
import * as db from "../db";
import { sendStudioEmail } from "../resendGateway";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import { ONE_YEAR_MS } from "@shared/const";

export const LOCAL_SESSION_COOKIE = "studio_session";
const CHALLENGE_TTL_MS = 15 * 60 * 1000;
const scrypt = promisify(scryptCallback);

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function hashAuthToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, 64) as Buffer;
  return `scrypt$${salt.toString("base64url")}$${derived.toString("base64url")}`;
}

export async function verifyPassword(password: string, encoded: string | null | undefined) {
  if (!encoded?.startsWith("scrypt$")) return false;
  const [, saltText, hashText] = encoded.split("$");
  if (!saltText || !hashText) return false;
  try {
    const salt = Buffer.from(saltText, "base64url");
    const expected = Buffer.from(hashText, "base64url");
    const actual = await scrypt(password, salt, expected.length) as Buffer;
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch { return false; }
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

export async function createPasswordUser(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalizedEmail)) throw new Error("INVALID_EMAIL");
  if (password.length < 10) throw new Error("PASSWORD_TOO_SHORT");
  if (await db.getLocalUserByEmail(normalizedEmail)) throw new Error("EMAIL_ALREADY_REGISTERED");
  const firstLocalUser = !(await db.hasLocalUsers());
  return db.createLocalPasswordUser({ email: normalizedEmail, passwordHash: await hashPassword(password), role: firstLocalUser && ENV.localAuthBootstrapFirstUser ? "admin" : "user" });
}

export async function authenticatePasswordUser(email: string, password: string) {
  const user = await db.getLocalUserByEmail(normalizeEmail(email));
  if (!user || !(await verifyPassword(password, user.passwordHash))) return null;
  await db.setLocalPassword(user.id, await hashPassword(password));
  return db.getUserByOpenId(user.openId);
}

export function getLocalSessionToken(req: Request) {
  return parseCookieHeader(req.headers.cookie ?? "")[LOCAL_SESSION_COOKIE];
}

export async function revokeLocalSession(req: Request) {
  const token = getLocalSessionToken(req);
  if (token) await db.revokeAuthSession(hashAuthToken(token));
}

export function registerLocalAuthRoutes(app: Express) {
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    if (!ENV.localAuthEnabled) { res.status(404).json({ message: "Local authentication is disabled" }); return; }
    try {
      const user = await createPasswordUser(String(req.body?.email ?? ""), String(req.body?.password ?? ""));
      if (!user) { res.status(500).json({ message: "Could not create the Studio user" }); return; }
      await createLocalSession(user.id, req, res);
      res.status(201).json({ user });
    } catch (error) {
      const message = error instanceof Error ? error.message : "REGISTRATION_FAILED";
      const status = message === "EMAIL_ALREADY_REGISTERED" ? 409 : message === "PASSWORD_TOO_SHORT" || message === "INVALID_EMAIL" ? 400 : 500;
      res.status(status).json({ message });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    if (!ENV.localAuthEnabled) { res.status(404).json({ message: "Local authentication is disabled" }); return; }
    const user = await authenticatePasswordUser(String(req.body?.email ?? ""), String(req.body?.password ?? ""));
    if (!user) { res.status(401).json({ message: "E-Mail oder Passwort ist falsch" }); return; }
    await createLocalSession(user.id, req, res);
    res.json({ user });
  });

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
