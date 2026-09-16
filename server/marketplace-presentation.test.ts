import { describe, expect, it } from "vitest";
import { filterMarketplaceProducts, groupMarketplaceCart, marketplaceDisclosure, marketplaceProductCount, type MarketplaceCartLine } from "../client/src/lib/marketplacePresentation";

const products: MarketplaceCartLine[] = [
  { id: 1, partnerId: 10, partnerName: "Kiemen-Kumpel", partnerType: "company", partnerUrl: "https://kiemen-kumpel.example", disclosureLabel: "Werbung", title: "Erlenzapfen", description: "Für Schwarzwasser", destinationUrl: "https://kiemen-kumpel.example/erlenzapfen", priceLabel: "7,90 €", imageUrl: null, quantity: 2 },
  { id: 2, partnerId: 10, partnerName: "Kiemen-Kumpel", partnerType: "company", partnerUrl: "https://kiemen-kumpel.example", disclosureLabel: "Werbung", title: "Futter", description: null, destinationUrl: "https://kiemen-kumpel.example/futter", priceLabel: null, imageUrl: null, quantity: 1 },
  { id: 3, partnerId: 11, partnerName: "Mooswerk", partnerType: "company", partnerUrl: null, disclosureLabel: "Werbung", title: "Terrarienmoos", description: "Feuchtes Moos", destinationUrl: "https://mooswerk.example/moos", priceLabel: "12,00 €", imageUrl: null, quantity: 3 },
];

describe("marketplace presentation", () => {
  it("filters only public catalogue data by text and partner", () => {
    expect(filterMarketplaceProducts(products, "schwarz").map(product => product.id)).toEqual([1]);
    expect(filterMarketplaceProducts(products, "", 10).map(product => product.id)).toEqual([1, 2]);
    expect(filterMarketplaceProducts(products, "moos", 10)).toEqual([]);
  });

  it("groups the local list by partner before external checkout", () => {
    const groups = groupMarketplaceCart(products);
    expect(groups).toHaveLength(2);
    expect(groups[0]).toMatchObject({ partnerId: 10, partnerName: "Kiemen-Kumpel" });
    expect(groups[0]?.lines.map(line => line.id)).toEqual([1, 2]);
    expect(groups[1]?.lines.map(line => line.id)).toEqual([3]);
    expect(marketplaceProductCount(products)).toBe(6);
  });

  it("keeps the advertising disclosure tied to the real partner", () => {
    expect(marketplaceDisclosure(products[0]!)).toBe("Werbung · Angebot von Kiemen-Kumpel");
  });
});
