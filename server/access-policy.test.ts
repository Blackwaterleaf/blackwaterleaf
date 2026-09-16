import { describe, expect, it } from "vitest";
import { canReadCommunityPost, canReadObservation, canReadProfile, isResourceOwner } from "./accessPolicy";

describe("BlackWaterLeaf ownership and visibility policy", () => {
  it("never treats a foreign account as the owner", () => {
    expect(isResourceOwner(7, 7)).toBe(true);
    expect(isResourceOwner(7, 8)).toBe(false);
  });

  it("keeps private and unlisted observations inaccessible to other users", () => {
    expect(canReadObservation({ viewerId: 7, ownerId: 8, ownerStatus: "active", visibility: "private" })).toBe(false);
    expect(canReadObservation({ viewerId: 7, ownerId: 8, ownerStatus: "active", visibility: "unlisted" })).toBe(false);
    expect(canReadObservation({ viewerId: null, ownerId: 8, ownerStatus: "active", visibility: "public" })).toBe(true);
  });

  it("lets an owner read their own private profile but never publishes suspended accounts", () => {
    expect(canReadProfile({ viewerId: 4, ownerId: 4, ownerStatus: "active", visibility: "private" })).toBe(true);
    expect(canReadProfile({ viewerId: null, ownerId: 4, ownerStatus: "suspended", visibility: "public" })).toBe(false);
  });

  it("exposes only published public community posts from active authors", () => {
    expect(canReadCommunityPost({ authorStatus: "active", visibility: "public", publicationStatus: "published" })).toBe(true);
    expect(canReadCommunityPost({ authorStatus: "active", visibility: "private", publicationStatus: "draft" })).toBe(false);
    expect(canReadCommunityPost({ authorStatus: "banned", visibility: "public", publicationStatus: "published" })).toBe(false);
  });
});
