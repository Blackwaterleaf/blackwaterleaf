export type MarketplaceProduct = {
  id: number;
  partnerId: number;
  partnerName: string;
  partnerType: "person" | "company";
  partnerUrl: string | null;
  disclosureLabel: string;
  title: string;
  description: string | null;
  destinationUrl: string;
  priceLabel: string | null;
  imageUrl: string | null;
  imageAltText: string | null;
  sourceVendor: string | null;
  marketplaceCategory: string | null;
  productType: string | null;
  variantSummary: string | null;
  variantCount: number;
  seoTitle: string | null;
  seoDescription: string | null;
};

export type MarketplaceCartLine = MarketplaceProduct & { quantity: number };

export function filterMarketplaceProducts(
  products: MarketplaceProduct[],
  search: string,
  partnerId: number | "all" = "all",
  category: string | "all" = "all",
) {
  const query = search.trim().toLocaleLowerCase("de-DE");
  return products.filter(product => {
    const partnerMatches = partnerId === "all" || product.partnerId === partnerId;
    const categoryMatches = category === "all" || product.marketplaceCategory === category;
    const text = `${product.title} ${product.partnerName} ${product.sourceVendor ?? ""} ${product.productType ?? ""} ${product.marketplaceCategory ?? ""} ${product.description ?? ""}`.toLocaleLowerCase("de-DE");
    return partnerMatches && categoryMatches && (!query || text.includes(query));
  });
}

export function groupMarketplaceCart(lines: MarketplaceCartLine[]) {
  const groups = new Map<number, { partnerName: string; partnerUrl: string | null; lines: MarketplaceCartLine[] }>();
  for (const line of lines) {
    const group = groups.get(line.partnerId) ?? { partnerName: line.partnerName, partnerUrl: line.partnerUrl, lines: [] };
    group.lines.push(line);
    groups.set(line.partnerId, group);
  }
  return Array.from(groups.entries()).map(([partnerId, group]) => ({ partnerId, ...group }));
}

export function marketplaceProductCount(lines: MarketplaceCartLine[]) {
  return lines.reduce((count, line) => count + line.quantity, 0);
}

export function marketplaceDisclosure(product: Pick<MarketplaceProduct, "disclosureLabel" | "partnerName">) {
  return `${product.disclosureLabel} · Angebot von ${product.partnerName}`;
}

export const marketplaceCategoryLabels: Record<string, string> = {
  futter: "Futter",
  lebendfutter: "Lebendfutter",
  frostfutter: "Frostfutter",
  technik: "Technik",
  filter: "Filter",
  wasserpflege: "Wasserpflege",
  dekoration: "Dekoration",
  bodengrund: "Bodengrund",
  pflanzenpflege: "Pflanzenpflege",
  zubehoer: "Zubehör",
  thermometer: "Temperatur",
  sonstiges: "Weitere Artikel",
};

export function marketplaceCategoryLabel(category: string | null) {
  return category ? marketplaceCategoryLabels[category] ?? "Weitere Artikel" : "Weitere Artikel";
}
