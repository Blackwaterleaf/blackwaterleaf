import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const assistant = readFileSync(resolve(root, "server/routers/assistant.ts"), "utf8");
const plantnet = readFileSync(resolve(root, "server/plantnet.ts"), "utf8");
const schema = readFileSync(resolve(root, "drizzle/schema.ts"), "utf8");
const api = readFileSync(resolve(root, "mobile-natur/src/api.ts"), "utf8");
const admin = readFileSync(resolve(root, "server/routers/admin.ts"), "utf8");

describe("AP-18 KI-Evidenz und Kostenwahrheit", () => {
  it("uses one structured result contract and never requests a four-image grid", () => {
    expect(assistant).toContain('responseFormat: { type: "json_schema"');
    expect(assistant).toContain("additionalImages");
    expect(assistant).toContain("images.length < 3");
    expect(assistant).toContain("niemals nach einem 4er-Raster");
    expect(api).toContain("additionalImages");
  });

  it("keeps accepted individual views inside the IONOS-only provider boundary", () => {
    expect(assistant).toContain("validateWithPlantNetImages");
    expect(assistant).toContain('organ: "auto"');
    expect(plantnet).toContain("IONOS-only policy");
    expect(plantnet).not.toContain("fetch(");
    expect(plantnet).toContain("engineVersion");
    expect(plantnet).toContain("referential");
  });

  it("records measured usage and explicit request outcomes without prompt or image contents", () => {
    for (const field of ["promptTokens", "completionTokens", "totalTokens", "requestOutcome", "tariffVersion", "plantnetEngineVersion"]) {
      expect(schema).toContain(`${field}:`);
    }
    expect(assistant).toContain("response.usage");
    expect(assistant).toContain('requestOutcome: "completed"');
    expect(schema).not.toContain("rawPrompt");
    expect(schema).not.toContain("imageBase64");
  });

  it("keeps corrections reviewable and notifies staff and the submitting user", () => {
    expect(assistant).toContain('type: "moderation"');
    expect(assistant).toContain("Neue Pflanzenkorrektur");
    expect(admin).toContain("reviewPlantCorrection");
    expect(admin).toContain("Deine Pflanzenkorrektur");
    expect(admin).toContain("ai_identification_correction_reviewed");
  });
});
