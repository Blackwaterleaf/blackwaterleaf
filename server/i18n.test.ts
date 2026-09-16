import { describe, expect, it } from "vitest";
import { habitatText, resolveAccountLocale, resolveLocale, resolveUnitSystem, translate } from "../client/src/i18n";

describe("BlackWaterLeaf i18n", () => {
  it("prefers a valid stored locale over the browser locale", () => {
    expect(resolveLocale("de", "en-US")).toBe("de");
    expect(resolveLocale("en", "de-DE")).toBe("en");
  });

  it("uses German as the primary default independent of the browser locale", () => {
    expect(resolveLocale(null, "de-AT")).toBe("de");
    expect(resolveLocale(null, "fr-FR")).toBe("de");
    expect(resolveLocale(null, "en-US")).toBe("de");
  });

  it("gives the verified server-side account locale priority after sign-in", () => {
    expect(resolveAccountLocale("en", "de")).toBe("de");
    expect(resolveAccountLocale("de", "en")).toBe("en");
    expect(resolveAccountLocale("de", null)).toBe("de");
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

  it("localizes private habitats consistently without weakening their privacy notice", () => {
    expect(habitatText("de").sectionTitle).toBe("Meine Anlagen & Werte");
    expect(habitatText("en").sectionTitle).toBe("My habitats & values");
    expect(habitatText("de").intro).toContain("öffentlichen Profil");
    expect(habitatText("en").intro).toContain("public profile");
    expect(habitatText("de").noValues).toBe("Noch keine Werte hinterlegt");
    expect(habitatText("en").noValues).toBe("No values recorded yet");
  });
});
