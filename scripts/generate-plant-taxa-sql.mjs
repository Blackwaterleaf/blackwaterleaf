import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const input = JSON.parse(fs.readFileSync(path.join(root, "data/imports/legacy-taxonomy-2024.json"), "utf8"));
const records = input.records.filter(record => record.careProfile?.category !== "channa");
const outDir = path.join(root, "data/imports/plant-taxa-batches");
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const sqlString = value => value === null || value === undefined
  ? "NULL"
  : `'${String(value).replaceAll("\\", "\\\\").replaceAll("'", "''").replaceAll(";", ",")}'`;
const jsonString = value => sqlString(JSON.stringify(value ?? null));
const row = record => [
  record.source,
  record.sourceVersion,
  record.sourceRecordId,
  record.scientificName,
  record.acceptedScientificName,
  record.rank,
  record.family,
  record.genus,
  jsonString(record.commonNames),
  jsonString(record.synonyms),
  record.summary,
  jsonString(record.careProfile),
  record.imageUrl,
  record.evidenceState,
  record.status,
].map((value, index) => index === 8 || index === 9 || index === 11 ? value : sqlString(value));
const columns = "source, sourceVersion, sourceRecordId, scientificName, acceptedScientificName, `rank`, family, genus, commonNames, synonyms, summary, careProfile, imageUrl, evidenceState, status";
const batches = [];
for (let index = 0; index < records.length; index += 20) batches.push(records.slice(index, index + 20));

batches.forEach((batch, batchIndex) => {
  const values = batch.map(record => `(${row(record).join(", ")})`).join(",\n");
  const sql = `INSERT INTO plant_taxa (${columns}) VALUES
${values}
ON DUPLICATE KEY UPDATE
  scientificName = VALUES(scientificName),
  acceptedScientificName = VALUES(acceptedScientificName),
  \`rank\` = VALUES(\`rank\`),
  family = VALUES(family),
  genus = VALUES(genus),
  commonNames = VALUES(commonNames),
  synonyms = VALUES(synonyms),
  summary = VALUES(summary),
  careProfile = VALUES(careProfile),
  imageUrl = VALUES(imageUrl),
  evidenceState = VALUES(evidenceState),
  status = VALUES(status),
  updatedAt = CURRENT_TIMESTAMP;
`;
  fs.writeFileSync(path.join(outDir, `batch-${String(batchIndex + 1).padStart(2, "0")}.sql`), sql);
});

fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify({
  source: input.source,
  sourceVersion: input.sourceVersion,
  importedRecords: records.length,
  excludedRecords: input.records.length - records.length,
  excludedCategory: "channa",
  batches: batches.length,
}, null, 2));
console.log(`Generated ${records.length} plant records in ${batches.length} SQL batches; excluded ${input.records.length - records.length} channa records.`);
