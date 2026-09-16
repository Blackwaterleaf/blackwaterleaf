import { describe, expect, it } from "vitest";
import { resolveLocale, resolveUnitSystem, translate } from "../client/src/i18n";

describe("BlackWaterLeaf i18n", () => {
  it("prefers a valid stored locale over the browser locale", () => {
    expect(resolveLocale("de", "en-US")).toBe("de");
    expect(resolveLocale("en", "de-DE")).toBe("en");
  });

  it("uses German only for German browser locales and English as global fallback", () => {
    expect(resolveLocale(null, "de-AT")).toBe("de");
    expect(resolveLocale(null, "fr-FR")).toBe("en");
  });

  it("keeps metric as the safe default while honoring a stored imperial choice", () => {
    expect(resolveUnitSystem(null)).toBe("metric");
    expect(resolveUnitSystem("imperial")).toBe("imperial");
  });

  it("provides equivalent German and English core meanings", () => {
    expect(translate("de", "assistant.rule")).toContain("KEINE KI-ANTWORT");
    expect(translate("en", "assistant.rule")).toContain("NO AI RESPONSE");
    expect(translate("de", "community.emptyBody")).toContain("keine Personen");
    expect(translate("en", "community.emptyBody")).toContain("No people");
  });
});
