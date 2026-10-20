import { COOKIE_NAME, ONE_YEAR_MS, OAUTH_STATE_COOKIE, decodeOAuthState, encodeOAuthState } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";
import type { Express, Request, Response } from "express";
import { SignJWT, jwtVerify } from "jose";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { ENV } from "./env";

const MOBILE_CALLBACK_SCHEME = "blackwaterleaf://oauth/callback";
const MOBILE_OAUTH_CALLBACK = "https://blackwaterleaf.com/api/oauth/callback";
const MOBILE_CODE_AUDIENCE = "blackwaterleaf-natur";
const MOBILE_CODE_TTL_SECONDS = 90;
const TRUSTED_WEB_ORIGINS = new Set([
  "https://blackwaterleaf.com",
  "https://www.blackwaterleaf.com",
  "https://bwlparity-nearrhpw.manus.space",
]);
const LOCAL_WEB_ORIGINS = new Set([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

function isValidMobileState(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{32,256}$/.test(value);
}

function isValidCodeChallenge(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{43,128}$/.test(value);
}

function toBase64Url(value: Uint8Array) {
  return Buffer.from(value).toString("base64url");
}

async function createNativeLoginCode(input: { openId: string; name: string; mobileState: string; codeChallenge: string }) {
  return new SignJWT({ openId: input.openId, appId: ENV.appId, name: input.name, mobileState: input.mobileState, codeChallenge: input.codeChallenge })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setAudience(MOBILE_CODE_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + MOBILE_CODE_TTL_SECONDS)
    .sign(new TextEncoder().encode(ENV.cookieSecret));
}

async function verifyNativeLoginCode(code: string) {
  const { payload } = await jwtVerify(code, new TextEncoder().encode(ENV.cookieSecret), { algorithms: ["HS256"], audience: MOBILE_CODE_AUDIENCE });
  const { openId, appId, name, mobileState, codeChallenge } = payload as Record<string, unknown>;
  if (typeof openId !== "string" || appId !== ENV.appId || typeof name !== "string" || !isValidMobileState(mobileState) || !isValidCodeChallenge(codeChallenge)) return null;
  return { openId, name, mobileState, codeChallenge };
}

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

/**
 * The managed WebDev runtime may receive the request on an internal proxy host.
 * The browser origin must therefore be supplied explicitly and checked against
 * our allowlist; the incoming request host is not the public application origin.
 */
function getTrustedWebOrigin(req: Request): string | null {
  const value = getQueryParam(req, "origin");
  if (!value) return null;

  try {
    const parsed = new URL(value);
    if (parsed.username || parsed.password || parsed.pathname !== "/" || parsed.search || parsed.hash) return null;
    const origin = parsed.origin;
    if (TRUSTED_WEB_ORIGINS.has(origin)) return origin;
    if (!ENV.isProduction && LOCAL_WEB_ORIGINS.has(origin)) return origin;
  } catch {
    return null;
  }

  return null;
}

export function registerOAuthRoutes(app: Express) {
  /** Web login entry point. The server owns the portal/app configuration so
   * preview and production builds cannot drift apart. */
  app.get("/api/oauth/start", (req: Request, res: Response) => {
    if (!ENV.oAuthPortalUrl || !ENV.appId) {
      res.status(503).json({ error: "oauth_not_configured" });
      return;
    }
    const webOrigin = getTrustedWebOrigin(req);
    if (!webOrigin) {
      res.status(400).json({ error: "oauth_origin_required" });
      return;
    }
    const redirectUri = `${webOrigin}/api/oauth/callback`;
    const nonce = crypto.randomUUID();
    const state = encodeOAuthState({ redirectUri, nonce });
    res.cookie(OAUTH_STATE_COOKIE, nonce, { path: "/", maxAge: 10 * 60 * 1000, httpOnly: true, secure: true, sameSite: "none" });
    const url = new URL(`${ENV.oAuthPortalUrl}/app-auth`);
    url.searchParams.set("appId", ENV.appId);
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signIn");
    res.set("Cache-Control", "no-store");
    res.redirect(302, url.toString());
  });

  /**
   * Begins the native BlackWaterLeaf Natur OAuth flow. The web callback remains
   * the registered HTTPS redirect; only after a verified code exchange does the
   * server send the session to the fixed app scheme. The app compares its own
   * high-entropy state before saving the bearer token.
   */
  app.get("/api/oauth/mobile/start", (req: Request, res: Response) => {
    const mobileState = getQueryParam(req, "mobileState");
    const codeChallenge = getQueryParam(req, "codeChallenge");
    const prompt = getQueryParam(req, "prompt");
    if (!isValidMobileState(mobileState) || !isValidCodeChallenge(codeChallenge) || !ENV.oAuthPortalUrl || !ENV.appId) {
      res.status(400).json({ error: "native_oauth_not_available" });
      return;
    }

    const state = encodeOAuthState({ redirectUri: MOBILE_OAUTH_CALLBACK, mobileState, mobileCodeChallenge: codeChallenge });
    const url = new URL(`${ENV.oAuthPortalUrl}/app-auth`);
    url.searchParams.set("appId", ENV.appId);
    url.searchParams.set("redirectUri", MOBILE_OAUTH_CALLBACK);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signIn");
    if (prompt === "select_account") url.searchParams.set("prompt", "select_account");
    res.set("Cache-Control", "no-store");
    res.redirect(302, url.toString());
  });

  app.post("/api/oauth/mobile/exchange", async (req: Request, res: Response) => {
    const code = typeof req.body?.code === "string" ? req.body.code : "";
    const mobileState = typeof req.body?.state === "string" ? req.body.state : "";
    const verifier = typeof req.body?.codeVerifier === "string" ? req.body.codeVerifier : "";
    if (!isValidMobileState(mobileState) || !/^[A-Za-z0-9._~-]{43,128}$/.test(verifier) || code.length > 4096) {
      res.status(400).json({ error: "invalid_native_exchange" });
      return;
    }
    try {
      const payload = await verifyNativeLoginCode(code);
      const actualChallenge = toBase64Url(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier))));
      if (!payload || payload.mobileState !== mobileState || payload.codeChallenge !== actualChallenge) {
        res.status(403).json({ error: "invalid_native_exchange" });
        return;
      }
      const sessionToken = await sdk.createSessionToken(payload.openId, { name: payload.name, expiresInMs: ONE_YEAR_MS });
      res.set("Cache-Control", "no-store");
      res.set("Referrer-Policy", "no-referrer");
      res.status(200).json({ sessionToken });
    } catch {
      res.status(403).json({ error: "invalid_native_exchange" });
    }
  });

  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    // CSRF guard: the nonce in `state` must match the one-time cookie that
    // startLogin set in the browser that began this login. An attacker can
    // forge `state`, but cannot plant this cookie in the victim's browser.
    const oauthState = decodeOAuthState(state);
    const mobileState = oauthState.mobileState;
    const mobileCodeChallenge = oauthState.mobileCodeChallenge;
    const nativeFlow = isValidMobileState(mobileState) && isValidCodeChallenge(mobileCodeChallenge) && oauthState.redirectUri === MOBILE_OAUTH_CALLBACK;
    const expectedNonce = parseCookieHeader(req.headers.cookie ?? "")[OAUTH_STATE_COOKIE];
    if (!nativeFlow && (!oauthState.nonce || oauthState.nonce !== expectedNonce)) {
      res.status(403).json({ error: "invalid oauth state" });
      return;
    }
    if (!nativeFlow) res.clearCookie(OAUTH_STATE_COOKIE, { path: "/", secure: true, sameSite: "none" });

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      if (nativeFlow) {
        const callback = new URL(MOBILE_CALLBACK_SCHEME);
        callback.searchParams.set("state", mobileState);
        callback.searchParams.set("code", await createNativeLoginCode({ openId: userInfo.openId, name: userInfo.name || "", mobileState, codeChallenge: mobileCodeChallenge }));
        res.set("Cache-Control", "no-store");
        res.set("Referrer-Policy", "no-referrer");
        res.redirect(302, callback.toString());
        return;
      }

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
