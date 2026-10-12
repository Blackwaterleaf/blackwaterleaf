import { describe, expect, it } from "vitest";
import { ENV } from "./_core/env";
import { listLLMModels } from "./_core/llm";

describe("IONOS AI Model Hub readiness", () => {
  it("authenticates with the configured IONOS token via the models endpoint", async () => {
    expect(ENV.aiProvider).toBe("ionos");
    expect(ENV.ionosApiKey).toBeTruthy();
    expect(ENV.ionosApiUrl).toMatch(/^https:\/\//);
    expect(ENV.ionosModel).toBeTruthy();

    const response = await listLLMModels();

    expect(response.object).toBe("list");
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBeGreaterThan(0);
    expect(response.data.some(model => model.id === ENV.ionosModel)).toBe(true);
  }, 30_000);
});
