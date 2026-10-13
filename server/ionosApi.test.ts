import { describe, expect, it } from "vitest";

const DEFAULT_BASE_URL = "https://api.ionos.com/cloudapi/v6";
const getBaseUrl = () => process.env.IONOS_API_BASE_URL?.startsWith("https://") ? process.env.IONOS_API_BASE_URL : DEFAULT_BASE_URL;
const hasUsableToken = (token: string | undefined) => Boolean(token && token.length > 1000 && !token.includes("<redacted>") && !token.includes("..."));
const liveIonosConfigured = () => process.env.IONOS_ENABLED === "true" || Boolean(process.env.IONOS_API_TOKEN || process.env.IONOS_DATACENTER_ID || process.env.IONOS_EXECUTION_SERVER_ID);

describe("IONOS API credential", () => {
  it("authenticates against the lightweight datacenters endpoint when configured", async () => {
    const token = process.env.IONOS_API_TOKEN;
    if (!liveIonosConfigured()) return;
    expect(hasUsableToken(token), "IONOS_API_TOKEN is missing, masked, truncated, or otherwise unusable").toBe(true);
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/datacenters`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    });
    expect(response.status, await response.text()).toBe(200);
  }, 20_000);

  it("authenticates against the selected execution server endpoint when configured", async () => {
    const token = process.env.IONOS_API_TOKEN;
    const datacenterId = process.env.IONOS_DATACENTER_ID;
    const serverId = process.env.IONOS_EXECUTION_SERVER_ID;
    if (!liveIonosConfigured()) return;
    expect(hasUsableToken(token), "IONOS_API_TOKEN is missing, masked, truncated, or otherwise unusable").toBe(true);
    expect(datacenterId, "IONOS_DATACENTER_ID is required for the selected server check").toBeTruthy();
    expect(serverId, "IONOS_EXECUTION_SERVER_ID is required for the selected server check").toBeTruthy();
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/datacenters/${datacenterId}/servers/${serverId}`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    });
    const payload = await response.json() as { id?: string; properties?: { vmState?: string } };
    expect(response.status, JSON.stringify(payload)).toBe(200);
    expect(payload.id).toBe(serverId);
    expect(payload.properties?.vmState).toBeTruthy();
  }, 20_000);
});
