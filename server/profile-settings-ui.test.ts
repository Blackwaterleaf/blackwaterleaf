import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const source = (file: string) => readFileSync(resolve(root, file), "utf8");

describe("profile settings navigation", () => {
  it("keeps every top-right profile destination actionable", () => {
    const shell = source("client/src/components/AppShell.tsx");
    expect(shell).toContain("<Menu size={20} />");
    for (const route of ["/profile/private", "/profile/habitats", "/profile/progress", "/profile/privacy", "/profile/preferences", "/profile/tools"]) expect(shell).toContain(route);
    expect(shell).not.toContain("PROFIL · SCHNELLWAHL");
  });

  it("renders the owner-only account closure flow and server mutation", () => {
    const profile = source("client/src/pages/Profile.tsx");
    const router = source("server/routers/profile.ts");
    for (const token of ["profile-avatar", "account-danger-zone", 'confirmation: "LÖSCHEN"']) expect(profile).toContain(token);
    for (const token of ["closeAccount: protectedProcedure", 'status: "banned"']) expect(router).toContain(token);
  });

  it("does not reintroduce the repeated six-row chooser", () => {
    const home = source("client/src/pages/ProfileHome.tsx");
    const profile = source("client/src/pages/Profile.tsx");
    expect(home).not.toContain("profile-reference-action-grid");
    expect(profile).not.toContain("profile-page-actions__menu");
    expect(profile).toContain("ObservatoryContextHeader");
  });

  it("keeps private drafts out of profile homes while retaining public posts", () => {
    const webProfile = source("client/src/pages/ProfileHome.tsx");
    const native = source("mobile-natur/App.tsx");
    const nativeProfile = native.slice(native.indexOf("function ProfileScreen"), native.indexOf("function CollectionScreen"));
    expect(webProfile).not.toContain("community.myPosts");
    expect(webProfile).toContain("profile.publicPosts.useQuery");
    expect(webProfile).toContain("FREIGEGEBENE BEITRÄGE");
    expect(nativeProfile).not.toContain("myCommunityPosts");
    expect(nativeProfile).not.toContain("EIGENE BEITRÄGE");
    expect(nativeProfile).toContain("publicProfilePosts(account.id)");
    expect(nativeProfile).toContain("BEITRÄGE & BILDER");
    expect(nativeProfile).toContain("profilePublicPostImage");
  });

  it("uses a visible creator media grid on web and native", () => {
    const webProfile = source("client/src/pages/ProfileHome.tsx");
    const styles = source("client/src/index.css");
    const native = source("mobile-natur/App.tsx");
    expect(webProfile).toContain("publicPosts.data.slice(0, 4)");
    expect(styles).toContain(".profile-observatory-post-list");
    expect(native).toContain("publicPosts.slice(0, 9)");
    for (const token of ["profilePublicPostGrid", "profilePublicPostImage", 'profilePublicPostTile: { width: "48.5%"']) expect(native).toContain(token);
  });
});

export {};
