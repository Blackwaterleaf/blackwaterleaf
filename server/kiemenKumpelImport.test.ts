import { describe, expect, it } from "vitest";
import { buildKiemenKumpelProducts, categoryForProduct, htmlToPlainText, parseShopifyCsv } from "./kiemenKumpelImport";

describe("KiemenKumpel Shopify import", () => {
  it("parses quoted HTML and keeps every product row associated with its handle", () => {
    const rows = parseShopifyCsv([
      "Handle,Title,Body (HTML),Vendor,Product Category,Type,Tags,Published,Option1 Value,Variant SKU,Variant Price,Image Src,Image Position,Image Alt Text,SEO Title,SEO Description,Status",
      'moorkien,Moorkienholz,"<p>Natürlich &amp; sofort einsatzbereit</p>",Kiemen-Kumpel,\"Tiere > Aquariumdekoration > Treibholz\",Wurzel,Schwarzwasser,true,XL,MOOR-XL,19.90,https://cdn.example.test/moor.jpg,1,Moorkienholz im Aquarium,,,active',
      'moorkien,,,,,,,,L,MOOR-L,14.90,,,,,,,',
    ].join("\n"));
    const products = buildKiemenKumpelProducts(rows);
    expect(products).toHaveLength(1);
    expect(products[0]).toMatchObject({
      handle: "moorkien",
      title: "Moorkienholz",
      description: "Natürlich & sofort einsatzbereit",
      marketplaceCategory: "dekoration",
      priceLabel: "ab 14,90 €",
      variantCount: 2,
      primaryImageUrl: "https://cdn.example.test/moor.jpg",
      isPublished: true,
    });
    expect(products[0]?.sourceVariants).toEqual([
      { sku: "MOOR-XL", option: "XL", price: "19.90", compareAtPrice: null, grams: null, barcode: null },
      { sku: "MOOR-L", option: "L", price: "14.90", compareAtPrice: null, grams: null, barcode: null },
    ]);
    expect(products[0]?.images).toEqual([{ sourceUrl: "https://cdn.example.test/moor.jpg", altText: "Moorkienholz im Aquarium", position: 1 }]);
  });

  it("maps aquarium-specific categories and does not activate unpublished records", () => {
    expect(categoryForProduct("Fischfutter > Lebendfutter", "")).toBe("lebendfutter");
    expect(categoryForProduct("Fischfutter > Gefrorenes Futter", "")).toBe("frostfutter");
    expect(categoryForProduct("Aquariumfilter", "Filter")).toBe("filter");
    expect(categoryForProduct("Nicht kategorisiert", "Werkzeug")).toBe("zubehoer");
    expect(htmlToPlainText("<p>Sauber<br>und sicher</p>")).toBe("Sauber\nund sicher");
  });
});
