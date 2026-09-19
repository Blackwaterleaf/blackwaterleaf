import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const read = (relativePath: string) => readFileSync(path.join(root, relativePath), "utf8");

describe("separate aquarium catalog", () => {
  it("keeps aquarium taxa separate from plant taxa and exposes the search/detail contract", () => {
    const schema = read("drizzle/schema.ts");
    const router = read("server/routers/search.ts");
    expect(schema).toContain('"aquarium_taxa"');
    expect(schema).toContain('"aquarium_taxon"');
    expect(router).toContain('"aquarium"');
    expect(router).toContain("aquariumById");
    expect(router).toContain("importValidatedAquariumTaxa");
  });

  it("preserves all 15 validated Channa records in the deterministic import manifest", () => {
    const manifest = JSON.parse(read("data/imports/aquarium-taxa-batches/manifest.json"));
    expect(manifest.importedRecords).toBe(15);
    expect(manifest.sourceNames).toEqual(["FishBase"]);
    expect(manifest.category).toBe("channa");
  });

  it("keeps web and native routes on the same aquarium destination", () => {
    expect(read("client/src/pages/Search.tsx")).toContain("/aquarium-fish/${id}");
    expect(read("client/src/App.tsx")).toContain('path={"/aquarium-fish/:id"}');
    expect(read("mobile-natur/App.tsx")).toContain('navigate("aquariumTaxon")');
    expect(read("mobile-natur/src/api.ts")).toContain('"search.aquariumById"');
  });
});
