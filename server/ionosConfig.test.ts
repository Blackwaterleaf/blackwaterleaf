import { describe, expect, it } from "vitest";
import { getIonosReadiness } from "./ionosGateway";

describe("IONOS configuration gate", () => {
  it("never reports ready when required server values are absent", () => {
    const readiness = getIonosReadiness();
    if (!process.env.IONOS_API_TOKEN || !process.env.IONOS_DATACENTER_ID || process.env.IONOS_ENABLED !== "true") {
      expect(readiness.configured).toBe(false);
      expect(readiness.executionServerConfigured).toBe(false);
    }
    expect(readiness).not.toHaveProperty("apiToken");
  });
});
