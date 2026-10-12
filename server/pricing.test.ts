import { describe, expect, it } from "vitest";
import { estimateVideoCost } from "./pricing";

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
});
