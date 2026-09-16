import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const source = (relative: string) => readFileSync(resolve(root, relative), "utf8");

const app = source("client/src/App.tsx");
const profile = source("client/src/pages/Profile.tsx");
const marketplace = source("client/src/pages/Marketplace.tsx");
const detail = source("client/src/pages/MarketplaceProduct.tsx");
const notFound = source("client/src/pages/NotFound.tsx");
const overlay = source("client/src/components/ReferenceOverlay.tsx");
const styles = source("client/src/index.css");
const worlds = source("client/src/lib/worlds.ts");

describe("remaining reference-overlay parity", () => {
  it("replaces the generic 404 page with a dark botanical recovery route", () => {
    for (const token of ["LiveSensorStrip", "ReferenceHero", "ReferenceEmptyState", "ROUTE / 404", "SEITE NICHT GEFUNDEN", "ZUR STARTSEITE", "reference-page--botany"]) {
      expect(notFound).toContain(token);
    }
    for (const prohibited of ["bg-gradient-to-br", "text-red-500", "Page Not Found", "Go Home", "animate-pulse"]) expect(notFound).not.toContain(prohibited);
  });

  it("makes signed-out profile access an explicit server-gated auth overlay", () => {
    for (const token of ["ProfileAuthOverlay", "data-state=\"server-auth-required\"", "[AUTH / REQUIRED]", "href=\"/login\"", "href=\"/register\""]) {
      expect(profile).toContain(token);
    }
    expect(profile).not.toContain("ReferenceEmptyState");
  });

  it("uses an honest sensor rail and aqua hero for catalogue and every product state", () => {
    for (const token of ["LiveSensorStrip compact", "marketplace-entry", "MARKET/ERROR", "MARKET/EMPTY"]) expect(marketplace).toContain(token);
    for (const token of ["LiveSensorStrip compact", "MARKET/ROUTE", "MARKET/DETAIL_LOAD", "MARKET/DETAIL_UNAVAILABLE", "ReferenceHero", "StatePanel"]) expect(detail).toContain(token);
  });

  it("keeps recovery navigation and reference error semantics accessible", () => {
    expect(app).toContain('<Route component={NotFound} />');
    expect(overlay).toContain('state?: "empty" | "error"');
    expect(overlay).toContain('reference-empty-state--${state}');
    expect(styles).toContain(".profile-auth-overlay");
    expect(styles).toContain(".reference-not-found");
    expect(styles).toContain(".marketplace-entry");
  });

  it("uses versioned project storage rather than session-bound image URLs", () => {
    expect(worlds).not.toContain("files.manuscdn.com");
    for (const token of ["botany-reference_c192e480.jpg", "aquarium-reference_2e42963b.jpg", "terrarium-reference_c4e109d3.jpg", "assistant-reference_4510581b.jpg"]) expect(worlds).toContain(token);
  });
});
