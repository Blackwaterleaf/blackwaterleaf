import { describe, expect, it } from "vitest";
import { getLocalAuthEmailConfig } from "./localAuthConfig";

describe("local authentication email configuration", () => {
  it("fails closed until all mail delivery values are present", () => {
    expect(getLocalAuthEmailConfig({})).toBeNull();
    expect(getLocalAuthEmailConfig({ RESEND_API_KEY: "re_test", AUTH_FROM_EMAIL: "BlackWaterLeaf <info@blackwaterleaf.com>" })).toBeNull();
  });

  it("accepts an HTTPS public origin and normalized sender values", () => {
    expect(getLocalAuthEmailConfig({
      RESEND_API_KEY: "re_test",
      AUTH_FROM_EMAIL: " BlackWaterLeaf <info@blackwaterleaf.com> ",
      AUTH_REPLY_TO_EMAIL: "info@blackwaterleaf.com",
      AUTH_PUBLIC_ORIGIN: "https://www.blackwaterleaf.com/",
    })).toEqual({
      apiKey: "re_test",
      from: "BlackWaterLeaf <info@blackwaterleaf.com>",
      replyTo: "info@blackwaterleaf.com",
      publicOrigin: "https://www.blackwaterleaf.com",
    });
  });

  it("rejects non-HTTPS and path-bearing callback origins", () => {
    expect(getLocalAuthEmailConfig({ RESEND_API_KEY: "re_test", AUTH_FROM_EMAIL: "sender@example.com", AUTH_PUBLIC_ORIGIN: "http://blackwaterleaf.com" })).toBeNull();
    expect(getLocalAuthEmailConfig({ RESEND_API_KEY: "re_test", AUTH_FROM_EMAIL: "sender@example.com", AUTH_PUBLIC_ORIGIN: "https://blackwaterleaf.com/reset" })).toBeNull();
  });
});
