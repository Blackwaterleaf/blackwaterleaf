import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { formatCatalogReferences } from "./routers/assistant";

const root = resolve(import.meta.dirname, "..");
const assistant = readFileSync(resolve(root, "server/routers/assistant.ts"), "utf8");

describe("assistant catalog retrieval", () => {
  it("formats only source-bound taxon references and keeps an explicit no-match state", () => {
    expect(formatCatalogReferences([])).toBe("Kein exakter, veröffentlichter Katalogeintrag wurde zu dieser Anfrage gefunden.");
    expect(formatCatalogReferences([{
      scientificName: "Anthurium clarinervium",
      acceptedScientificName: "Anthurium clarinervium",
      family: "Araceae",
      source: "GBIF",
      sourceRecordUrl: "https://www.gbif.org/species/2872501",
      sourceCitation: "GBIF Backbone Taxonomy, DOI: 10.15468/39omei",
      taxonomicStatus: "accepted",
      matchConfidence: 100,
    }])).toContain("Anthurium clarinervium (Araceae)");
    expect(formatCatalogReferences([{
      scientificName: "Anthurium clarinervium",
      acceptedScientificName: "Anthurium clarinervium",
      family: "Araceae",
      source: "GBIF",
      sourceRecordUrl: "https://www.gbif.org/species/2872501",
      sourceCitation: "GBIF Backbone Taxonomy, DOI: 10.15468/39omei",
      taxonomicStatus: "accepted",
      matchConfidence: 100,
    }])).toContain("Fachquelle: https://www.gbif.org/species/2872501");
  });

  it("adds retrieved catalog evidence to chat and image-identification outputs without treating it as a diagnosis", () => {
    expect(assistant).toContain("catalogContextForQuery(reservation.db, input.message)");
    expect(assistant).toContain("catalogReferencesForCandidates(reservation.db, result.candidates)");
    expect(assistant).toContain("**BlackWaterLeaf-Katalogabgleich**");
    expect(assistant).toContain("nutze sie nur als Abgleich und behaupte keine darüber hinausgehenden Details");
  });
});
