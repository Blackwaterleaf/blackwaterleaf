import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  belongsToOfficialMediaSource,
  belongsToOfficialSource,
  isCommerciallyReusableCatalogImageLicense,
  isDisallowedCatalogSource,
  isOfficialTaxonSourceUrl,
  officialTaxonSource,
} from "../shared/taxon-source-policy";

const root = resolve(import.meta.dirname, "..");
const router = readFileSync(resolve(root, "server/routers/search.ts"), "utf8");
const rangeMap = readFileSync(resolve(root, "client/src/components/TaxonRangeMap.tsx"), "utf8");

describe("scientific taxon source policy", () => {
  it("recognizes only configured official catalog sources", () => {
    expect(officialTaxonSource("POWO")?.id).toBe("powo");
    expect(officialTaxonSource("FishBase")?.id).toBe("fishbase");
    expect(officialTaxonSource("manual")).toBeNull();
  });

  it("rejects Wikimedia and Wikipedia in every catalog provenance value", () => {
    for (const value of [
      "https://commons.wikimedia.org/wiki/File:Example.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/example.jpg",
      "Wikipedia",
      "Wikimedia Commons",
    ]) {
      expect(isDisallowedCatalogSource(value)).toBe(true);
    }
  });

  it("accepts a source page only when it belongs to the configured source", () => {
    expect(isOfficialTaxonSourceUrl("https://powo.science.kew.org/taxon/example")).toBe(true);
    expect(belongsToOfficialSource("POWO", "https://powo.science.kew.org/taxon/example")).toBe(true);
    expect(belongsToOfficialSource("FishBase", "https://powo.science.kew.org/taxon/example")).toBe(false);
    expect(isOfficialTaxonSourceUrl("https://example.invalid/species")).toBe(false);
  });

  it("does not treat a scientific discovery index as an image host", () => {
    expect(belongsToOfficialMediaSource("POWO", "https://powo.science.kew.org/image/example.jpg")).toBe(true);
    expect(belongsToOfficialMediaSource("GBIF", "https://www.gbif.org/occurrence/123")).toBe(false);
  });

  it("allows only explicit commercially reusable media licenses", () => {
    expect(isCommerciallyReusableCatalogImageLicense("CC BY 4.0")).toBe(true);
    expect(isCommerciallyReusableCatalogImageLicense("https://creativecommons.org/publicdomain/zero/1.0/")).toBe(true);
    expect(isCommerciallyReusableCatalogImageLicense("CC-BY-NC 4.0")).toBe(false);
    expect(isCommerciallyReusableCatalogImageLicense("all rights reserved")).toBe(false);
    expect(isCommerciallyReusableCatalogImageLicense(null)).toBe(false);
  });

  it("requires an official source for every new published taxon and exposes it to range maps", () => {
    expect(router).toContain("official_taxon_source_required");
    expect(router).toContain("unapproved_media_source");
    expect(router).toContain("catalog_image_license_not_reusable");
    expect(rangeMap).toContain("officialTaxonSource(source)");
    expect(rangeMap).toContain("Quellengebunden · keine exakten Privatkoordinaten");
  });
});
