export type DayPhase = "night" | "dawn" | "day" | "dusk" | "evening";

export type DayPhaseState = {
  phase: DayPhase;
  label: string;
  shortLabel: string;
  hour: number;
  minute: number;
  minutesSinceMidnight: number;
};

const PHASE_LABELS: Record<DayPhase, { label: string; shortLabel: string }> = {
  night: { label: "Nacht", shortLabel: "NACHT" },
  dawn: { label: "Morgendämmerung", shortLabel: "MORGEN" },
  day: { label: "Tag", shortLabel: "TAG" },
  dusk: { label: "Abenddämmerung", shortLabel: "ABEND" },
  evening: { label: "Abend", shortLabel: "ABEND" },
};

export function getDayPhase(date = new Date()): DayPhase {
  const minutes = date.getHours() * 60 + date.getMinutes();
  if (minutes < 5 * 60) return "night";
  if (minutes < 8 * 60) return "dawn";
  if (minutes < 18 * 60) return "day";
  if (minutes < 21 * 60) return "dusk";
  return "evening";
}

export function getDayPhaseState(date = new Date()): DayPhaseState {
  const phase = getDayPhase(date);
  const labels = PHASE_LABELS[phase];
  return {
    phase,
    ...labels,
    hour: date.getHours(),
    minute: date.getMinutes(),
    minutesSinceMidnight: date.getHours() * 60 + date.getMinutes(),
  };
}

export function formatDayPhaseTime(state: DayPhaseState): string {
  return `${String(state.hour).padStart(2, "0")}:${String(state.minute).padStart(2, "0")}`;
}

/** Stable test hook: ?bwlTime=HH:MM is intentionally accepted only by clients. */
export function parseDayPhaseTime(value: string, base = new Date()): Date | null {
  const match = /^(?:[01]\d|2[0-3]):[0-5]\d$/.exec(value.trim());
  if (!match) return null;
  const [hour, minute] = value.split(":").map(Number);
  const result = new Date(base);
  result.setHours(hour, minute, 0, 0);
  return result;
}
