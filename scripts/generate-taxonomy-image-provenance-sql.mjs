import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const input = JSON.parse(fs.readFileSync(path.join(root, "data/imports/taxonomy-image-candidates.json"), "utf8"));
const output = path.join(root, "data/imports/taxonomy-image-provenance-exact.sql");

const sql = value => `'${String(value ?? "").replaceAll("\\", "\\\\").replaceAll("'", "''")}'`;
const normalize = value => String(value ?? "").toLowerCase().replaceAll(/[“”'’.,:;()[\]{}]/g, " ").replaceAll(/\s+/g, " ").trim();
const plainText = value => String(value ?? "")
  .replaceAll(/<[^>]*>/g, "")
  .replaceAll("&amp;", "&")
  .replaceAll("&quot;", '"')
  .replaceAll("&#39;", "'")
  .replaceAll(/\s+/g, " ")
  .trim();
const preferred = record => (record.candidates ?? [])
  .filter(candidate => candidate.imageUrl && candidate.sourcePageUrl && candidate.license && candidate.exactNameInTitle)
  .sort((a, b) => Number(normalize(a.title?.replace(/^File:/i, "")).replace(/\.[^.]+$/, "") === normalize(record.scientificName)) - Number(normalize(b.title?.replace(/^File:/i, "")).replace(/\.[^.]+$/, "") === normalize(record.scientificName)) || String(a.title).localeCompare(String(b.title)))[0];

const statements = [];
for (const record of input.records ?? []) {
  const candidate = preferred(record);
  if (!candidate) continue;
  const table = /^Channa\s/i.test(record.scientificName) ? "aquarium_taxa" : "plant_taxa";
  const attribution = candidate.artist ? `© ${plainText(candidate.artist)} · Wikimedia Commons` : candidate.credit ? `${plainText(candidate.credit)} · Wikimedia Commons` : "Wikimedia Commons";
  statements.push(`UPDATE ${table} SET imageUrl=${sql(candidate.imageUrl)}, imageSourceUrl=${sql(candidate.sourcePageUrl)}, imageLicense=${sql(candidate.license)}, imageAttribution=${sql(attribution)}, imageVerifiedAt=CURRENT_TIMESTAMP WHERE scientificName=${sql(record.scientificName)} AND status='published';`);
}

const header = [
  "-- Generated from Wikimedia Commons candidates.",
  "-- Only exact scientific-name title matches with source URL, license and image URL are included.",
  "-- Remaining records stay unchanged and must not be presented as verified images.",
  "",
].join("\n");
fs.writeFileSync(output, `${header}${statements.join("\n")}\n`);
console.log(`Generated ${statements.length} idempotent provenance updates at ${output}`);
