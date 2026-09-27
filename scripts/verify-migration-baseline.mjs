import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const journal = resolve(root, "drizzle/meta/_journal.json");
const migrationsDir = resolve(root, "drizzle");
const baselineTag = "0037_woozy_inertia";
const expectedBaselineHash = "2dcf47f2b44d079f6148fc26129d253db143a30a07c0d4c0040a7a48da664596";

const hash = file => createHash("sha256").update(readFileSync(file)).digest("hex");
const journalData = JSON.parse(readFileSync(journal, "utf8"));
const sqlFiles = readdirSync(migrationsDir).filter(file => /^\d{4}_.*\.sql$/.test(file)).sort();
const baselineFile = `${baselineTag}.sql`;
const baselineIndex = sqlFiles.indexOf(baselineFile);
const journalTags = new Set(journalData.entries.map(entry => entry.tag));
const missingJournalEntries = sqlFiles.filter(file => !journalTags.has(file.replace(/\.sql$/, "")));

if (baselineIndex < 0 || missingJournalEntries.length > 0) {
  throw new Error("migration_baseline_mismatch: migration count, journal or baseline anchor changed");
}

const actualBaselineHash = hash(resolve(migrationsDir, baselineFile));
if (actualBaselineHash !== expectedBaselineHash) {
  throw new Error(`migration_baseline_hash_mismatch: baseline (${actualBaselineHash})`);
}

console.log(JSON.stringify({
  ok: true,
  migrationCount: sqlFiles.length,
  journalCount: journalData.entries.length,
  baseline: baselineFile,
  head: sqlFiles.at(-1),
  additiveMigrations: sqlFiles.slice(baselineIndex + 1),
}, null, 2));
