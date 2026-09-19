import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const outputPath = path.join(root, "data/imports/missing-taxonomy-wikidata-media.json");
const names = [
  "Alocasia azlanii", "Alocasia infernalis", "Alocasia maharani", "Alocasia lauterbachiana",
  "Alocasia melo", "Alocasia nebula", "Alocasia princeps", "Alocasia reversa", "Alocasia stingray",
  "Bucephalandra sp.", "Cryptocoryne balansae", "Cryptocoryne parva", "Cryptocoryne undulata",
  "Hemianthus callitrichoides", "Monstera standleyana", "Philodendron atabapoense",
  "Philodendron domesticum", "Philodendron gloriosum x melanochrysum", "Philodendron plowmanii",
  "Philodendron spiritus sancti", "Taxiphyllum barbieri", "Channa ornatipinnis",
];

async function getJson(url) {
  const response = await fetch(url, { headers: { "user-agent": "BlackWaterLeaf/1.0 (catalog-quality-audit; contact: blackwaterleaf@gmail.com)" } });
  if (!response.ok) throw new Error(`Request failed ${response.status}: ${url}`);
  return response.json();
}

async function searchWikidata(name) {
  const params = new URLSearchParams({ action: "wbsearchentities", search: name, language: "en", format: "json", limit: "5" });
  const payload = await getJson(`https://www.wikidata.org/w/api.php?${params}`);
  return payload.search ?? [];
}

async function entityMedia(id) {
  const params = new URLSearchParams({ action: "wbgetentities", ids: id, props: "claims|labels|descriptions|sitelinks", languages: "en", format: "json" });
  const payload = await getJson(`https://www.wikidata.org/w/api.php?${params}`);
  const entity = payload.entities?.[id] ?? {};
  const imageClaims = entity.claims?.P18 ?? [];
  const images = imageClaims.map(claim => claim.mainsnak?.datavalue?.value).filter(Boolean);
  const categoryClaims = entity.claims?.P373 ?? [];
  const categories = categoryClaims.map(claim => claim.mainsnak?.datavalue?.value).filter(Boolean);
  return { id, label: entity.labels?.en?.value ?? null, description: entity.descriptions?.en?.value ?? null, images, categories };
}

async function commonsFile(filename) {
  const params = new URLSearchParams({ action: "query", titles: `File:${filename}`, prop: "imageinfo", iiprop: "url|extmetadata", iiurlwidth: "1600", format: "json", origin: "*" });
  const payload = await getJson(`https://commons.wikimedia.org/w/api.php?${params}`);
  const page = Object.values(payload.query?.pages ?? {})[0];
  const info = page?.imageinfo?.[0];
  if (!info) return null;
  const meta = info.extmetadata ?? {};
  return { title: page.title, imageUrl: info.thumburl ?? info.url ?? null, sourcePageUrl: info.descriptionurl ?? null, license: meta.LicenseShortName?.value ?? meta.License?.value ?? null, artist: meta.Artist?.value ?? null };
}

const records = [];
for (const name of names) {
  const search = await searchWikidata(name);
  const exact = search.find(item => item.label?.toLowerCase() === name.toLowerCase()) ?? search[0] ?? null;
  const entity = exact ? await entityMedia(exact.id) : null;
  const files = [];
  for (const filename of entity?.images ?? []) files.push(await commonsFile(filename));
  records.push({ name, wikidataSearch: search.slice(0, 5).map(item => ({ id: item.id, label: item.label, description: item.description })), entity, files: files.filter(Boolean) });
  await fs.writeFile(outputPath, JSON.stringify({ generatedAt: new Date().toISOString(), source: "Wikidata + Wikimedia Commons", reviewOnly: true, records }, null, 2));
  console.error(`${records.length}/${names.length} ${name}`);
  await new Promise(resolve => setTimeout(resolve, 900));
}
console.log(`Wrote ${records.length} records to ${outputPath}`);
