import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const app = readFileSync(resolve(root, "client/src/App.tsx"), "utf8");
const shell = readFileSync(resolve(root, "client/src/components/AppShell.tsx"), "utf8");
const overlay = readFileSync(resolve(root, "client/src/components/ReferenceOverlay.tsx"), "utf8");
const styles = readFileSync(resolve(root, "client/src/index.css"), "utf8");

function page(name: string) { return readFileSync(resolve(root, `client/src/pages/${name}`), "utf8"); }

describe("reference-overlay routes", () => {
  it("registers the three reachable reference destination flows", () => {
    expect(app).toContain('path={"/flow/:flow"}');
    const flows = page("FlowDestination.tsx");
    for (const token of ['live:', 'foto:', 'beitrag:', 'ReferenceHero', 'ReferenceActionGrid', 'Foto auswählen oder aufnehmen']) expect(flows).toContain(token);
  });

  it("routes legacy menu names to real destinations and never renders a dead-end fallback", () => {
    for (const token of ['path={"/wissen"}', 'path={"/feed"}', 'path={"/community/feed"}', 'path={"/botanik"}', 'path={"/aquaristik"}', 'path={"/terraristik"}', 'path={"/shop"}', '<Route component={Home} />']) expect(app).toContain(token);
  });

  it("uses the binding five-target mobile navigation with the marketplace", () => {
    expect(shell).toContain('href: "/"'); expect(shell).toContain('href: "/explore"'); expect(shell).toContain('href: "/marketplace"'); expect(shell).toContain('href: "/community"'); expect(shell).toContain('href: "/profile"');
    expect(shell).not.toContain('href: "/assistant"');
    expect(styles).toContain('grid-template-columns: repeat(5, 1fr)');
  });

  it("provides one reusable design language for the hero, choice cards and truthful empty states", () => {
    for (const token of ['ReferenceHero', 'ReferenceActionGrid', 'ReferenceEmptyState', 'reference-tone--${tone}', 'reference-future-banner', 'SEID GESPANNT']) expect(overlay).toContain(token);
    for (const token of ['.reference-hero', '.reference-action-grid', '.reference-empty-state', '--reference-botany', '--reference-aquarium', '--reference-terrarium', '--reference-ai']) expect(styles).toContain(token);
  });

  it("keeps the canonical Observatory Explore surface independent from the retired overlay composition", () => {
    const explore = page('Explore.tsx');
    expect(explore).toContain('observatory-explore-page');
    expect(explore).toContain('observatory-portal-grid');
    expect(explore).toContain('observatory-observation-panel');
    expect(explore).not.toContain('ReferenceHero');
    const profile = page('Profile.tsx');
    expect(profile).toContain('profile-page-only');
    expect(profile).not.toContain('<LiveSensorStrip');
    expect(profile).not.toContain('<ReferenceHero');
    expect(styles).toContain('.observatory-explore-page');
    expect(styles).toContain('.observatory-portal-card');
    expect(styles).toContain('.observatory-feature-card');
  });
});
