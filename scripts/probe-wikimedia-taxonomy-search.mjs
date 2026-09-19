import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const outputPath = path.join(root, "data/imports/missing-taxonomy-image-search-probe.json");
const names = [
  "Alocasia azlanii", "Alocasia infernalis", "Alocasia maharani", "Alocasia lauterbachiana",
  "Alocasia melo", "Alocasia nebula", "Alocasia princeps", "Alocasia reversa", "Alocasia stingray",
  "Bucephalandra", "Cryptocoryne balansae", "Cryptocoryne parva", "Cryptocoryne undulata",
  "Hemianthus callitrichoides", "Monstera standleyana", "Philodendron atabapoense",
  "Philodendron domesticum", "Philodendron gloriosum melanochrysum", "Philodendron plowmanii",
  "Philodendron spiritus sancti", "Taxiphyllum barbieri", "Channa ornatipinnis",
];

async function search(query) {
  const params = new URLSearchParams({
    action: "query", format: "json", origin: "*", generator: "search",
    gsrsearch: query, gsrnamespace: "6", gsrlimit: "20", prop: "imageinfo",
    iiprop: "url|extmetadata", iiurlwidth: "1600",
  });
  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
    headers: { "user-agent": "BlackWaterLeaf/1.0 (catalog-quality-audit; contact: blackwaterleaf@gmail.com)" },
  });
  if (!response.ok) throw new Error(`Wikimedia request failed ${response.status} for ${query}`);
  const payload = await response.json();
  return Object.values(payload.query?.pages ?? {}).map(page => {
    const info = page.imageinfo?.[0] ?? {};
    const meta = info.extmetadata ?? {};
    return {
      title: page.title,
      imageUrl: info.thumburl ?? info.url ?? null,
      sourcePageUrl: info.descriptionurl ?? null,
      license: meta.LicenseShortName?.value ?? meta.License?.value ?? null,
      artist: meta.Artist?.value ?? null,
    };
  }).filter(item => item.imageUrl && item.sourcePageUrl);
}

const records = [];
for (const name of names) {
  const variants = [name, `"${name}"`];
  const results = [];
  for (const query of variants) {
    results.push({ query, candidates: await search(query) });
    await new Promise(resolve => setTimeout(resolve, 800));
  }
  records.push({ name, results });
  await fs.writeFile(outputPath, JSON.stringify({ generatedAt: new Date().toISOString(), source: "Wikimedia Commons API", records }, null, 2));
  console.error(`${records.length}/${names.length} ${name}`);
}
console.log(`Wrote ${records.length} probe records to ${outputPath}`);
