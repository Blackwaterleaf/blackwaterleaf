import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const app = readFileSync(resolve(root, "client/src/App.tsx"), "utf8");
const shell = readFileSync(resolve(root, "client/src/components/AppShell.tsx"), "utf8");
const marketplace = readFileSync(resolve(root, "client/src/pages/Marketplace.tsx"), "utf8");
const shop = readFileSync(resolve(root, "client/src/pages/MarketplaceShop.tsx"), "utf8");
const detail = readFileSync(resolve(root, "client/src/pages/MarketplaceProduct.tsx"), "utf8");
const router = readFileSync(resolve(root, "server/routers/partners.ts"), "utf8");
const styles = readFileSync(resolve(root, "client/src/index.css"), "utf8");
const designBook = readFileSync(resolve(root, "docs/BLACKWATERLEAF_OBSERVATORY_SCREEN_DESIGN_BOOK_2026-09-19.md"), "utf8");

describe("marketplace UI truth contract", () => {
  it("provides a compact shop hub and real shop/product routes", () => {
    expect(app).toContain('path={"/marketplace"} component={Marketplace}');
    expect(app).toContain('path={"/marketplace/shop/:id"} component={MarketplaceShop}');
    expect(app).toContain('path={"/marketplace/product/:id"} component={MarketplaceProduct}');
    expect(marketplace).toContain("trpc.partners.marketplace.useQuery");
    expect(shop).toContain("trpc.partners.marketplace.useQuery");
    expect(detail).toContain("trpc.partners.marketplaceProduct.useQuery");
  });

  it("keeps the overview focused on verified shop selection", () => {
    expect(marketplace).toContain("SHOP ÖFFNEN");
    expect(marketplace).toContain("Händler auswählen");
    expect(marketplace).toContain("FREIGEGEBENE HÄNDLER");
    expect(marketplace).toContain("KIEMEN_KUMPEL_IMAGE");
    expect(marketplace).not.toContain("Partner-Angebote");
    expect(marketplace).not.toContain("filtered.map(product");
  });

  it("keeps products, categories, search and partner handoffs inside the selected shop", () => {
    expect(shop).toContain("marketplace-shop-categories");
    expect(shop).toContain("marketplace-shop-subcategories");
    expect(shop).toContain("marketplaceSubcategoryLabel");
    expect(shop).toContain("priceAsc");
    expect(shop).toContain("priceDesc");
    expect(shop).toContain("newest");
    expect(shop).toContain("filterMarketplaceProducts");
    expect(shop).toContain("sortMarketplaceProducts");
    expect(shop).toContain("KAUFINTERESSE MERKEN");
    expect(shop).toContain('rel="sponsored nofollow noopener"');
    expect(detail).toContain('rel="sponsored nofollow noopener"');
    expect(shop).toContain("Zahlung, Versand, Rückgabe und Support");
  });

  it("uses the same currently-authorized publication gate for catalogue records", () => {
    expect(router).toContain("getPublicMarketplaceProducts");
    expect(router).toContain("isPublicPartnerProduct");
    expect(router).toContain("marketplaceProduct: publicProcedure");
    expect(router).toContain("updatedAt: product.updatedAt");
  });

  it("keeps source-labelled images, verified galleries and the official merchant asset", () => {
    expect(shop).toContain("product.imageUrl");
    expect(detail).toContain("item.gallery.length");
    expect(detail).toContain("marketplace-gallery-thumbnails");
    expect(detail).toContain("item.variantSummary");
    expect(router).toContain("getPublicProductGallery");
    expect(marketplace).toContain("KIEMEN_KUMPEL_IMAGE");
    expect(styles).toContain(".marketplace-hub-shop");
    expect(styles).toContain(".marketplace-shop-hero");
  });

  it("keeps the Marketplace in the Observatory navigation and design book", () => {
    expect(shell).toContain('href: "/marketplace"');
    expect(shell).toContain('label: "tabs.marketplace"');
    expect(designBook).toContain("/marketplace/shop/:id");
    expect(designBook).toContain("Shopauswahl");
  });
});
