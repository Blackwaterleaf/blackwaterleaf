import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("combined plant identification flow", () => {
  it("keeps the current assistant flow and adds the independent PlantNet validation", () => {
    const router = read("./routers/assistant.ts");
    const adapter = read("./plantnet.ts");
    const page = read("../client/src/pages/Assistant.tsx");
    expect(router).toContain('from "../plantnet"');
    expect(router).toContain("validateWithPlantNet");
    expect(router).toContain("plantNetValidation");
    expect(adapter).toContain("PLANTNET_API_KEY");
    expect(adapter).toContain("my-api.plantnet.org/v2/identify/all");
    expect(page).toContain("const AI_MAINTENANCE = false");
  });
});
