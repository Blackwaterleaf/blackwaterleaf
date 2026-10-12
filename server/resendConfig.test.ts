import { describe, expect, it } from "vitest";
import { getResendStatus } from "./resendGateway";

describe("Resend configuration", () => {
  it("reports configuration without exposing secret values", () => {
    const status = getResendStatus();
    expect(status.provider).toBe("resend");
    expect(status).not.toHaveProperty("apiKey");
    expect(status).not.toHaveProperty("token");
    expect(typeof status.configured).toBe("boolean");
  });
});
