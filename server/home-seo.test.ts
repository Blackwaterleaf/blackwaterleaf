import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { HOME_SEO_KEYWORDS, HOME_SEO_TITLES } from "../client/src/lib/seo";

const projectRoot = resolve(import.meta.dirname, "..");
const indexHtml = readFileSync(resolve(projectRoot, "client/index.html"), "utf8");
const homePage = readFileSync(resolve(projectRoot, "client/src/pages/Home.tsx"), "utf8");
const appShell = readFileSync(resolve(projectRoot, "client/src/components/AppShell.tsx"), "utf8");

describe("Startseite: SEO- und Zugänglichkeitsgrundlagen", () => {
  it("enthält zwischen drei und acht fokussierten Meta-Keywords", () => {
    const keywordTag = indexHtml.match(/<meta name="keywords" content="([^"]+)"\s*\/>/);
    expect(keywordTag?.[1].split(",").map(keyword => keyword.trim()).filter(Boolean)).toEqual([...HOME_SEO_KEYWORDS]);
    expect(HOME_SEO_KEYWORDS).toHaveLength(5);
  });

  it("setzt den Startseitentitel per document.title innerhalb der Zeichenobergrenze", () => {
    expect(homePage).toContain("document.title = pageTitle");
    Object.values(HOME_SEO_TITLES).forEach(title => expect(Array.from(title).length).toBeGreaterThanOrEqual(30));
    Object.values(HOME_SEO_TITLES).forEach(title => expect(Array.from(title).length).toBeLessThanOrEqual(60));
  });

  it("gibt den drei Bildportalen eindeutige sichtbare Fachbezeichnungen und Beschreibungen", () => {
    expect(homePage).toContain('aria-label={locale === "de" ? "BlackWaterLeaf Portale"');
    for (const token of ["Botanik", "Aquaristik", "Terraristik", "Wasserpflanzen & Wissen", "Fische & Wirbellose", "Terrarien & Lebensräume"]) expect(homePage).toContain(token);
    expect(homePage).toContain("home-portal-row");
  });

  it("gibt dem einzigen Startseiten-Logo einen beschreibenden Alternativtext", () => {
    expect(appShell).toContain('alt="BlackWaterLeaf Logo"');
  });
});
