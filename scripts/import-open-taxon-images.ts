import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { and, eq } from "drizzle-orm";
import { aquariumTaxa, plantTaxa } from "../drizzle/schema";
import { getDb } from "../server/db";
import { storagePut } from "../server/storage";
import { validateImageUpload } from "../server/uploadValidation";

const root = process.cwd();
const inputPath = resolve(root, "data/imports/open-taxon-image-candidates-2026-09.json");
const receiptPath = resolve(root, "data/imports/open-taxon-image-import-receipt-2026-09.json");
const dryReceiptPath = resolve(root, "data/imports/open-taxon-image-import-dry-run-2026-09.json");
const dryRun = process.argv.includes("--dry-run");
const retryFailedOnly = process.argv.includes("--retry-failed");
const replaceExisting = process.argv.includes("--replace-existing");
const minPixels = 1_200_000;
const minShortestSide = 900;
const allowedLicenses = new Set(["cc0", "cc-by"]);
const sleep = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds));

async function retryingFetch(url: string, init: RequestInit, label: string) {
  let failure: Error | null = null;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const response = await fetch(url, init);
      if (response.ok) return response;
      failure = new Error(`${label}_failed:${response.status}`);
    } catch (error) {
      failure = error instanceof Error ? error : new Error(String(error));
    }
    await sleep(2_000 * (attempt + 1));
  }
  throw failure ?? new Error(`${label}_failed`);
}

type Candidate = {
  observationId: number;
  observationUrl: string;
  photoId: number;
  directImageUrl: string;
  license: string;
  attribution: string;
  width: number;
  height: number;
  pixels: number;
  qualityGrade: string;
  taxonName: string;
  taxonRank: string;
};

type CandidateRecord = {
  id: number;
  kind: "plant" | "aquarium";
  scientificName: string;
  status: string;
  candidates: Candidate[];
};

type ObservationPhoto = {
  id: number;
  license_code: string | null;
  attribution: string | null;
  url: string | null;
  original_dimensions: { width?: number; height?: number } | null;
};

type Observation = {
  id: number;
  quality_grade: string | null;
  taxon: { name: string | null; rank: string | null } | null;
  photos: ObservationPhoto[];
};

function normalized(value: string | null | undefined) {
  return String(value ?? "").trim().replace(/\s+/g, " ").toLocaleLowerCase("en");
}

function exactSpecies(expected: string, observation: Observation) {
  return observation.taxon?.rank === "species" && normalized(observation.taxon.name) === normalized(expected);
}

function originalPhotoUrl(url: string) {
  return url.replace(/\/(?:square|small|medium|large)\.(jpe?g|png|webp)(?:\?.*)?$/i, "/original.$1");
}

function isValidCandidate(record: CandidateRecord, candidate: Candidate) {
  return candidate.observationId > 0
    && candidate.photoId > 0
    && candidate.qualityGrade === "research"
    && candidate.taxonRank === "species"
    && normalized(candidate.taxonName) === normalized(record.scientificName)
    && allowedLicenses.has(normalized(candidate.license))
    && candidate.width * candidate.height >= minPixels
    && Math.min(candidate.width, candidate.height) >= minShortestSide
    && candidate.attribution.trim().length > 0
    && candidate.observationUrl === `https://www.inaturalist.org/observations/${candidate.observationId}`
    && candidate.directImageUrl.startsWith("https://inaturalist-open-data.s3.amazonaws.com/photos/");
}

async function verifiedObservation(record: CandidateRecord, candidate: Candidate) {
  const response = await retryingFetch(`https://api.inaturalist.org/v1/observations/${candidate.observationId}`, {
    headers: { Accept: "application/json", "User-Agent": "BlackWaterLeaf-OpenTaxonImageImport/1.0 (+https://blackwaterleaf.com)" },
    signal: AbortSignal.timeout(40_000),
  }, "observation_verification");
  const payload = await response.json() as { results?: Observation[] };
  const observation = payload.results?.[0];
  if (!observation || observation.id !== candidate.observationId || observation.quality_grade !== "research" || !exactSpecies(record.scientificName, observation)) {
    throw new Error("observation_taxonomy_or_quality_mismatch");
  }
  const photo = observation.photos.find(item => item.id === candidate.photoId);
  if (!photo || !allowedLicenses.has(normalized(photo.license_code)) || !photo.attribution?.trim() || !photo.url?.startsWith("https://")) {
    throw new Error("observation_photo_provenance_mismatch");
  }
  const width = Number(photo.original_dimensions?.width ?? 0);
  const height = Number(photo.original_dimensions?.height ?? 0);
  if (width * height < minPixels || Math.min(width, height) < minShortestSide) throw new Error("observation_photo_dimensions_mismatch");
  return { photo, width, height, directImageUrl: originalPhotoUrl(photo.url) };
}

