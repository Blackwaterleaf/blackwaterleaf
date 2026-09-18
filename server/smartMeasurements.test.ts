import { describe, expect, it } from "vitest";
import { smartMeasurementInputSchema, unitForSmartMetric } from "./smartMeasurements";

describe("smart measurement validation", () => {
  it("uses a canonical display unit for every supported device metric", () => {
    expect(unitForSmartMetric("temperatureC")).toBe("°C");
    expect(unitForSmartMetric("ph")).toBe("pH");
    expect(unitForSmartMetric("conductivityUs")).toBe("µS/cm");
  });

  it("accepts bounded numeric measurements and rejects unknown metrics", () => {
    expect(smartMeasurementInputSchema.safeParse({ habitatId: 1, metric: "ph", value: 6.8 }).success).toBe(true);
    expect(smartMeasurementInputSchema.safeParse({ habitatId: 1, metric: "salinity", value: 10 }).success).toBe(false);
    expect(smartMeasurementInputSchema.safeParse({ habitatId: 1, metric: "ph", value: Number.NaN }).success).toBe(false);
  });
});
