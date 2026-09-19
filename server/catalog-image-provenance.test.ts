import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const read = (file: string) => readFileSync(resolve(root, file), "utf8");

describe("AP-12 catalog image provenance", () => {
  it("stores source, license, attribution and verification time for both public catalogs", () => {
    const schema = read("drizzle/schema.ts");
    expect((schema.match(/imageSourceUrl: varchar/g) ?? []).length).toBe(2);
    expect((schema.match(/imageLicense: varchar/g) ?? []).length).toBe(2);
    expect((schema.match(/imageAttribution: text/g) ?? []).length).toBe(2);
    expect((schema.match(/imageVerifiedAt: timestamp/g) ?? []).length).toBe(2);
  });

  it("stores a primary scientific record, retrieval date and match quality for both catalogs", () => {
    const schema = read("drizzle/schema.ts");
    expect((schema.match(/sourceRecordUrl: varchar/g) ?? []).length).toBe(2);
    expect((schema.match(/sourceLicense: varchar/g) ?? []).length).toBe(2);
    expect((schema.match(/sourceCitation: text/g) ?? []).length).toBe(2);
    expect((schema.match(/sourceRetrievedAt: timestamp/g) ?? []).length).toBe(2);
    expect((schema.match(/taxonomicStatus: varchar/g) ?? []).length).toBe(2);
    expect((schema.match(/matchConfidence: int/g) ?? []).length).toBe(2);
  });

  it("requires complete image provenance before a staff import may publish records", () => {
    const router = read("server/routers/search.ts");
    expect((router.match(/published_taxon_image_provenance_required/g) ?? []).length).toBe(2);
    expect(router).toContain("catalog_image_license_not_reusable");
    expect(router).toContain("imageVerifiedAt: input.publish ? new Date() : null");
  });

  it("allows text-only scientific records but requires a complete official primary source before publishing", () => {
    const router = read("server/routers/search.ts");
    expect((router.match(/taxon_source_provenance_required/g) ?? []).length).toBe(1);
    expect((router.match(/unapproved_taxon_source/g) ?? []).length).toBe(1);
    expect(router).toContain("record.sourceRecordUrl");
    expect(router).toContain("record.sourceRetrievedAt");
    expect(router).toContain("record.matchConfidence");
  });

  it("exposes provenance to search and details while keeping missing images explicit", () => {
    const router = read("server/routers/search.ts");
    const plantPage = read("client/src/pages/PlantTaxon.tsx");
    const aquariumPage = read("client/src/pages/AquariumTaxon.tsx");
    expect(router).toContain("imageSourceUrl: plantTaxa.imageSourceUrl");
    expect(router).toContain("imageSourceUrl: aquariumTaxa.imageSourceUrl");
    expect(plantPage).toContain("Für dieses Taxon ist noch kein verifiziertes Katalogbild hinterlegt.");
    expect(aquariumPage).toContain("Für diesen Fisch ist noch kein verifiziertes Katalogbild hinterlegt.");
  });
});
