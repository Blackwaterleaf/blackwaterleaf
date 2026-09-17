import { describe, expect, it } from "vitest";
import { assertValidMediaContext, hasValidMediaContext } from "./mediaIntegrity";

describe("media relation integrity", () => {
  it("permits exactly one valid parent context for every media kind", () => {
    expect(hasValidMediaContext({ kind: "avatar", observationId: null, postId: null, habitatId: null })).toBe(true);
    expect(hasValidMediaContext({ kind: "observation_image", observationId: 2, postId: null, habitatId: null })).toBe(true);
    expect(hasValidMediaContext({ kind: "post_image", observationId: null, postId: 3, habitatId: null })).toBe(true);
    expect(hasValidMediaContext({ kind: "habitat_image", observationId: null, postId: null, habitatId: 4 })).toBe(true);
  });

  it("rejects orphaned and cross-context media records", () => {
    expect(hasValidMediaContext({ kind: "observation_image", observationId: null, postId: null, habitatId: null })).toBe(false);
    expect(() => assertValidMediaContext({ kind: "post_image", observationId: 2, postId: 3, habitatId: null })).toThrow("invalid_media_context");
  });
});
