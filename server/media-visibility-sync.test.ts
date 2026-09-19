import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const community = readFileSync(resolve(root, "server/routers/community.ts"), "utf8");
const admin = readFileSync(resolve(root, "server/routers/admin.ts"), "utf8");
const observations = readFileSync(resolve(root, "server/routers/observations.ts"), "utf8");

describe("AP-08 media visibility synchronization", () => {
  it("revokes post media when an owner deletes a post", () => {
    expect(community).toContain('set({ visibility: "private" })');
    expect(community).toContain('eq(mediaAssets.postId, input.postId)');
  });

  it("revokes post media for both staff moderation and admin deletion", () => {
    expect(admin.match(/eq\(mediaAssets\.postId, input\.id\)/g)?.length).toBe(2);
    expect(admin).toContain('set({ visibility: "private" })');
  });

  it("synchronizes observation media with visibility changes and reads through policy", () => {
    expect(observations).toContain("canReadMedia");
    expect(observations).toContain("eq(mediaAssets.observationId, id)");
    expect(observations).toContain("set({ visibility: input.visibility })");
  });
});
