import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const realm = readFileSync(resolve(root, "client/src/pages/Realm.tsx"), "utf8");
const router = readFileSync(resolve(root, "server/routers/search.ts"), "utf8");
const css = readFileSync(resolve(root, "client/src/index.css"), "utf8");

describe("AP-21 shared realm map and catalogue surface", () => {
  it("uses the same public observation and catalogue contracts in every realm", () => {
    expect(realm).toContain("trpc.observations.publicFeed.useQuery");
    expect(realm).toContain("trpc.search.catalogByRealm.useQuery");
    expect(realm).toContain("KARTE &amp; LISTE");
    expect(realm).toContain("realm-observation-surface--${realm.tone}");
    expect(router).toContain("catalogByRealm: publicProcedure");
    expect(router).toContain('if (input.realm === "terrarium") return []');
  });

  it("does not invent geolocation pins and exposes protected-location wording", () => {
    expect(realm).toContain("Geschützte Orte · genaue Positionen bleiben privat");
    expect(realm).not.toContain("observatory-map-pin--one");
    expect(css).toContain("realm-map-panel");
  });

  it("keeps the three realm accents inside the approved palette", () => {
    expect(css).toContain("--realm-accent:#b9fb7f");
    expect(css).toContain("--realm-accent:#40d9ff");
    expect(css).toContain("--realm-accent:#e7b969");
    expect(css).not.toContain("--realm-accent:#bf8fff");
  });
});
