import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

// Deep-Link-Schema der nativen App (siehe app.json "scheme").
const APP_SCHEME = "blackwaterleaf";

async function handleCallback(req: Request, res: Response) {
  const code = getQueryParam(req, "code");
  const state = getQueryParam(req, "state");
  // "platform=app" (oder ein app-Redirect) signalisiert den nativen Flow.
  const platform = getQueryParam(req, "platform");
  const isAppFlow = platform === "app";

  if (!code || !state) {
    res.status(400).json({ error: "code and state are required" });
    return;
  }

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

    // Cookie wird in beiden Fällen gesetzt (schadet dem App-Flow nicht).
    const cookieOptions = getSessionCookieOptions(req);
    res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

    if (isAppFlow) {
      // Native App: Token per Deep-Link zurückgeben. Die App fängt
      // blackwaterleaf://auth?token=... ab, speichert es und nutzt es
      // fortan als Authorization-Header (Bearer). Cookie-Sharing entfällt.
      const deepLink = `${APP_SCHEME}://auth?token=${encodeURIComponent(sessionToken)}`;
      // HTML-Redirect statt 302, damit Custom-Tabs den Deep-Link zuverlässig
      // an die App übergeben (einige Browser blocken 302 auf custom schemes).
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.status(200).send(
        `<!doctype html><html><head><meta charset="utf-8">` +
          `<meta name="viewport" content="width=device-width, initial-scale=1">` +
          `<title>Anmeldung abgeschlossen</title>` +
          `<style>body{background:#070A08;color:#e7efe9;font-family:-apple-system,Segoe UI,Roboto,sans-serif;` +
          `display:flex;min-height:100vh;align-items:center;justify-content:center;text-align:center;padding:24px}` +
          `a{color:#5fb87a;font-weight:600}</style></head>` +
          `<body><div><p>Anmeldung erfolgreich. Zur\u00fcck zur App\u2026</p>` +
          `<p><a href="${deepLink}">Weiter zu BlackwaterLeaf</a></p></div>` +
          `<script>window.location.replace(${JSON.stringify(deepLink)});` +
          `setTimeout(function(){window.location.href=${JSON.stringify(deepLink)};},400);</script>` +
          `</body></html>`
      );
      return;
    }

    res.redirect(302, "/");
  } catch (error) {
    console.error("[OAuth] Callback failed", error);
    res.status(500).json({ error: "OAuth callback failed" });
  }
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", handleCallback);
  // Dedizierte App-Route: verhält sich wie der Callback, erzwingt aber den
  // nativen Deep-Link-Flow, auch ohne platform-Query.
  app.get("/api/oauth/app-callback", (req, res) => {
    if (req.query.platform === undefined) {
      (req.query as Record<string, unknown>).platform = "app";
    }
    return handleCallback(req, res);
  });
}
