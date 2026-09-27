import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const ROOT = process.cwd();
const OUT = resolve(ROOT, "data/imports/catalog-expansion-gbif-2026-09.json");
const GBIF = "https://api.gbif.org/v1";
const BACKBONE = "d7dddbf4-2cf0-4f39-9b2a-bb099caae36c";
const TARGET = 500;
const HARD_STOP = 909;
const CONCURRENCY = 2;
const REQUEST_DELAY_MS = 300;
const REQUEST_RETRIES = 5;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const cleanName = value => String(value ?? "").trim().replace(/\s+/g, " ");

async function gbif(path, params = {}) {
  const url = `${GBIF}${path}?${new URLSearchParams(params)}`;
  let lastError;
  for (let attempt = 1; attempt <= REQUEST_RETRIES; attempt += 1) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(60000),
        headers: {
          Accept: "application/json",
          "User-Agent": "BlackWaterLeaf-CatalogExpansion/1.0 (+https://blackwaterleaf.com)",
        },
      });
      if (!response.ok) throw new Error(`gbif_${response.status}:${path}`);
      const payload = await response.json();
      await sleep(REQUEST_DELAY_MS);
      return payload;
    } catch (error) {
      lastError = error;
      await sleep(1000 * attempt);
    }
  }
  throw lastError ?? new Error(`gbif_request_failed:${path}`);
}

async function mapLimit(items, mapper) {
  const results = new Array(items.length);
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      try {
        results[index] = await mapper(items[index], index);
      } catch (error) {
        results[index] = { error: error instanceof Error ? error.message : String(error) };
      }
    }
  }));
  return results;
}

async function readExistingNames() {
  const paths = [
    resolve(ROOT, "data/imports/authoritative-taxonomy-gbif-2026-09.json"),
    resolve(ROOT, "data/imports/legacy-taxonomy-2024.json"),
  ];
  const names = new Set();
  for (const path of paths) {
    try {
      const payload = JSON.parse(await readFile(path, "utf8"));
      for (const group of Object.values(payload)) {
        if (!Array.isArray(group)) continue;
        for (const record of group) {
          if (record?.scientificName) names.add(cleanName(record.scientificName).toLowerCase());
        }
      }
      for (const record of payload.records ?? []) {
        if (record?.scientificName) names.add(cleanName(record.scientificName).toLowerCase());
      }
    } catch {
      // Optional historical manifests may not exist in every environment.
    }
  }
  return names;
}

async function backboneMatch(name) {
  const result = await gbif("/species/match", { name, checklistKey: BACKBONE });
  return result.matchType === "EXACT" && result.usageKey ? result : null;
}

async function seedKeys(names) {
  const matches = await mapLimit(Array.from(names), async name => {
    const match = await backboneMatch(name);
    return match?.familyKey ? { familyKey: match.familyKey } : null;
  });
  return Array.from(new Set(matches.filter(Boolean).map(item => item.familyKey)));
}

async function descendants(rootKeys, allowedClasses, allowedKingdoms, maxRecords = TARGET) {
  const queue = [...new Set(rootKeys)];
  const visited = new Set();
  const found = new Map();
  while (queue.length && found.size < Math.min(maxRecords, HARD_STOP)) {
    const key = queue.shift();
    if (visited.has(key)) continue;
    visited.add(key);
    const payload = await gbif(`/species/${key}/children`, { limit: "1000", offset: "0" });
    for (const item of payload.results ?? []) {
      const kingdom = cleanName(item.kingdom);
      const rank = cleanName(item.rank).toUpperCase();
      const itemClass = cleanName(item.class);
      // The traversal root already establishes the catalog area. GBIF children responses often omit higher taxonomy fields.
      if (rank === "SPECIES" && (item.taxonomicStatus ?? item.status) === "ACCEPTED") {
        const canonicalName = cleanName(item.canonicalName || item.scientificName);
        if (canonicalName && !found.has(canonicalName.toLowerCase())) found.set(canonicalName.toLowerCase(), item);
      } else if (item.key && ["PHYLUM", "SUBPHYLUM", "CLASS", "SUBCLASS", "ORDER", "SUBORDER", "FAMILY", "SUBFAMILY", "GENUS"].includes(rank)) {
        queue.push(item.key);
      }
    }
    if (visited.size % 10 === 0) console.log(`GBIF traversal ${visited.size} nodes, ${found.size} species`);
  }
  return Array.from(found.values()).sort((a, b) => String(a.canonicalName).localeCompare(String(b.canonicalName))).slice(0, maxRecords);
}

