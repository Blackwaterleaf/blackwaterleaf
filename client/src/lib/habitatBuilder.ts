export type BuilderHabitatKind = "aquarium" | "terrarium";

export type BuilderDimensions = {
  lengthCm: number | null;
  widthCm: number | null;
  heightCm: number | null;
};

export type HabitatDetails = Record<string, unknown>;

function finitePositiveNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
}

export function dimensionsFromHabitat(details: HabitatDetails): BuilderDimensions {
  return {
    lengthCm: finitePositiveNumber(details.lengthCm),
    widthCm: finitePositiveNumber(details.widthCm),
    heightCm: finitePositiveNumber(details.heightCm),
  };
}

export function grossVolumeLiters(dimensions: BuilderDimensions): number | null {
  const { lengthCm, widthCm, heightCm } = dimensions;
  if (!lengthCm || !widthCm || !heightCm) return null;
  return Math.round((lengthCm * widthCm * heightCm) / 1_000);
}

export function hasCompleteDimensions(dimensions: BuilderDimensions): boolean {
  return dimensions.lengthCm !== null && dimensions.widthCm !== null && dimensions.heightCm !== null;
}

export function displayDimension(value: number | null): string {
  return value === null ? "" : String(value);
}

export function parseDimension(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 && parsed <= 10_000 ? parsed : null;
}
