import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("Phase 4–6 retention, quality and SEO contracts", () => {
  it("projects only explicitly public profile posts", () => {
    const source = read("./routers/profile.ts");
    expect(source).toContain("publicPosts: publicProcedure");
    expect(source).toContain('eq(communityPosts.status, "published")');
    expect(source).toContain('eq(communityPosts.visibility, "public")');
  });

  it("keeps social blocking and public-target validation server-side", () => {
    const source = read("./routers/social.ts");
    expect(source).toContain("assertNotBlocked");
    expect(source).toContain("assertPublicTarget");
    expect(source).toContain('router({');
  });

  it("gates public ranking and challenge progress on public media", () => {
    const challengeSource = read("./routers/challenges.ts");
    const rankingSource = read("./routers/gamification.ts");
    for (const source of [challengeSource, rankingSource]) {
      expect(source).toContain("mediaAssets");
      expect(source).toContain('eq(mediaAssets.visibility, "public")');
      expect(source).toContain('eq(xpEvents.sourceType, "media_asset")');
    }
  });

  it("prevents dynamic private and social routes from being indexed", () => {
    const source = read("../client/src/components/AppShell.tsx");
    expect(source).toContain('location === "/search"');
    expect(source).toContain('location.startsWith("/member/")');
    expect(source).toContain('location.startsWith("/profile")');
    expect(source).toContain('noindex, nofollow, noarchive');
    expect(source).toContain('rel="canonical"');
  });
});
