import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const schema = readFileSync(resolve(root, "drizzle/schema.ts"), "utf8");
const router = readFileSync(resolve(root, "server/routers/partners.ts"), "utf8");
const marketplace = readFileSync(resolve(root, "client/src/pages/Marketplace.tsx"), "utf8");
const shop = readFileSync(resolve(root, "client/src/pages/MarketplaceShop.tsx"), "utf8");
const merchant = readFileSync(resolve(root, "client/src/pages/MerchantMarketplace.tsx"), "utf8");
const adminPage = readFileSync(resolve(root, "client/src/pages/AdminDashboard.tsx"), "utf8");
const designBook = readFileSync(resolve(root, "docs/BLACKWATERLEAF_OBSERVATORY_SCREEN_DESIGN_BOOK_2026-09-19.md"), "utf8");

describe("merchant shop and attribution contract", () => {
  it("stores additive, deduplicated partner attribution events", () => {
    expect(schema).toContain("export const partnerOfferEvents");
    expect(schema).toContain("partner_offer_events_event_id_unique");
    expect(schema).toContain('"outbound_click", "purchase_intent"');
  });

  it("records public handoffs without claiming completed sales", () => {
    expect(router).toContain("marketplaceEvent: publicProcedure");
    expect(router).toContain("partnerOfferEvents");
    expect(router).toContain("merchantSalesSummary: merchantProcedure");
    expect(router).toContain("confirmed sales");
  });

  it("exposes an admin-only approval queue with separate publication gates", () => {
    expect(router).toContain("approvalQueue: adminProcedure");
    expect(router).toContain("readyForPublicPublication");
    expect(router).toContain("productCounts");
    expect(adminPage).toContain("Händler-Warteschlange");
    expect(adminPage).toContain("Händlerfreigaben");
  });

  it("renders a separate shop area for every approved partner", () => {
    expect(marketplace).toContain("marketplace-hub__shop-grid");
    expect(marketplace).toContain("SHOP ÖFFNEN");
    expect(shop).toContain("KAUFINTERESSE MERKEN");
    expect(marketplace).toContain("shops.map");
  });

  it("gives merchants scoped profile, product and attribution controls", () => {
    expect(merchant).toContain("merchantUpdateProfile");
    expect(merchant).toContain("merchantUpdateProduct");
    expect(merchant).toContain("merchantSalesSummary");
    expect(merchant).toContain("Bestätigte Verkäufe");
  });

  it("keeps the design contract current", () => {
    expect(designBook).toContain("getrennte Händler-Shops");
    expect(designBook).toContain("keine bestätigten Verkäufe behaupten");
    expect(designBook).toContain("bestätigte Verkäufe");
  });
});
