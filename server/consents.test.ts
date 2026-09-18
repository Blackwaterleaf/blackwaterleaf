import { describe, expect, it } from "vitest";
import { consentPurposeSchema } from "../shared/blackwaterleaf-contract-v1";

describe("current consent contract", () => {
  it("accepts only explicit supported consent purposes", () => {
    expect(consentPurposeSchema.safeParse("ai_processing").success).toBe(true);
    expect(consentPurposeSchema.safeParse("unknown_purpose").success).toBe(false);
  });

  it("keeps the current-state table as the authorization source", async () => {
    const source = await import("node:fs").then(({ readFileSync }) => readFileSync(new URL("./consents.ts", import.meta.url), "utf8"));
    expect(source).toContain("userConsentCurrent");
    expect(source).toContain("userConsentEvents");
    expect(source).toContain("recordCurrentConsent");
  });
});
