import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const root = process.cwd();
const inputPath = resolve(root, "data/imports/authoritative-taxonomy-targets-2026-09.json");
const outputPath = resolve(root, "data/imports/authoritative-taxonomy-gbif-2026-09.json");
const manifestPath = resolve(root, "data/imports/authoritative-taxonomy-gbif-2026-09.manifest.json");
const delayMs = 275;
const minimumConfidence = 95;
const gbifCitation = "GBIF Backbone Taxonomy, DOI: 10.15468/39omei, CC BY 4.0";
const gbifLicense = "CC BY 4.0";

const wait = ms => new Promise(resolvePromise => setTimeout(resolvePromise, ms));

function normalizeName(value) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function isExactAcceptedSpecies(match, expectedName) {
  return match?.matchType === "EXACT"
    && match?.status === "ACCEPTED"
    && match?.rank === "SPECIES"
    && Number(match?.confidence) >= minimumConfidence
    && normalizeName(match.canonicalName ?? "") === normalizeName(expectedName)
    && Number.isSafeInteger(Number(match.usageKey));
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "BlackWaterLeaf-Taxonomy-Resolver/1.0 (source-reviewed import)",
    },
  });
  if (!response.ok) throw new Error(`GBIF request failed: ${response.status} ${url}`);
  return response.json();
}

function namesFrom(payload) {
  const rows = Array.isArray(payload) ? payload : Array.isArray(payload?.results) ? payload.results : [];
  const allowedLanguages = new Set(["de", "deu", "ger", "en", "eng"]);
  return [...new Set(rows
    .filter(row => typeof row?.vernacularName === "string" && allowedLanguages.has(String(row.language ?? "").toLowerCase()))
    .map(row => row.vernacularName.trim())
    .filter(Boolean))].slice(0, 20);
}

function synonymsFrom(payload) {
  const rows = Array.isArray(payload) ? payload : Array.isArray(payload?.results) ? payload.results : [];
  return [...new Set(rows
    .map(row => String(row?.canonicalName ?? row?.scientificName ?? "").trim())
    .filter(Boolean))].slice(0, 40);
}

function catalogRecord(target, match, commonNames, synonyms, retrievedAt) {
  const acceptedName = String(match.canonicalName).trim();
  const group = target.category;
  return {
    sourceRecordId: `GBIF:${match.usageKey}`,
    sourceRecordUrl: `https://www.gbif.org/species/${match.usageKey}`,
    sourceLicense: gbifLicense,
    sourceCitation: gbifCitation,
    sourceRetrievedAt: retrievedAt,
    taxonomicStatus: String(match.status).toLowerCase(),
    matchConfidence: Number(match.confidence),
    scientificName: acceptedName,
    acceptedScientificName: acceptedName,
    rank: String(match.rank).toLowerCase(),
    family: match.family ?? null,
    genus: match.genus ?? null,
    commonNames,
    synonyms,
    summary: `Taxonomischer Fachdatensatz. Akzeptierter Name: ${acceptedName}. Die Einordnung beruht auf einem exakten GBIF-Backbone-Abgleich; Pflege-, Haltungs- und Verbreitungsdetails werden erst aus separat geprüften Fachquellen ergänzt.`,
    careProfile: { category: group, dataScope: "taxonomy_only" },
    imageUrl: null,
    imageSourceUrl: null,
    imageLicense: null,
    imageAttribution: null,
    evidenceState: "confirmed",
    status: "published",
  };
}

async function resolveTarget(target, kingdom) {
  const params = new URLSearchParams({ name: target.scientificName, kingdom });
  const match = await fetchJson(`https://api.gbif.org/v1/species/match?${params}`);
  if (!isExactAcceptedSpecies(match, target.scientificName)) {
    return { target, accepted: false, reason: "not_exact_accepted_species", match: { canonicalName: match?.canonicalName ?? null, rank: match?.rank ?? null, status: match?.status ?? null, matchType: match?.matchType ?? null, confidence: match?.confidence ?? null } };
  }
  await wait(delayMs);
  const [vernacularPayload, synonymPayload] = await Promise.all([
    fetchJson(`https://api.gbif.org/v1/species/${match.usageKey}/vernacularNames?limit=100`),
    fetchJson(`https://api.gbif.org/v1/species/${match.usageKey}/synonyms?limit=100`),
  ]);
  return {
    target,
    accepted: true,
    record: catalogRecord(target, match, namesFrom(vernacularPayload), synonymsFrom(synonymPayload), new Date().toISOString()),
  };
}

async function resolveGroup(targets, kingdom, label) {
  const records = [];
  const rejected = [];
  for (const [index, target] of targets.entries()) {
    try {
      const result = await resolveTarget(target, kingdom);
      if (result.accepted) records.push(result.record);
      else rejected.push(result);
      console.log(`${label} ${index + 1}/${targets.length}: ${target.scientificName} ${result.accepted ? "accepted" : "rejected"}`);
    } catch (error) {
      rejected.push({ target, accepted: false, reason: "request_failed", error: error instanceof Error ? error.message : String(error) });
      console.log(`${label} ${index + 1}/${targets.length}: ${target.scientificName} failed`);
    }
    await wait(delayMs);
  }
  return { records, rejected };
}

const targets = JSON.parse(await readFile(inputPath, "utf8"));
const [plants, freshwaterFish] = await Promise.all([
  resolveGroup(targets.plants, "Plantae", "plant"),
  resolveGroup(targets.freshwaterFish, "Animalia", "fish"),
]);
const generatedAt = new Date().toISOString();
const payload = {
  generatedAt,
  source: "GBIF Backbone Taxonomy",
  sourceVersion: "gbif-backbone-2026-09",
  sourceLicense: gbifLicense,
  sourceCitation: gbifCitation,
  plants: plants.records,
  freshwaterFish: freshwaterFish.records,
};
const manifest = {
  generatedAt,
  input: "data/imports/authoritative-taxonomy-targets-2026-09.json",
  source: payload.source,
  sourceVersion: payload.sourceVersion,
  acceptanceRule: "EXACT + ACCEPTED + SPECIES + canonical name equality + confidence >= 95",
  plants: { requested: targets.plants.length, accepted: plants.records.length, rejected: plants.rejected },
  freshwaterFish: { requested: targets.freshwaterFish.length, accepted: freshwaterFish.records.length, rejected: freshwaterFish.rejected },
  imagePolicy: "No images are imported by this resolver. Images require separate source, license, attribution and rights verification.",
};
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ plants: plants.records.length, freshwaterFish: freshwaterFish.records.length, rejected: plants.rejected.length + freshwaterFish.rejected.length, outputPath, manifestPath }));
