export const DISALLOWED_CATALOG_SOURCE_PATTERN = /(?:wikimedia|wikipedia|commons\.wikimedia|upload\.wikimedia)/i;

export type OfficialTaxonSource = {
  id: "powo" | "fishbase" | "gbif" | "bhl" | "jstor-plants";
  aliases: readonly string[];
  label: string;
  homepageUrl: string;
  approvedHosts: readonly string[];
};

export const OFFICIAL_TAXON_SOURCES: readonly OfficialTaxonSource[] = [
  {
    id: "powo",
    aliases: ["powo", "plants of the world online", "kew"],
    label: "Plants of the World Online · Kew Science",
    homepageUrl: "https://powo.science.kew.org/",
    approvedHosts: ["powo.science.kew.org"],
  },
  {
    id: "fishbase",
    aliases: ["fishbase"],
    label: "FishBase",
    homepageUrl: "https://www.fishbase.se/",
    approvedHosts: ["fishbase.se", "www.fishbase.se"],
  },
  {
    id: "gbif",
    aliases: ["gbif", "global biodiversity information facility"],
    label: "Global Biodiversity Information Facility",
    homepageUrl: "https://www.gbif.org/",
    approvedHosts: ["gbif.org", "www.gbif.org"],
  },
  {
    id: "bhl",
    aliases: ["bhl", "biodiversity heritage library"],
    label: "Biodiversity Heritage Library",
    homepageUrl: "https://www.biodiversitylibrary.org/",
    approvedHosts: ["biodiversitylibrary.org", "www.biodiversitylibrary.org"],
  },
  {
    id: "jstor-plants",
    aliases: ["jstor plants", "plants.jstor"],
    label: "JSTOR Global Plants",
    homepageUrl: "https://plants.jstor.org/",
    approvedHosts: ["plants.jstor.org"],
  },
] as const;

export function officialTaxonSource(source: string | null | undefined): OfficialTaxonSource | null {
  const normalized = source?.trim().toLowerCase();
  if (!normalized) return null;
  return OFFICIAL_TAXON_SOURCES.find(entry => entry.aliases.includes(normalized)) ?? null;
}

export function isDisallowedCatalogSource(value: string | null | undefined): boolean {
  return typeof value === "string" && DISALLOWED_CATALOG_SOURCE_PATTERN.test(value);
}

export function isOfficialTaxonSourceUrl(value: string | null | undefined): boolean {
  if (!value) return false;
  try {
    const hostname = new URL(value).hostname.toLowerCase();
    return OFFICIAL_TAXON_SOURCES.some(source => source.approvedHosts.includes(hostname));
  } catch {
    return false;
  }
}

export function belongsToOfficialSource(source: string, value: string | null | undefined): boolean {
  const configuredSource = officialTaxonSource(source);
  if (!configuredSource || !value) return false;
  try {
    return configuredSource.approvedHosts.includes(new URL(value).hostname.toLowerCase());
  } catch {
    return false;
  }
}
