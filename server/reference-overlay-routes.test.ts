import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const app = readFileSync(resolve(root, "client/src/App.tsx"), "utf8");
const shell = readFileSync(resolve(root, "client/src/components/AppShell.tsx"), "utf8");
const styles = readFileSync(resolve(root, "client/src/index.css"), "utf8");
function page(name: string) { return readFileSync(resolve(root, `client/src/pages/${name}`), "utf8"); }

describe("Observatory route migration", () => {
  it("registers the three reachable capture destination flows", () => {
    expect(app).toContain('path={"/flow/:flow"}');
    const flows = page("FlowDestination.tsx");
    for (const token of ["live:", "foto:", "beitrag:", "ObservatoryContextHeader", "ObservatoryActionCluster", "BEREICH ZUERST WÄHLEN", "/botanik#capture", "/aquaristik#capture"]) expect(flows).toContain(token);
  });

  it("routes legacy menu aliases to real destinations and a clear recovery route", () => {
    for (const token of ['path={"/wissen"}', 'path={"/feed"}', 'path={"/community/feed"}', 'path={"/botanik"}', 'path={"/aquaristik"}', 'path={"/terraristik"}', 'path={"/shop"}', "<Route component={NotFound} />"]) expect(app).toContain(token);
  });

  it("uses six direct portal targets including Community without contextual AI routes", () => {
    for (const token of ['href: "/explore"', 'href: "/explore#map"', 'href: "/flow/foto"', 'href: "/search"', 'href: "/community"', 'href: "/profile"', 'href="/marketplace"']) expect(shell).toContain(token);
    expect(shell).not.toContain('href: "/assistant"');
    expect(styles).toContain("repeat(6, minmax(0, 1fr))");
  });

  it("uses one reusable Observatory language and no retired overlay", () => {
    expect(existsSync(resolve(root, "client/src/components/ReferenceOverlay.tsx"))).toBe(false);
    for (const token of [".observatory-context-header", ".observatory-action-cluster", ".observatory-state-surface", ".observatory-route--aquarium", ".observatory-route--terrarium"]) expect(styles).toContain(token);
    for (const retired of ["ReferenceHero", "ReferenceActionGrid", "ReferenceEmptyState", ".reference-hero", ".reference-action-grid", "--reference-"]) expect(styles).not.toContain(retired);
  });

  it("keeps the canonical Explore surface independent and profile privacy focused", () => {
    const explore = page("Explore.tsx");
    for (const token of ["observatory-explore-page", "observatory-portal-grid", "observatory-observation-panel", "ObservatoryContextHeader"]) expect(explore).toContain(token);
    const profile = page("Profile.tsx");
    expect(profile).toContain("profile-page-only");
    expect(profile).not.toContain("<LiveSensorStrip");
  });
});
