import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const outputPath = path.join(root, "data/imports/missing-taxonomy-image-candidates.json");
const names = [
  "Alocasia azlanii", "Alocasia clypeolata", "Alocasia infernalis", "Alocasia lauterbachiana",
  "Alocasia maharani", "Alocasia melo", "Alocasia nebula", "Alocasia princeps", "Alocasia reversa",
  "Alocasia stingray", "Bucephalandra sp.", "Cryptocoryne balansae", "Cryptocoryne parva",
  "Cryptocoryne undulata", "Hemianthus callitrichoides", "Monstera standleyana",
  "Philodendron atabapoense", "Philodendron domesticum", "Philodendron gloriosum x melanochrysum",
  "Philodendron plowmanii", "Philodendron spiritus sancti", "Taxiphyllum barbieri", "Channa ornatipinnis",
];

const normalize = value => String(value).toLowerCase()
  .replaceAll(/[“”'’.,:;()[\]{}]/g, " ").replaceAll(/\s+/g, " ").trim();

function queryFor(name) {
  if (name === "Bucephalandra sp.") return "File:Bucephalandra";
  if (name === "Philodendron gloriosum x melanochrysum") return "File:Philodendron gloriosum melanochrysum";
  return `File:${name}`;
}

async function fetchCandidates(scientificName) {
  const params = new URLSearchParams({
    action: "query", format: "json", origin: "*", generator: "search",
    gsrsearch: queryFor(scientificName), gsrnamespace: "6", gsrlimit: "10", prop: "imageinfo",
    iiprop: "url|extmetadata", iiurlwidth: "1600",
  });
  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
    headers: { "user-agent": "BlackWaterLeaf/1.0 (catalog-quality-audit; contact: blackwaterleaf@gmail.com)" },
  });
  if (!response.ok) throw new Error(`Wikimedia request failed ${response.status} for ${scientificName}`);
  const payload = await response.json();
  return Object.values(payload.query?.pages ?? {}).map(page => {
    const title = String(page.title ?? "").replace(/^File:/i, "").replace(/\.[^.]+$/, "");
    const metadata = page.imageinfo?.[0]?.extmetadata ?? {};
    return {
      title: page.title,
      titleNormalized: normalize(title),
      exactNameInTitle: normalize(title).includes(normalize(scientificName)),
      imageUrl: page.imageinfo?.[0]?.thumburl ?? page.imageinfo?.[0]?.url ?? null,
      sourcePageUrl: page.imageinfo?.[0]?.descriptionurl ?? null,
      license: metadata.LicenseShortName?.value ?? metadata.License?.value ?? null,
      artist: metadata.Artist?.value ?? null,
      credit: metadata.Credit?.value ?? null,
    };
  }).filter(candidate => candidate.imageUrl && candidate.sourcePageUrl);
}

const records = [];
for (const [index, scientificName] of names.entries()) {
  const candidates = await fetchCandidates(scientificName);
  records.push({ scientificName, candidates });
  await fs.writeFile(outputPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    source: "Wikimedia Commons API",
    reviewOnly: true,
    records,
  }, null, 2));
  console.error(`${index + 1}/${names.length} ${scientificName}: ${candidates.length} candidates`);
  await new Promise(resolve => setTimeout(resolve, 1200));
}

console.log(JSON.stringify(records.map(record => ({
  scientificName: record.scientificName,
  candidates: record.candidates.slice(0, 4).map(candidate => ({
    title: candidate.title,
    exactNameInTitle: candidate.exactNameInTitle,
    license: candidate.license,
  })),
})), null, 2));
console.error(`Wrote ${records.length} review records to ${outputPath}`);
