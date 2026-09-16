import { describe, expect, it } from "vitest";
import { createBuilderPlacement, dimensionsFromHabitat, grossVolumeLiters, hasCompleteDimensions, isPlacementTypeForHabitat, MAX_BUILDER_PLACEMENTS, normalizeBuilderPlacement, parseDimension } from "../client/src/lib/habitatBuilder";

describe("Habitat Builder calculations", () => {
  it("uses only finite positive private dimensions", () => {
    expect(dimensionsFromHabitat({ lengthCm: 120, widthCm: 50, heightCm: 50 })).toEqual({ lengthCm: 120, widthCm: 50, heightCm: 50 });
    expect(dimensionsFromHabitat({ lengthCm: -1, widthCm: "50", heightCm: null })).toEqual({ lengthCm: null, widthCm: null, heightCm: null });
  });

  it("calculates a gross aquarium volume only for complete dimensions", () => {
    expect(grossVolumeLiters({ lengthCm: 120, widthCm: 50, heightCm: 50 })).toBe(300);
    expect(grossVolumeLiters({ lengthCm: 120, widthCm: null, heightCm: 50 })).toBeNull();
    expect(hasCompleteDimensions({ lengthCm: 120, widthCm: 50, heightCm: 50 })).toBe(true);
    expect(hasCompleteDimensions({ lengthCm: 120, widthCm: null, heightCm: 50 })).toBe(false);
  });

  it("accepts bounded positive decimal entries and rejects ambiguous values", () => {
    expect(parseDimension("60,5")).toBe(60.5);
    expect(parseDimension("0")).toBeNull();
    expect(parseDimension("-50")).toBeNull();
    expect(parseDimension("50cm")).toBeNull();
    expect(parseDimension("10001")).toBeNull();
  });

  it("creates bounded abstract placement markers without pretending they are catalog assets", () => {
    expect(createBuilderPlacement("marker-1", "hardscape", 120, -150)).toMatchObject({ id: "marker-1", type: "hardscape", xPct: 92, zPct: -92, rotationDeg: 0, scale: 1 });
    expect(normalizeBuilderPlacement({ id: "marker-2", type: "plants", xPct: -99, zPct: 99, rotationDeg: 300, scale: 3 })).toMatchObject({ xPct: -92, zPct: 92, rotationDeg: 180, scale: 1.8 });
    expect(isPlacementTypeForHabitat("filter", "aquarium")).toBe(true);
    expect(isPlacementTypeForHabitat("filter", "terrarium")).toBe(false);
    expect(MAX_BUILDER_PLACEMENTS).toBe(24);
  });
});
