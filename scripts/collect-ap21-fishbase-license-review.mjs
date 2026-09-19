import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const queuePath = path.join(root, "data/imports/ap21-official-media-review-queue.json");
const outputPath = path.join(root, "data/imports/ap21-fishbase-license-review.json");
const MAX_CONCURRENCY = 3;

function plain(value) {
  return String(value ?? "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

function slug(scientificName) {
  return scientificName.trim().replace(/\s+/g, "-");
}

async function getText(url, attempts = 2) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { "user-agent": "BlackWaterLeaf-AP21-FishBase-Licence-Review/1.0 (+https://blackwaterleaf.com)" } });
      if (response.ok) return response.text();
      lastError = new Error(`HTTP ${response.status} for ${url}`);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error(`Unable to fetch ${url}`);
}

function licenseStatus(html) {
  const text = plain(html).toLowerCase();
  if (text.includes("all rights reserved")) return "blocked_all_rights_reserved";
  if (/cc\s*by[-\s]*nc/.test(text) || text.includes("non-commercial")) return "blocked_non_commercial";
  if (/cc\s*by\s*4\.0/.test(text) || /creativecommons\.org\/licenses\/by\/4\.0/.test(text)) return "manual_review_cc_by_4_0";
  if (/cc\s*by\s*3\.0/.test(text) || /creativecommons\.org\/licenses\/by\/3\.0/.test(text)) return "manual_review_cc_by_3_0";
  if (/cc0|public domain/.test(text)) return "manual_review_public_domain";
  return "blocked_no_explicit_commercial_license";
}

function extractPictureCards(html, speciesPage) {
  const starts = Array.from(html.matchAll(/(?:\.\.\/)?images\/species\/([^"'\s>]+\.(?:jpg|jpeg|png|gif))/gi));
  return starts.map((match, index) => {
    const block = html.slice(match.index, starts[index + 1]?.index ?? html.length);
    const filename = match[1];
    const creatorMatch = block.match(/by\s*<a[^>]*>\s*([^<]+)<\/a>/i) ?? block.match(/by\s+([^<\n]+)/i);
    const highResRelative = block.match(/\.\.\/images\/HiRes_Pics\/([^"'\s<]+)/i)?.[1] ?? null;
    return {
      filename,
      sourcePage: speciesPage,
      directImageUrl: highResRelative ? `https://www.fishbase.se/images/HiRes_Pics/${highResRelative}` : `https://www.fishbase.se/images/species/${filename}`,
      creator: plain(creatorMatch?.[1] ?? "") || null,
      licenseStatus: licenseStatus(block),
      importEligibility: "manual_review_required",
    };
  });
}

async function mapLimit(items, mapper) {
  const output = new Array(items.length);
  let index = 0;
  await Promise.all(Array.from({ length: Math.min(MAX_CONCURRENCY, items.length) }, async () => {
    while (true) {
      const current = index++;
      if (current >= items.length) return;
      output[current] = await mapper(items[current]);
    }
  }));
  return output;
}

async function inspect(record) {
  const speciesPage = `https://www.fishbase.se/summary/${slug(record.scientificName)}.html`;
  try {
    const summaryHtml = await getText(speciesPage);
    const id = summaryHtml.match(/ThumbnailsSummary\.php\?ID=(\d+)/i)?.[1];
    if (!id) return { ...record, status: "species_page_without_picture_index", speciesPage, candidates: [] };
    const picturePage = `https://www.fishbase.se/photos/PicturesSummary.php?ID=${id}&what=species&showAll=yes`;
    const pictureHtml = await getText(picturePage);
    const candidates = extractPictureCards(pictureHtml, picturePage);
    const manualCandidates = candidates.filter(candidate => candidate.licenseStatus.startsWith("manual_review"));
    return {
      ...record,
      fishBaseSpeciesId: Number(id),
      speciesPage,
      picturePage,
      discoveredPictureCards: candidates.length,
      status: manualCandidates.length ? "candidate_requires_manual_visual_review" : candidates.length ? "no_commercially_reusable_license_found" : "no_picture_records",
      candidates,
    };
  } catch (error) {
    return { ...record, status: "lookup_error", speciesPage, error: error instanceof Error ? error.message : String(error), candidates: [] };
  }
}

const queue = JSON.parse(await fs.readFile(queuePath, "utf8"));
const records = await mapLimit(queue.aquarium, inspect);
const report = {
  generatedAt: new Date().toISOString(),
  purpose: "FishBase individual image-card license review only. No production import, no download and no image publication.",
  policy: "Only exact Channa species with an explicit commercial reusable license can advance to visual review. CC-BY-NC and all-rights-reserved media remain blocked.",
  summary: {
    queued: records.length,
    manualReviewCandidates: records.reduce((count, record) => count + record.candidates.filter(candidate => candidate.licenseStatus.startsWith("manual_review")).length, 0),
    blockedCandidates: records.reduce((count, record) => count + record.candidates.filter(candidate => candidate.licenseStatus.startsWith("blocked_")).length, 0),
    inspectedPictureCards: records.reduce((count, record) => count + (record.discoveredPictureCards ?? 0), 0),
    lookupErrors: records.filter(record => record.status === "lookup_error").length,
  },
  records,
};
await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report.summary));
console.log(outputPath);
