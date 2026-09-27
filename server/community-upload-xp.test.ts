import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const community = readFileSync(resolve(root, "server/routers/community.ts"), "utf8");
const gamification = readFileSync(resolve(root, "server/gamification.ts"), "utf8");
const nativeApi = readFileSync(resolve(root, "mobile-natur/src/api.ts"), "utf8");

 describe("community image XP contract", () => {
  it("awards a fixed idempotent reward after a successful image upload", () => {
    expect(community).toContain("awardXpIfReady(db");
    expect(community).toContain("eventType: \"photo_upload\"");
    expect(community).toContain("community-photo:${post.id}");
    expect(community).toContain("xpAwarded: xp.amount");
    expect(gamification).toContain("communityPhoto: 10");
    expect(nativeApi).toContain("xpAwarded: number");
  });
});
