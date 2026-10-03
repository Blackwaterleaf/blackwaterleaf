import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const read = (file: string) => readFileSync(resolve(root, file), "utf8");

describe("Observatory community feed interface", () => {
  it("keeps the existing realm selection while presenting a public, moderated feed", () => {
    const page = read("client/src/pages/Community.tsx");
    const router = read("server/routers/community.ts");
    for (const token of ["ObservatoryContextHeader", "ÖFFENTLICHER FACHFEED", "community-feed-command", "community-feed-filters", "aria-pressed", "QUELLENBASIERT", "Aktive · veröffentlichte Beiträge", "publicFeed", "community-guest-banner"]) expect(page).toContain(token);
    expect(router).toContain("publicFeed: publicProcedure");
    for (const filter of ["Feed", "Botanik", "Aquaristik", "Terraristik"]) expect(page).toContain(filter);
  });

  it("shows real public community activity on the home page before login", () => {
    const home = read("client/src/pages/Home.tsx");
    const router = read("server/routers/community.ts");
    const css = read("client/src/index.css");
    for (const token of ["publicPreview", "Echte Naturmomente aus der Community", "home-feed-preview", "FEED ENTDECKEN", "MITMACHEN"]) expect(home).toContain(token);
    for (const token of ["publicProcedure", "eq(communityPosts.status, \"published\")", "displayName: author.name?.trim() || author.username?.trim()"]) expect(router).toContain(token);
    for (const token of [".home-feed-preview", ".home-feed-preview__item", "home-feed-shimmer"]) expect(css).toContain(token);
  });

  it("offers refresh and creation actions without inventing feed content", () => {
    const page = read("client/src/pages/Community.tsx");
    for (const token of ["activeFeed.refetch()", "BEITRAG ERSTELLEN", "activeFeed.isLoading", "activeFeed.isError", "FEED / EMPTY", "Keine Beiträge in diesem Bereich"]) expect(page).toContain(token);
  });

  it("keeps the catalog focused on named botanical inspiration, not private drafts", () => {
    const web = read("client/src/pages/Search.tsx");
    const native = read("mobile-natur/App.tsx");
    for (const token of ["PFLANZEN VORAB ENTDECKEN", "catalog-feature-grid", "KARTE ÖFFNEN · INFOS LESEN", "CatalogCard"]) expect(web).toContain(token);
    for (const token of ["PFLANZEN ZUM ENTDECKEN", "Anubias barteri", "exploreInspirationGrid"]) expect(native).toContain(token);
    expect(web).not.toContain("PRIVATE_DRAFT");
    expect(native).not.toContain("PRIVATE_DRAFT");
  });

  it("shows specific aquarium plants with actionable care parameters and licensed catalog images", () => {
    const web = read("client/src/pages/Search.tsx");
    const native = read("mobile-natur/App.tsx");
    for (const token of ["catalog-feature-grid", "catalogItems.slice(0, 6)", "CatalogCard"]) expect(web).toContain(token);
    for (const token of ["Vallisneria spiralis", "Rotala rotundifolia", "Ludwigia repens", "Limnophila aquatica", "Staurogyne repens", "exploreInspirationCare", "CO₂"]) expect(native).toContain(token);
    expect(native).toContain("blackwaterleaf.com/manus-storage/catalog/taxa/plant/4/");
  });

  it("explains the public community and protects participation before login", () => {
    const page = read("client/src/pages/Community.tsx");
    const css = read("client/src/index.css");
    for (const token of ["ÖFFENTLICH · OHNE ANMELDUNG", "Sieh dir echte Naturmomente an.", "Zum Hochladen, Liken und Kommentieren", "KOSTENLOS MITMACHEN", "onLike={() => void like(post.id)}"]) expect(page).toContain(token);
    expect(css).toContain("community-guest-banner");
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

  it("keeps the immersive social-feed contract in web and native", () => {
    const web = read("client/src/pages/Community.tsx");
    const css = read("client/src/index.css");
    const native = read("mobile-natur/App.tsx");
    for (const token of ["community-post--social", "hasSocialMedia", "post-metrics", "community-post-content-link"]) expect(web + css).toContain(token);
    for (const token of ["postSocialStage", "postSocialRail", "postSocialCaption", "share-social-outline", "Share.share"]) expect(native).toContain(token);
  });

  it("avoids a heavy first feed load and focus-triggered request loop", () => {
    const page = read("client/src/pages/Community.tsx");
    const css = read("client/src/index.css");
    expect(page).toContain('trpc.community.feed.useQuery({ limit: 12 }');
    for (const token of ["staleTime: 20_000", "refetchOnWindowFocus: false", "refetchOnReconnect: false"]) expect(page).toContain(token);
    for (const token of [".community-post .post-author-profile > img", "width: 38px", "width: 32px"]) expect(css).toContain(token);
  });

  it("shows accessible skeleton posts only while an existing feed refreshes", () => {
    const page = read("client/src/pages/Community.tsx");
    const css = read("client/src/index.css");
    for (const token of ["CommunityPostSkeleton", "activeFeed.isFetching", "Weitere Beiträge werden geladen", "aria-live=\"polite\""]) expect(page).toContain(token);
    for (const token of ["community-feed-skeletons", "community-post-skeleton", "community-skeleton-shimmer", "prefers-reduced-motion:reduce"]) expect(css).toContain(token);
  });
});
