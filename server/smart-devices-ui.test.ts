import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const profile = readFileSync(resolve(root, "client/src/pages/Profile.tsx"), "utf8");
const dialog = readFileSync(resolve(root, "client/src/components/SmartDeviceDialog.tsx"), "utf8");

describe("smart device selection interface", () => {
  it("places the dialog in the signed-in private profile area", () => {
    expect(profile).toContain("<SmartDeviceDialog />");
    expect(profile).toContain("Smart-Werte verbinden");
  });

  it("offers device classes and water metrics without claiming immediate connection", () => {
    for (const token of ["Home Assistant", "Aquarium-Controller", "Wasser-Messgerät", "Zigbee / Matter", "Wassertemperatur", "pH-Wert"]) {
      expect(dialog).toContain(token);
    }
    expect(dialog).toContain("Noch nicht verbunden.");
    expect(dialog).toContain("Herstellerfreigabe");
  });

  it("does not collect secrets and supports deleting a private selection", () => {
    expect(dialog).not.toContain("API-Schlüssel");
    expect(dialog).not.toContain("Passwort");
    expect(dialog).toContain("smartDevices.remove");
    expect(dialog).toContain("Geräteauswahl entfernen");
  });
});
