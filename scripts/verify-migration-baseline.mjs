import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const schema = resolve(root, "drizzle/schema.ts");
const journal = resolve(root, "drizzle/meta/_journal.json");
const migrationsDir = resolve(root, "drizzle");
const expected = {
  schema: "552cac5123aa2f85bd00ee1146c7c9be1560fcd60f69233d1b12b81be00f122c",
  journal: "4f8828297d442c830c442e8bf48a3700f6b57ac5941ceb8727d27b704be46d46",
  head: "c0718546f8f953e7a98f7eddd1b5fae44b6b97af2852818b92b12b0e4d575d64",
};
const hash = file => createHash("sha256").update(readFileSync(file)).digest("hex");
const journalData = JSON.parse(readFileSync(journal, "utf8"));
const sqlFiles = readdirSync(migrationsDir).filter(file => /^\d{4}_.*\.sql$/.test(file)).sort();
const head = resolve(migrationsDir, sqlFiles.at(-1));
const actual = { schema: hash(schema), journal: hash(journal), head: hash(head) };
if (sqlFiles.length !== 37 || journalData.entries.length !== 37 || journalData.entries.at(-1)?.tag !== "0036_lumpy_omega_sentinel") {
  throw new Error("migration_baseline_mismatch: migration count, journal or head changed");
}
for (const [key, value] of Object.entries(expected)) {
  if (actual[key] !== value) throw new Error(`migration_baseline_hash_mismatch: ${key}`);
}
console.log(JSON.stringify({ ok: true, migrationCount: sqlFiles.length, head: sqlFiles.at(-1), actual }, null, 2));
