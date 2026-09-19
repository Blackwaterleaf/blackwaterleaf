import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const inputPath = resolve(root, "data/imports/open-taxon-image-candidates-2026-09.json");
const outputPath = resolve(root, "data/imports/open-taxon-image-candidates-2026-09.json");
const API = "https://api.inaturalist.org/v1/observations";
const acceptedLicenses = new Set(["cc0", "cc-by"]);
const minPixels = 1_200_000;
const minShortestSide = 900;
const pauseMs = 1_250;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const normalized = value => String(value ?? "").trim().replace(/\s+/g, " ").toLocaleLowerCase("en");
const exactSpecies = (expected, taxon) => taxon?.rank === "species" && normalized(taxon?.name) === normalized(expected);
const originalPhotoUrl = url => String(url).replace(/\/(?:square|small|medium|large)\.(jpe?g|png|webp)(?:\?.*)?$/i, "/original.$1");

function candidate(observation, photo) {
  const dimensions = photo.original_dimensions ?? {};
  const width = Number(dimensions.width ?? 0);
  const height = Number(dimensions.height ?? 0);
  if (!acceptedLicenses.has(normalized(photo.license_code)) || !width || !height || width * height < minPixels || Math.min(width, height) < minShortestSide || !photo.attribution?.trim() || !photo.url?.startsWith("https://")) return null;
  return {
    observationId: observation.id,
    observationUrl: `https://www.inaturalist.org/observations/${observation.id}`,
    photoId: photo.id,
    directImageUrl: originalPhotoUrl(photo.url),
    thumbnailUrl: photo.url,
    license: photo.license_code,
    attribution: photo.attribution.trim(),
    width,
    height,
    pixels: width * height,
    qualityGrade: observation.quality_grade,
    taxonName: observation.taxon.name,
    taxonRank: observation.taxon.rank,
    captive: Boolean(observation.captive),
  };
}

async function request(url) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "BlackWaterLeaf-OpenTaxonImageDiscovery/1.0 (+https://blackwaterleaf.com)" }, signal: AbortSignal.timeout(40_000) });
      if (response.ok) return response.json();
      if (response.status === 429 || response.status >= 500) {
        const retryAfter = Number(response.headers.get("retry-after") ?? 0);
        await sleep(Math.max(retryAfter * 1_000, 5_000 * (attempt + 1)));
        continue;
      }
      throw new Error(`iNaturalist request failed: ${response.status}`);
    } catch (error) {
      if (attempt === 4) throw error;
      await sleep(3_000 * (attempt + 1));
    }
  }
  throw new Error("iNaturalist request retry budget exhausted");
}

async function lookup(record, photoLicense) {
  const params = new URLSearchParams({
    taxon_name: record.scientificName,
    quality_grade: "research",
    photo_license: photoLicense,
    per_page: "100",
    order_by: "votes",
    order: "desc",
  });
  const payload = await request(`${API}?${params}`);
  const result = [];
  for (const observation of payload.results ?? []) {
    if (!exactSpecies(record.scientificName, observation.taxon)) continue;
    for (const photo of observation.photos ?? []) {
      const accepted = candidate(observation, photo);
      if (accepted) result.push(accepted);
    }
  }
  return result;
}

const output = JSON.parse(await readFile(inputPath, "utf8"));
const pending = output.records.filter(record => record.status === "lookup_error");
console.log(JSON.stringify({ retrying: pending.length, pauseMs }));
await sleep(20_000);
for (let index = 0; index < pending.length; index += 1) {
  const record = pending[index];
  try {
    let candidates = await lookup(record, "CC-BY");
    await sleep(pauseMs);
    if (!candidates.length) {
      candidates = await lookup(record, "CC0");
      await sleep(pauseMs);
    }
    const distinct = new Map();
    for (const item of candidates) if (!distinct.has(item.photoId)) distinct.set(item.photoId, item);
    record.candidates = Array.from(distinct.values()).sort((a, b) => b.pixels - a.pixels || a.captive - b.captive || a.photoId - b.photoId).slice(0, 6);
    record.status = record.candidates.length ? "candidate_found" : "no_eligible_candidate";
    delete record.error;
  } catch (error) {
    record.status = "lookup_error";
    record.error = error instanceof Error ? error.message : String(error);
  }
  console.log(`${index + 1}/${pending.length} ${record.scientificName} ${record.status}`);
  await sleep(pauseMs);
}
const selected = output.records.filter(record => record.candidates.length).map(record => ({ ...record, selected: record.candidates[0] }));
output.generatedAt = new Date().toISOString();
output.summary = {
  requested: output.records.length,
  withCandidate: selected.length,
  missingCandidate: output.records.filter(record => record.status === "no_eligible_candidate").length,
  lookupErrors: output.records.filter(record => record.status === "lookup_error").length,
  plants: { requested: output.records.filter(record => record.kind === "plant").length, withCandidate: selected.filter(record => record.kind === "plant").length },
  aquarium: { requested: output.records.filter(record => record.kind === "aquarium").length, withCandidate: selected.filter(record => record.kind === "aquarium").length },
};
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output.summary));
