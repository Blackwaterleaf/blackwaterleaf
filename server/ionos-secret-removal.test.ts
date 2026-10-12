import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ENV } from "./_core/env";

describe("IONOS secret removal", () => {
  it("uses the configured IONOS secret without a Manus fallback", () => {
    const llm = readFileSync(resolve(import.meta.dirname, "_core/llm.ts"), "utf8");
    expect(ENV.aiProvider).toBe("ionos");
    expect(ENV.ionosApiKey.length).toBeGreaterThan(100);
    expect(llm).toContain("const usingIonos = () => true");
    expect(llm).toContain("IONOS_AI_API_KEY is not configured");
  });
});
