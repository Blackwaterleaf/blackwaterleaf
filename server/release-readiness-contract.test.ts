import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const server = readFileSync(resolve(root, "server/_core/index.ts"), "utf8");
const eas = readFileSync(resolve(root, "mobile-natur/eas.json"), "utf8");
const app = readFileSync(resolve(root, "mobile-natur/app.json"), "utf8");
const docs = readFileSync(resolve(root, "docs/BLACKWATERLEAF_RELEASE_READINESS_2026-09-19.md"), "utf8");

describe("AP-20 release readiness", () => {
  it("separates liveness from bounded readiness without leaking secrets", () => {
    expect(server).toContain('app.get("/livez"');
    expect(server).toContain('app.get("/readyz"');
    expect(server).toContain("readiness_timeout");
    expect(server).toContain("mediaStorage");
    expect(server).not.toContain("process.env.DATABASE_URL");
    expect(server).not.toContain("BUILT_IN_FORGE_API_KEY });");
  });

  it("defines development, staging, preview and production Expo channels", () => {
    for (const profile of ["development", "staging", "preview", "production"]) expect(eas).toContain(`"${profile}"`);
    for (const channel of ["development", "staging", "production"]) expect(eas).toContain(`"channel": "${channel}"`);
    expect(app).toContain('"runtimeVersion": { "policy": "appVersion" }');
    expect(app).toContain("https://u.expo.dev/40ef1859-d5f9-484d-89e9-046333b708f4");
  });

  it("documents the required manual promotion and rollback evidence honestly", () => {
    expect(docs).toContain("eas update:rollback");
    expect(docs).toContain("nicht als erledigt behauptet");
    expect(docs).toContain("Nutzerkonten");
  });
});
