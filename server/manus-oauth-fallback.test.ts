import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const helper = readFileSync(resolve(root, "client/src/const.ts"), "utf8");
const accountAccess = readFileSync(resolve(root, "client/src/pages/AccountAccess.tsx"), "utf8");
const callback = readFileSync(resolve(root, "server/_core/oauth.ts"), "utf8");
const googleCallback = readFileSync(resolve(root, "server/_core/googleOAuthRoutes.ts"), "utf8");
const googleHelper = readFileSync(resolve(root, "server/googleOAuth.ts"), "utf8");
const client = readFileSync(resolve(root, "client/src/main.tsx"), "utf8");
const styles = readFileSync(resolve(root, "client/src/index.css"), "utf8");

describe("temporary Manus authentication fallback", () => {
  it("starts through the server and keeps the API same-origin for session cookies", () => {
    expect(helper).toContain('new URLSearchParams({ origin: window.location.origin })');
    expect(helper).toContain('window.location.assign(`/api/oauth/start?${params.toString()}`)');
    expect(callback).toContain("const nonce = crypto.randomUUID()");
    expect(callback).toContain("encodeOAuthState({ redirectUri, nonce })");
    expect(callback).toContain("getTrustedWebOrigin(req)");
    expect(callback).not.toContain('req.get("host")');
    expect(callback).toContain('url.searchParams.set("type", "signIn")');
    expect(client).toContain('url: "/api/trpc"');
    expect(client).not.toContain("3000-ibp8fnclaynuq4sdd6dsd-206ff939.us1.manus.computer/api/trpc");
  });

  it("keeps the callback nonce guard, Google PKCE and a controlled temporary access action", () => {
    expect(callback).toContain("nonce !== expectedNonce");
    expect(callback).toContain('res.status(403).json({ error: "invalid oauth state" })');
    expect(helper).toContain("startGoogleLogin");
    expect(helper).toContain("/api/oauth/google/start?");
    expect(googleHelper).toContain("code_challenge");
    expect(googleCallback).toContain("GOOGLE_STATE_COOKIE");
    expect(googleCallback).toContain("createGoogleSessionToken");
    expect(googleHelper).toContain("tokens are never persisted");
    expect(googleHelper).toContain("email_verified");
    expect(accountAccess).toContain("MIT MANUS ANMELDEN");
    expect(accountAccess).toContain("MIT GOOGLE ANMELDEN");
    expect(accountAccess).toContain("googleLoginAvailable");
    expect(accountAccess).toContain("onClick={startLogin}");
    expect(accountAccess).toContain("const localLoginAvailable = Boolean(status.data?.localLoginAvailable)");
    expect(accountAccess).toContain("const showManusFallback = !isEmailReady || !localLoginAvailable");
    expect(accountAccess).toContain("showManusFallback && !googleLoginAvailable");
    expect(accountAccess).toContain("BlackWaterLeaf kann weltweit genutzt werden");
    expect(styles).toContain(".account-manus-fallback");
  });
});
