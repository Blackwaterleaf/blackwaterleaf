import { describe, expect, it } from "vitest";
import { estimateVideoCost, getPlanLimits, STUDIO_PRICING } from "./pricing";

describe("video pricing", () => {
  it("returns a deterministic estimate", () => {
    const estimate = estimateVideoCost({ durationSeconds: 60, quality: "standard", voice: "synthetic", music: true, clips: 1 });
    expect(estimate.credits).toBe(66);
    expect(estimate.estimatedEurCents).toBe(132);
  });

  it("clamps unsafe duration and clip inputs", () => {
    const estimate = estimateVideoCost({ durationSeconds: 99999, quality: "high", voice: "premium", music: false, clips: 999 });
    expect(estimate.durationSeconds).toBe(1800);
    expect(estimate.clips).toBe(30);
    expect(estimate.credits).toBeGreaterThan(0);
  });

  it("keeps affordable tiers ordered by credits and limits", () => {
    const plans = STUDIO_PRICING.monthly;
    expect(plans.map(plan => plan.id)).toEqual(["free", "creator", "studio", "enterprise"]);
    expect(plans.map(plan => plan.monthlyCents)).toEqual([0, 990, 2490, 7900]);
    expect(plans.every(plan => plan.features.length >= 3)).toBe(true);
    expect(plans.map(plan => plan.includedCredits)).toEqual([20, 400, 1500, 6000]);
  });

  it("exposes the same limits used by server-side enforcement", () => {
    expect(getPlanLimits("free")).toEqual({ maxProjects: 1, maxActiveRuns: 1, maxRuntimeSeconds: 60, includedCredits: 20 });
    expect(getPlanLimits("studio").maxActiveRuns).toBe(8);
  });
});
