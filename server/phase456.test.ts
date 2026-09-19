import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const root = resolve(import.meta.dirname, "..");

describe("Phase 4–6 retention, quality and SEO contracts", () => {
  it("projects only explicitly public profile posts", () => {
    const source = read("./routers/profile.ts");
    for (const token of ["publicPosts: protectedProcedure", 'eq(communityPosts.status, "published")', 'eq(communityPosts.visibility, "public")']) expect(source).toContain(token);
  });

  it("keeps social blocking and public-target validation server-side", () => {
    const source = read("./routers/social.ts");
    for (const token of ["assertNotBlocked", "assertPublicTarget", "router({"]) expect(source).toContain(token);
  });

  it("gates public ranking and challenge progress on public media", () => {
    for (const source of [read("./routers/challenges.ts"), read("./routers/gamification.ts")]) {
      for (const token of ["mediaAssets", 'eq(mediaAssets.visibility, "public")', 'eq(xpEvents.sourceType, "media_asset")']) expect(source).toContain(token);
    }
  });

  it("prevents dynamic private and social routes from being indexed", () => {
    const source = read("../client/src/components/AppShell.tsx");
    for (const token of ['location === "/search"', 'location.startsWith("/member/")', 'location.startsWith("/profile")', "noindex, nofollow, noarchive", 'rel="canonical"']) expect(source).toContain(token);
  });
});

describe("profile three-line menu routes", () => {
  it("links every settings choice to its own route and reveals that route", () => {
    const shell = read("../client/src/components/AppShell.tsx");
    const styles = read("../client/src/index.css");
    for (const route of ["/profile/private", "/profile/habitats", "/profile/progress", "/profile/privacy", "/profile/preferences", "/profile/tools"]) expect(shell).toContain(`href=\"${route}\"`);
    for (const token of ["profile-section-privacy #profile-consents", "profile-section-preferences #profile-preferences", "profile-section-tools #profile-tools"]) expect(styles).toContain(token);
  });
});

describe("private profile boundary and native menu parity", () => {
  it("keeps privacy, language and tools out of the web profile home", () => {
    const source = read("../client/src/pages/ProfileHome.tsx");
    for (const token of ["DEIN BEREICH WARTET AUF DICH", "ObservatoryStateSurface", "profile.publicPosts.useQuery", "FREIGEGEBENE BEITRÄGE"]) expect(source).toContain(token);
    expect(source).not.toContain("Datenschutz & Freigaben <ChevronRight");
  });

  it("exposes the same three-line menu destinations in Native", () => {
    const source = read("../mobile-natur/App.tsx");
    for (const label of ["Privatbereich & Profil bearbeiten", "Meine Anlagen", "Punkte & Fortschritt", "Datenschutz & Freigaben", "Sprache & Einheiten", "Weitere Werkzeuge"]) expect(source).toContain(label);
    expect(source).toContain("profileConsentPanel");
    expect(source).toContain("profilePreferencesPanel");
  });
});

describe("continuous realm banners and focused community editing", () => {
  it("maps the German realm routes to their themes and retains focused community editing", () => {
    const realm = read("../client/src/pages/Realm.tsx");
    const community = read("../client/src/pages/Community.tsx");
    expect(realm).toContain('aquaristik: "aquarium"');
    expect(realm).toContain('terraristik: "terrarium"');
    expect(community).not.toContain("const myPosts = trpc.community.myPosts.useQuery");
    expect(community).toContain("community-edit--focused");
    expect(existsSync(resolve(root, "client/src/components/ReferenceOverlay.tsx"))).toBe(false);
  });
});
