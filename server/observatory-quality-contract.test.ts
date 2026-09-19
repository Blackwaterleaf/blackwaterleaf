import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const webCss = readFileSync(resolve(root, "client/src/index.css"), "utf8");
const native = readFileSync(resolve(root, "mobile-natur/App.tsx"), "utf8");

describe("AP-19 Observatory quality contract", () => {
  it("keeps one canonical palette and compact hero bounds", () => {
    for (const token of ["--portal-bg", "--portal-surface", "--portal-lime", "--portal-aqua", "--portal-gold", "--portal-hero-desktop", "--portal-hero-mobile"]) expect(webCss).toContain(token);
    expect(webCss).toContain("min-height: var(--portal-hero-desktop)");
    expect(webCss).toContain("min-height: var(--portal-hero-mobile)");
    expect(webCss).toContain(".world-assistant .world-image { filter: none; }");
  });

  it("exposes visible focus and reduced-motion behavior", () => {
    expect(webCss).toContain(":focus-visible");
    expect(webCss).toContain("prefers-reduced-motion: reduce");
    expect(webCss).toContain("min-width: var(--portal-hit)");
  });

  it("keeps Native core controls touchable and compact", () => {
    expect(native).toContain("width: 40,");
    expect(native).toContain("height: 40,");
    expect(native).toContain("hitSlop={4}");
    expect(native).toContain("homeHero: { minHeight: 250 }");
    expect(native).toContain("minHeight: 48,");
  });
});
