import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const queuePath = path.join(root, "data/imports/ap21-official-media-review-queue.json");
const outputPath = path.join(root, "data/imports/ap21-gbif-media-candidates.json");
const API = "https://api.gbif.org/v1";
const MAX_CONCURRENCY = 4;
const REVIEWABLE_LICENSES = new Set([
  "cc0_1_0",
  "cc_by_4_0",
  "cc_by_3_0",
  "https://creativecommons.org/publicdomain/zero/1.0/",
  "https://creativecommons.org/licenses/by/4.0/",
  "https://creativecommons.org/licenses/by/3.0/",
]);

function normalized(value) {
  return String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function isExactTaxon(expected, candidate) {
  return normalized(expected) === normalized(candidate);
}

function reusableLicense(value) {
  return REVIEWABLE_LICENSES.has(normalized(value));
}

function safeHttps(value) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

async function getJson(url) {
  const response = await fetch(url, {
    headers: { "user-agent": "BlackWaterLeaf-AP21-Media-Review/1.0 (+https://blackwaterleaf.com)" },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.json();
}

async function reviewTaxon(record, kind) {
  try {
    const match = await getJson(`${API}/species/match?name=${encodeURIComponent(record.scientificName)}&strict=true`);
    const canonical = match.canonicalName ?? match.scientificName ?? null;
    const exactTaxonMatch = Boolean(match.usageKey && isExactTaxon(record.scientificName, canonical));
    if (!exactTaxonMatch) {
      return {
        ...record,
        kind,
        status: "no_exact_gbif_taxon_match",
        gbif: { usageKey: match.usageKey ?? null, canonicalName: canonical, matchType: match.matchType ?? null },
        candidates: [],
      };
    }

    const response = await getJson(`${API}/occurrence/search?taxon_key=${encodeURIComponent(match.usageKey)}&media_type=StillImage&limit=20`);
    const candidates = [];
    for (const occurrence of response.results ?? []) {
      if (!isExactTaxon(record.scientificName, occurrence.species ?? occurrence.acceptedScientificName)) continue;
      for (const media of occurrence.media ?? []) {
        const directImageUrl = media.identifier ?? null;
        const license = media.license ?? occurrence.license ?? null;
        if (!safeHttps(directImageUrl) || !reusableLicense(license)) continue;
        candidates.push({
          occurrenceKey: occurrence.key,
          occurrenceUrl: `https://www.gbif.org/occurrence/${occurrence.key}`,
          publisher: occurrence.publishingOrgKey ?? occurrence.institutionCode ?? occurrence.datasetName ?? null,
          dataset: occurrence.datasetName ?? null,
          exactTaxonMatch: true,
          directImageUrl,
          mediaTitle: media.title ?? media.description ?? null,
          mediaCreator: media.creator ?? media.rightsHolder ?? null,
          license,
          mediaType: media.type ?? null,
          importEligibility: "manual_review_required",
          reviewReason: "GBIF is a discovery index. Verify the original institution, record page, creator, license and image/taxon correspondence before any import.",
        });
      }
    }

    return {
      ...record,
      kind,
      status: candidates.length ? "candidate_found_manual_review_required" : "no_reusable_exact_candidate_found",
      gbif: { usageKey: match.usageKey, canonicalName: canonical, matchType: match.matchType ?? null },
      candidates: candidates.slice(0, 8),
    };
  } catch (error) {
    return { ...record, kind, status: "lookup_error", error: error instanceof Error ? error.message : String(error), candidates: [] };
  }
}

async function mapLimit(items, mapper, limit) {
  const output = new Array(items.length);
  let nextIndex = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const index = nextIndex++;
      if (index >= items.length) return;
      output[index] = await mapper(items[index]);
    }
  }));
  return output;
}

const queue = JSON.parse(await fs.readFile(queuePath, "utf8"));
const records = [
  ...queue.plants.map(record => ({ ...record, kind: "plant" })),
  ...queue.aquarium.map(record => ({ ...record, kind: "aquarium" })),
];
const reviewed = await mapLimit(records, record => reviewTaxon(record, record.kind), MAX_CONCURRENCY);
const report = {
  generatedAt: new Date().toISOString(),
  purpose: "Discovery-only candidate review; no database changes and no automatic imports.",
  source: "GBIF public API; each candidate requires manual original-source verification.",
  policy: {
    wikipediaAndWikimediaAllowed: false,
    automaticImportAllowed: false,
    requiredBeforeImport: ["exact taxon", "original source page", "direct image", "reusable license", "creator/attribution", "manual visual verification"],
  },
  summary: {
    queued: reviewed.length,
    candidatesFound: reviewed.filter(item => item.candidates.length > 0).length,
    candidatesAbsent: reviewed.filter(item => item.status === "no_reusable_exact_candidate_found").length,
    noExactTaxonMatch: reviewed.filter(item => item.status === "no_exact_gbif_taxon_match").length,
    lookupErrors: reviewed.filter(item => item.status === "lookup_error").length,
  },
  records: reviewed,
};
await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report.summary));
console.log(outputPath);
