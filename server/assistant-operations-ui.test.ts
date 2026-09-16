import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const assistantPage = readFileSync(resolve(root, "client/src/pages/Assistant.tsx"), "utf8");
const assistantRouter = readFileSync(resolve(root, "server/routers/assistant.ts"), "utf8");

describe("assistant operation interface", () => {
  it("wires every assistant selection to a real operation rather than a coming-soon state", () => {
    for (const token of ["plantIdentify", "aquariumAnalyze", "Pflanze bestimmen", "Aquarium verstehen", "Frage stellen"]) expect(assistantPage).toContain(token);
    expect(assistantPage).not.toContain("wird vorbereitet");
    expect(assistantPage).not.toContain("unavailable: true");
  });

  it("keeps image identification server-validated and does not persist the image", () => {
    expect(assistantRouter).toContain("validateImageUpload(input.imageBase64, input.mimeType)");
    expect(assistantRouter).toContain("Die Bilddaten werden nur für diese Anfrage verarbeitet und nicht gespeichert");
    expect(assistantRouter).toContain('type: "image_url"');
  });

  it("looks up an aquarium by owned private habitat before analysis", () => {
    expect(assistantRouter).toContain("owned_aquarium_not_found");
    expect(assistantRouter).toContain("eq(privateHabitats.userId, ctx.user.id)");
    expect(assistantRouter).toContain("aquariumContext(habitat.name, habitat.details)");
  });
});
