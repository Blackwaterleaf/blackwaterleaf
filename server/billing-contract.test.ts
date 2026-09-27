import { describe, expect, it } from "vitest";
import { AI_CREDIT_PACKS, DEFAULT_FREE_DAILY_IDENTIFICATIONS, FREE_FEATURES, PRO_FEATURES, PRO_MONTHLY_PRICE_EUR, PRO_YEARLY_PRICE_EUR } from "@shared/monetization";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Free / Pro monetization contract", () => {
  it("keeps the approved price points and core Pro value", () => {
    expect(PRO_MONTHLY_PRICE_EUR).toBe(4.99);
    expect(PRO_YEARLY_PRICE_EUR).toBe(39.99);
    expect(DEFAULT_FREE_DAILY_IDENTIFICATIONS).toBe(2);
    expect(AI_CREDIT_PACKS.map(pack => pack.credits)).toEqual([10, 50, 120]);
    for (const key of ["unlimited_habitats", "care_history", "advanced_charts", "ai_allowance", "secure_export"]) {
      expect(PRO_FEATURES.some(feature => feature.key === key)).toBe(true);
    }
  });

  it("keeps discovery and community free", () => {
    expect(FREE_FEATURES.join(" ")).toMatch(/Katalog|Community|Karte/);
    const proPage = readFileSync(resolve(process.cwd(), "client/src/pages/Pro.tsx"), "utf8");
    expect(proPage).toContain("COMMUNITY BLEIBT KOSTENLOS");
    expect(proPage).toContain("CREDITS KAUFEN");
    expect(proPage).toContain("billing.createCheckout");
  });

  it("disables Managed Payments for inline credit-product data", () => {
    const stripe = readFileSync(resolve(process.cwd(), "server/stripe.ts"), "utf8");
    expect(stripe).toContain('params.set("managed_payments[enabled]", "false")');
  });

  it("exposes a private purchase history for completed credit purchases", () => {
    const billing = readFileSync(resolve(process.cwd(), "server/routers/billing.ts"), "utf8");
    const proPage = readFileSync(resolve(process.cwd(), "client/src/pages/Pro.tsx"), "utf8");
    expect(billing).toContain("history: protectedProcedure");
    expect(billing).toContain("aiCreditPurchases");
    expect(proPage).toContain("trpc.billing.history.useQuery");
    expect(proPage).toContain("DEINE CREDIT-KÄUFE");
  });
});
