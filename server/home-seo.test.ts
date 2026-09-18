import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { HOME_SEO_KEYWORDS, HOME_SEO_TITLES, HOME_WORLD_IMAGE_ALTS } from "../client/src/lib/seo";

const projectRoot = resolve(import.meta.dirname, "..");
const indexHtml = readFileSync(resolve(projectRoot, "client/index.html"), "utf8");
const homePage = readFileSync(resolve(projectRoot, "client/src/pages/Home.tsx"), "utf8");

describe("Startseite: SEO-Grundlagen", () => {
  it("enthält zwischen drei und acht fokussierten Meta-Keywords", () => {
    const keywordTag = indexHtml.match(/<meta name="keywords" content="([^"]+)"\s*\/>/);

    expect(keywordTag?.[1].split(",").map(keyword => keyword.trim()).filter(Boolean)).toEqual([...HOME_SEO_KEYWORDS]);
    expect(HOME_SEO_KEYWORDS).toHaveLength(5);
    expect(HOME_SEO_KEYWORDS.length).toBeGreaterThanOrEqual(3);
    expect(HOME_SEO_KEYWORDS.length).toBeLessThanOrEqual(8);
  });

  it("setzt den Startseitentitel per document.title innerhalb der Zeichenobergrenze", () => {
    expect(homePage).toContain("document.title = pageTitle");

    Object.values(HOME_SEO_TITLES).forEach(title => {
      expect(Array.from(title).length).toBeGreaterThanOrEqual(30);
      expect(Array.from(title).length).toBeLessThanOrEqual(60);
    });
  });

  it("liefert vier eindeutige, nichtleere Alt-Texte an die Startseitenweltkarten", () => {
    expect(homePage).toContain("imageAlt={HOME_WORLD_IMAGE_ALTS[locale][world.realm]}");

    for (const locale of Object.values(HOME_WORLD_IMAGE_ALTS)) {
      const altTexts = Object.values(locale);
      expect(altTexts).toHaveLength(4);
      expect(new Set(altTexts).size).toBe(4);
      altTexts.forEach(alt => expect(alt.trim().length).toBeGreaterThan(0));
    }
  });
});
