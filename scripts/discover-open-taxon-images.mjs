import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const inputPath = resolve(root, "data/imports/open-taxon-image-source.json");
const outputPath = resolve(root, "data/imports/open-taxon-image-candidates-2026-09.json");
const API = "https://api.inaturalist.org/v1/observations";
const acceptedLicenses = new Set(["cc0", "cc-by"]);
const concurrency = 3;
const minPixels = 1_200_000;
const minShortestSide = 900;

function normalized(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ").toLocaleLowerCase("en");
}

function exactSpecies(expected, taxon) {
  return taxon?.rank === "species" && normalized(taxon?.name) === normalized(expected);
}

function originalPhotoUrl(url) {
  return String(url).replace(/\/(?:square|small|medium|large)\.(jpe?g|png|webp)(?:\?.*)?$/i, "/original.$1");
}

function qualityCandidate(observation, photo) {
  const dimensions = photo.original_dimensions ?? {};
  const width = Number(dimensions.width ?? 0);
  const height = Number(dimensions.height ?? 0);
  const pixels = width * height;
  return acceptedLicenses.has(normalized(photo.license_code))
    && width > 0
    && height > 0
    && pixels >= minPixels
    && Math.min(width, height) >= minShortestSide
    && typeof photo.attribution === "string"
    && photo.attribution.trim().length > 0
    && typeof photo.url === "string"
    && photo.url.startsWith("https://");
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "BlackWaterLeaf-OpenTaxonImageDiscovery/1.0 (+https://blackwaterleaf.com)" },
  });
  if (!response.ok) throw new Error(`iNaturalist request failed: ${response.status}`);
  return response.json();
}

async function candidatesFor(record) {
  const found = [];
  for (const photoLicense of ["CC0", "CC-BY"]) {
    const params = new URLSearchParams({
      taxon_name: record.scientificName,
      quality_grade: "research",
      photo_license: photoLicense,
      per_page: "50",
      order_by: "votes",
      order: "desc",
    });
    const payload = await fetchJson(`${API}?${params}`);
    for (const observation of payload.results ?? []) {
      if (!exactSpecies(record.scientificName, observation.taxon)) continue;
      for (const photo of observation.photos ?? []) {
        if (!qualityCandidate(observation, photo)) continue;
        const dimensions = photo.original_dimensions;
        found.push({
          observationId: observation.id,
          observationUrl: `https://www.inaturalist.org/observations/${observation.id}`,
          photoId: photo.id,
          directImageUrl: originalPhotoUrl(photo.url),
          thumbnailUrl: photo.url,
          license: photo.license_code,
          attribution: photo.attribution.trim(),
          width: dimensions.width,
          height: dimensions.height,
          pixels: dimensions.width * dimensions.height,
          qualityGrade: observation.quality_grade,
          taxonName: observation.taxon.name,
          taxonRank: observation.taxon.rank,
          captive: Boolean(observation.captive),
        });
      }
    }
  }
  const distinct = new Map();
  for (const candidate of found) {
    if (!distinct.has(candidate.photoId)) distinct.set(candidate.photoId, candidate);
  }
  return Array.from(distinct.values()).sort((a, b) => b.pixels - a.pixels || a.captive - b.captive || a.photoId - b.photoId).slice(0, 6);
}

async function mapLimit(items, mapper) {
  const results = new Array(items.length);
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      try {
        const candidates = await mapper(items[index]);
        results[index] = { ...items[index], candidates, status: candidates.length ? "candidate_found" : "no_eligible_candidate" };
      } catch (error) {
        results[index] = { ...items[index], candidates: [], status: "lookup_error", error: error instanceof Error ? error.message : String(error) };
      }
      console.log(`${index + 1}/${items.length} ${items[index].scientificName}`);
    }
  }));
  return results;
}

const source = JSON.parse(await readFile(inputPath, "utf8"));
const records = [...source.plants.map(record => ({ ...record, kind: "plant" })), ...source.aquarium.map(record => ({ ...record, kind: "aquarium" }))];
const reviewed = await mapLimit(records, candidatesFor);
const selected = reviewed.filter(record => record.candidates.length).map(record => ({ ...record, selected: record.candidates[0] }));
const output = {
  generatedAt: new Date().toISOString(),
  purpose: "Discovery only. No image is imported until its source page, exact taxon, CC0 or CC BY license, attribution, dimensions and downloadable bytes are revalidated.",
  source: "iNaturalist public observations API; individual media remains owned by the uploader and is used only with the returned CC0 or CC BY media license and attribution.",
  policy: {
    acceptedPhotoLicenses: ["CC0", "CC BY"],
    qualityGate: "research grade, exact species rank/name, original dimensions >= 1.2 MP and shortest side >= 900 px, complete attribution",
    disallowed: ["Wikipedia", "Wikimedia", "CC BY-NC", "CC BY-SA", "CC BY-ND", "all rights reserved", "unlicensed media"],
  },
  summary: {
    requested: records.length,
    withCandidate: selected.length,
    missingCandidate: reviewed.filter(record => record.status === "no_eligible_candidate").length,
    lookupErrors: reviewed.filter(record => record.status === "lookup_error").length,
    plants: { requested: source.plants.length, withCandidate: selected.filter(record => record.kind === "plant").length },
    aquarium: { requested: source.aquarium.length, withCandidate: selected.filter(record => record.kind === "aquarium").length },
  },
  records: reviewed,
};
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output.summary));
