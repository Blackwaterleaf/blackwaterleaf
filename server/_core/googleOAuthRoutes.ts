import type { Express, Request, Response } from "express";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import { sdk } from "./sdk";
import {
  createCodeChallenge,
  createGoogleStateNonce,
  createServerCodeVerifier,
  exchangeGoogleAuthorizationCode,
  getGoogleOAuthConfig,
  googleAuthorizationUrl,
  resolveGoogleAccount,
  trustedOriginFromRequest,
} from "../googleOAuth";

const GOOGLE_STATE_COOKIE = "bwl_google_oauth_state";
const MOBILE_CALLBACK_SCHEME = "blackwaterleaf://oauth/callback";
const MOBILE_CODE_AUDIENCE = "blackwaterleaf-google";
const MOBILE_CODE_TTL_SECONDS = 90;
const TRUSTED_WEB_ORIGINS = new Set([
  "https://blackwaterleaf.com",
  "https://www.blackwaterleaf.com",
  "https://bwlparity-nearrhpw.manus.space",
]);
const LOCAL_WEB_ORIGINS = new Set(["http://localhost:3000", "http://127.0.0.1:3000"]);

type GoogleState = {
  flow: "web" | "native";
  nonce: string;
  verifier: string;
  origin?: string;
  mobileState?: string;
  mobileCodeChallenge?: string;
};

function signingKey() {
  if (ENV.cookieSecret.length < 32) throw new Error("google_oauth_signing_secret_unavailable");
  return new TextEncoder().encode(ENV.cookieSecret);
}

function validMobileState(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{32,256}$/.test(value);
}

function validCodeChallenge(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{43,128}$/.test(value);
}

function queryValue(req: Request, key: string) {
  const value = req.query[key];
  return typeof value === "string" ? value : "";
}

async function encodeState(value: GoogleState) {
  return new SignJWT(value)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setAudience("blackwaterleaf-google-oauth")
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(signingKey());
}

async function decodeState(value: string): Promise<GoogleState | null> {
  try {
    const { payload } = await jwtVerify(value, signingKey(), { algorithms: ["HS256"], audience: "blackwaterleaf-google-oauth" });
    const raw = payload as Record<string, unknown>;
    if ((raw.flow !== "web" && raw.flow !== "native") || typeof raw.nonce !== "string" || !/^[A-Za-z0-9_-]{32,256}$/.test(raw.nonce) || typeof raw.verifier !== "string" || !/^[A-Za-z0-9._~-]{43,128}$/.test(raw.verifier)) return null;
    if (raw.flow === "web") {
      if (typeof raw.origin !== "string" || !TRUSTED_WEB_ORIGINS.has(raw.origin)) return null;
      return { flow: "web", nonce: raw.nonce, verifier: raw.verifier, origin: raw.origin };
    }
    if (!validMobileState(raw.mobileState) || !validCodeChallenge(raw.mobileCodeChallenge)) return null;
    return { flow: "native", nonce: raw.nonce, verifier: raw.verifier, mobileState: raw.mobileState, mobileCodeChallenge: raw.mobileCodeChallenge };
  } catch {
    return null;
  }
}

