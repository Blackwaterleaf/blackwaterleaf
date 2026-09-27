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

  it("confirms paid checkout sessions before showing credited credits", () => {
    const stripe = readFileSync(resolve(process.cwd(), "server/stripe.ts"), "utf8");
    const billing = readFileSync(resolve(process.cwd(), "server/routers/billing.ts"), "utf8");
    const proPage = readFileSync(resolve(process.cwd(), "client/src/pages/Pro.tsx"), "utf8");
    expect(stripe).toContain("getCheckoutConfirmation");
    expect(stripe).toContain('session.payment_status === "paid"');
    expect(billing).toContain("checkoutConfirmation: protectedProcedure");
    expect(proPage).toContain("Credits gutgeschrieben");
    expect(proPage).toContain("STRIPE · ZAHLUNG BESTÄTIGT");
  });

  it("keeps Pro access server-controlled through Stripe or an explicit admin grant", () => {
    const schema = readFileSync(resolve(process.cwd(), "drizzle/schema.ts"), "utf8");
    const entitlements = readFileSync(resolve(process.cwd(), "server/entitlements.ts"), "utf8");
    const admin = readFileSync(resolve(process.cwd(), "server/routers/admin.ts"), "utf8");
    const assistant = readFileSync(resolve(process.cwd(), "server/routers/assistant.ts"), "utf8");
    const dashboard = readFileSync(resolve(process.cwd(), "client/src/pages/AdminDashboard.tsx"), "utf8");
    expect(schema).toContain('"account_entitlements"');
    expect(entitlements).toContain('user.role === "admin"');
    expect(entitlements).toContain('accountEntitlements.featureKey, "pro"');
    expect(entitlements).toContain('account.status === "active"');
    expect(admin).toContain("setAccountProAccess");
    expect(dashboard).toContain("PRO FREISCHALTEN");
    expect(assistant).toContain('user.role === "admin"');
    expect(assistant).toContain("creditsConsumed: 0");
  });

  it("offers a one-time nature-project donation without credit fulfillment", () => {
    const stripe = readFileSync(resolve(process.cwd(), "server/stripe.ts"), "utf8");
    const billing = readFileSync(resolve(process.cwd(), "server/routers/billing.ts"), "utf8");
    const support = readFileSync(resolve(process.cwd(), "client/src/pages/Support.tsx"), "utf8");
    expect(stripe).toContain('kind === "donation"');
    expect(stripe).toContain('nature_project_support');
    expect(stripe).toContain("amountCents < 100");
    expect(stripe).toContain("amountCents > 50000");
    expect(stripe).toContain("input.anonymous");
    expect(stripe).toContain("getDonationConfirmation");
    expect(billing).toContain('donationAmountEur: z.number().min(1).max(500)');
    expect(billing).toContain("anonymousDonationCheckout");
    expect(support).toContain('kind: "donation"');
    expect(support).toContain("ANONYM SPENDEN");
    expect(support).toContain("MITGLIED WERDEN");
    expect(support).toContain("VEREIN ODER ORGANISATION ANFRAGEN");
    expect(support).toContain('id="custom-donation"');
    expect(support).toContain("customAmountValid");
    expect(support).toContain("13 Sprachen vorbereitet");
  });
});
