import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  belongsToOfficialSource,
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

  it("requires an official source for every new published taxon and exposes it to range maps", () => {
    expect(router).toContain("official_taxon_source_required");
    expect(router).toContain("unapproved_media_source");
    expect(rangeMap).toContain("officialTaxonSource(source)");
    expect(rangeMap).toContain("Quellengebunden · keine exakten Privatkoordinaten");
  });
});
