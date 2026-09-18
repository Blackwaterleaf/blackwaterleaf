import { describe, expect, it } from "vitest";
import { addMarketplaceProduct, removeMarketplaceProduct, setMarketplaceQuantity, toggleMarketplaceFavorite } from "../client/src/lib/marketplaceCart";
import type { MarketplaceProduct } from "../client/src/lib/marketplacePresentation";

const product: MarketplaceProduct = {
  id: 8,
  partnerId: 3,
  partnerName: "Kiemen-Kumpel",
  partnerType: "company",
  partnerUrl: "https://kiemen-kumpel.example",
  disclosureLabel: "Werbung",
  title: "Schwarzwasser-Set",
  description: null,
  destinationUrl: "https://kiemen-kumpel.example/set",
  priceLabel: "19,90 €",
  imageUrl: null,
};

describe("local marketplace cart", () => {
  it("adds an external partner offer and only increases its local quantity on repeat", () => {
    const once = addMarketplaceProduct([], product);
    const twice = addMarketplaceProduct(once, product);
    expect(once).toEqual([{ ...product, quantity: 1 }]);
    expect(twice).toEqual([{ ...product, quantity: 2 }]);
  });

  it("caps a quantity and removes a line instead of creating invalid negative data", () => {
    const line = [{ ...product, quantity: 1 }];
    expect(setMarketplaceQuantity(line, product.id, 25)[0]?.quantity).toBe(20);
    expect(setMarketplaceQuantity(line, product.id, 0)).toEqual([]);
    expect(removeMarketplaceProduct(line, product.id)).toEqual([]);
  });

  it("toggles a product once in the local favorites list without a purchase quantity", () => {
    const saved = toggleMarketplaceFavorite([], product);
    const removed = toggleMarketplaceFavorite(saved, product);
    expect(saved).toEqual([product]);
    expect(removed).toEqual([]);
  });
});
