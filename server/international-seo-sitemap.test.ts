import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { HOME_SEO_TITLES, SEO_LOCALES } from "../client/src/lib/seo";

const publicRoot = resolve(import.meta.dirname, "../client/public");

describe("International SEO and sitemap coverage", () => {
  it("publishes one sitemap for every supported locale", () => {
    const index = readFileSync(resolve(publicRoot, "sitemap.xml"), "utf8");
    for (const locale of SEO_LOCALES) {
      expect(index).toContain(`sitemap-${locale}.xml`);
      const sitemap = readFileSync(resolve(publicRoot, `sitemap-${locale}.xml`), "utf8");
      expect(sitemap).toContain(`?lang=${locale}`);
      expect(sitemap).toContain("<lastmod>2026-09-27</lastmod>");
    }
  });

  it("keeps localized home titles within the established search-title range", () => {
    expect(Object.keys(HOME_SEO_TITLES)).toHaveLength(SEO_LOCALES.length);
    for (const title of Object.values(HOME_SEO_TITLES)) {
      expect(Array.from(title).length).toBeGreaterThanOrEqual(30);
      expect(Array.from(title).length).toBeLessThanOrEqual(60);
    }
  });
});
