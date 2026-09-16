import { readFileSync } from "node:fs";

const path = process.argv[2];
if (!path) throw new Error("CSV path required");
const source = readFileSync(path, "utf8");

function parseCsv(input) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') quoted = false;
      else cell += char;
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      cell = "";
    } else cell += char;
  }
  if (cell.length || row.length) {
    row.push(cell.replace(/\r$/, ""));
    rows.push(row);
  }
  return rows;
}

const [header, ...rows] = parseCsv(source);
const records = rows.filter(row => row.some(value => value.trim())).map(row => Object.fromEntries(header.map((key, index) => [key, row[index] ?? ""])));
const products = new Map();
for (const record of records) {
  const handle = record.Handle.trim();
  if (!handle) continue;
  const product = products.get(handle) ?? {
    handle,
    title: record.Title.trim(),
    vendor: record.Vendor.trim(),
    published: record.Published.trim(),
    category: record["Product Category"].trim(),
    type: record.Type.trim(),
    tags: record.Tags.trim(),
    seoTitle: record["SEO Title"].trim(),
    seoDescription: record["SEO Description"].trim(),
    variants: [],
    images: [],
  };
  if (record.Title.trim()) product.title = record.Title.trim();
  if (record.Vendor.trim()) product.vendor = record.Vendor.trim();
  if (record.Published.trim()) product.published = record.Published.trim();
  if (record["Product Category"].trim()) product.category = record["Product Category"].trim();
  if (record.Type.trim()) product.type = record.Type.trim();
  if (record.Tags.trim()) product.tags = record.Tags.trim();
  if (record["SEO Title"].trim()) product.seoTitle = record["SEO Title"].trim();
  if (record["SEO Description"].trim()) product.seoDescription = record["SEO Description"].trim();
  if (record["Variant SKU"].trim() || record["Variant Price"].trim()) product.variants.push({ sku: record["Variant SKU"].trim(), option: [record["Option1 Value"], record["Option2 Value"], record["Option3 Value"]].filter(Boolean).join(" / "), price: record["Variant Price"].trim() });
  if (record["Image Src"].trim()) product.images.push({ url: record["Image Src"].trim(), alt: record["Image Alt Text"].trim(), position: record["Image Position"].trim() });
  products.set(handle, product);
}

const values = [...products.values()];
const countBy = key => Object.fromEntries([...new Map([...new Set(values.map(key).filter(Boolean))].map(value => [value, values.filter(item => key(item) === value).length])).entries()].sort((a, b) => b[1] - a[1]));
const output = {
  rows: records.length,
  productCount: values.length,
  published: { true: values.filter(item => item.published.toLowerCase() === "true").length, false: values.filter(item => item.published.toLowerCase() === "false").length, blank: values.filter(item => !item.published).length },
  withImage: values.filter(item => item.images.length > 0).length,
  withVariants: values.filter(item => item.variants.length > 0).length,
  withSeoTitle: values.filter(item => item.seoTitle).length,
  withSeoDescription: values.filter(item => item.seoDescription).length,
  vendors: countBy(item => item.vendor),
  productCategories: countBy(item => item.category),
  types: countBy(item => item.type),
  sample: values.slice(0, 10).map(item => ({ handle: item.handle, title: item.title, published: item.published, category: item.category, type: item.type, variants: item.variants.length, image: item.images[0]?.url ?? null, seoTitle: item.seoTitle || null })),
};
console.log(JSON.stringify(output, null, 2));
