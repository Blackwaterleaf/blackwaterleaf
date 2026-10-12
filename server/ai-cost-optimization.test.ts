import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const source = (file: string) => readFileSync(resolve(root, file), "utf8");

const assistant = source("server/routers/assistant.ts");
const admin = source("server/routers/admin.ts");
const gamification = source("server/gamification.ts");
const schema = source("drizzle/schema.ts");
const migration = source("drizzle/0061_spooky_centennial.sql");
const webAdmin = source("client/src/pages/AdminDashboard.tsx");
const webRanking = source("client/src/pages/Ranking.tsx");
const nativeRanking = source("mobile-natur/App.tsx");

describe("AI cost optimization and verified learning", () => {
  it("uses a no-model path for exact, source-bound catalogue facts", () => {
    for (const token of [
      "queryMentionsScientificName",
      "requestsCatalogFacts",
      "formatCatalogFastPath",
      'model: "catalog-fast-path"',
      'provider: "catalog-local"',
      "estimatedTotalCostUsd: \"0.00000000\"",
    ]) expect(assistant).toContain(token);
  });

  it("keeps a plant image request to one bounded IONOS model call", () => {
    expect(assistant).toContain("const PLANT_TRIAGE_MAX_TOKENS = 800");
    expect(assistant).toContain("eine zweite Modellanfrage auszulösen");
    expect(assistant).not.toContain("PLANT_ESCALATION_MODEL");
    expect(assistant).not.toContain("plantResultNeedsEscalation");
  });

  it("stores only measured IONOS token costs and never fabricates historical costs", () => {
    for (const token of ["estimatedInputCostUsd", "estimatedOutputCostUsd", "estimatedTotalCostUsd", "costCurrency"]) {
      expect(schema).toContain(token);
      expect(migration).toContain(token);
    }
    expect(assistant).toContain("measuredIonosCost");
    expect(assistant).toContain("IONOS_QWEN_35_9B_INPUT_USD_PER_MILLION = 0.11");
    expect(assistant).toContain("IONOS_QWEN_35_9B_OUTPUT_USD_PER_MILLION = 0.17");
    expect(admin).toContain("measuredRequests");
    expect(admin).toContain("estimatedTotalUsd");
    expect(webAdmin).toContain("Kostenbasis für Tarife");
  });

  it("turns only staff-approved corrections into verifiable quality achievements", () => {
    expect(admin).toContain('if (input.status === "approved")');
    expect(admin).toContain("verified-plant-correction");
    expect(gamification).toContain("verifiedPlantCorrections");
    expect(gamification).toContain("qualityAchievements");
    expect(webRanking).toContain("QUALITÄTS-ACHIEVEMENTS");
    expect(nativeRanking).toContain("QUALITÄTS-ACHIEVEMENTS");
  });
});
