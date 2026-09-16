import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const app = readFileSync(resolve(root, "client/src/App.tsx"), "utf8");
const marketplace = readFileSync(resolve(root, "client/src/pages/Marketplace.tsx"), "utf8");
const detail = readFileSync(resolve(root, "client/src/pages/MarketplaceProduct.tsx"), "utf8");
const router = readFileSync(resolve(root, "server/routers/partners.ts"), "utf8");
const styles = readFileSync(resolve(root, "client/src/index.css"), "utf8");

describe("marketplace UI truth contract", () => {
  it("provides a catalogue and a real product route", () => {
    expect(app).toContain('path={"/marketplace"} component={Marketplace}');
    expect(app).toContain('path={"/marketplace/product/:id"} component={MarketplaceProduct}');
    expect(marketplace).toContain("trpc.partners.marketplace.useQuery");
    expect(detail).toContain("trpc.partners.marketplaceProduct.useQuery");
  });

  it("marks all external handoffs as partner offers rather than in-app payments", () => {
    expect(marketplace).toContain('rel="sponsored nofollow noopener"');
    expect(detail).toContain('rel="sponsored nofollow noopener"');
    expect(marketplace).toContain("BlackWaterLeaf verkauft nicht selbst");
    expect(detail).toContain("Der Kaufvertrag, Bezahlvorgang, Versand, Widerruf und Support");
  });

  it("uses the same currently-authorized publication gate for catalogue records", () => {
    expect(router).toContain("getPublicMarketplaceProducts");
    expect(router).toContain("isPublicPartnerProduct");
    expect(router).toContain("marketplaceProduct: publicProcedure");
  });

  it("uses a clearly labelled abstract loading phase and accessible product-card motion", () => {
    expect(marketplace).toContain("<MarketplaceLoading />");
    expect(marketplace).toContain('aria-busy="true"');
    expect(marketplace).toContain("Partnerangebote werden geprüft");
    expect(styles).toContain("marketplace-loading__card");
    expect(styles).toContain(".marketplace-card:focus-within");
    expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
  });
});
