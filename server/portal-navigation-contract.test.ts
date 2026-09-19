import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const read = (file: string) => readFileSync(resolve(root, file), "utf8");

describe("AP-13 Observatory primary navigation", () => {
  it("defines only the five current Web portal destinations", () => {
    const shell = read("client/src/components/AppShell.tsx");
    for (const label of ["Entdecken", "Karte", "Erfassen", "Katalog", "Profil"]) expect(shell).toContain(`label: "${label}"`);
    expect(shell).toContain('const bottomNavigation = portalNavigation');
    expect(shell).not.toContain("desktop-navigation");
    expect(shell).not.toContain("adminBuilderNavigation");
  });

  it("defines the same five Native destinations and leaves Builder out of the global tabs", () => {
    const app = read("mobile-natur/App.tsx");
    for (const label of ["Entdecken", "Karte", "Erfassen", "Katalog", "Profil"]) expect(app).toContain(`label: "${label}"`);
    expect(app).toContain('screen: "photo"');
    expect(app).toContain('screen: "search"');
    expect(app).not.toContain("showBuilder={account?.role === \"admin\"}");
  });

  it("keeps Marketplace, Community and Builder as contextual routes", () => {
    const shell = read("client/src/components/AppShell.tsx");
    const app = read("client/src/App.tsx");
    expect(shell).toContain('href="/marketplace"');
    expect(app).toContain('path={"/community"}');
    expect(app).toContain('path={"/habitat-builder"}');
  });
});
