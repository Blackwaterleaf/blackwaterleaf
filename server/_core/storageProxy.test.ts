import { describe, expect, it } from "vitest";
import { isPublicDesignStorageKey } from "./storageProxy";

describe("legacy storage proxy access policy", () => {
  it("allows only versioned public design assets", () => {
    expect(isPublicDesignStorageKey("botany-rainforest_def7888b.jpg")).toBe(true);
    expect(isPublicDesignStorageKey("assistant-reference_4510581b.jpg")).toBe(true);
  });

  it("never accepts raw private or unrecognized storage keys", () => {
    expect(isPublicDesignStorageKey("users/42/avatars/avatar_abc123.jpg")).toBe(false);
    expect(isPublicDesignStorageKey("partners/7/products/3/image_abc123.jpg")).toBe(false);
    expect(isPublicDesignStorageKey("unrecognized-image.jpg")).toBe(false);
  });
});
