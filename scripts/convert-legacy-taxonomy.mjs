import fs from "node:fs";

const inputPath = process.argv[2] ?? "data/imports/legacy-seed-taxonomy.sql";
const outputPath = process.argv[3] ?? "data/imports/legacy-taxonomy-2024.json";
const sql = fs.readFileSync(inputPath, "utf8");
const valuesStart = sql.indexOf("VALUES");
if (valuesStart < 0) throw new Error("No VALUES clause found");

function splitTuples(text) {
  const tuples = [];
  let depth = 0;
  let quote = false;
  let escaped = false;
  let start = -1;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quote) {
      if (ch === "'" && text[i + 1] === "'") { i += 1; continue; }
      if (ch === "\\" && !escaped) { escaped = true; continue; }
      if (ch === "'" && !escaped) quote = false;
      escaped = false;
      continue;
    }
    if (ch === "'") { quote = true; continue; }
    if (ch === "(") {
      if (depth === 0) start = i + 1;
      depth += 1;
    } else if (ch === ")") {
      depth -= 1;
      if (depth === 0 && start >= 0) tuples.push(text.slice(start, i));
    }
  }
  return tuples;
}

function splitFields(tuple) {
  const fields = [];
  let start = 0;
  let quote = false;
  let escaped = false;
  for (let i = 0; i < tuple.length; i += 1) {
    const ch = tuple[i];
    if (quote) {
      if (ch === "'" && tuple[i + 1] === "'") { i += 1; continue; }
      if (ch === "\\" && !escaped) { escaped = true; continue; }
      if (ch === "'" && !escaped) quote = false;
      escaped = false;
      continue;
    }
    if (ch === "'") { quote = true; continue; }
    if (ch === ",") { fields.push(tuple.slice(start, i).trim()); start = i + 1; }
  }
  fields.push(tuple.slice(start).trim());
  return fields;
}

function decode(value) {
  if (value.toUpperCase() === "NULL") return null;
  if (value.startsWith("'") && value.endsWith("'")) return value.slice(1, -1).replaceAll("''", "'").replaceAll("\\'", "'");
  return value;
}
function jsonValue(value, fallback) {
  if (value == null) return fallback;
  try { return JSON.parse(value); } catch { return fallback; }
}

const records = [];
for (const tuple of splitTuples(sql.slice(valuesStart + "VALUES".length))) {
  const fields = splitFields(tuple).map(decode);
  if (fields.length < 14) continue;
  const [scientificName, cultivar, genus, family, commonNames, synonyms, keyFeatures, habitat, careLevel, light, water, category, source, verified] = fields;
  if (scientificName === "scientificName") continue;
  const sourceRecordId = `${scientificName}${cultivar ? `:${cultivar}` : ""}`;
  records.push({
    source: source ?? "legacy-blackwaterleaf",
    sourceVersion: "legacy-taxonomy-2024",
    sourceRecordId,
    scientificName,
    acceptedScientificName: scientificName,
    rank: "species",
    family,
    genus,
    commonNames: jsonValue(commonNames, {}),
    synonyms: jsonValue(synonyms, []),
    summary: [cultivar ? `Kultivar: ${cultivar}` : null, habitat ? `Lebensraum: ${habitat}` : null, keyFeatures ? `Merkmale: ${jsonValue(keyFeatures, []).join("; ")}` : null].filter(Boolean).join("\n"),
    careProfile: { cultivar, careLevel, light, water, category },
    imageUrl: null,
    evidenceState: verified === "true" ? "confirmed" : "contextual",
    status: verified === "true" ? "published" : "draft",
  });
}

const deduped = [...new Map(records.map(record => [`${record.source}:${record.sourceVersion}:${record.sourceRecordId}`, record])).values()];
fs.writeFileSync(outputPath, `${JSON.stringify({ source: inputPath, recordCount: deduped.length, records: deduped }, null, 2)}\n`);
console.log(`Converted ${records.length} source tuples into ${deduped.length} records at ${outputPath}`);
