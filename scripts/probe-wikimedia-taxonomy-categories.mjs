import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const outputPath = path.join(root, "data/imports/missing-taxonomy-category-media.json");
const names = [
  "Alocasia azlanii", "Alocasia infernalis", "Alocasia maharani", "Alocasia lauterbachiana",
  "Alocasia melo", "Alocasia nebula", "Alocasia princeps", "Alocasia reversa", "Alocasia stingray",
  "Bucephalandra", "Cryptocoryne balansae", "Cryptocoryne parva", "Cryptocoryne undulata",
  "Hemianthus callitrichoides", "Monstera standleyana", "Philodendron atabapoense",
  "Philodendron domesticum", "Philodendron plowmanii", "Philodendron spiritus sancti",
  "Taxiphyllum barbieri", "Channa ornatipinnis",
];

async function getJson(url) {
  const response = await fetch(url, { headers: { "user-agent": "BlackWaterLeaf/1.0 (catalog-quality-audit; contact: blackwaterleaf@gmail.com)" } });
  if (!response.ok) throw new Error(`Request failed ${response.status}: ${url}`);
  return response.json();
}

async function categoryFiles(name) {
  const params = new URLSearchParams({ action: "query", list: "categorymembers", cmtitle: `Category:${name}`, cmnamespace: "6", cmlimit: "50", format: "json", origin: "*" });
  const payload = await getJson(`https://commons.wikimedia.org/w/api.php?${params}`);
  const titles = (payload.query?.categorymembers ?? []).map(item => item.title);
  if (!titles.length) return [];
  const infoParams = new URLSearchParams({ action: "query", titles: titles.join("|"), prop: "imageinfo", iiprop: "url|extmetadata", iiurlwidth: "1600", format: "json", origin: "*" });
  const info = await getJson(`https://commons.wikimedia.org/w/api.php?${infoParams}`);
  return Object.values(info.query?.pages ?? {}).map(page => {
    const image = page.imageinfo?.[0];
    const meta = image?.extmetadata ?? {};
    return { title: page.title, imageUrl: image?.thumburl ?? image?.url ?? null, sourcePageUrl: image?.descriptionurl ?? null, license: meta.LicenseShortName?.value ?? meta.License?.value ?? null, artist: meta.Artist?.value ?? null };
  }).filter(item => item.imageUrl && item.sourcePageUrl);
}

const records = [];
for (const name of names) {
  records.push({ name, candidates: await categoryFiles(name) });
  await fs.writeFile(outputPath, JSON.stringify({ generatedAt: new Date().toISOString(), source: "Wikimedia Commons category API", reviewOnly: true, records }, null, 2));
  console.error(`${records.length}/${names.length} ${name}`);
  await new Promise(resolve => setTimeout(resolve, 700));
}
console.log(`Wrote ${records.length} category records to ${outputPath}`);
