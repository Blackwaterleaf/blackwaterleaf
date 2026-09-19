import { describe, expect, it } from "vitest";
import { getKimiProviderStatus, invokeKimi } from "./kimiGateway";

describe("Kimi provider gate", () => {
  it("is disabled unless both feature flag and server secret are configured", async () => {
    const status = getKimiProviderStatus();
    expect(status.configured).toBe(false);
    expect(status.enabled).toBe(false);
    await expect(invokeKimi({ messages: [{ role: "user", content: "test" }] })).rejects.toThrow("KIMI_PROVIDER_NOT_CONFIGURED");
  });
});
