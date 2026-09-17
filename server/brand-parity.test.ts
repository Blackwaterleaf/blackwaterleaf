import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getBlackWaterLeafSeason } from "../client/src/lib/season";

const root = resolve(import.meta.dirname, "..");
const css = readFileSync(resolve(root, "client/src/index.css"), "utf8");
const webShell = readFileSync(resolve(root, "client/src/components/AppShell.tsx"), "utf8");
const marketplace = readFileSync(resolve(root, "client/src/pages/Marketplace.tsx"), "utf8");
const native = readFileSync(resolve(root, "mobile-natur/App.tsx"), "utf8");
const rulebook = readFileSync(resolve(root, "docs/DESIGN_RULEBOOK_V2_REFERENCE_OVERLAY.md"), "utf8");

describe("cross-platform BlackWaterLeaf brand parity", () => {
  it("maps calendar seasons without using weather data", () => {
    expect(getBlackWaterLeafSeason(new Date("2026-03-01T12:00:00Z"))).toBe("spring");
    expect(getBlackWaterLeafSeason(new Date("2026-07-01T12:00:00Z"))).toBe("summer");
    expect(getBlackWaterLeafSeason(new Date("2026-10-01T12:00:00Z"))).toBe("autumn");
    expect(getBlackWaterLeafSeason(new Date("2026-12-01T12:00:00Z"))).toBe("winter");
  });

  it("keeps the original mark and seasonal shell on the web", () => {
    expect(webShell).toContain("getBlackWaterLeafSeason");
    expect(webShell).toContain('data-season={season}');
    for (const token of ["season-spring", "season-summer", "season-autumn", "season-winter"]) expect(css).toContain(token);
    expect(css).toContain("--reference-marketplace: #d9ad69");
  });

  it("uses the dedicated marketplace tone on web and native", () => {
    expect(marketplace).toContain('reference-page--marketplace');
    expect(marketplace).toContain('tone="marketplace"');
    expect(native).toContain('market: "#D9AD69"');
    expect(native).toContain('screen: "marketplace"');
    expect(native).toContain('label: "Marktplatz"');
    expect(native).toContain('color: c.market');
  });

  it("records the confirmed visual contract in the binding rulebook", () => {
    expect(rulebook).toContain("Originalmarke");
    expect(rulebook).toContain("Amber/Champagner");
    expect(rulebook).toContain("saisonale Waldlogik");
    expect(rulebook).toContain("keine erfundenen Wetter-, Sensor- oder Standortdaten");
  });
});
