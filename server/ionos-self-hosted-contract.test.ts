import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const env = readFileSync(resolve(root, "server/_core/env.ts"), "utf8");
const llm = readFileSync(resolve(root, "server/_core/llm.ts"), "utf8");
const storage = readFileSync(resolve(root, "server/storage.ts"), "utf8");
const server = readFileSync(resolve(root, "server/_core/index.ts"), "utf8");
const platform = readFileSync(resolve(root, "server/routers/platform.ts"), "utf8");
const runtime = readFileSync(resolve(root, "deploy/ionos/production.env.names"), "utf8");

describe("IONOS-only self-hosted production contract", () => {
  it("prefers the split IONOS secret and routes all LLM calls to the IONOS endpoint", () => {
    expect(env).toContain("IONOS_AI_API_KEY_PART_1");
    expect(env).toContain("IONOS_AI_API_KEY_PART_4");
    expect(env).toContain("ionosApiKeyFromParts || process.env.IONOS_AI_API_KEY");
    expect(llm).toContain("const usingIonos = () => true");
    expect(llm).toContain("/v1/chat/completions");
    expect(llm).toContain("authorization: `Bearer ${usingIonos() ? ENV.ionosApiKey");
  });

  it("does not use Manus storage when self-hosted mode is active", () => {
    expect(storage).toContain("if (ENV.selfHostedAuthOnly)");
    expect(storage).toContain("set BWL_STORAGE_ROOT");
    expect(platform).toContain("process.env.BWL_STORAGE_ROOT");
    expect(server).toContain('const mediaStorage = ENV.storageRoot ? "ready" : "not_ready"');
    expect(server).toContain('const ai = ENV.ionosApiKey && ENV.ionosModel ? "ionos_configured" : "not_ready"');
  });

  it("ships the production runtime contract without the deprecated single key", () => {
    expect(runtime).toContain("AI_PROVIDER=ionos");
    expect(runtime).toContain("IONOS_AI_API_KEY_PART_1");
    expect(runtime).toContain("IONOS_AI_API_KEY_PART_4");
    expect(runtime).not.toContain("IONOS_AI_API_KEY=<ionos-ai-key>");
    expect(runtime).toContain("/etc/blackwaterleaf/production.conf");
  });
});
