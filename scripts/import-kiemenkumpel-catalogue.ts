import { readFile } from "node:fs/promises";
import { and, eq, inArray } from "drizzle-orm";
import {
  partnerProductImages,
  partnerProducts,
  partnerProfiles,
} from "../drizzle/schema";
import { appendAuditEntry } from "../server/auditLedger";
import { getDb } from "../server/db";
import { buildKiemenKumpelProducts, parseShopifyCsv } from "../server/kiemenKumpelImport";
import { storagePut } from "../server/storage";
import { ALLOWED_IMAGE_MIME_TYPES, type AllowedImageMimeType } from "../server/uploadValidation";

const csvPath = process.argv.find(arg => arg.endsWith(".csv"));
const dryRun = process.argv.includes("--dry-run");
const partnerName = "Kiemen-Kumpel";
const sourceHost = "cdn.shopify.com";
const concurrency = 4;
const nonMerchandiseHandles = new Set(["energiekostenpauschale"]);

if (!csvPath) throw new Error("usage: tsx scripts/import-kiemenkumpel-catalogue.ts /absolute/path/products.csv [--dry-run]");

function isAllowedMime(value: string | null): value is AllowedImageMimeType {
  return Boolean(value) && ALLOWED_IMAGE_MIME_TYPES.includes(value as AllowedImageMimeType);
}

function extensionFor(mime: AllowedImageMimeType) {
  return mime === "image/jpeg" ? "jpg" : mime === "image/png" ? "png" : "webp";
}

async function pool<T>(items: T[], fn: (item: T) => Promise<void>) {
  let cursor = 0;
  const worker = async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      await fn(items[index]!);
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
}

