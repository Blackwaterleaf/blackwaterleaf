import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const read = (relativePath: string) => readFileSync(path.resolve(process.cwd(), relativePath), "utf8");

describe("Observatory portal layout contract", () => {
  it("marks every routed page with the shared portal content frame", () => {
    expect(read("client/src/components/AppShell.tsx")).toContain("portal-route-content");
  });

  it("defines the shared Observatory route, context and panel system", () => {
    const css = read("client/src/index.css");
    for (const token of ["/* Observatory Portal V2", ".observatory-route", ".observatory-context-header", ".observatory-data-panel", ".observatory-state-surface", "@media (min-width: 980px)"]) expect(css).toContain(token);
    for (const retired of [".reference-page", ".reference-hero", ".reference-action-grid"]) expect(css).not.toContain(retired);
  });

  it("keeps the seven core product surfaces represented in the source", () => {
    const routes = read("client/src/App.tsx");
    for (const route of ["/community", "/assistant", "/marketplace", "/profile", "/search", "/botanik", "/aquaristik"]) expect(routes).toContain(route);
  });
});
