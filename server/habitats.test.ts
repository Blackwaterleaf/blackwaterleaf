import { describe, expect, it } from "vitest";
import { summarizeHabitat } from "../client/src/components/HabitatProfiles";
import { habitatText } from "../client/src/i18n";
import {
  aquariumDetailsSchema,
  plantDetailsSchema,
  privateHabitatInputSchema,
  terrariumDetailsSchema,
} from "../shared/blackwaterleaf-contract-v1";

describe("private habitat profile contracts", () => {
  it("accepts a structured private aquarium with water values and equipment", () => {
    const parsed = privateHabitatInputSchema.parse({
      kind: "aquarium",
      name: "Schwarzwasser 180",
      details: {
        volumeLiters: 180,
        lengthCm: 100,
        widthCm: 40,
        heightCm: 45,
        occupants: "10 Salmler, 6 Panzerwelse",
        plants: "Cryptocoryne, Javafarn",
        temperatureC: 25,
        ph: 6.2,
        gh: 5,
        kh: 2,
        nitriteMgL: 0,
        nitrateMgL: 10,
        conductivityUs: 180,
        equipment: "Außenfilter, Heizer, LED",
        notes: null,
      },
    });
    expect(parsed.kind).toBe("aquarium");
    expect(aquariumDetailsSchema.parse(parsed.details).nitriteMgL).toBe(0);
  });

  it("supports compact, structured plant and terrarium records", () => {
    expect(plantDetailsSchema.parse({
      scientificName: "Anubias barteri",
      quantity: 2,
      location: "Fenster Ost",
      substrate: "Mineralisches Substrat",
      potSizeCm: 12,
      light: "hell, indirekt",
      watering: "erst nach Antrocknen",
      humidityPercent: 55,
      temperatureC: 22,
      fertilizer: "alle zwei Wochen",
      notes: null,
    }).quantity).toBe(2);

    expect(terrariumDetailsSchema.parse({
      volumeLiters: 90,
      lengthCm: 60,
      widthCm: 45,
      heightCm: 45,
      occupants: "1.0 Dendrobates",
      plants: "Bromelien, Moos",
      dayTemperatureC: 24,
      nightTemperatureC: 20,
      humidityPercent: 80,
      substrate: "Drainage, Laub, Humus",
      equipment: "Beregnung, LED, Thermostat",
      notes: null,
    }).humidityPercent).toBe(80);
  });

  it("rejects unsafe or implausible profile values", () => {
    expect(() => aquariumDetailsSchema.parse({
      volumeLiters: 0,
      lengthCm: null,
      widthCm: null,
      heightCm: null,
      occupants: null,
      plants: null,
      temperatureC: null,
      ph: 15,
      gh: null,
      kh: null,
      nitriteMgL: null,
      nitrateMgL: null,
      conductivityUs: null,
      equipment: null,
      notes: null,
    })).toThrow();
  });

  it("preserves contractually valid zero values in the private UI summary", () => {
    expect(summarizeHabitat({ kind: "aquarium", details: { volumeLiters: 240, temperatureC: 0, ph: 0 } }, habitatText("de"))).toBe("240 L · 0 °C · pH 0");
    expect(summarizeHabitat({ kind: "terrarium", details: { humidityPercent: 0, dayTemperatureC: 0 } }, habitatText("de"))).toBe("0 % LF · 0 °C");
  });
});
