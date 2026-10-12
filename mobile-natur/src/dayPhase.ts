// Keep this tiny client module in sync with shared/day-phase.ts so Expo can bundle without a parent-root Metro dependency.
export type DayPhase = "night" | "dawn" | "day" | "dusk" | "evening";
export type DayPhaseState = { phase: DayPhase; label: string; shortLabel: string; hour: number; minute: number; minutesSinceMidnight: number };

const labels: Record<DayPhase, { label: string; shortLabel: string }> = {
  night: { label: "Nacht", shortLabel: "NACHT" },
  dawn: { label: "Morgendämmerung", shortLabel: "MORGEN" },
  day: { label: "Tag", shortLabel: "TAG" },
  dusk: { label: "Abenddämmerung", shortLabel: "ABEND" },
  evening: { label: "Abend", shortLabel: "ABEND" },
};

export function getDayPhase(date = new Date()): DayPhase {
  const minutes = date.getHours() * 60 + date.getMinutes();
  if (minutes < 300) return "night";
  if (minutes < 480) return "dawn";
  if (minutes < 1080) return "day";
  if (minutes < 1260) return "dusk";
  return "evening";
}

export function getDayPhaseState(date = new Date()): DayPhaseState {
  const phase = getDayPhase(date);
  return { phase, ...labels[phase], hour: date.getHours(), minute: date.getMinutes(), minutesSinceMidnight: date.getHours() * 60 + date.getMinutes() };
}

export function formatDayPhaseTime(state: DayPhaseState): string {
  return `${String(state.hour).padStart(2, "0")}:${String(state.minute).padStart(2, "0")}`;
}
