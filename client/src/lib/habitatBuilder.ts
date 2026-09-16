export type BuilderHabitatKind = "aquarium" | "terrarium";

export type BuilderDimensions = {
  lengthCm: number | null;
  widthCm: number | null;
  heightCm: number | null;
};

export type BuilderPlacementType =
  | "hardscape"
  | "leaf-litter"
  | "plants"
  | "filter"
  | "structure"
  | "substrate"
  | "climate";

export type BuilderPlacement = {
  id: string;
  type: BuilderPlacementType;
  xPct: number;
  zPct: number;
  rotationDeg: number;
  scale: number;
};

export type HabitatDetails = Record<string, unknown>;

export const MAX_BUILDER_PLACEMENTS = 24;

function finitePositiveNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
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

export function createBuilderPlacement(id: string, type: BuilderPlacementType, xPct = 0, zPct = 0): BuilderPlacement {
  return {
    id,
    type,
    xPct: clamp(Number.isFinite(xPct) ? xPct : 0, -92, 92),
    zPct: clamp(Number.isFinite(zPct) ? zPct : 0, -92, 92),
    rotationDeg: 0,
    scale: 1,
  };
}

export function normalizeBuilderPlacement(placement: BuilderPlacement): BuilderPlacement {
  return {
    ...placement,
    xPct: clamp(Number.isFinite(placement.xPct) ? placement.xPct : 0, -92, 92),
    zPct: clamp(Number.isFinite(placement.zPct) ? placement.zPct : 0, -92, 92),
    rotationDeg: clamp(Number.isFinite(placement.rotationDeg) ? placement.rotationDeg : 0, -180, 180),
    scale: clamp(Number.isFinite(placement.scale) ? placement.scale : 1, 0.5, 1.8),
  };
}

export function isPlacementTypeForHabitat(type: BuilderPlacementType, habitat: BuilderHabitatKind): boolean {
  return habitat === "aquarium"
    ? ["hardscape", "leaf-litter", "plants", "filter"].includes(type)
    : ["structure", "substrate", "plants", "climate"].includes(type);
}
