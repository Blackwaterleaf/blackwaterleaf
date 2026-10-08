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

/**
 * BlackWaterLeaf IONOS-only policy.
 *
 * PlantNet would require sending user-uploaded plant images to a third-party
 * service. Until an equivalent in-IONOS validation service is configured, both
 * adapters intentionally return null and perform no network request.
 */
export async function validateWithPlantNet(
  _imageBuffer: Buffer,
  _mimeType: string,
  _llmScientificName: string,
  _timeoutMs = 8_000,
): Promise<PlantNetValidation | null> {
  return null;
}

export async function validateWithPlantNetImages(
  _images: Array<{ imageBuffer: Buffer; mimeType: string; organ?: string }>,
  _llmScientificName: string,
  _timeoutMs = 8_000,
): Promise<PlantNetValidation | null> {
  return null;
}
