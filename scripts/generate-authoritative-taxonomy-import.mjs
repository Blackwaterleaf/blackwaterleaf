import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const sourcePath = resolve(root, "data/imports/authoritative-taxonomy-gbif-2026-09.json");
const legacyPath = resolve(root, "data/imports/legacy-taxonomy-2024.json");
const outDir = resolve(root, "data/imports/authoritative-taxonomy-gbif-2026-09-batches");
const preparedPath = resolve(root, "data/imports/authoritative-taxonomy-gbif-2026-09.import.json");
const batchSize = 30;

const [resolved, legacy] = await Promise.all([
  JSON.parse(await readFile(sourcePath, "utf8")),
  JSON.parse(await readFile(legacyPath, "utf8")),
]);
const existingNames = new Set(legacy.records.map(record => String(record.scientificName).toLowerCase()));
const unique = records => records.filter(record => !existingNames.has(String(record.scientificName).toLowerCase()));
const plants = unique(resolved.plants);
const freshwaterFish = unique(resolved.freshwaterFish);

function sqlValue(value) {
  if (value === null || value === undefined) return "NULL";
  if (value instanceof Date) return `'${value.toISOString().slice(0, 19).replace("T", " ")}'`;
  if (typeof value === "object") return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
  return `'${String(value).replace(/'/g, "''")}'`;
}

function values(record) {
  return [
    "GBIF",
    resolved.sourceVersion,
    record.sourceRecordId,
    record.sourceRecordUrl,
    record.sourceLicense,
    record.sourceCitation,
    new Date(record.sourceRetrievedAt),
    record.taxonomicStatus,
    record.matchConfidence,
    record.scientificName,
    record.acceptedScientificName,
    record.rank,
    record.family,
    record.genus,
    record.commonNames,
    record.synonyms,
    record.summary,
    record.careProfile,
    null,
    null,
    null,
    null,
    record.evidenceState,
    record.status,
  ].map(sqlValue).join(", ");
}

const columns = "source, sourceVersion, sourceRecordId, sourceRecordUrl, sourceLicense, sourceCitation, sourceRetrievedAt, taxonomicStatus, matchConfidence, scientificName, acceptedScientificName, `rank`, family, genus, commonNames, synonyms, summary, careProfile, imageUrl, imageSourceUrl, imageLicense, imageAttribution, evidenceState, status";
const updates = "sourceRecordUrl = VALUES(sourceRecordUrl), sourceLicense = VALUES(sourceLicense), sourceCitation = VALUES(sourceCitation), sourceRetrievedAt = VALUES(sourceRetrievedAt), taxonomicStatus = VALUES(taxonomicStatus), matchConfidence = VALUES(matchConfidence), scientificName = VALUES(scientificName), acceptedScientificName = VALUES(acceptedScientificName), `rank` = VALUES(`rank`), family = VALUES(family), genus = VALUES(genus), commonNames = VALUES(commonNames), synonyms = VALUES(synonyms), summary = VALUES(summary), careProfile = VALUES(careProfile), evidenceState = VALUES(evidenceState), status = VALUES(status), updatedAt = CURRENT_TIMESTAMP";

function toSql(table, records) {
  return `INSERT INTO ${table} (${columns}) VALUES\n${records.map(record => `(${values(record)})`).join(",\n")}\nON DUPLICATE KEY UPDATE ${updates};\n`;
}

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });
const batches = [];
for (const [catalog, records] of [["plant_taxa", plants], ["aquarium_taxa", freshwaterFish]]) {
  for (let start = 0; start < records.length; start += batchSize) {
    const chunk = records.slice(start, start + batchSize);
    const index = String(Math.floor(start / batchSize) + 1).padStart(2, "0");
    const file = `${catalog}-batch-${index}.sql`;
    await writeFile(resolve(outDir, file), toSql(catalog, chunk));
    batches.push({ catalog, file, records: chunk.length });
  }
}
const prepared = {
  generatedAt: new Date().toISOString(),
  source: resolved.source,
  sourceVersion: resolved.sourceVersion,
  sourceLicense: resolved.sourceLicense,
  sourceCitation: resolved.sourceCitation,
  plants,
  freshwaterFish,
};
const manifest = {
  generatedAt: prepared.generatedAt,
  source: prepared.source,
  sourceVersion: prepared.sourceVersion,
  skippedExistingScientificNames: {
    plants: resolved.plants.length - plants.length,
    freshwaterFish: resolved.freshwaterFish.length - freshwaterFish.length,
  },
  preparedRecords: { plants: plants.length, freshwaterFish: freshwaterFish.length },
  batches,
  idempotency: "Unique key source + sourceVersion + sourceRecordId with ON DUPLICATE KEY UPDATE; legacy scientific names are excluded before batch generation.",
  imagePolicy: "No image values are included. Text-only scientific records are published with full source provenance.",
};
await writeFile(preparedPath, `${JSON.stringify(prepared, null, 2)}\n`);
await writeFile(resolve(outDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify(manifest, null, 2));
