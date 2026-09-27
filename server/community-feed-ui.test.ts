import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const read = (file: string) => readFileSync(resolve(root, file), "utf8");

describe("Observatory community feed interface", () => {
  it("keeps the existing realm selection while presenting a public, moderated feed", () => {
    const page = read("client/src/pages/Community.tsx");
    for (const token of ["ObservatoryContextHeader", "ÖFFENTLICHER FACHFEED", "community-feed-command", "community-feed-filters", "aria-pressed", "QUELLENBASIERT", "Aktive · veröffentlichte Beiträge"]) expect(page).toContain(token);
    for (const filter of ["Feed", "Botanik", "Aquaristik", "Terraristik"]) expect(page).toContain(filter);
  });

  it("offers refresh and creation actions without inventing feed content", () => {
    const page = read("client/src/pages/Community.tsx");
    for (const token of ["feed.refetch()", "BEITRAG ERSTELLEN", "feed.isLoading", "feed.isError", "FEED / EMPTY", "Keine Beiträge in diesem Bereich"]) expect(page).toContain(token);
  });

  it("separates admin media targets from the explicit all-feeds option", () => {
    const page = read("client/src/pages/Community.tsx");
    for (const token of ["const adminPublicPost = isAdmin && (adminAllFeeds || realm !== \"none\")", "realm: adminAllFeeds ? null", "Bitte zuerst einen Fachfeed oder ALLE FEEDS · ADMIN auswählen.", "ALLE FEEDS · ADMIN", "AN GEWÄHLTEN FEED SENDEN"]) expect(page).toContain(token);
  });

  it("keeps every hook before the unauthenticated early return", () => {
    const page = read("client/src/pages/Community.tsx");
    const community = page.slice(page.indexOf("export default function Community()"));
    const authGuard = community.indexOf('if (!auth.isAuthenticated)');
    const composerEffect = community.indexOf('useEffect(() => {');
    expect(authGuard).toBeGreaterThan(-1);
    expect(composerEffect).toBeGreaterThan(-1);
    expect(composerEffect).toBeLessThan(authGuard);
  });

  it("exposes Community as a sixth direct destination on web and native", () => {
    const shell = read("client/src/components/AppShell.tsx");
    const css = read("client/src/index.css");
    const native = read("mobile-natur/App.tsx");
    expect(shell).toContain('{ href: "/community", label: "Community", icon: UsersRound }');
    expect(css).toContain("grid-template-columns: repeat(6, minmax(0, 1fr))");
    expect(native).toContain('id: "community"');
    expect(native).toContain('screen: "community"');
    expect(native).toContain('label: "Community"');
  });

  it("keeps equivalent native realm filters and truthful empty states", () => {
    const native = read("mobile-natur/App.tsx");
    for (const token of ["realmFilter", "communityFeedSelector", "communityFeedFilterRow", "FEED / BEREICH_LEER", "KEINE BEITRÄGE IN DIESEM BEREICH"]) expect(native).toContain(token);
  });

  it("opens author profiles from posts and keeps follow/block actions on profiles", () => {
    const web = read("client/src/pages/Community.tsx");
    const detail = read("client/src/pages/CommunityPostDetail.tsx");
    const native = read("mobile-natur/App.tsx");
    expect(web).toContain('className="post-author-profile"');
    expect(web).toContain('href={`/member/${post.author.id}`}');
    expect(detail).not.toContain("FOLGST DU");
    expect(detail).not.toContain("Konto blockieren");
    expect(native).toContain("onOpenProfile");
    expect(native).toContain("toggleBlock");
    expect(native).not.toContain("Konto blockieren");
  });
});
