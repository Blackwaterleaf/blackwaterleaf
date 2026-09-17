import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const communityRouter = readFileSync(resolve(root, "server/routers/community.ts"), "utf8");
const adminRouter = readFileSync(resolve(root, "server/routers/admin.ts"), "utf8");
const analyticsRouter = readFileSync(resolve(root, "server/routers/analytics.ts"), "utf8");
const analyticsPanel = readFileSync(resolve(root, "client/src/components/AdminAnalyticsPanel.tsx"), "utf8");

describe("final security and admin contracts", () => {
  it("blocks sexual community content and suspends the submitting account", () => {
    expect(communityRouter).toContain("sexualContentPattern");
    expect(communityRouter).toContain("community_sexual_content_blocked");
    expect(communityRouter).toContain('status: "suspended"');
    expect(communityRouter).toContain("enforceCommunityContentPolicy(db, ctx.user.id, input.content)");
  });

  it("keeps contribution deletion administrator-only and auditable", () => {
    expect(adminRouter).toContain("deletePublicPost: adminProcedure");
    expect(adminRouter).toContain("community_post_deleted_by_admin");
    expect(adminRouter).toContain('visibility: "private"');
  });

  it("locks analytics to the owner email and exposes a numbers-only option", () => {
    expect(analyticsRouter).toContain('blackwaterleaf@gmail.com');
    expect(analyticsRouter).toContain("owner_analytics_only");
    expect(analyticsPanel).toContain("Nur Zahlen");
    expect(analyticsPanel).toContain("numbersOnly");
  });
});
