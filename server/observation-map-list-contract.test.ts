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
    expect(webExplore).toContain("trpc.observations.publicFeed.useQuery");
    expect(webExplore).toContain("Keine Kartenpunkte freigegeben");
    expect(webExplore).toContain("Private Daten bleiben geschützt");
    expect(webExplore).toContain("aria-pressed");
    expect(observations).toContain("publicFeed: publicProcedure");
    expect(observations).toContain('eq(observations.visibility, "public")');
  });

  it("keeps native on the same publicFeed and truthful empty/error states", () => {
    expect(api).toContain('"observations.publicFeed"');
    expect(nativeApp).toContain("publicObservationRows");
    expect(nativeApp).toContain("Keine Kartenpunkte freigegeben");
    expect(nativeApp).toContain("Keine öffentlich zulässige Ortsangabe – es werden keine Pins simuliert.");
    expect(nativeApp).toContain('setView("map")');
    expect(nativeApp).toContain('setView("list")');
  });
});
