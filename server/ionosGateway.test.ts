import { describe, expect, it } from "vitest";
import { getIonosReadiness } from "./ionosGateway";

describe("ionosGateway", () => {
  it("does not report an execution server as ready without token and datacenter", () => {
    const readiness = getIonosReadiness();
    expect(readiness.configured).toBe(false);
    expect(readiness.executionServerConfigured).toBe(false);
    expect(["IONOS_INTEGRATION_DISABLED", "IONOS_TOKEN_OR_DATACENTER_MISSING"]).toContain(readiness.reason);
  });
});
