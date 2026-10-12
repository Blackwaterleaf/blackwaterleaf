import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const read = (file: string) => readFileSync(resolve(root, file), "utf8");

describe("AP-13 Observatory primary navigation", () => {
  it("defines six current Web portal destinations including Community", () => {
    const shell = read("client/src/components/AppShell.tsx");
    for (const label of ["Entdecken", "Karte", "Erfassen", "Katalog", "Community", "Profil"]) expect(shell).toContain(`label: "${label}"`);
    expect(shell).toContain("const bottomNavigation = portalNavigation");
    expect(shell).not.toContain("desktop-navigation");
    expect(shell).not.toContain("adminBuilderNavigation");
  });

  it("defines the current Native destinations and leaves Builder out of global tabs", () => {
    const app = read("mobile-natur/App.tsx");
    for (const label of ["Home", "Entdecken", "Community", "Profil"]) expect(app).toContain(`label: "${label}"`);
    expect(app).not.toContain('screen: "builder"');
    expect(app).not.toContain("HABITAT BUILDER");
  });

  it("keeps Marketplace contextual while Community is a direct route", () => {
    const shell = read("client/src/components/AppShell.tsx");
    const app = read("client/src/App.tsx");
    expect(shell).toContain('href="/marketplace"');
    expect(shell).toContain('href: "/community"');
    expect(app).toContain('path={"/community"}');
    expect(app).not.toContain('path={"/habitat-builder"}');
  });

  it("groups profile-menu destinations instead of presenting a flat settings list", () => {
    const shell = read("client/src/components/AppShell.tsx");
    for (const label of ["PROFIL · MENÜ", "Profil öffnen", "Verwalten · alle Einstellungen", "Postfach", "Marketplace", "Heute · Pflegeaufgaben"]) {
      expect(shell).toContain(label);
    }
    expect(shell).toContain("aria-expanded={profileMenuOpen}");
    expect(shell).toContain("setProfileMenuOpen(false)");
    expect(shell).not.toContain("<details className=\"profile-header-menu\">");
  });
});
