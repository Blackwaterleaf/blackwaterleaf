export type PlantNetAlternative = {
  species: string;
  score: number;
  commonNames: string[];
};

export type PlantNetValidation = {
  topSpecies: string;
  topScore: number;
  sameGenus: boolean;
  exactMatch: boolean;
  alternatives: PlantNetAlternative[];
  engineVersion?: string | null;
  referential?: string | null;
};

type PlantNetResponse = {
  version?: string;
  referential?: string;
  results?: Array<{
    score?: number;
    species?: {
      scientificNameWithoutAuthor?: string;
      commonNames?: string[];
    };
  }>;
};

function normalizeSpeciesName(value: string) {
  return value
    .toLowerCase()
    .replace(/\bauthorities?\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Sends one individual image to Pl@ntNet for an independent second opinion.
 * Missing credentials, timeouts and upstream errors deliberately return null so
 * the primary protected identification flow remains available and explicit.
 */
export async function validateWithPlantNet(
  imageBuffer: Buffer,
  mimeType: string,
  llmScientificName: string,
  timeoutMs = 8_000,
): Promise<PlantNetValidation | null> {
  return validateWithPlantNetImages([{ imageBuffer, mimeType }], llmScientificName, timeoutMs);
}

/** Sends all accepted views of the same individual in one provider request. */
export async function validateWithPlantNetImages(
  images: Array<{ imageBuffer: Buffer; mimeType: string; organ?: string }>,
  llmScientificName: string,
  timeoutMs = 8_000,
): Promise<PlantNetValidation | null> {
  const key = process.env.PLANTNET_API_KEY;
  if (!key) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const formData = new FormData();
    images.forEach((image, index) => {
      formData.append("images", new Blob([new Uint8Array(image.imageBuffer)], { type: image.mimeType || "image/jpeg" }), `plant-${index + 1}.jpg`);
      formData.append("organs", image.organ ?? "auto");
    });
    const response = await fetch(
      `https://my-api.plantnet.org/v2/identify/all?api-key=${encodeURIComponent(key)}&lang=de&nb-results=5`,
      { method: "POST", body: formData, signal: controller.signal },
    );
    if (!response.ok) return null;
    const payload = await response.json() as PlantNetResponse;
    const results = payload.results ?? [];
    if (!results.length) return null;

    const top = results[0];
    const topSpecies = top.species?.scientificNameWithoutAuthor?.trim() ?? "";
    if (!topSpecies) return null;
    const topScore = Math.round((top.score ?? 0) * 100);
    const llmName = normalizeSpeciesName(llmScientificName);
    const topName = normalizeSpeciesName(topSpecies);
    const topGenus = topName.split(" ")[0] ?? "";
    const llmGenus = llmName.split(" ")[0] ?? "";
    const exactMatch = Boolean(llmName && (topName === llmName || topName.startsWith(`${llmName} `) || llmName.startsWith(`${topName} `)));
    return {
      topSpecies,
      topScore,
      sameGenus: Boolean(topGenus && llmGenus && topGenus === llmGenus),
      exactMatch,
      alternatives: results.slice(0, 5).map(item => ({
        species: item.species?.scientificNameWithoutAuthor?.trim() ?? "Unbekannt",
        score: Math.round((item.score ?? 0) * 100),
        commonNames: (item.species?.commonNames ?? []).slice(0, 2),
      })),
      engineVersion: payload.version ?? null,
      referential: payload.referential ?? null,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
