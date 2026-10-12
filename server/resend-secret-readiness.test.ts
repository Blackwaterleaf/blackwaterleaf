import { describe, expect, it } from "vitest";

describe("Resend secret readiness", () => {
  it("reaches the Resend API without sending an email", async () => {
    const apiKey = process.env.RESEND_API_KEY;
    expect(apiKey, "RESEND_API_KEY must be configured server-side").toMatch(/^re_/);
    const response = await fetch("https://api.resend.com/api-keys", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const body = (await response.json()) as { name?: string };
    // Sending-access keys are intentionally not allowed to enumerate keys;
    // Resend returns this explicit restricted_api_key response for a valid key.
    expect(
      response.status === 200 ||
        (response.status === 401 && body.name === "restricted_api_key"),
    ).toBe(true);
  }, 20_000);
});