async function loadSourceImage(url: string) {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || parsed.hostname !== sourceHost) {
    throw new Error(`untrusted_image_source:${parsed.hostname}`);
  }
  const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`image_download_failed:${response.status}`);
  const mime = response.headers.get("content-type")?.split(";", 1)[0]?.toLowerCase() ?? null;
  if (!isAllowedMime(mime)) throw new Error(`unsupported_source_image_type:${mime ?? "missing"}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (!bytes.length || bytes.length > 8 * 1024 * 1024) throw new Error(`invalid_source_image_size:${bytes.length}`);
  return { bytes, mime };
}

const db = await getDb();
if (!db) throw new Error("database_unavailable");
const csv = await readFile(csvPath, "utf8");
const parsed = buildKiemenKumpelProducts(parseShopifyCsv(csv));
const operationalSurcharges = parsed.filter(product => product.isPublished && nonMerchandiseHandles.has(product.handle));
const published = parsed.filter(product => product.isPublished && !nonMerchandiseHandles.has(product.handle));
const inactive = parsed.filter(product => !product.isPublished);
const [partner] = await db
  .select({ id: partnerProfiles.id, createdByUserId: partnerProfiles.createdByUserId, status: partnerProfiles.status })
  .from(partnerProfiles)
  .where(and(eq(partnerProfiles.displayName, partnerName), eq(partnerProfiles.status, "approved")))
  .limit(1);
if (!partner) throw new Error("approved_kiemen_kumpel_partner_not_found");

const existing = await db
  .select({ id: partnerProducts.id, sourceHandle: partnerProducts.sourceHandle, imageStorageKey: partnerProducts.imageStorageKey })
  .from(partnerProducts)
  .where(eq(partnerProducts.partnerId, partner.id));
const existingByHandle = new Map(existing.filter(item => item.sourceHandle).map(item => [item.sourceHandle!, item]));

console.log(JSON.stringify({
  mode: dryRun ? "dry-run" : "import",
  partnerId: partner.id,
  sourceProducts: parsed.length,
  publishedProducts: published.length,
  inactiveProducts: inactive.length,
  excludedOperationalSurcharges: operationalSurcharges.length,
  sourceImages: published.reduce((count, product) => count + product.images.length, 0),
  existingProducts: existing.length,
  willCreate: published.filter(product => !existingByHandle.has(product.handle)).length,
  willUpdate: published.filter(product => existingByHandle.has(product.handle)).length,
}, null, 2));

if (dryRun) process.exit(0);

if (operationalSurcharges.length) {
  await db
    .update(partnerProducts)
    .set({ status: "paused" })
    .where(and(eq(partnerProducts.partnerId, partner.id), inArray(partnerProducts.sourceHandle, operationalSurcharges.map(product => product.handle))));
}

const imported: Array<{ id: number; handle: string; created: boolean; primaryImageUrl: string | null; images: typeof published[number]["images"] }> = [];
for (const product of published) {
  const values = {
    partnerId: partner.id,
    title: product.title,
    description: product.description,
    sourceDescriptionHtml: product.sourceDescriptionHtml,
    destinationUrl: product.destinationUrl,
    priceLabel: product.priceLabel,
    sourceHandle: product.handle,
    sourceVendor: product.vendor,
    marketplaceCategory: product.marketplaceCategory,
    sourceProductCategory: product.sourceProductCategory,
    productType: product.productType,
    sourceTags: product.sourceTags,
    variantSummary: product.variantSummary,
    variantCount: product.variantCount,
    sourceVariants: product.sourceVariants,
    sourceImageUrl: product.primaryImageUrl,
    imageAltText: product.primaryImageAlt,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    status: "active" as const,
    createdByUserId: partner.createdByUserId,
  };
  const previous = existingByHandle.get(product.handle);
  let id: number;
  let created = false;
  if (previous) {
    id = previous.id;
    await db.update(partnerProducts).set(values).where(eq(partnerProducts.id, id));
  } else {
    const result = await db.insert(partnerProducts).values(values);
    id = Number(result[0].insertId);
    created = true;
  }
  imported.push({ id, handle: product.handle, created, primaryImageUrl: product.primaryImageUrl, images: product.images });
}

const imageWork = imported.flatMap(product => product.images.map(image => ({ ...image, product })));
const imageResults = { stored: 0, skipped: 0, failed: [] as Array<{ handle: string; position: number; reason: string }> };
await pool(imageWork, async work => {
  try {
    const { bytes, mime } = await loadSourceImage(work.sourceUrl);
    const stored = await storagePut(
      `partners/${partner.id}/catalogue/${work.product.id}/gallery-${work.position}.${extensionFor(mime)}`,
      bytes,
      mime,
    );
    await db
      .insert(partnerProductImages)
      .values({
        productId: work.product.id,
        position: work.position,
        sourceUrl: work.sourceUrl,
        storageKey: stored.key,
        mimeType: mime,
        byteSize: bytes.length,
        altText: work.altText,
      })
      .onDuplicateKeyUpdate({
        set: { sourceUrl: work.sourceUrl, storageKey: stored.key, mimeType: mime, byteSize: bytes.length, altText: work.altText },
      });
    const firstImagePosition = Math.min(...work.product.images.map(image => image.position));
    if (work.position === firstImagePosition) {
      await db
        .update(partnerProducts)
        .set({ imageStorageKey: stored.key, imageMimeType: mime, imageByteSize: bytes.length, imageAltText: work.altText, sourceImageUrl: work.sourceUrl })
        .where(eq(partnerProducts.id, work.product.id));
    }
    imageResults.stored += 1;
  } catch (error) {
    imageResults.failed.push({ handle: work.product.handle, position: work.position, reason: error instanceof Error ? error.message : "image_import_failed" });
  }
});

const importedIds = imported.map(product => product.id);
if (importedIds.length) {
  const expectedByProduct = new Map(imported.map(product => [product.id, product.images.map(image => image.position)]));
  for (const productId of importedIds) {
    const positions = expectedByProduct.get(productId) ?? [];
    if (positions.length === 0) await db.delete(partnerProductImages).where(eq(partnerProductImages.productId, productId));
  }
}

await appendAuditEntry({
  actorId: partner.createdByUserId,
  action: "partner_catalogue_imported",
  targetType: "partner_profile",
  targetId: partner.id,
  payload: {
    source: "kiemen_kumpel_shopify_csv",
    sourceProducts: parsed.length,
    publishedProducts: published.length,
    inactiveProductsExcluded: inactive.length,
    operationalSurchargesExcluded: operationalSurcharges.map(product => product.handle),
    createdProducts: imported.filter(item => item.created).length,
    updatedProducts: imported.filter(item => !item.created).length,
    sourceImages: imageWork.length,
    storedImages: imageResults.stored,
    failedImages: imageResults.failed.length,
  },
});

console.log(JSON.stringify({
  result: "ok",
  partnerId: partner.id,
  importedProducts: imported.length,
  createdProducts: imported.filter(item => item.created).length,
  updatedProducts: imported.filter(item => !item.created).length,
  imageResults,
}, null, 2));

if (imageResults.failed.length) process.exitCode = 2;
