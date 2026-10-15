import { describe, expect, it } from "vitest";
import { getRunwayModel, getRunwayStatus } from "./runwayGateway";

describe("Runway gateway", () => {
  it("fails closed without an API key", () => {
    const status = getRunwayStatus();
    if (process.env.RUNWAY_ENABLED === "false") {
      expect(status.configured).toBe(false);
      expect(status.reason).toBe("provider_disabled");
      return;
    }
    if (!process.env.RUNWAY_API_KEY) {
      expect(status.configured).toBe(false);
      expect(status.reason).toBe("missing_runway_configuration");
    }
  });

  it("routes quality tiers to supported Runway models", () => {
    expect(getRunwayModel("draft")).toBe("gen4_turbo");
    expect(getRunwayModel("standard")).toBe("gen4.5");
    expect(getRunwayModel("high")).toBe("gen4.5");
  });
});
