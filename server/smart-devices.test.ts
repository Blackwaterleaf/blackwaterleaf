import { describe, expect, it } from "vitest";
import { smartDeviceConnectionSchema, smartDeviceSelectionInputSchema } from "../shared/blackwaterleaf-contract-v1";

describe("private smart device selection contract", () => {
  it("accepts a selection without requesting provider credentials", () => {
    const selection = smartDeviceSelectionInputSchema.parse({
      provider: "water_monitor",
      habitatId: 42,
      modelLabel: "pH Monitor X",
      requestedMetrics: ["temperatureC", "ph", "conductivityUs"],
    });
    expect(selection.provider).toBe("water_monitor");
    expect(selection.requestedMetrics).toEqual(["temperatureC", "ph", "conductivityUs"]);
    expect(Object.keys(selection)).not.toContain("apiKey");
    expect(Object.keys(selection)).not.toContain("password");
  });

  it("rejects an empty or duplicate requested metric selection", () => {
    const base = { provider: "home_assistant", habitatId: null, modelLabel: null };
    expect(() => smartDeviceSelectionInputSchema.parse({ ...base, requestedMetrics: [] })).toThrow();
    expect(() => smartDeviceSelectionInputSchema.parse({ ...base, requestedMetrics: ["ph", "ph"] })).toThrow();
  });

  it("preserves transparent pending connection status", () => {
    expect(smartDeviceConnectionSchema.parse({
      id: "7", provider: "zigbee_matter", habitatId: null, modelLabel: null,
      requestedMetrics: ["temperatureC"], status: "awaiting_authorization",
      createdAt: "2026-09-16T14:00:00.000Z", updatedAt: "2026-09-16T14:00:00.000Z",
    }).status).toBe("awaiting_authorization");
  });
});
