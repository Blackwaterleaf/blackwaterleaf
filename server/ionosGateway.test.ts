import { describe, expect, it } from "vitest";
import { getIonosReadiness, runIonosPreflight } from "./ionosGateway";

const getConfiguredToken = () => process.env.IONOS_API_TOKEN_CANDIDATE ?? process.env.IONOS_API_TOKEN;
const hasUsableToken = (token: string | undefined) => Boolean(token && token.length > 1000 && !token.includes("<redacted>") && !token.includes("..."));
const hasConfiguredIonos = () => hasUsableToken(getConfiguredToken()) && Boolean(process.env.IONOS_DATACENTER_ID && process.env.IONOS_EXECUTION_SERVER_ID && process.env.IONOS_ENABLED === "true");

describe("ionosGateway", () => {
  it("does not report an execution server as ready without usable credentials", () => {
    const readiness = getIonosReadiness();
    if (hasConfiguredIonos()) {
      expect(readiness.configured).toBe(true);
      expect(readiness.executionServerConfigured).toBe(true);
      expect(readiness.reason).toBe("READY_FOR_PREFLIGHT");
    } else {
      expect(readiness.configured).toBe(false);
      expect(readiness.executionServerConfigured).toBe(false);
      expect(["IONOS_INTEGRATION_DISABLED", "IONOS_TOKEN_OR_DATACENTER_MISSING"]).toContain(readiness.reason);
    }
  });

  it("confirms the selected execution server when IONOS is configured", async () => {
    if (!hasConfiguredIonos()) return;
    const result = await runIonosPreflight();
    expect(result.ok, result.reason).toBe(true);
    expect(result.server?.id).toBe(process.env.IONOS_EXECUTION_SERVER_ID);
    expect(result.server?.vmState).toBeTruthy();
  }, 20_000);
});
