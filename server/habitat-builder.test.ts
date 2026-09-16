import { describe, expect, it } from "vitest";
import { dimensionsFromHabitat, grossVolumeLiters, hasCompleteDimensions, parseDimension } from "../client/src/lib/habitatBuilder";

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
});
