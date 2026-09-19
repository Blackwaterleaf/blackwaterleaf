import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const admin = readFileSync(resolve(root, "server/routers/admin.ts"), "utf8");
const community = readFileSync(resolve(root, "server/routers/community.ts"), "utf8");
const contract = readFileSync(resolve(root, "docs/AP07_MODERATION_APPEALS_DATA_CONTRACT_2026-09-19.md"), "utf8");

describe("AP-07 moderation and appeals contract", () => {
  it("keeps existing server-verified moderation capabilities intact", () => {
    expect(admin).toContain("setPublicPostStatus");
    expect(admin).toContain("deletePublicPost: adminProcedure");
    expect(community).toContain("community_sexual_content_blocked");
    expect(community).toContain("community_content_policy_violation_account_suspended");
  });

  it("requires dedicated report and appeal records instead of free audit text", () => {
    expect(contract).toContain("moderation_reports");
    expect(contract).toContain("moderation_appeals");
    expect(contract).toContain("Freie Audit-Logtexte reichen nicht aus");
    expect(contract).toContain("noch nicht ausgeführt");
  });
});
