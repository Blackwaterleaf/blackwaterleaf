import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const app = readFileSync(resolve(root, "mobile-natur/App.tsx"), "utf8");
const api = readFileSync(resolve(root, "mobile-natur/src/api.ts"), "utf8");
const web = readFileSync(resolve(root, "client/src/pages/Marketplace.tsx"), "utf8");
const book = readFileSync(resolve(root, "docs/BLACKWATERLEAF_OBSERVATORY_SCREEN_DESIGN_BOOK_2026-09-19.md"), "utf8");

describe("AP-16 native marketplace shop contract", () => {
  it("keeps the marketplace as a merchant chooser before products", () => {
    expect(app).toContain("selectedPartnerId");
    expect(app).toContain("SHOP ÖFFNEN");
    expect(app).toContain("ALLE HÄNDLER");
    expect(app).toContain("JEDER HÄNDLER · EIN EIGENER SHOP");
    expect(app).toContain("PARTNER-SHOPS");
  });

  it("supports the same category and sort controls as the web shop flow", () => {
    expect(app).toContain("marketplaceCategory");
    expect(app).toContain("price-low");
    expect(app).toContain("price-high");
    expect(app).toContain("Neueste");
    expect(web).toContain("/marketplace/shop/");
    expect(api).toContain("partnerType");
    expect(api).toContain("updatedAt");
  });

  it("keeps payment ownership and partner attribution explicit", () => {
    expect(app).toContain("BlackWaterLeaf verarbeitet keine Zahlung");
    expect(app).toContain("marketplaceEvent");
    expect(book).toContain("Partner");
  });
});
