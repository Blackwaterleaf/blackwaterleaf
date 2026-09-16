export type ShopifyExportRow = Record<string, string>;

export type KiemenKumpelImportProduct = {
  handle: string;
  title: string;
  description: string | null;
  sourceDescriptionHtml: string | null;
  vendor: string | null;
  marketplaceCategory: MarketplaceCategory;
  sourceProductCategory: string | null;
  productType: string | null;
  sourceTags: string | null;
  destinationUrl: string;
  priceLabel: string | null;
  variantSummary: string | null;
  variantCount: number;
  sourceVariants: Array<{ sku: string | null; option: string | null; price: string | null; compareAtPrice: string | null; grams: string | null; barcode: string | null }>;
  primaryImageUrl: string | null;
  primaryImageAlt: string | null;
  images: Array<{ sourceUrl: string; altText: string | null; position: number }>;
  seoTitle: string;
  seoDescription: string;
  isPublished: boolean;
};

export type MarketplaceCategory =
  | "futter"
  | "lebendfutter"
  | "frostfutter"
  | "technik"
  | "filter"
  | "wasserpflege"
  | "dekoration"
  | "bodengrund"
  | "pflanzenpflege"
  | "zubehoer"
  | "thermometer"
  | "sonstiges";

function field(row: ShopifyExportRow, key: string) {
  return row[key]?.trim() ?? "";
}

export function parseShopifyCsv(source: string): ShopifyExportRow[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        value += '"';
        index += 1;
      } else if (char === '"') quoted = false;
      else value += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(value);
      value = "";
    } else if (char === "\n") {
      row.push(value.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      value = "";
    } else value += char;
  }
  if (value.length || row.length) {
    row.push(value.replace(/\r$/, ""));
    rows.push(row);
  }
  const [headers = [], ...data] = rows;
  return data
    .filter(values => values.some(cell => cell.trim()))
    .map(values => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

export function htmlToPlainText(html: string) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>|<\/li>|<\/h[1-6]>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&uuml;/gi, "ü")
    .replace(/&ouml;/gi, "ö")
    .replace(/&auml;/gi, "ä")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export function categoryForProduct(category: string, type: string): MarketplaceCategory {
  const source = `${category} ${type}`.toLocaleLowerCase("de-DE");
  if (source.includes("lebendfutter")) return "lebendfutter";
  if (source.includes("gefroren") || source.includes("frostfutter")) return "frostfutter";
  if (source.includes("fischfutter") || source.includes("trockenfutter")) return "futter";
  if (source.includes("filter")) return "filter";
  if (source.includes("wasseraufbereiter") || source.includes("algen") || source.includes("bakterien") || source.includes("wasserpflege")) return "wasserpflege";
  if (source.includes("temperatur") || source.includes("thermometer") || source.includes("heizung")) return "thermometer";
  if (source.includes("bodengrund") || source.includes("sand")) return "bodengrund";
  if (source.includes("dünger") || source.includes("wasserpflanz")) return "pflanzenpflege";
  if (source.includes("treibholz") || source.includes("dekoration") || source.includes("höhle") || source.includes("versteck") || source.includes("wurzel")) return "dekoration";
  if (source.includes("netz") || source.includes("werkzeug") || source.includes("reinigung")) return "zubehoer";
  if (source.includes("aqua") || source.includes("technik")) return "technik";
  return "sonstiges";
}

function price(value: string) {
  const parsed = Number.parseFloat(value.replace(",", "."));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function euro(value: number) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value);
}

function crop(value: string, length: number) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= length) return normalized;
  return `${normalized.slice(0, Math.max(0, length - 1)).trimEnd()}…`;
}

export function buildKiemenKumpelProducts(rows: ShopifyExportRow[]): KiemenKumpelImportProduct[] {
  const products = new Map<string, { source: ShopifyExportRow; variants: ShopifyExportRow[]; images: ShopifyExportRow[] }>();
  for (const row of rows) {
    const handle = field(row, "Handle");
    if (!handle) continue;
    const current = products.get(handle) ?? { source: row, variants: [], images: [] };
    if (field(row, "Title")) current.source = row;
    if (field(row, "Variant SKU") || field(row, "Variant Price")) current.variants.push(row);
    if (field(row, "Image Src")) current.images.push(row);
    products.set(handle, current);
  }
  return Array.from(products.entries()).map(([handle, record]) => {
    const source = record.source;
    const title = field(source, "Title");
    const sourceDescriptionHtml = field(source, "Body (HTML)") || null;
    const description = htmlToPlainText(sourceDescriptionHtml ?? "") || null;
    const sourceProductCategory = field(source, "Product Category") || null;
    const productType = field(source, "Type") || null;
    const variants: Array<{ sku: string | null; option: string | null; price: string | null; compareAtPrice: string | null; grams: string | null; barcode: string | null; normalizedPrice: number | null }> = record.variants.map((variant: ShopifyExportRow) => ({
      sku: field(variant, "Variant SKU") || null,
      option: [variant["Option1 Value"], variant["Option2 Value"], variant["Option3 Value"]].filter(Boolean).join(" / "),
      price: field(variant, "Variant Price") || null,
      compareAtPrice: field(variant, "Variant Compare At Price") || null,
      grams: field(variant, "Variant Grams") || null,
      barcode: field(variant, "Variant Barcodes") || null,
      normalizedPrice: price(variant["Variant Price"]),
    }));
    const prices: number[] = variants.map((variant) => variant.normalizedPrice).filter((value): value is number => value !== null);
    const priceLabel = prices.length ? (prices.length === 1 ? euro(prices[0]!) : `ab ${euro(Math.min(...prices))}`) : null;
    const optionValues = Array.from(new Set(variants.map((variant) => variant.option).filter((value): value is string => Boolean(value))));
    const variantSummary = optionValues.length ? crop(optionValues.join(" · "), 1_000) : null;
    const images = record.images
      .map((image: ShopifyExportRow, index) => ({
        sourceUrl: field(image, "Image Src"),
        altText: field(image, "Image Alt Text") || null,
        position: Number(field(image, "Image Position")) || index + 1,
      }))
      .filter((image) => image.sourceUrl)
      .sort((first, second) => first.position - second.position);
    const image = images[0];
    const seoTitle = crop(field(source, "SEO Title") || `${title} | Kiemen-Kumpel`, 160);
    const seoDescription = crop(field(source, "SEO Description") || description || `${title} bei Kiemen-Kumpel entdecken.`, 320);
    return {
      handle,
      title,
      description,
      sourceDescriptionHtml,
      vendor: field(source, "Vendor") || null,
      marketplaceCategory: categoryForProduct(sourceProductCategory ?? "", productType ?? ""),
      sourceProductCategory,
      productType,
      sourceTags: field(source, "Tags") || null,
      destinationUrl: `https://kiemen-kumpel.de/products/${encodeURIComponent(handle)}`,
      priceLabel,
      variantSummary,
      variantCount: variants.length,
      sourceVariants: variants.map(({ normalizedPrice: _normalizedPrice, ...variant }) => variant),
      primaryImageUrl: image?.sourceUrl ?? null,
      primaryImageAlt: image?.altText ?? null,
      images,
      seoTitle,
      seoDescription,
      isPublished: (field(source, "Published") || field(source, "Status")).toLocaleLowerCase("de-DE") === "true" || field(source, "Status").toLowerCase() === "active",
    };
  }).filter(product => product.title);
}

export const marketplaceCategoryLabels: Record<MarketplaceCategory, string> = {
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
