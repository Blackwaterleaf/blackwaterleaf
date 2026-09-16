import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const app = readFileSync(resolve(root, "client/src/App.tsx"), "utf8");
const shell = readFileSync(resolve(root, "client/src/components/AppShell.tsx"), "utf8");
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

  it("renders imported categories, variants, source-labelled images, and a verified product gallery", () => {
    expect(marketplace).toContain("marketplaceCategoryLabel");
    expect(marketplace).toContain("marketplace-filters--categories");
    expect(detail).toContain("item.gallery.length");
    expect(detail).toContain("marketplace-gallery-thumbnails");
    expect(detail).toContain("item.variantSummary");
    expect(detail).toContain("product.data?.seoTitle");
    expect(router).toContain("getPublicProductGallery");
    expect(styles).toContain(".marketplace-product-gallery");
  });

  it("uses a clearly labelled abstract loading phase and accessible product-card motion", () => {
    expect(marketplace).toContain("<MarketplaceLoading />");
    expect(marketplace).toContain('aria-busy="true"');
    expect(marketplace).toContain("Partnerangebote werden geprüft");
    expect(styles).toContain("marketplace-loading__card");
    expect(styles).toContain(".marketplace-card:focus-within");
    expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
  });

  it("keeps the reference sensor rail, entry composition, and detail states inside the aqua overlay", () => {
    expect(marketplace).toContain("LiveSensorStrip compact");
    expect(marketplace).toContain("marketplace-entry");
    for (const token of ["LiveSensorStrip compact", "MARKET/ROUTE", "MARKET/DETAIL_LOAD", "MARKET/DETAIL_UNAVAILABLE", "ReferenceHero"]) expect(detail).toContain(token);
    expect(styles).toContain(".marketplace-entry");
  });

  it("exposes the marketplace through bottom navigation and presents prices in one compact offer row", () => {
    expect(shell).toContain('href: "/marketplace"');
    expect(shell).toContain('label: "tabs.marketplace"');
    expect(styles).toContain("grid-template-columns: repeat(5, 1fr)");
    expect(marketplace).toContain("marketplace-card__offer");
    expect(marketplace).toContain("marketplace-card__price");
    expect(styles).toContain(".marketplace-card__offer");
    expect(styles).toContain(".marketplace-card__vendor");
  });

  it("offers accessible heart toggles and a device-local favorites list", () => {
    expect(marketplace).toContain("toggleMarketplaceFavorite");
    expect(marketplace).toContain("marketplace-favorite-toggle");
    expect(marketplace).toContain('aria-pressed={isFavorite}');
    expect(marketplace).toContain("MarketplaceFavorites");
    expect(marketplace).toContain("Favoriten bleiben nur auf diesem Gerät");
    expect(styles).toContain(".marketplace-favorite-toggle");
    expect(styles).toContain(".marketplace-favorite-list");
  });
});
