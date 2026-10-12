import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const community = readFileSync(resolve(root, "server/routers/community.ts"), "utf8");
const notifications = readFileSync(resolve(root, "server/routers/notifications.ts"), "utf8");
const admin = readFileSync(resolve(root, "server/routers/admin.ts"), "utf8");
const schema = readFileSync(resolve(root, "drizzle/schema.ts"), "utf8");

describe("AP-17 community parity contract", () => {
  it("keeps safety-critical community actions server-side and auditable", () => {
    expect(community).toContain("report: protectedProcedure");
    expect(community).toContain("blockUser: protectedProcedure");
    expect(community).toContain("unblockUser: protectedProcedure");
    expect(community).toContain("updateComment: protectedProcedure");
    expect(community).toContain("deleteComment: protectedProcedure");
    expect(community).toContain("community_report_submitted");
    expect(community).toContain("community_user_blocked");
    expect(community).toContain("assertNoBlockingRelationship");
    expect(community).toContain('return { liked: false } as const');
  });

  it("keeps feed author labels and media identity stable", () => {
    expect(community).toContain("displayName: author.name?.trim() || author.username?.trim()");
    expect(community).toContain("const uniqueRows = rows.filter");
    expect(readFileSync(resolve(root, "client/src/pages/Community.tsx"), "utf8")).toContain("const uniquePosts = useMemo");
    expect(readFileSync(resolve(root, "mobile-natur/App.tsx"), "utf8")).toContain("const uniqueMedia = useMemo");
  });

  it("uses cursor pagination and count(*) for notification state", () => {
    expect(notifications).toContain("feedPage: protectedProcedure");
    expect(notifications).toContain("nextCursor");
    expect(notifications).toContain("select({ total: count() })");
  });

  it("gives staff a report queue and sends a decision notification", () => {
    expect(admin).toContain("communityReports: staffProcedure");
    expect(admin).toContain("reviewCommunityReport: staffProcedure");
    expect(admin).toContain('type: "moderation"');
    expect(admin).toContain("community_report_reviewed");
  });

  it("keeps report intake additive and constrained to one target", () => {
    expect(schema).toContain('export const communityReports = mysqlTable');
    expect(schema).toContain('"community_reports_status_created_idx"');
    expect(community).toContain("exactly_one_report_target_required");
  });
});
