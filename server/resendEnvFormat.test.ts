import { describe, expect, it } from "vitest";

describe("Resend environment format", () => {
  it("accepts the Studio sender and HTTPS public URL format", () => {
    const from = "noreply@blackwaterleaf-studio.com";
    const publicUrl = "https://blackwaterleaf-studio.com";
    expect(from).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
    expect(new URL(publicUrl).protocol).toBe("https:");
    expect(new URL(publicUrl).hostname).toBe("blackwaterleaf-studio.com");
  });
});
