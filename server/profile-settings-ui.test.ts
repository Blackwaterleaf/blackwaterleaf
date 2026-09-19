import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const source = (file: string) => readFileSync(resolve(root, file), "utf8");

describe("profile settings navigation", () => {
  it("keeps every top-right profile destination actionable", () => {
    const shell = source("client/src/components/AppShell.tsx");
    expect(shell).toContain("<Menu size={20} />");
    expect(shell).toContain("/profile/private");
    expect(shell).toContain("/profile/habitats");
    expect(shell).toContain("/profile/progress");
    expect(shell).toContain("/profile/privacy");
    expect(shell).toContain("/profile/preferences");
    expect(shell).toContain("/profile/tools");
    expect(shell).not.toContain("PROFIL · SCHNELLWAHL");
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

  it("does not reintroduce the repeated six-row chooser", () => {
    const home = source("client/src/pages/ProfileHome.tsx");
    const profile = source("client/src/pages/Profile.tsx");
    expect(home).not.toContain("profile-reference-action-grid");
    expect(profile).not.toContain("profile-page-actions__menu");
    expect(profile).toContain("profile-subpage-heading");
  });

  it("keeps private drafts out of both profile homes while retaining only published public posts", () => {
    const webProfile = source("client/src/pages/ProfileHome.tsx");
    const native = source("mobile-natur/App.tsx");
    const nativeProfile = native.slice(native.indexOf("function ProfileScreen"), native.indexOf("function CollectionScreen"));
    expect(webProfile).not.toContain("community.myPosts");
    expect(webProfile).toContain("profile.publicPosts.useQuery");
    expect(webProfile).toContain("ÖFFENTLICHE BEITRÄGE");
    expect(nativeProfile).not.toContain("myCommunityPosts");
    expect(nativeProfile).not.toContain("EIGENE BEITRÄGE");
    expect(nativeProfile).toContain("publicProfilePosts(account.id)");
    expect(nativeProfile).toContain("VERÖFFENTLICHT");
  });

  it("uses a compact four-item 2×2 grid for the public profile excerpts", () => {
    const webProfile = source("client/src/pages/ProfileHome.tsx");
    const styles = source("client/src/index.css");
    const native = source("mobile-natur/App.tsx");
    expect(webProfile).toContain("publicPosts.data.slice(0, 4)");
    expect(styles).toContain(".profile-reference-post-list { display: grid; grid-template-columns:repeat(2,minmax(0,1fr))");
    expect(native).toContain("publicPosts.slice(0, 4)");
    expect(native).toContain("profilePublicPostGrid");
    expect(native).toContain('profilePublicPostTile: { width: "48.5%"');
  });
});

export {};
