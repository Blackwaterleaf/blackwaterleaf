import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Instagram-style profile subscriptions", () => {
  it("exposes an official admin profile with follower status", () => {
    const router = readFileSync(resolve(process.cwd(), "server/routers/social.ts"), "utf8");
    expect(router).toContain("adminProfile: publicProcedure.query");
    expect(router).toContain("eq(users.role, \"admin\")");
    expect(router).toContain("isFollowing: relationship[0]?.status === \"active\"");
    expect(router).toContain("followers: Number(followers[0]?.value ?? 0)");
  });

  it("renders subscribe and unsubscribe actions in the community header", () => {
    const page = readFileSync(resolve(process.cwd(), "client/src/pages/Community.tsx"), "utf8");
    expect(page).toContain("trpc.social.adminProfile.useQuery");
    expect(page).toContain("trpc.social.follow.useMutation");
    expect(page).toContain("trpc.social.unfollow.useMutation");
    expect(page).toContain("BLACKWATERLEAF ABONNIEREN");
    expect(page).toContain("ABONNIERT");
    expect(page).toContain("if (!auth.isAuthenticated) { startLogin(); return; }");
  });
});
