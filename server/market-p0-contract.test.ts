import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const schema = readFileSync(resolve(root, "drizzle/schema.ts"), "utf8");
const observations = readFileSync(resolve(root, "server/routers/observations.ts"), "utf8");
const care = readFileSync(resolve(root, "server/routers/care.ts"), "utf8");
const careWeb = readFileSync(resolve(root, "client/src/pages/CareToday.tsx"), "utf8");
const careNative = readFileSync(resolve(root, "mobile-natur/App.tsx"), "utf8");

describe("market P0 contracts", () => {
  it("stores structured observation provenance and protected public coordinates", () => {
    for (const token of ["basisOfRecord", "wildStatus", "coordinateUncertaintyM", "publicLatitude", "publicLongitude", "geoprivacy", "embargoUntil"]) expect(schema).toContain(token);
    expect(schema).toContain("observations_public_geo_idx");
    for (const token of ["public_generalized_coordinates_required", "map: publicProcedure", "record.geoprivacy !== \"private\""]) expect(observations).toContain(token);
  });

  it("creates the next private care occurrence only after an explicit completion", () => {
    for (const token of ["repeatEveryDays", "recurring_task_next_occurrence", 'current[0].status === "open"', 'input.status === "done"']) expect(care).toContain(token);
    for (const token of ["Wiederholung", "repeatEveryDays", "Anlage"]) expect(careWeb).toContain(token);
    for (const token of ["repeatEveryDays", "planHabitat", "habitats={habitats}"]) expect(careNative).toContain(token);
  });
});
