import { describe, expect, it } from "vitest";
import { partnerProductPresentation, publicPartnerCardPresentation } from "../client/src/lib/partnerPresentation";

describe("öffentliche Partnerproduktdarstellung", () => {
  it("zeigt bei einem aktiven Partner ohne aktive Produkte einen ehrlichen Leerzustand und keine Teaser", () => {
    const presentation = partnerProductPresentation([], "de");
    expect(presentation).toEqual({ kind: "empty", message: "Noch keine freigegebenen Produkte." });
    expect(presentation.kind).not.toBe("products");
  });

  it("gibt nur die vom Server freigegebenen Produktteaser weiter", () => {
    const presentation = partnerProductPresentation([{ id: 1, title: "Naturprodukt", destinationUrl: "https://kiemen-kumpel.de/products/naturprodukt", priceLabel: null, imageUrl: "https://assets.example.invalid/product.webp" }], "de");
    expect(presentation.kind).toBe("products");
    if (presentation.kind === "products") {
      expect(presentation.products).toHaveLength(1);
      expect(presentation.products[0]?.imageUrl).toBe("https://assets.example.invalid/product.webp");
    }
  });

  it("bildet die reale Kiemen-Kumpel-Karte mit Werbung, Firmenhinweis, HTTPS-Ziel und ehrlichem Produktleerzustand ab", () => {
    const card = publicPartnerCardPresentation({
      displayName: "Kiemen-Kumpel",
      partyType: "company",
      destinationUrl: "https://kiemen-kumpel.de/",
      disclosureLabel: "Werbung",
      products: [],
    }, "de");
    expect(card.displayName).toBe("Kiemen-Kumpel");
    expect(card.disclosureLabel).toBe("Werbung");
    expect(card.partyLabel).toBe("Unternehmenspartner");
    expect(card.destinationUrl).toBe("https://kiemen-kumpel.de/");
    expect(card.products).toEqual({ kind: "empty", message: "Noch keine freigegebenen Produkte." });
  });
});
