import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const webExplore = readFileSync(resolve(root, "client/src/pages/Explore.tsx"), "utf8");
const nativeApp = readFileSync(resolve(root, "mobile-natur/App.tsx"), "utf8");
const observations = readFileSync(resolve(root, "server/routers/observations.ts"), "utf8");
const api = readFileSync(resolve(root, "mobile-natur/src/api.ts"), "utf8");

describe("AP-14 observation map/list contract", () => {
  it("uses the published observation feed rather than simulated catalog pins", () => {
    for (const token of ["trpc.observations.publicFeed.useQuery", "MapView", "Noch keine öffentlichen Kartenpunkte", "Private Daten bleiben geschützt", "aria-pressed"]) expect(webExplore).toContain(token);
    expect(observations).toContain("publicFeed: publicProcedure");
    expect(observations).toContain('eq(observations.visibility, "public")');
  });

  it("renders a real interactive map basis with an explicit retry state", () => {
    const map = readFileSync(resolve(root, "client/src/components/Map.tsx"), "utf8");
    for (const token of ["onMapError", "Kartenbasis konnte nicht geladen werden", "mapScriptPromise", "fullscreenControl: true"]) expect(map).toContain(token);
    expect(webExplore).toContain("KARTE ERNEUT LADEN");
  });

  it("keeps native on the same public feed and truthful empty/error states", () => {
    expect(api).toContain('"observations.publicFeed"');
    for (const token of ["publicObservationRows", "Keine Kartenpunkte freigegeben", "keine ausdrücklich zulässigen generalisierten Ortsdaten", 'setView("map")', 'setView("list")']) expect(nativeApp).toContain(token);
    expect(nativeApp).not.toContain("es werden keine Pins simuliert");
  });
});
