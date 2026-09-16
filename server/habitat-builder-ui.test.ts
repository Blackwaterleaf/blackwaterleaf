import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const app = readFileSync(resolve(root, "client/src/App.tsx"), "utf8");
const profile = readFileSync(resolve(root, "client/src/pages/Profile.tsx"), "utf8");
const builder = readFileSync(resolve(root, "client/src/pages/HabitatBuilder.tsx"), "utf8");
const canvas = readFileSync(resolve(root, "client/src/components/HabitatCanvas.tsx"), "utf8");

 describe("Habitat Builder app integration", () => {
  it("keeps the builder as an explicit authenticated application route", () => {
    expect(app).toContain('path={"/habitat-builder"}');
    expect(builder).toContain("if (!auth.isAuthenticated)");
    expect(builder).toContain("SICHER ANMELDEN");
  });

  it("bases planning on private habitat records and makes local persistence explicit", () => {
    expect(builder).toContain("trpc.habitats.mine.useQuery");
    expect(builder).toContain("private Grundlage");
    expect(builder).toContain("Entwurf auf diesem Gerät gespeichert");
    expect(builder).toContain("Planungsentwurf ohne Haltungs-, Diagnose-, Kauf-, Statik- oder Elektrofreigabe");
  });

  it("provides an actual placement workflow with inspector controls instead of rotation-only viewing", () => {
    for (const token of ["activateTool", "placeElement", "PlacementInspector", "updateSelectedPlacement", "Marker entfernen", "PLATZIERMODUS"]) {
      expect(builder).toContain(token);
    }
    for (const token of ["EditableFloor", "onPlace", "enableRotate={!props.placementTool}", "PlacementShape"]) {
      expect(canvas).toContain(token);
    }
  });

  it("uses a fallback reference scene without invoking Tripo or pretending PBR assets exist", () => {
    expect(canvas).toContain("ReferenceBackdrop");
    expect(canvas).toContain("habitat-canvas-fallback");
    expect(canvas).not.toContain("meshPhysicalMaterial");
    expect(builder).toContain("ABSTRAKTE PLANUNGSMARKER");
    expect(builder).not.toMatch(/tripo|text-to-model|image-to-model/i);
  });

  it("provides an account-area entry point", () => {
    expect(profile).toContain('href="/habitat-builder"');
  });
});
