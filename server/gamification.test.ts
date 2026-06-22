import { describe, expect, it } from "vitest";
import { levelForXp, LEVELS } from "./db";

describe("levelForXp", () => {
  it("returns level 1 for 0 XP", () => {
    const r = levelForXp(0);
    expect(r.level).toBe(1);
    expect(r.title).toBe(LEVELS[0].title);
    expect(r.nextLevelXp).toBe(LEVELS[1].minXp);
  });

  it("promotes to the correct level at thresholds", () => {
    const second = LEVELS[1];
    const r = levelForXp(second.minXp);
    expect(r.level).toBe(second.level);
    expect(r.title).toBe(second.title);
  });

  it("returns the highest level with null next at max", () => {
    const top = LEVELS[LEVELS.length - 1];
    const r = levelForXp(top.minXp + 10_000);
    expect(r.level).toBe(top.level);
    expect(r.nextLevelXp).toBeNull();
    expect(r.nextTitle).toBeNull();
  });

  it("stays on a level just below the next threshold", () => {
    const second = LEVELS[1];
    const r = levelForXp(second.minXp - 1);
    expect(r.level).toBe(LEVELS[0].level);
    expect(r.nextLevelXp).toBe(second.minXp);
  });
});
