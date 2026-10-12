import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const packageJson = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const verifier = readFileSync(resolve(root, "scripts/verify-migration-baseline.mjs"), "utf8");
const guard = readFileSync(resolve(root, "scripts/guard-db-push.mjs"), "utf8");
const baseline = readFileSync(resolve(root, "docs/BLACKWATERLEAF_MIGRATION_BASELINE_2026-09-19.md"), "utf8");

describe("AP-06 migration baseline", () => {
  it("provides a deterministic baseline verification command", () => {
    expect(packageJson.scripts["db:baseline:verify"]).toBe("node scripts/verify-migration-baseline.mjs");
    expect(verifier).toContain("0037_woozy_inertia");
    expect(verifier).toContain("migration_baseline_hash_mismatch");
  });

  it("keeps global db push fail-closed until restore evidence exists", () => {
    expect(guard).toContain("BLOCKED");
    expect(baseline).toContain("kein Backup erstellt");
    expect(baseline).toContain("keine Datenbank wiederhergestellt");
  });
});
