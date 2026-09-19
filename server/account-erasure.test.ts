import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const profile = readFileSync(resolve(root, "server/routers/profile.ts"), "utf8");
const designBook = readFileSync(resolve(root, "docs/BLACKWATERLEAF_OBSERVATORY_SCREEN_DESIGN_BOOK_2026-09-19.md"), "utf8");

describe("AP-05 account erasure safety contract", () => {
  it("exposes a non-destructive, protected erasure preview", () => {
    expect(profile).toContain("erasurePreview: protectedProcedure");
    expect(profile).toContain('status: "blocked_pending_ap05"');
    expect(profile).toContain('storageDeletion: "not_yet_executed"');
    expect(profile).toContain('assertSafetyGateAllows("accountErasure")');
  });

  it("documents the complete review boundary", () => {
    expect(designBook).toContain("profile.erasurePreview");
    expect(designBook).toContain("DB-, Session- und Storage-Löschlauf");
  });
});
