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


describe("profile three-line menu routes", () => {
  it("links every settings choice to its own route and reveals that route", () => {
    const shell = read("../client/src/components/AppShell.tsx");
    const styles = read("../client/src/index.css");
    for (const route of ["/profile/private", "/profile/habitats", "/profile/progress", "/profile/privacy", "/profile/preferences", "/profile/tools"]) {
      expect(shell).toContain(`href=\"${route}\"`);
    }
    expect(styles).toContain("profile-section-privacy #profile-consents { display: grid; }");
    expect(styles).toContain("profile-section-preferences #profile-preferences { display: grid; }");
    expect(styles).toContain("profile-section-tools #profile-tools { display: grid; }");
  });
});


describe("private profile boundary and native menu parity", () => {
  it("keeps privacy, language and tools out of the web profile home", () => {
    const source = read("../client/src/pages/ProfileHome.tsx");
    expect(source).toContain("DEIN BEREICH WARTET AUF DICH");
    expect(source).toContain("profile-auth-cta");
    expect(source).not.toContain("Datenschutz & Freigaben <ChevronRight");
    expect(source).not.toContain("Privatsphäre, Sprache und Sicherheit");
  });

  it("exposes the same three-line menu destinations in Native", () => {
    const source = read("../mobile-natur/App.tsx");
    for (const label of ["Privatbereich & Profil bearbeiten", "Meine Anlagen", "Punkte & Fortschritt", "Datenschutz & Freigaben", "Sprache & Einheiten", "Weitere Werkzeuge"]) {
      expect(source).toContain(label);
    }
    expect(source).toContain("profileConsentPanel");
    expect(source).toContain("profilePreferencesPanel");
  });
});


describe("continuous realm banners and focused community editing", () => {
  it("maps the German realm routes to their own themes and removes duplicate history loading", () => {
    const realm = read("../client/src/pages/Realm.tsx");
    const community = read("../client/src/pages/Community.tsx");
    const overlay = read("../client/src/components/ReferenceOverlay.tsx");
    expect(realm).toContain("aquaristik: \"aquarium\"");
    expect(realm).toContain("terraristik: \"terrarium\"");
    expect(community).not.toContain("const myPosts = trpc.community.myPosts.useQuery");
    expect(community).toContain("community-edit--focused");
    expect(overlay).toContain("reference-hero--continuous");
  });
});
