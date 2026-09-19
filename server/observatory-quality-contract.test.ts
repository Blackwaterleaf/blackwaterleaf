import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const webCss = readFileSync(resolve(root, "client/src/index.css"), "utf8");
const native = readFileSync(resolve(root, "mobile-natur/App.tsx"), "utf8");

describe("AP-19 Observatory quality contract", () => {
  it("keeps one canonical palette and compact context headers", () => {
    for (const token of ["--portal-bg", "--portal-surface", "--portal-lime", "--portal-aqua", "--portal-gold", ".observatory-context-header", "min-height: 150px"]) expect(webCss).toContain(token);
    expect(webCss).toContain(".world-assistant .world-image { filter: none; }");
  });

  it("exposes visible focus and reduced-motion behavior", () => {
    for (const token of [":focus-visible", "prefers-reduced-motion: reduce", "min-width: var(--portal-hit)"]) expect(webCss).toContain(token);
  });

  it("keeps Native core controls touchable and the new header compact", () => {
    for (const token of ["width: 40,", "height: 40,", "hitSlop={4}", "homeContextHeader: { minHeight: 168 }", "minHeight: 48,"]) expect(native).toContain(token);
  });
});
