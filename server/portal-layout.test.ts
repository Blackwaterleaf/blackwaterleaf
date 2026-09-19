import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const read = (relativePath: string) => readFileSync(path.resolve(process.cwd(), relativePath), "utf8");

describe("Observatory portal layout contract", () => {
  it("marks every routed page with the shared portal content frame", () => {
    const shell = read("client/src/components/AppShell.tsx");
    expect(shell).toContain("portal-route-content");
  });

  it("defines shared portal styling for legacy route surfaces", () => {
    const css = read("client/src/index.css");
    expect(css).toContain("/* Observatory Portal V2");
    expect(css).toContain(".portal-route-content .reference-page");
    expect(css).toContain(".portal-route-content .glass-panel");
    expect(css).toContain(".portal-route-content .form-grid");
    expect(css).toContain("@media (min-width: 980px)");
  });

  it("keeps the seven core product surfaces represented in the source", () => {
    const routes = read("client/src/App.tsx");
    for (const route of ["/community", "/assistant", "/marketplace", "/profile", "/search", "/botanik", "/aquaristik"]) {
      expect(routes).toContain(route);
    }
  });
});
