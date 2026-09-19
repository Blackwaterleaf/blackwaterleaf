import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const read = (file: string) => readFileSync(resolve(root, file), "utf8");
const modal = read("client/src/components/TaxonImageModal.tsx");
const plant = read("client/src/pages/PlantTaxon.tsx");
const aquarium = read("client/src/pages/AquariumTaxon.tsx");
const css = read("client/src/index.css");
const native = read("mobile-natur/App.tsx");

describe("catalogue image detail modal", () => {
  it("opens the original stored image through a keyboard-accessible dialog", () => {
    expect(modal).toContain('aria-haspopup="dialog"');
    expect(modal).toContain('role="dialog"');
    expect(modal).toContain('aria-modal="true"');
    expect(modal).toContain('event.key === "Escape"');
    expect(modal).toContain('event.key !== "Tab"');
    expect(modal).toContain('document.body.style.overflow = "hidden"');
  });

  it("keeps source observation, licence, and attribution visible in the expanded view", () => {
    for (const token of ["imageSourceUrl", "imageLicense", "imageAttribution", "Quellbeobachtung öffnen", "Originalbild lokal gespeichert"]) {
      expect(modal).toContain(token);
    }
  });

  it("connects both plant and aquarium records to the shared detail surface", () => {
    expect(plant).toContain('<TaxonImageModal category="Pflanze"');
    expect(aquarium).toContain('<TaxonImageModal category="Fisch"');
    expect(css).toContain('.taxon-image-modal-backdrop');
    expect(css).toContain('.taxon-image-modal__figure>img');
    expect(css).toContain('@media(max-width:640px)');
  });

  it("maintains the same full-image evidence interaction in the native application", () => {
    for (const token of ["function TaxonImageDetail", "<Modal visible={open}", "DETAILANSICHT", "QUELLBEOBACHTUNG ÖFFNEN", "category=\"PFLANZE\"", "category=\"FISCH\""]) {
      expect(native).toContain(token);
    }
  });
});
