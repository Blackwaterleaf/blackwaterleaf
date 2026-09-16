import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(process.cwd(), "scripts/import-kiemenkumpel-catalogue.ts"), "utf8");

describe("KiemenKumpel catalogue importer safeguards", () => {
  it("uses the existing approved partner, only imports published products, and creates a ledger entry", () => {
    expect(source).toContain('const partnerName = "Kiemen-Kumpel"');
    expect(source).toContain('eq(partnerProfiles.status, "approved")');
    expect(source).toContain("const published = parsed.filter(product => product.isPublished && !nonMerchandiseHandles.has(product.handle))");
    expect(source).toContain('action: "partner_catalogue_imported"');
  });

  it("accepts only HTTPS Shopify CDN images and validates their type and size before storage", () => {
    expect(source).toContain('const sourceHost = "cdn.shopify.com"');
    expect(source).toContain('parsed.protocol !== "https:" || parsed.hostname !== sourceHost');
    expect(source).toContain("isAllowedMime(mime)");
    expect(source).toContain("bytes.length > 8 * 1024 * 1024");
    expect(source).toContain("storagePut(");
    expect(source).toContain("firstImagePosition");
  });

  it("keeps operational surcharges out of the public product catalogue", () => {
    expect(source).toContain('const nonMerchandiseHandles = new Set(["energiekostenpauschale"])');
    expect(source).toContain("operationalSurcharges");
    expect(source).toContain('set({ status: "paused" })');
  });
});
