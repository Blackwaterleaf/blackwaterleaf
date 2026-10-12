import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("legal provider details", () => {
  it("publishes the configured operator name and address", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/Legal.tsx"), "utf8");
    expect(source).toContain("Tim Höfges");
    expect(source).toContain("Bönninghardtstraße 94");
    expect(source).toContain("46519 Bönninghardt");
    expect(source).toContain("BlackWaterLeaf Organisation of Loyalty");
  });

  it("links the supplied official Instagram and TikTok profiles", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/Legal.tsx"), "utf8");
    for (const token of ["https://www.instagram.com/blackwaterleaf/", "https://www.instagram.com/house.of.channa/", "https://www.tiktok.com/@blackwaterleaf", "https://www.tiktok.com/@channaworldone", "Offizielle Profile"]) expect(source).toContain(token);
  });
});
