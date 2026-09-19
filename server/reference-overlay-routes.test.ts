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

  it("ends unknown realm and flow parameters in the 404 surface instead of redirecting", () => {
    const realm = page("Realm.tsx");
    const flows = page("FlowDestination.tsx");
    for (const source of [realm, flows]) {
      expect(source).toContain('import NotFound from "@/pages/NotFound"');
      expect(source).toContain('if (invalid');
      expect(source).toContain('return <NotFound />');
    }
    expect(realm).toContain('href: "/profile/settings#habitats"');
    expect(flows).toContain('href: "/profile/settings#habitats"');
  });

  it("uses the binding five-target mobile navigation with the marketplace", () => {
    expect(shell).toContain('href: "/"'); expect(shell).toContain('href: "/explore"'); expect(shell).toContain('href: "/marketplace"'); expect(shell).toContain('href: "/community"'); expect(shell).toContain('href: "/profile"');
    expect(shell).not.toContain('href: "/assistant"');
    expect(styles).toContain('grid-template-columns: repeat(5, 1fr)');
  });

  it("provides one reusable design language for the hero, choice cards and truthful empty states", () => {
    for (const token of ['ReferenceHero', 'ReferenceActionGrid', 'ReferenceEmptyState', 'reference-tone--${tone}']) expect(overlay).toContain(token);
    for (const token of ['.reference-hero', '.reference-action-grid', '.reference-empty-state', '--reference-botany', '--reference-aquarium', '--reference-terrarium', '--reference-ai']) expect(styles).toContain(token);
    expect(overlay).toContain('reference-action--unavailable');
    expect(overlay).toContain('disabled aria-disabled="true"');
    expect(styles).toContain('.reference-action--unavailable');
  });

  it("recomposes every supplied target area to reusable reference components", () => {
    for (const file of ['Explore.tsx', 'Community.tsx', 'Profile.tsx', 'Knowledge.tsx', 'Assistant.tsx', 'Realm.tsx']) {
      const source = page(file);
      expect(source).toContain('ReferenceHero');
    }
    for (const file of ['Community.tsx', 'Knowledge.tsx', 'Assistant.tsx', 'Realm.tsx']) expect(page(file)).toContain('ReferenceEmptyState');
  });
});
