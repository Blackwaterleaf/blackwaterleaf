import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const schema = readFileSync(resolve(root, "drizzle/schema.ts"), "utf8");
const google = readFileSync(resolve(root, "server/googleOAuth.ts"), "utf8");
const routes = readFileSync(resolve(root, "server/_core/googleOAuthRoutes.ts"), "utf8");
const sdk = readFileSync(resolve(root, "server/_core/sdk.ts"), "utf8");
const sessions = readFileSync(resolve(root, "server/sessionRegistry.ts"), "utf8");
const native = readFileSync(resolve(root, "mobile-natur/src/nativeAuth.ts"), "utf8");

/** Contract tests intentionally inspect only implementation invariants, never credentials. */
describe("Google OAuth for BlackWaterLeaf", () => {
  it("stores an identity binding but never Google access or refresh tokens", () => {
    expect(schema).toContain('"external_auth_identities"');
    expect(schema).toContain('"normalizedEmail"');
    expect(google).toContain("email_verified");
    expect(google).toContain("externalAuthIdentities");
    expect(google).not.toContain("refresh_token");
    expect(google).not.toContain("accessToken:");
  });

  it("links only a Google-verified email and creates revocable Google sessions", () => {
    expect(google).toContain("google_email_not_verified");
    expect(google).toContain("lower(${users.email})");
    expect(routes).toContain("createGoogleSessionToken");
    expect(sdk).toContain('provider: "google"');
    expect(sessions).toContain('"manus" | "local" | "google"');
    expect(schema).toContain('["manus", "local", "google"]');
  });

  it("uses server-owned PKCE in web and native flows", () => {
    expect(google).toContain("code_challenge_method");
    expect(routes).toContain("createServerCodeVerifier");
    expect(routes).toContain("GOOGLE_STATE_COOKIE");
    expect(native).toContain('provider === "google" ? "/api/oauth/google/mobile/start"');
    expect(native).toContain('provider === "google" ? "/api/oauth/google/mobile/exchange"');
  });
});
