import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const home = readFileSync(resolve(root, "client/src/pages/Home.tsx"), "utf8");
const liveSensors = readFileSync(resolve(root, "client/src/components/LiveSensorStrip.tsx"), "utf8");
const shell = readFileSync(resolve(root, "client/src/components/AppShell.tsx"), "utf8");
const leafCore = readFileSync(resolve(root, "client/src/components/LeafCore.tsx"), "utf8");
const style = readFileSync(resolve(root, "client/src/index.css"), "utf8");

describe("BlackWaterLeaf reference layout", () => {
  it("keeps the reference composition of nature imagery, realm selection and a central leaf action", () => {
    for (const token of ["home-hero", "world-rail--home", "home-capture-zone", "<LeafCore"]) {
      expect(home).toContain(token);
    }
    expect(home).not.toContain("<LiveSensorStrip");
    expect(home).not.toContain("hero-note");
    expect(home).not.toContain("Privat starten");
    for (const token of ["home-status-card", "sensor-grid", "Waves", "Droplets", "Gauge", "ThermometerSun"]) {
      expect(liveSensors).toContain(token);
    }
    expect(home.indexOf("home-hero")).toBeLessThan(home.indexOf("world-rail--home"));
  });

  it("uses individual round action icons for the supplied content choices", () => {
    for (const token of ["Camera", "MessageCircle", "Sprout", "Fish", "Box", "Bot", "radial-action-icon"]) {
      expect(leafCore).toContain(token);
    }
    for (let position = 1; position <= 7; position += 1) {
      expect(style).toContain(`.radial-action:nth-child(${position})`);
    }
  });

  it("keeps the central action wheel exactly centered without a vertical offset", () => {
    expect(style).toContain(".home-capture-zone .leaf-core { position: relative; left: auto; bottom: auto; z-index: 4; width: 110px; height: 110px; margin: 0; transform: none; }");
    expect(style.indexOf("margin: 0; transform: none;")).toBeGreaterThan(style.indexOf("margin-top: 22px"));
  });

  it("uses the supplied green light, water and individual realm color language", () => {
    for (const token of ["#c7f35b", "#28d8ff", "#e1d661", "#c36bff", ".world-aquarium", ".world-terrarium", ".world-assistant"]) {
      expect(style).toContain(token);
    }
  });

  it("keeps the four sensor states in one compact desktop strip", () => {
    expect(style).toContain(".home-status-card .sensor-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }");
  });

  it("keeps one Observatory navigation with exactly five primary destinations", () => {
    expect(shell).toContain("const portalNavigation");
    for (const label of ["Entdecken", "Karte", "Erfassen", "Katalog", "Profil"]) expect(shell).toContain(`label: "${label}"`);
    expect(shell).not.toContain('className="desktop-navigation"');
    expect(shell).not.toContain("adminBuilderNavigation");
    expect(style).toContain(".bottom-navigation { display: none !important; }");
  });

  it("uses the supplied original mark for global branding while retaining descriptive action icons", () => {
    expect(shell).toContain("blackwaterleaf-original-mark-1024_28dcd697.png");
    expect(leafCore).toContain("leaf-trigger-brand");
    expect(style).toContain(".brand-mark img");
    expect(style).toContain(".leaf-trigger-brand");
    expect(leafCore).toContain("Camera");
    expect(leafCore).toContain("Fish");
  });

  it("keeps the Habitat Builder outside the global navigation", () => {
    expect(shell).not.toContain('href: "/habitat-builder"');
    expect(shell).not.toContain('label: "tabs.builder"');
    expect(style).not.toContain(".bottom-navigation--admin { grid-template-columns:repeat(6, minmax(0, 1fr))");
  });

  it("uses a short interruptible transition for bottom-tab changes, including the Builder", () => {
    for (const token of ["handleTabNavigation", "setIsTabSwitching(true)", "setLocation(href)", "prefers-reduced-motion: reduce", "tab-transition-surface", "is-transition-target"]) {
      expect(shell).toContain(token);
    }
    for (const token of [".tab-transition-surface", ".app-frame.is-tab-switching .tab-transition-surface", ".nav-link.is-transition-target"]) {
      expect(style).toContain(token);
    }
  });

  it("preserves reduced-motion behavior for living overlays", () => {
    expect(style).toContain("@media (prefers-reduced-motion: reduce)");
    expect(style).toContain("animation-duration:1ms!important");
  });

  it("propagates aquarium, terrarium, AI and marketplace tones to the complete page surface", () => {
    for (const token of [
      ".reference-actions.reference-tone--aquarium",
      ".reference-actions.reference-tone--terrarium",
      ".reference-actions.reference-tone--ai",
      ".reference-empty-state.reference-tone--ai",
      ".reference-page--ai .assistant-workflow",
      ".reference-page--aquarium .reference-action",
      ".reference-page--terrarium .reference-action",
      ".reference-page--marketplace .primary-action",
    ]) {
      expect(style).toContain(token);
    }
  });
});
