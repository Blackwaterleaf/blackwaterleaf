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
  it("keeps the reference composition of sensor strip, nature imagery, realm selection and a central leaf action", () => {
    for (const token of ["LiveSensorStrip", "home-hero", "world-rail--home", "home-capture-zone", "<LeafCore"]) {
      expect(home).toContain(token);
    }
    for (const token of ["home-status-card", "sensor-grid", "Waves", "Droplets", "Gauge", "ThermometerSun"]) {
      expect(liveSensors).toContain(token);
    }
    expect(home.indexOf("<LiveSensorStrip")).toBeLessThan(home.indexOf("home-hero"));
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

  it("uses the supplied green light, water and individual realm color language", () => {
    for (const token of ["#b0fb78", "#40d9ff", "#e0c75f", "#bf8fff", ".world-aquarium", ".world-terrarium", ".world-assistant"]) {
      expect(style).toContain(token);
    }
  });

  it("keeps the four sensor states in one compact desktop strip", () => {
    expect(style).toContain(".home-status-card .sensor-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }");
  });

  it("keeps desktop navigation clear while retaining the mobile icon bar", () => {
    expect(shell).toContain('className="desktop-navigation"');
    expect(shell).toContain('className="bottom-navigation"');
    expect(style).toContain(".desktop-navigation { display:flex; }");
    expect(style).toContain(".bottom-navigation { display:none; }");
  });

  it("preserves reduced-motion behavior for living overlays", () => {
    expect(style).toContain("@media (prefers-reduced-motion: reduce)");
    expect(style).toContain("animation-duration:1ms!important");
  });
});
