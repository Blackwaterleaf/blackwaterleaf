import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { aquariumTaxa, plantTaxa } from "../drizzle/schema";
import { getDb } from "../server/db";
import { belongsToOfficialSource, officialTaxonSource } from "../shared/taxon-source-policy";

type TaxonRecord = {
  sourceRecordId: string;
  sourceRecordUrl: string;
  sourceLicense: string;
  sourceCitation: string;
  sourceRetrievedAt: string;
  taxonomicStatus: string;
  matchConfidence: number;
  scientificName: string;
  acceptedScientificName: string;
  rank: string;
  family: string | null;
  genus: string | null;
  commonNames: string[];
  synonyms: string[];
  summary: string;
  careProfile: Record<string, unknown>;
  imageUrl: null;
  imageSourceUrl: null;
  imageLicense: null;
  imageAttribution: null;
  evidenceState: "confirmed";
  status: "published";
};

type SourcePayload = {
  generatedAt: string;
  source: string;
  sourceVersion: string;
  sourceLicense: string;
  sourceCitation: string;
  plants: TaxonRecord[];
  freshwaterFish: TaxonRecord[];
};

const root = process.cwd();
const inputPath = resolve(root, "data/imports/authoritative-taxonomy-gbif-2026-09.import.json");
const receiptPath = resolve(root, "data/imports/authoritative-taxonomy-gbif-2026-09.import-receipt.json");
const dryRun = process.argv.includes("--dry-run");

function stableKey(source: string, version: string, sourceRecordId: string) {
  return `${source}|${version}|${sourceRecordId}`;
}

function normalizedScientificName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function assertValidRecord(record: TaxonRecord, source: string) {
  if (source !== "GBIF" || !officialTaxonSource(source)) throw new Error("official_taxon_source_required");
  if (!record.sourceRecordId.startsWith("GBIF:")) throw new Error(`invalid_source_record_id:${record.sourceRecordId}`);
  if (!belongsToOfficialSource(source, record.sourceRecordUrl)) throw new Error(`invalid_source_record_url:${record.sourceRecordUrl}`);
  if (record.sourceLicense !== "CC BY 4.0") throw new Error(`invalid_source_license:${record.sourceLicense}`);
  if (!record.sourceCitation.includes("10.15468/39omei")) throw new Error("missing_backbone_doi");
  if (record.taxonomicStatus !== "accepted" || record.matchConfidence < 95 || record.rank !== "species") throw new Error(`unverified_taxonomic_match:${record.scientificName}`);
  if (record.imageUrl || record.imageSourceUrl || record.imageLicense || record.imageAttribution) throw new Error(`unreviewed_image_not_allowed:${record.scientificName}`);
}

function values(source: string, sourceVersion: string, record: TaxonRecord) {
  return {
    source,
    sourceVersion,
    sourceRecordId: record.sourceRecordId,
    sourceRecordUrl: record.sourceRecordUrl,
    sourceLicense: record.sourceLicense,
    sourceCitation: record.sourceCitation,
    sourceRetrievedAt: new Date(record.sourceRetrievedAt),
    taxonomicStatus: record.taxonomicStatus,
    matchConfidence: record.matchConfidence,
    scientificName: record.scientificName,
    acceptedScientificName: record.acceptedScientificName,
    rank: record.rank,
    family: record.family,
    genus: record.genus,
    commonNames: record.commonNames,
    synonyms: record.synonyms,
    summary: record.summary,
    careProfile: record.careProfile,
    imageUrl: null,
    imageSourceUrl: null,
    imageLicense: null,
    imageAttribution: null,
    imageVerifiedAt: null,
    evidenceState: record.evidenceState,
    status: record.status,
  };
}

const payload = JSON.parse(await readFile(inputPath, "utf8")) as SourcePayload;
for (const record of [...payload.plants, ...payload.freshwaterFish]) assertValidRecord(record, "GBIF");
const seen = new Set<string>();
for (const record of [...payload.plants, ...payload.freshwaterFish]) {
  const key = stableKey("GBIF", payload.sourceVersion, record.sourceRecordId);
  if (seen.has(key)) throw new Error(`duplicate_source_record:${key}`);
  seen.add(key);
}

const db = await getDb();
if (!db) throw new Error("database_unavailable");

async function importCatalog(kind: "plant" | "aquarium", records: TaxonRecord[]) {
  const table = kind === "plant" ? plantTaxa : aquariumTaxa;
  const existing = await db.select({
    scientificName: table.scientificName,
    source: table.source,
    sourceVersion: table.sourceVersion,
    sourceRecordId: table.sourceRecordId,
  }).from(table);
  const existingNames = new Set(existing.map(row => normalizedScientificName(row.scientificName)));
  const existingKeys = new Set(existing.map(row => stableKey(row.source, row.sourceVersion, row.sourceRecordId)));
  const create = records.filter(record => !existingNames.has(normalizedScientificName(record.scientificName)));
  const update = records.filter(record => existingKeys.has(stableKey("GBIF", payload.sourceVersion, record.sourceRecordId)));
  const skippedExistingName = records.filter(record => existingNames.has(normalizedScientificName(record.scientificName)) && !existingKeys.has(stableKey("GBIF", payload.sourceVersion, record.sourceRecordId)));
  if (!dryRun) {
    for (const record of [...create, ...update]) {
      await db.insert(table).values(values("GBIF", payload.sourceVersion, record)).onDuplicateKeyUpdate({ set: values("GBIF", payload.sourceVersion, record) });
    }
  }
  return { requested: records.length, create: create.length, update: update.length, skippedExistingName: skippedExistingName.map(record => record.scientificName) };
}

const [plants, freshwaterFish] = await Promise.all([
  importCatalog("plant", payload.plants),
  importCatalog("aquarium", payload.freshwaterFish),
]);
const receipt = {
  mode: dryRun ? "dry-run" : "import",
  importedAt: new Date().toISOString(),
  input: "data/imports/authoritative-taxonomy-gbif-2026-09.import.json",
  source: payload.source,
  sourceVersion: payload.sourceVersion,
  sourceLicense: payload.sourceLicense,
  sourceCitation: payload.sourceCitation,
  plants,
  freshwaterFish,
  imagePolicy: "No images imported; every image field remains null.",
};
if (!dryRun) await writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
console.log(JSON.stringify(receipt, null, 2));
process.exit(0);
