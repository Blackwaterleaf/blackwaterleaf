import { describe, expect, it } from "vitest";
import { FREE_FEATURES, PRO_FEATURES, PRO_MONTHLY_PRICE_EUR, PRO_YEARLY_PRICE_EUR } from "@shared/monetization";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Free / Pro monetization contract", () => {
  it("keeps the approved price points and core Pro value", () => {
    expect(PRO_MONTHLY_PRICE_EUR).toBe(4.99);
    expect(PRO_YEARLY_PRICE_EUR).toBe(39.99);
    for (const key of ["unlimited_habitats", "care_history", "advanced_charts", "ai_allowance", "secure_export"]) {
      expect(PRO_FEATURES.some(feature => feature.key === key)).toBe(true);
    }
  });

  it("keeps discovery and community free", () => {
    expect(FREE_FEATURES.join(" ")).toMatch(/Katalog|Community|Karte/);
    const proPage = readFileSync(resolve(process.cwd(), "client/src/pages/Pro.tsx"), "utf8");
    expect(proPage).toContain("COMMUNITY BLEIBT KOSTENLOS");
    expect(proPage).toContain("PRO WIRD VORBEREITET");
  });
});
