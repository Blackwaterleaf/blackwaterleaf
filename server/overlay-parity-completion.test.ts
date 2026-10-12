import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const source = (relative: string) => readFileSync(resolve(root, relative), "utf8");

const app = source("client/src/App.tsx");
const profile = source("client/src/pages/Profile.tsx");
const marketplace = source("client/src/pages/Marketplace.tsx");
const detail = source("client/src/pages/MarketplaceProduct.tsx");
const notFound = source("client/src/pages/NotFound.tsx");
const styles = source("client/src/index.css");
const worlds = source("client/src/lib/worlds.ts");

describe("Observatory retirement and state parity", () => {
  it("uses an Observatory recovery route for unknown addresses", () => {
    for (const token of ["ObservatoryContextHeader", "ObservatoryStateSurface", "SEITE NICHT GEFUNDEN", "ZUR STARTSEITE", "observatory-route"]) expect(notFound).toContain(token);
    expect(app).toContain('path={"/404"} component={NotFound}');
    expect(app).toContain("<Route component={NotFound} />");
  });

  it("keeps signed-out profile access explicitly server-gated", () => {
    for (const token of ["ProfileAuthOverlay", 'data-state="server-auth-required"', "href=\"/login\"", "href=\"/register\""]) expect(profile).toContain(token);
    expect(profile).toContain("observatory-route");
    expect(profile).not.toContain("<LiveSensorStrip");
  });

  it("keeps catalogue and product states truthful without Home-only sensors", () => {
    for (const token of ["marketplace-hub__intro", "MARKET/HUB_ERROR", "MARKET/HUB_EMPTY", "ObservatoryContextHeader"]) expect(marketplace).toContain(token);
    for (const token of ["MARKET/ROUTE", "MARKET/DETAIL_LOAD", "MARKET/DETAIL_UNAVAILABLE", "StatePanel"]) expect(detail).toContain(token);
    expect(marketplace).not.toContain("LiveSensorStrip");
    expect(detail).not.toContain("LiveSensorStrip");
  });

  it("removes retired overlay files and selectors", () => {
    expect(existsSync(resolve(root, "client/src/components/ReferenceOverlay.tsx"))).toBe(false);
    for (const retired of [".reference-page", ".reference-hero", ".reference-action-grid", "glitch-title"]) expect(styles).not.toContain(retired);
    expect(styles).toContain(".marketplace-hub__intro");
  });

  it("uses versioned project storage rather than session-bound image URLs", () => {
    expect(worlds).not.toContain("files.manuscdn.com");
    for (const token of ["botany-reference_c192e480.jpg", "aquarium-reference_2e42963b.jpg", "terrarium-reference_c4e109d3.jpg", "assistant-reference_4510581b.jpg"]) expect(worlds).toContain(token);
  });
});
