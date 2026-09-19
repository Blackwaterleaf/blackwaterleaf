import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const schema = resolve(root, "drizzle/schema.ts");
const journal = resolve(root, "drizzle/meta/_journal.json");
const migrationsDir = resolve(root, "drizzle");
const expected = {
  schema: "a041ffa9cf7c9fa1108d6c93ede6957fa2ee6b788fc3313a23506cd04ab310c6",
  journal: "2b0856a23a0141bac3212dc24ab9356a9dba171ecf3cde28a9a425ff59fe606d",
  head: "13e5f8182e9d45fe0ff6a8142d15d436b95a5983cf8634ee851d4446a1ac2ba6",
};
const hash = file => createHash("sha256").update(readFileSync(file)).digest("hex");
const journalData = JSON.parse(readFileSync(journal, "utf8"));
const sqlFiles = readdirSync(migrationsDir).filter(file => /^\d{4}_.*\.sql$/.test(file)).sort();
const head = resolve(migrationsDir, sqlFiles.at(-1));
const actual = { schema: hash(schema), journal: hash(journal), head: hash(head) };
if (sqlFiles.length !== 27 || journalData.entries.length !== 27 || journalData.entries.at(-1)?.tag !== "0026_sticky_dazzler") {
  throw new Error("migration_baseline_mismatch: migration count, journal or head changed");
}
for (const [key, value] of Object.entries(expected)) {
  if (actual[key] !== value) throw new Error(`migration_baseline_hash_mismatch: ${key}`);
}
console.log(JSON.stringify({ ok: true, migrationCount: sqlFiles.length, head: sqlFiles.at(-1), actual }, null, 2));
