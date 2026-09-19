import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const input = JSON.parse(await fs.readFile(path.join(root, "data/imports/legacy-taxonomy-2024.json"), "utf8"));
const outputPath = path.join(root, "data/imports/taxonomy-image-candidates.json");
const names = [...new Set(input.records.map(record => record.scientificName.trim()))];
let existing = { records: [] };
try { existing = JSON.parse(await fs.readFile(outputPath, "utf8")); } catch { /* first run */ }
const byName = new Map((existing.records ?? []).map(record => [record.scientificName, record]));

function normalize(value) {
  return value.toLowerCase().replaceAll(/[“”'’.,:;()[\]{}]/g, " ").replaceAll(/\s+/g, " ").trim();
}

async function fetchCandidates(scientificName) {
  const search = `File:${scientificName}`;
  const params = new URLSearchParams({
    action: "query", format: "json", origin: "*", generator: "search",
    gsrsearch: search, gsrnamespace: "6", gsrlimit: "8", prop: "imageinfo",
    iiprop: "url|extmetadata", iiurlwidth: "1600",
  });
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
      headers: { "user-agent": "BlackWaterLeaf/1.0 (catalog-quality-audit; contact: blackwaterleaf@gmail.com)" },
    });
    if (response.ok) {
      const payload = await response.json();
      const pages = Object.values(payload.query?.pages ?? {});
      const normalizedName = normalize(scientificName);
      return pages.map(page => {
        const title = String(page.title ?? "").replace(/^File:/i, "").replace(/\.[^.]+$/, "");
        const metadata = page.imageinfo?.[0]?.extmetadata ?? {};
        return {
          title: page.title,
          titleNormalized: normalize(title),
          exactNameInTitle: normalize(title).includes(normalizedName),
          imageUrl: page.imageinfo?.[0]?.thumburl ?? page.imageinfo?.[0]?.url ?? null,
          sourcePageUrl: page.imageinfo?.[0]?.descriptionurl ?? null,
          license: metadata.LicenseShortName?.value ?? metadata.License?.value ?? null,
          artist: metadata.Artist?.value ?? null,
          credit: metadata.Credit?.value ?? null,
        };
      }).filter(candidate => candidate.imageUrl && candidate.sourcePageUrl);
    }
    if (response.status !== 429 && response.status < 500) throw new Error(`Wikimedia request failed ${response.status} for ${scientificName}`);
    const waitMs = 5000 * (attempt + 1);
    console.error(`rate limited for ${scientificName}; retry ${attempt + 1}/5 after ${waitMs}ms`);
    await new Promise(resolve => setTimeout(resolve, waitMs));
  }
  throw new Error(`Wikimedia retries exhausted for ${scientificName}`);
}

for (let index = 0; index < names.length; index += 1) {
  const scientificName = names[index];
  if (byName.has(scientificName) && (byName.get(scientificName)?.candidates?.length ?? 0) > 0) {
    console.error(`${index + 1}/${names.length} ${scientificName}: existing candidates`);
    continue;
  }
  const candidates = await fetchCandidates(scientificName);
  byName.set(scientificName, { scientificName, candidates });
  await fs.writeFile(outputPath, JSON.stringify({ generatedAt: new Date().toISOString(), source: "Wikimedia Commons API", records: names.map(name => byName.get(name)).filter(Boolean) }, null, 2));
  console.error(`${index + 1}/${names.length} ${scientificName}: ${candidates.length} candidates`);
  await new Promise(resolve => setTimeout(resolve, 3500));
}
console.log(`Wrote ${byName.size} name records`);
