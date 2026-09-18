import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const source = (file: string) => readFileSync(resolve(root, file), "utf8");

describe("profile settings navigation", () => {
  it("keeps every top-right profile destination actionable", () => {
    const shell = source("client/src/components/AppShell.tsx");
    expect(shell).toContain("/profile#profile-edit");
    expect(shell).toContain("/profile#profile-avatar");
    expect(shell).toContain("/profile#profile-consents");
    expect(shell).toContain("/profile#profile-preferences");
    expect(shell).toContain("/profile#profile-tools");
    expect(shell).not.toContain("/profile#profile-private");
    expect(shell).not.toContain("/profile#profile-habitats");
  });

  it("renders the owner-only account closure flow and server mutation", () => {
    const profile = source("client/src/pages/Profile.tsx");
    const router = source("server/routers/profile.ts");
    expect(profile).toContain("profile-avatar");
    expect(profile).toContain("account-danger-zone");
    expect(profile).toContain('confirmation: "LÖSCHEN"');
    expect(router).toContain("closeAccount: protectedProcedure");
    expect(router).toContain('status: "banned"');
  });
});

export {};
