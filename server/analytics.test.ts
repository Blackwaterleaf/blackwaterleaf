import { describe, expect, it } from "vitest";
import { formatDuration, normalizeSessionKey } from "./analytics";

const trackerSource = await import("node:fs/promises").then(fs => fs.readFile("./client/src/components/AnalyticsTracker.tsx", "utf8"));

describe("privacy-first analytics helpers", () => {
  it("formats durations without exposing raw identifiers", () => {
    expect(formatDuration(125)).toBe("2m 5s");
    expect(normalizeSessionKey("  anonymous-session  ")).toBe("anonymous-session");
  });

  it("keeps the analytics event contract free of IP and user-agent fields", async () => {
    const source = await import("node:fs/promises").then(fs => fs.readFile("./drizzle/schema.ts", "utf8"));
    expect(source).toContain('"analytics_events"');
    expect(source).toContain("sessionKey");
    expect(source).not.toContain('ipAddress:');
    expect(source).not.toContain('userAgent:');
  });

  it("shows the one-time analytics prompt only to the owner account", () => {
    expect(trackerSource).toContain('blackwaterleaf@gmail.com');
    expect(trackerSource).toContain("auth.isAuthenticated");
    expect(trackerSource).toContain("if (!isOwner || consent !== null) return null");
  });
});