async function downloadAndValidate(url: string) {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || parsed.hostname !== "inaturalist-open-data.s3.amazonaws.com") throw new Error("unapproved_image_download_host");
  const response = await retryingFetch(url, { redirect: "error", signal: AbortSignal.timeout(45_000) }, "image_download");
  const mime = response.headers.get("content-type")?.split(";", 1)[0]?.toLowerCase() ?? "";
  const bytes = Buffer.from(await response.arrayBuffer());
  return validateImageUpload(bytes.toString("base64"), mime);
}

function storedAttribution(candidate: Candidate) {
  return `${candidate.attribution} · iNaturalist photo #${candidate.photoId} · Research Grade`;
}

function displayedLicense(license: string) {
  return normalized(license) === "cc0" ? "CC0 1.0" : "CC BY";
}

const raw = JSON.parse(await readFile(inputPath, "utf8")) as { records: CandidateRecord[] };
const retryFailureKeys = retryFailedOnly
  ? new Set((JSON.parse(await readFile(dryReceiptPath, "utf8")) as { failed: Array<{ kind: string; id: number }> }).failed.map(record => `${record.kind}:${record.id}`))
  : null;
const records = raw.records
  .filter(record => record.status === "candidate_found" && record.candidates.length > 0 && (!retryFailureKeys || retryFailureKeys.has(`${record.kind}:${record.id}`)))
  .map(record => ({ ...record, candidate: record.candidates[0] }));
for (const item of records) if (!isValidCandidate(item, item.candidate)) throw new Error(`invalid_candidate_manifest:${item.kind}:${item.id}`);

const db = await getDb();
if (!db) throw new Error("database_unavailable");
const outcome = { mode: dryRun ? "dry-run" : "import", startedAt: new Date().toISOString(), requested: records.length, imported: 0, skippedExisting: 0, failed: [] as Array<{ kind: string; id: number; scientificName: string; reason: string }>, files: [] as Array<{ kind: string; id: number; scientificName: string; observationUrl: string; photoId: number; license: string; attribution: string; width: number; height: number; imageUrl: string }> };

for (const item of records) {
  try {
    const table = item.kind === "plant" ? plantTaxa : aquariumTaxa;
    const rows = await db.select({ id: table.id, scientificName: table.scientificName, imageUrl: table.imageUrl, imageSourceUrl: table.imageSourceUrl })
      .from(table)
      .where(and(eq(table.id, item.id), eq(table.scientificName, item.scientificName), eq(table.status, "published")))
      .limit(1);
    const existing = rows[0];
    if (!existing) throw new Error("published_taxon_not_found_or_name_mismatch");
    const observationUrl = `https://www.inaturalist.org/observations/${item.candidate.observationId}`;
    if ((existing.imageUrl || existing.imageSourceUrl) && !replaceExisting) {
      outcome.skippedExisting += 1;
      continue;
    }
    if (replaceExisting && (!existing.imageUrl?.startsWith("/manus-storage/catalog/taxa/") || existing.imageSourceUrl !== observationUrl)) {
      throw new Error("refusing_to_replace_nonmatching_curated_image");
    }
    const verified = await verifiedObservation(item, item.candidate);
    await sleep(1_100);
    if (dryRun) {
      outcome.imported += 1;
      outcome.files.push({ kind: item.kind, id: item.id, scientificName: item.scientificName, observationUrl, photoId: item.candidate.photoId, license: displayedLicense(item.candidate.license), attribution: storedAttribution(item.candidate), width: verified.width, height: verified.height, imageUrl: "dry-run" });
      continue;
    }
    const image = await downloadAndValidate(verified.directImageUrl);
    const stored = await storagePut(`catalog/taxa/${item.kind}/${item.id}/inat-${item.candidate.photoId}.${image.extension}`, image.buffer, image.mimeType);
    await db.update(table).set({
      imageUrl: stored.url,
      imageSourceUrl: observationUrl,
      imageLicense: displayedLicense(item.candidate.license),
      imageAttribution: storedAttribution(item.candidate),
      imageVerifiedAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(table.id, item.id));
    outcome.imported += 1;
    outcome.files.push({ kind: item.kind, id: item.id, scientificName: item.scientificName, observationUrl, photoId: item.candidate.photoId, license: displayedLicense(item.candidate.license), attribution: storedAttribution(item.candidate), width: verified.width, height: verified.height, imageUrl: stored.url });
  } catch (error) {
    outcome.failed.push({ kind: item.kind, id: item.id, scientificName: item.scientificName, reason: error instanceof Error ? error.message : String(error) });
  }
}

outcome.files.sort((a, b) => a.kind.localeCompare(b.kind) || a.scientificName.localeCompare(b.scientificName));
const receipt = { ...outcome, completedAt: new Date().toISOString(), policy: "Only exact-species, Research-Grade iNaturalist photos with CC0 or CC BY, attribution, >=1.2MP and >=900px shortest side were accepted. Imported images are stored locally; source observation and attribution remain public in the catalogue." };
await writeFile(dryRun ? dryReceiptPath : receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
console.log(JSON.stringify({ mode: outcome.mode, requested: outcome.requested, imported: outcome.imported, skippedExisting: outcome.skippedExisting, failed: outcome.failed.length }, null, 2));
if (outcome.failed.length) process.exitCode = 2;
process.exit();
