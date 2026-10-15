import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const home = readFileSync(resolve(root, "client/src/pages/Home.tsx"), "utf8");
const liveSensors = readFileSync(resolve(root, "client/src/components/LiveSensorStrip.tsx"), "utf8");
const shell = readFileSync(resolve(root, "client/src/components/AppShell.tsx"), "utf8");
const style = readFileSync(resolve(root, "client/src/index.css"), "utf8");
const native = readFileSync(resolve(root, "mobile-natur/App.tsx"), "utf8");

describe("BlackWaterLeaf Observatory layout", () => {
  it("uses a compact context header and three real specialist portals", () => {
    for (const token of ["ObservatoryContextHeader", "home-portal-strip", "home-portal-row", "Botanik", "Aquaristik", "Terraristik"]) expect(home).toContain(token);
    expect(home).not.toContain("<LiveSensorStrip");
    expect(home).not.toContain("home-hero");
  });

  it("uses compact working rows and no retired reference components on Native", () => {
    for (const token of ["ObservatoryContextHeader", "ObservatoryActionCluster", "ObservatoryActionRow", "observatoryActionRowCompact"]) expect(native).toContain(token);
    for (const retired of ["ReferenceHero", "ReferenceCard", "ActionGrid"]) expect(native).not.toContain(retired);
  });

  it("keeps the supplied green, water and realm color language", () => {
    for (const token of ["--obs-lime", "--obs-aqua", "--obs-gold", ".observatory-route--aquarium", ".observatory-route--terrarium"]) expect(style).toContain(token);
  });

  it("keeps live values as a separate privacy-preserving component", () => {
    for (const token of ["home-status-card", "sensor-grid", "Waves", "Droplets", "Gauge", "ThermometerSun"]) expect(liveSensors).toContain(token);
    expect(liveSensors).toContain("navigator.geolocation.getCurrentPosition");
  });

  it("keeps one Observatory navigation with seven primary destinations including KI", () => {
    expect(shell).toContain("const portalNavigation");
    for (const label of ["Entdecken", "Karte", "Erfassen", "KI", "Katalog", "Feed", "Profil"]) expect(shell).toContain(`label: "${label}"`);
    expect(shell).not.toContain('className="desktop-navigation"');
    expect(shell).not.toContain("adminBuilderNavigation");
  });

  it("uses the supplied original mark for global branding", () => {
    expect(shell).toContain("blackwaterleaf-original-mark-1024_28dcd697.png");
    expect(style).toContain(".brand-mark img");
  });

  it("keeps the Habitat Builder outside the global navigation", () => {
    expect(shell).not.toContain('href: "/habitat-builder"');
    expect(shell).not.toContain('label: "tabs.builder"');
  });

  it("preserves reduced-motion behavior", () => {
    expect(style).toContain("@media (prefers-reduced-motion: reduce)");
  });

  it("removes the legacy overlay and its CSS surface", () => {
    expect(existsSync(resolve(root, "client/src/components/ReferenceOverlay.tsx"))).toBe(false);
    for (const retired of [".reference-page", ".reference-hero", ".reference-action-grid", "glitch-title"]) expect(style).not.toContain(retired);
  });
});
