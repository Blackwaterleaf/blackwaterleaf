import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const webTaxonAction = readFileSync(resolve(root, "client/src/components/TaxonHabitatAction.tsx"), "utf8");
const webProfile = readFileSync(resolve(root, "client/src/pages/Profile.tsx"), "utf8");
const webHabitats = readFileSync(resolve(root, "client/src/components/HabitatProfiles.tsx"), "utf8");
const nativeApp = readFileSync(resolve(root, "mobile-natur/App.tsx"), "utf8");
const nativeHabitats = readFileSync(resolve(root, "mobile-natur/src/HabitatManager.tsx"), "utf8");

describe("catalog to private habitat bridge", () => {
  it("keeps the action authenticated and private on Web", () => {
    expect(webTaxonAction).toContain("auth.isAuthenticated");
    expect(webTaxonAction).toContain("/profile/habitats?");
    expect(webProfile).toContain("prefillName");
    expect(webHabitats).toContain("Katalogdaten übernommen");
  });

  it("uses the same prefill contract on Native", () => {
    expect(nativeApp).toContain("openCollectionFromTaxon");
    expect(nativeApp).toContain("prefill={prefill}");
    expect(nativeHabitats).toContain("setScientificName(prefill.scientificName ?? \"\")");
    expect(nativeApp).toContain("IN ANLAGE ÜBERNEHMEN");
  });
});
