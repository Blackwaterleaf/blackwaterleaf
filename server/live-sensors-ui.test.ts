import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const home = readFileSync(resolve(root, "client/src/pages/Home.tsx"), "utf8");
const sensorStrip = readFileSync(resolve(root, "client/src/components/LiveSensorStrip.tsx"), "utf8");
const weatherService = readFileSync(resolve(root, "server/weather.ts"), "utf8");

describe("live sensor interface", () => {
  it("uses a dedicated live sensor component rather than hard-coded offline readings", () => {
    expect(home).toContain("<LiveSensorStrip");
    expect(home).toContain("weather-effect--${weatherEffect}");
    expect(home).not.toContain('value={t("common.offline")}');
  });

  it("requests browser location only after a deliberate user action", () => {
    expect(sensorStrip).toContain("navigator.geolocation.getCurrentPosition");
    expect(sensorStrip).toContain("onClick={requestLocation}");
    expect(sensorStrip).toContain("not stored");
    expect(sensorStrip).toContain("enabled: auth.isAuthenticated");
  });

  it("uses private aquarium values for water temperature and pH", () => {
    expect(sensorStrip).toContain('item.kind === "aquarium"');
    expect(sensorStrip).toContain("details.temperatureC");
    expect(sensorStrip).toContain("details.ph");
  });

  it("does not persist precise browser coordinates in the server weather service", () => {
    expect(weatherService).toContain("never written to the application database");
    expect(weatherService).not.toContain("insert(");
    expect(weatherService).not.toContain("update(");
  });
});
