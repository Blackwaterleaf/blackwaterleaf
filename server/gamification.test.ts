import { describe, expect, it } from "vitest";
import { dayKey, levelForXp, XP_REWARDS } from "./gamification";

describe("BlackWaterLeaf XP rules", () => {
  it("uses fixed server-owned reward values", () => {
    expect(XP_REWARDS).toEqual({ dailyCheckIn: 5, observationPhoto: 10, assistantResponse: 3 });
  });

  it("creates stable UTC day keys", () => {
    expect(dayKey(new Date("2026-09-16T23:59:59.000Z"))).toBe("2026-09-16");
    expect(dayKey(new Date("2026-09-17T00:00:00.000Z"))).toBe("2026-09-17");
  });

  it("levels experience in 100-XP bands", () => {
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(99)).toBe(1);
    expect(levelForXp(100)).toBe(2);
    expect(levelForXp(275)).toBe(3);
  });
});
