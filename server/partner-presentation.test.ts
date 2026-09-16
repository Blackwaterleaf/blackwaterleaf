import { describe, expect, it } from "vitest";
import { partnerProductPresentation } from "../client/src/lib/partnerPresentation";

describe("öffentliche Partnerproduktdarstellung", () => {
  it("zeigt bei einem aktiven Partner ohne aktive Produkte einen ehrlichen Leerzustand und keine Teaser", () => {
    const presentation = partnerProductPresentation([], "de");
    expect(presentation).toEqual({ kind: "empty", message: "Noch keine freigegebenen Produkte." });
    expect(presentation.kind).not.toBe("products");
  });

  it("gibt nur die vom Server freigegebenen Produktteaser weiter", () => {
    const presentation = partnerProductPresentation([{ id: 1, title: "Naturprodukt", destinationUrl: "https://kiemen-kumpel.de/products/naturprodukt", priceLabel: null }], "de");
    expect(presentation.kind).toBe("products");
    if (presentation.kind === "products") expect(presentation.products).toHaveLength(1);
  });
});
