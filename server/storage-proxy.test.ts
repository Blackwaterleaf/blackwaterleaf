import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(import.meta.dirname, "_core/storageProxy.ts"), "utf8");

describe("AP-03 object-authorized storage proxy", () => {
  it("allows only the immutable Observatory design allowlist", () => {
    expect(source).toContain("PUBLIC_DESIGN_ASSETS");
    expect(source).toContain("Object authorization required");
    expect(source).toContain("blackwaterleaf-original-mark-1024_28dcd697.png");
  });

  it("does not proxy arbitrary dynamic user storage keys", () => {
    expect(source).toContain("if (!PUBLIC_DESIGN_ASSETS.has(key))");
    expect(source).not.toContain("res.redirect(307, key)");
  });
});
