import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const helper = readFileSync(resolve(root, "client/src/const.ts"), "utf8");
const accountAccess = readFileSync(resolve(root, "client/src/pages/AccountAccess.tsx"), "utf8");
const callback = readFileSync(resolve(root, "server/_core/oauth.ts"), "utf8");
const styles = readFileSync(resolve(root, "client/src/index.css"), "utf8");

describe("temporary Manus authentication fallback", () => {
  it("uses the current browser origin and a one-time nonce for Manus sign-in", () => {
    expect(helper).toContain('import { OAUTH_STATE_COOKIE, encodeOAuthState } from "@shared/const"');
    expect(helper).toContain("const redirectUri = `${window.location.origin}/api/oauth/callback`");
    expect(helper).toContain("const nonce = crypto.randomUUID()");
    expect(helper).toContain("encodeOAuthState({ redirectUri, nonce })");
    expect(helper).toContain("document.cookie = `${OAUTH_STATE_COOKIE}=${nonce}");
    expect(helper).toContain('url.searchParams.set("type", "signIn")');
  });

  it("keeps the callback nonce guard and exposes a clear temporary access action", () => {
    expect(callback).toContain("nonce !== expectedNonce");
    expect(callback).toContain('res.status(403).json({ error: "invalid oauth state" })');
    expect(accountAccess).toContain("MIT MANUS ANMELDEN");
    expect(accountAccess).toContain("onClick={startLogin}");
    expect(accountAccess).toContain("const showManusFallback = !isEmailReady");
    expect(accountAccess).toContain("{showManusFallback ? <div className=\"account-manus-fallback\"");
    expect(accountAccess).toContain("eigene E-Mail-Anmeldung wird gerade eingerichtet");
    expect(styles).toContain(".account-manus-fallback");
  });
});
