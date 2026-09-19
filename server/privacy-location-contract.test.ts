import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const profile = readFileSync(resolve(root, "server/routers/profile.ts"), "utf8");
const consents = readFileSync(resolve(root, "server/consents.ts"), "utf8");

describe("AP-09 privacy and location contract", () => {
  it("does not expose profile location or suspended-account posts publicly", () => {
    expect(profile).toContain("location: includePrivate ? user.location : null");
    expect(profile).toContain('eq(users.status, "active")');
    expect(profile).toContain('eq(communityPosts.visibility, "public")');
  });

  it("forces a private profile when profile publication consent is revoked", () => {
    expect(consents).toContain('input.purpose === "profile_publication" && !input.granted');
    expect(consents).toContain('set({ profileVisibility: "private" })');
  });
});
