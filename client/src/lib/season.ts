export type BlackWaterLeafSeason = "spring" | "summer" | "autumn" | "winter";

export function getBlackWaterLeafSeason(date = new Date()): BlackWaterLeafSeason {
  const month = date.getMonth() + 1;
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

export const BLACKWATERLEAF_SEASON_LABELS: Record<BlackWaterLeafSeason, string> = {
  spring: "Frühling",
  summer: "Sommer",
  autumn: "Herbst",
  winter: "Winter",
};
