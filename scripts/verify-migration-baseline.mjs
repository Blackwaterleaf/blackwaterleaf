import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const schema = resolve(root, "drizzle/schema.ts");
const journal = resolve(root, "drizzle/meta/_journal.json");
const migrationsDir = resolve(root, "drizzle");
const expected = {
  schema: "e3458fc6a717c18f4677efa3e10354052d82903d86a75ca7fdf3469e98afb538",
  journal: "bf77326ff1859c1d723b483bbc5958e22b590dcccf3079543cca4421a8e451e8",
  head: "2dcf47f2b44d079f6148fc26129d253db143a30a07c0d4c0040a7a48da664596",
};
const hash = file => createHash("sha256").update(readFileSync(file)).digest("hex");
const journalData = JSON.parse(readFileSync(journal, "utf8"));
const sqlFiles = readdirSync(migrationsDir).filter(file => /^\d{4}_.*\.sql$/.test(file)).sort();
const head = resolve(migrationsDir, sqlFiles.at(-1));
const actual = { schema: hash(schema), journal: hash(journal), head: hash(head) };
if (sqlFiles.length !== 38 || journalData.entries.length !== 38 || journalData.entries.at(-1)?.tag !== "0037_woozy_inertia") {
  throw new Error("migration_baseline_mismatch: migration count, journal or head changed");
}
for (const [key, value] of Object.entries(expected)) {
  if (actual[key] !== value) throw new Error(`migration_baseline_hash_mismatch: ${key}`);
}
console.log(JSON.stringify({ ok: true, migrationCount: sqlFiles.length, head: sqlFiles.at(-1), actual }, null, 2));
