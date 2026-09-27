import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { aquariumTaxa, plantTaxa, terrariumTaxa } from "../drizzle/schema";
import { getDb } from "../server/db";

const root = process.cwd();
const inputPath = resolve(root, "data/imports/catalog-expansion-gbif-2026-09.json");
const receiptPath = resolve(root, "data/imports/catalog-expansion-gbif-2026-09-import-receipt.json");
const dryRun = process.argv.includes("--dry-run");

type RecordKind = "plant" | "aquarium" | "terrarium";
type ExpansionRecord = {
  kind: RecordKind;
  source: string;
  sourceVersion: string;
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
  summary: string | null;
  careProfile: Record<string, unknown> | null;
  evidenceState: "confirmed";
  status: "draft";
};

type Payload = {
  plants: ExpansionRecord[];
  freshwaterFish: ExpansionRecord[];
  terrarium: ExpansionRecord[];
};

const payload = JSON.parse(await readFile(inputPath, "utf8")) as Payload;
const all = [...payload.plants, ...payload.freshwaterFish, ...payload.terrarium];
if (all.length !== 1_500) throw new Error(`unexpected_record_count:${all.length}`);
const seen = new Set<string>();
for (const record of all) {
  if (record.source !== "GBIF" || record.sourceLicense !== "CC BY 4.0" || record.rank !== "species" || record.taxonomicStatus !== "accepted" || record.matchConfidence < 95 || record.status !== "draft") {
    throw new Error(`invalid_draft_record:${record.scientificName}`);
  }
  const key = `${record.kind}|${record.source}|${record.sourceVersion}|${record.sourceRecordId}`;
  if (seen.has(key)) throw new Error(`duplicate_record:${key}`);
  seen.add(key);
}

const db = await getDb();
if (!db && !dryRun) throw new Error("database_unavailable");

function values(record: ExpansionRecord) {
  return {
    source: record.source,
    sourceVersion: record.sourceVersion,
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

const result = {
  mode: dryRun ? "dry-run" : "import",
  requested: { plants: payload.plants.length, freshwaterFish: payload.freshwaterFish.length, terrarium: payload.terrarium.length },
  insertedOrUpdated: 0,
  policy: "Taxonomy-only drafts. No care claims or images are published until independently sourced and verified.",
};

if (!dryRun && db) {
  const groups: Array<[RecordKind, ExpansionRecord[], typeof plantTaxa | typeof aquariumTaxa | typeof terrariumTaxa]> = [
    ["plant", payload.plants, plantTaxa],
    ["aquarium", payload.freshwaterFish, aquariumTaxa],
    ["terrarium", payload.terrarium, terrariumTaxa],
  ];
  for (const [, records, table] of groups) {
    for (const record of records) {
      await db.insert(table).values(values(record)).onDuplicateKeyUpdate({ set: values(record) });
      result.insertedOrUpdated += 1;
    }
  }
}

await writeFile(receiptPath, `${JSON.stringify({ ...result, completedAt: new Date().toISOString() }, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
