import { describe, expect, it } from "vitest";
import { formatDayPhaseTime, getDayPhase, getDayPhaseState, parseDayPhaseTime } from "./day-phase";

const at = (value: string) => parseDayPhaseTime(value, new Date(2026, 8, 27))!;

describe("shared observatory day phases", () => {
  it("uses deterministic local-time boundaries", () => {
    expect(getDayPhase(at("04:59"))).toBe("night");
    expect(getDayPhase(at("05:00"))).toBe("dawn");
    expect(getDayPhase(at("08:00"))).toBe("day");
    expect(getDayPhase(at("18:00"))).toBe("dusk");
    expect(getDayPhase(at("21:00"))).toBe("evening");
    expect(getDayPhase(at("23:59"))).toBe("evening");
  });

  it("exposes a stable user-facing time label and rejects invalid simulation input", () => {
    const state = getDayPhaseState(at("07:04"));
    expect(state.label).toBe("Morgendämmerung");
    expect(formatDayPhaseTime(state)).toBe("07:04");
    expect(parseDayPhaseTime("25:00")).toBeNull();
  });
});
