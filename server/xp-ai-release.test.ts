import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { XP_POLICY_VERSION, XP_REWARDS, dayKey, levelForXp } from "./gamification";

const projectRoot = join(import.meta.dirname, "..");
const source = (relativePath: string) => readFileSync(join(projectRoot, relativePath), "utf8");

describe("XP and AI staged release guards", () => {
  it("keeps the legacy XP journal vocabulary and server-owned policy version", () => {
    expect(XP_POLICY_VERSION).toBe("xp-2026-09-16-v1");
    expect(XP_REWARDS).toEqual({ dailyCheckIn: 5, observationPhoto: 10, assistantResponse: 3 });
    expect(dayKey(new Date("2026-09-16T00:00:00.000Z"))).toBe("2026-09-16");
    expect(levelForXp(200)).toBe(3);

    const schema = source("drizzle/schema.ts");
    expect(schema).toContain('"daily_login", "photo_upload", "ai_use"');
    expect(schema).toContain('"session", "media_asset", "ai_request"');
    expect(schema).toContain('uniqueIndex("xp_events_event_key_unique")');
  });

  it("keeps the staged migration additive and excludes the existing XP journal", () => {
    const migration = source("drizzle/0003_slimy_bloodaxe.sql");
    expect(migration).toContain("CREATE TABLE IF NOT EXISTS `assistant_usage`");
    expect(migration).not.toContain("CREATE TABLE `xp_events`");
    expect(migration).not.toContain("ALTER TABLE `xp_events`");
  });

  it("routes assistant traffic through the dedicated API limiter", () => {
    const index = source("server/_core/index.ts");
    expect(index).toContain('app.use("/api/trpc/assistant", aiRateLimiter);');
  });

  it("binds the managed server to its declared port without fallback scanning", () => {
    const index = source("server/_core/index.ts");
    expect(index).toContain('const port = parseInt(process.env.PORT || "3000", 10);');
    expect(index).toContain('throw new Error("Production runtime requires a managed PORT")');
    expect(index).toContain('app.get("/healthz"');
    expect(index).toContain('server.listen(port, "0.0.0.0"');
    expect(index).not.toContain("findAvailablePort");
  });

  it("grants XP only from server-created source identifiers", () => {
    const assistant = source("server/routers/assistant.ts");
    const observations = source("server/routers/observations.ts");
    const daily = source("server/routers/gamification.ts");

    expect(assistant).toContain('eventType: "ai_use"');
    expect(assistant).toContain('sourceType: "ai_request"');
    expect(assistant).toContain("plantIdentify");
    expect(assistant).toContain("aquariumAnalyze");
    expect(observations).toContain('eventType: "photo_upload"');
    expect(observations).toContain('sourceType: "media_asset"');
    expect(daily).toContain('eventType: "daily_login"');
    expect(daily).toContain('sourceType: "session"');
  });
});
