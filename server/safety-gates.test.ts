import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { P0_SAFETY_GATES, assertSafetyGateAllows, getPublicSafetyGateStatus } from "./safetyGates";

const root = resolve(import.meta.dirname, "..");
const source = (relativePath: string) => readFileSync(resolve(root, relativePath), "utf8");

describe("AP-01 P0 safety gates", () => {
  it("keeps publication and destructive P0 paths fail-closed while media validation is enabled", () => {
    expect(P0_SAFETY_GATES.mediaUpload.active).toBe(false);
    expect(() => assertSafetyGateAllows("mediaUpload")).not.toThrow();
    for (const gate of ["publicPublication", "marketplaceActivation", "accountErasure", "databaseMigration"] as const) {
      expect(() => assertSafetyGateAllows(gate)).toThrow(P0_SAFETY_GATES[gate].messageKey);
    }
  });

  it("returns safe maintenance information", () => {
    expect(getPublicSafetyGateStatus()).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "mediaUpload", active: false, packageId: "AP-03/AP-04" }),
      expect.objectContaining({ id: "databaseMigration", active: true, packageId: "AP-06" }),
    ]));
  });

  it("guards all current high-risk server actions", () => {
    expect(source("server/routers/community.ts")).toContain('assertSafetyGateAllows("publicPublication")');
    expect(source("server/routers/community.ts")).toContain('assertSafetyGateAllows("mediaUpload")');
    expect(source("server/routers/observations.ts")).toContain('assertSafetyGateAllows("publicPublication")');
    expect(source("server/routers/observations.ts")).toContain('assertSafetyGateAllows("mediaUpload")');
    expect(source("server/routers/habitats.ts")).toContain('assertSafetyGateAllows("mediaUpload")');
    expect(source("server/routers/profile.ts")).toContain('assertSafetyGateAllows("accountErasure")');
    expect(source("server/routers/profile.ts")).toContain('assertSafetyGateAllows("mediaUpload")');
    expect(source("server/routers/partners.ts")).toContain('assertSafetyGateAllows("marketplaceActivation")');
    expect(source("server/routers/partners.ts")).toContain('assertSafetyGateAllows("mediaUpload")');
    expect(source("scripts/guard-db-push.mjs")).toContain("AP-06");
  });
});

describe("AP-02 data inventory", () => {
  it("documents all current data domains and protection classes", () => {
    const inventory = source("docs/BLACKWATERLEAF_DATA_INVENTORY_2026-09-19.md");
    for (const required of ["users", "local_credentials", "observations", "media_assets", "community_posts", "moderation_logs", "assistant_usage", "plant_taxa", "aquarium_taxa", "partner_profiles"]) {
      expect(inventory).toContain(required);
    }
    expect(inventory).toContain("Drittübermittlungen");
    expect(inventory).toContain("Keine exakten Standorte");
  });
});