async function createNativeLoginCode(input: { openId: string; name: string; mobileState: string; codeChallenge: string }) {
  return new SignJWT({ ...input, appId: ENV.appId, provider: "google" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setAudience(MOBILE_CODE_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + MOBILE_CODE_TTL_SECONDS)
    .sign(signingKey());
}

async function verifyNativeLoginCode(value: string) {
  try {
    const { payload } = await jwtVerify(value, signingKey(), { algorithms: ["HS256"], audience: MOBILE_CODE_AUDIENCE });
    const raw = payload as Record<string, unknown>;
    if (typeof raw.openId !== "string" || typeof raw.name !== "string" || raw.appId !== ENV.appId || raw.provider !== "google" || !validMobileState(raw.mobileState) || !validCodeChallenge(raw.codeChallenge)) return null;
    return { openId: raw.openId, name: raw.name, mobileState: raw.mobileState, codeChallenge: raw.codeChallenge };
  } catch {
    return null;
  }
}

function unavailable(res: Response) {
  res.status(503).json({ error: "google_oauth_not_configured" });
}

function googleFailureRedirect(origin: string) {
  return `${origin}/login?oauth=google_failed`;
}

export function registerGoogleOAuthRoutes(app: Express) {
  app.get("/api/oauth/google/start", async (req, res) => {
    const config = getGoogleOAuthConfig();
    const origin = trustedOriginFromRequest(req, TRUSTED_WEB_ORIGINS, LOCAL_WEB_ORIGINS, ENV.isProduction);
    if (!config) return unavailable(res);
    if (!origin) return res.status(400).json({ error: "oauth_origin_required" });
    const nonce = createGoogleStateNonce();
    const verifier = createServerCodeVerifier();
    const state = await encodeState({ flow: "web", nonce, verifier, origin });
    res.cookie(GOOGLE_STATE_COOKIE, nonce, { path: "/", maxAge: 10 * 60 * 1_000, httpOnly: true, secure: true, sameSite: "none" });
    res.set("Cache-Control", "no-store");
    res.redirect(302, googleAuthorizationUrl(config, { state, codeChallenge: createCodeChallenge(verifier), prompt: queryValue(req, "prompt") === "select_account" ? "select_account" : undefined }));
  });

  app.get("/api/oauth/google/mobile/start", async (req, res) => {
    const config = getGoogleOAuthConfig();
    const mobileState = queryValue(req, "mobileState");
    const mobileCodeChallenge = queryValue(req, "codeChallenge");
    if (!config) return unavailable(res);
    if (!validMobileState(mobileState) || !validCodeChallenge(mobileCodeChallenge)) return res.status(400).json({ error: "invalid_native_exchange" });
    const verifier = createServerCodeVerifier();
    const state = await encodeState({ flow: "native", nonce: createGoogleStateNonce(), verifier, mobileState, mobileCodeChallenge });
    res.set("Cache-Control", "no-store");
    res.redirect(302, googleAuthorizationUrl(config, { state, codeChallenge: createCodeChallenge(verifier), prompt: queryValue(req, "prompt") === "select_account" ? "select_account" : undefined }));
  });

  app.get("/api/oauth/google/callback", async (req, res) => {
    const code = queryValue(req, "code");
    const state = queryValue(req, "state");
    const parsed = state ? await decodeState(state) : null;
    if (!code || !parsed) return res.status(400).json({ error: "invalid_google_oauth_state" });

    if (parsed.flow === "web") {
      const expectedNonce = parseCookieHeader(req.headers.cookie ?? "")[GOOGLE_STATE_COOKIE];
      if (expectedNonce !== parsed.nonce) return res.status(403).json({ error: "invalid_google_oauth_state" });
      res.clearCookie(GOOGLE_STATE_COOKIE, { path: "/", secure: true, sameSite: "none" });
    }

    try {
      const identity = await exchangeGoogleAuthorizationCode({ code, codeVerifier: parsed.verifier });
      const account = await resolveGoogleAccount(identity);
      const sessionToken = await sdk.createGoogleSessionToken(account.openId, { name: account.name || identity.name, expiresInMs: ONE_YEAR_MS });

      if (parsed.flow === "native") {
        const callback = new URL(MOBILE_CALLBACK_SCHEME);
        callback.searchParams.set("state", parsed.mobileState!);
        callback.searchParams.set("code", await createNativeLoginCode({ openId: account.openId, name: account.name || identity.name, mobileState: parsed.mobileState!, codeChallenge: parsed.mobileCodeChallenge! }));
        res.set("Cache-Control", "no-store");
        res.set("Referrer-Policy", "no-referrer");
        return res.redirect(302, callback.toString());
      }

      res.cookie(COOKIE_NAME, sessionToken, { ...getSessionCookieOptions(req), maxAge: ONE_YEAR_MS });
      return res.redirect(302, parsed.origin!);
    } catch (error) {
      console.error("[Google OAuth] Callback failed", error instanceof Error ? error.message : "unknown");
      if (parsed.flow === "web") return res.redirect(302, googleFailureRedirect(parsed.origin!));
      return res.status(403).json({ error: "google_oauth_failed" });
    }
  });

  app.post("/api/oauth/google/mobile/exchange", async (req, res) => {
    const code = typeof req.body?.code === "string" ? req.body.code : "";
    const mobileState = typeof req.body?.state === "string" ? req.body.state : "";
    const verifier = typeof req.body?.codeVerifier === "string" ? req.body.codeVerifier : "";
    if (!validMobileState(mobileState) || !/^[A-Za-z0-9._~-]{43,128}$/.test(verifier) || code.length > 4096) return res.status(400).json({ error: "invalid_native_exchange" });
    const payload = await verifyNativeLoginCode(code);
    if (!payload || payload.mobileState !== mobileState || createCodeChallenge(verifier) !== payload.codeChallenge) return res.status(403).json({ error: "invalid_native_exchange" });
    const sessionToken = await sdk.createGoogleSessionToken(payload.openId, { name: payload.name, expiresInMs: ONE_YEAR_MS });
    res.set("Cache-Control", "no-store");
    res.set("Referrer-Policy", "no-referrer");
    res.status(200).json({ sessionToken });
  });
}