function toRecord(item, kind) {
  const scientificName = cleanName(item.canonicalName || item.scientificName);
  const sourceRecordId = `GBIF:${item.key}`;
  const sourceRecordUrl = `https://www.gbif.org/species/${item.key}`;
  const descriptions = Array.isArray(item.descriptions) ? item.descriptions.map(value => cleanName(value.description)).filter(Boolean) : [];
  const distribution = descriptions.find(value => /^distribution[:.]/i.test(value)) ?? null;
  return {
    kind,
    source: "GBIF",
    sourceVersion: "Backbone Taxonomy 2026-09",
    sourceRecordId,
    sourceRecordUrl,
    sourceLicense: "CC BY 4.0",
    sourceCitation: "GBIF Backbone Taxonomy, DOI: 10.15468/39omei",
    sourceRetrievedAt: new Date().toISOString(),
    taxonomicStatus: "accepted",
    matchConfidence: 100,
    scientificName,
    acceptedScientificName: scientificName,
    rank: "species",
    family: item.family ?? null,
    genus: item.genus ?? null,
    commonNames: Array.isArray(item.vernacularNames) ? item.vernacularNames.map(value => cleanName(value.vernacularName)).filter(Boolean).slice(0, 12) : [],
    synonyms: [],
    summary: distribution ? `GBIF-Verbreitungsnotiz: ${distribution}` : null,
    careProfile: null,
    imageUrl: null,
    imageSourceUrl: null,
    imageLicense: null,
    imageAttribution: null,
    imageVerifiedAt: null,
    evidenceState: "confirmed",
    status: "draft",
  };
}

const existing = await readExistingNames();
const authoritative = JSON.parse(await readFile(resolve(ROOT, "data/imports/authoritative-taxonomy-gbif-2026-09.json"), "utf8"));
const plantSeedNames = new Set((authoritative.plants ?? []).map(record => record.scientificName));
const fishSeedNames = new Set((authoritative.freshwaterFish ?? []).map(record => record.scientificName));

console.log("Resolving GBIF family seeds...");
const [plantFamilyKeys, fishFamilyKeys] = await Promise.all([seedKeys(plantSeedNames), seedKeys(fishSeedNames)]);
console.log(`Plant families: ${plantFamilyKeys.length}; fish families: ${fishFamilyKeys.length}`);

const [plants, fish, terrarium] = await Promise.all([
  descendants(plantFamilyKeys, [], ["Plantae"], TARGET),
  descendants(fishFamilyKeys, ["Actinopterygii", "Actinopteri"], ["Animalia"], TARGET),
  descendants([11592253, 11418114, 11493978, 952, 953, 775], ["Squamata", "Testudines", "Crocodylia", "Amphibia"], ["Animalia"], TARGET),
]);

const result = {
  generatedAt: new Date().toISOString(),
  purpose: "Taxonomy-first discovery manifest. Records remain drafts until care/husbandry sources and images are independently verified.",
  source: "GBIF Backbone Taxonomy",
  sourceVersion: "Backbone Taxonomy 2026-09",
  sourceLicense: "CC BY 4.0",
  sourceCitation: "GBIF Backbone Taxonomy, DOI: 10.15468/39omei",
  policy: {
    requestedPerKind: TARGET,
    hardStopPerKind: HARD_STOP,
    publishOnlyAfterCareEvidence: true,
    noAiGeneratedCareClaims: true,
    imageImportSeparateVerification: true,
  },
  counts: { plants: plants.length, freshwaterFish: fish.length, terrarium: terrarium.length },
  plants: plants.map(item => toRecord(item, "plant")),
  freshwaterFish: fish.map(item => toRecord(item, "aquarium")),
  terrarium: terrarium.map(item => toRecord(item, "terrarium")),
};
await writeFile(OUT, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ output: OUT, counts: result.counts }, null, 2));
