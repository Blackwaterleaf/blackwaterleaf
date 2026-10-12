import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const read = (file: string) => readFileSync(resolve(root, file), "utf8");

describe("open taxon image import", () => {
  it("imports only exact, research-grade CC0 or CC-BY images with attribution and a quality gate", () => {
    const importer = read("scripts/import-open-taxon-images.ts");
    expect(importer).toContain('const minPixels = 1_200_000');
    expect(importer).toContain('const minShortestSide = 900');
    expect(importer).toContain('const allowedLicenses = new Set(["cc0", "cc-by"])');
    expect(importer).toContain('candidate.qualityGrade === "research"');
    expect(importer).toContain('candidate.taxonRank === "species"');
    expect(importer).toContain('normalized(candidate.taxonName) === normalized(record.scientificName)');
    expect(importer).toContain('observation_photo_provenance_mismatch');
  });

  it("stores reviewed image bytes locally while retaining a public attribution and evidence page", () => {
    const importer = read("scripts/import-open-taxon-images.ts");
    const storage = read("server/_core/storageProxy.ts");
    const webPlant = read("client/src/pages/PlantTaxon.tsx");
    const webFish = read("client/src/pages/AquariumTaxon.tsx");
    const native = read("mobile-natur/App.tsx");
    expect(importer).toContain('storagePut(`catalog/taxa/${item.kind}/${item.id}/inat-${item.candidate.photoId}.${image.extension}`');
    expect(importer).toContain('imageSourceUrl: observationUrl');
    expect(importer).toContain('imageAttribution: storedAttribution(item.candidate)');
    expect(storage).toContain('isPublicCatalogueTaxonImage');
    expect(webPlant).toContain('Bild: {item.imageAttribution');
    expect(webFish).toContain('Bild: {item.imageAttribution');
    expect(native).toContain('TaxonMediaAttribution');
  });

  it("does not permit unverified user media through the public storage proxy", () => {
    const storage = read("server/_core/storageProxy.ts");
    expect(storage).toContain('catalog\\/taxa\\/(?:plant|aquarium)');
    expect(storage).toContain('Object authorization required');
    expect(storage).not.toContain('res.redirect(307, key)');
  });
});
