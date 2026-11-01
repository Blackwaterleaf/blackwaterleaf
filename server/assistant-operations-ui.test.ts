import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const speciesPage = readFileSync(
  resolve(root, "client/src/pages/SpeciesIdentification.tsx"),
  "utf8"
);
const app = readFileSync(resolve(root, "client/src/App.tsx"), "utf8");
const assistantRouter = readFileSync(
  resolve(root, "server/routers/assistant.ts"),
  "utf8"
);

describe("canonical species-identification interface", () => {
  it("mounts the new species-identification experience at the canonical KI route", () => {
    expect(app).toMatch(
      /path=\{"\/assistant"\}\s+component=\{SpeciesIdentification\}/
    );
    expect(app).toMatch(
      /path=\{"\/assistant\/identify"\}\s+component=\{SpeciesIdentification\}/
    );
    expect(app).not.toContain('from "./pages/Assistant"');
    expect(existsSync(resolve(root, "client/src/pages/Assistant.tsx"))).toBe(
      false
    );
  });

  it("uses a real protected species-identification operation rather than a client fixture", () => {
    expect(speciesPage).toContain("trpc.assistant.speciesIdentify.useMutation");
    expect(speciesPage).toContain(
      "trpc.assistant.identificationFeedback.useMutation"
    );
    expect(speciesPage).toContain("trpc.observations.create.useMutation");
    expect(speciesPage).not.toContain("90 % Übereinstimmung");
  });

  it("keeps image identification server-validated and does not persist the image", () => {
    expect(assistantRouter).toContain("validateImageUpload");
    expect(assistantRouter).toContain("speciesIdentify");
    expect(assistantRouter).toContain('type: "image_url"');
  });
});
