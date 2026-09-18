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
    expect(shell).toContain("/world/botany");
    expect(shell).toContain("/world/aquarium");
    expect(shell).toContain("/world/terrarium");
    expect(shell).toContain("/profile#profile-tools");
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

