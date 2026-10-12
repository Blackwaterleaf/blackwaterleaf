import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const home = readFileSync(resolve(root, "client/src/pages/Home.tsx"), "utf8");
const sensorStrip = readFileSync(resolve(root, "client/src/components/LiveSensorStrip.tsx"), "utf8");
const weatherService = readFileSync(resolve(root, "server/weather.ts"), "utf8");
const style = readFileSync(resolve(root, "client/src/index.css"), "utf8");

describe("live sensor interface", () => {
  it("keeps live sensors as a dedicated component without placing them in the home context header", () => {
    expect(home).not.toContain("<LiveSensorStrip");
    expect(home).toContain("ObservatoryContextHeader");
    expect(home).not.toContain('value={t("common.offline")}');
  });

  it("requests browser location only after a deliberate user action", () => {
    for (const token of ["navigator.geolocation.getCurrentPosition", "onClick={requestLocation}", "not stored", "enabled: auth.isAuthenticated"]) expect(sensorStrip).toContain(token);
  });

  it("uses private aquarium values for water temperature and pH", () => {
    for (const token of ['item.kind === "aquarium"', "details.temperatureC", "details.ph"]) expect(sensorStrip).toContain(token);
  });

  it("keeps the compact sensor rail styled independently of the retired layout system", () => {
    for (const token of ["observatory-sensor-rail", "grid-template-columns: repeat(2, minmax(0, 1fr))", "min-height: 58px", ".sensor-note--action { display: none; }"]) expect(style).toContain(token);
    expect(style).not.toContain("reference-sensor-rail");
  });

  it("does not persist precise browser coordinates in the server weather service", () => {
    expect(weatherService).toContain("never written to the application database");
    expect(weatherService).not.toContain("insert(");
    expect(weatherService).not.toContain("update(");
  });
});
