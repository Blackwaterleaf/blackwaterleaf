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

  it("measures all visitors automatically without a consent prompt or account identity", () => {
    expect(trackerSource).toContain("sessionStorage");
    expect(trackerSource).toContain("eventType: \"page_view\"");
    expect(trackerSource).not.toContain("CONSENT_KEY");
    expect(trackerSource).not.toContain("blackwaterleaf@gmail.com");
    expect(trackerSource).not.toContain("useAuth");
  });

  it("keeps the registered-account aggregate in the analytics implementation", async () => {
    const analytics = await import("./analytics");
    expect(analytics.getAnalyticsOverview.toString()).toContain("registeredAccounts");
  });

  it("keeps the recovery migration and operator reach metrics wired", async () => {
    const migration = await import("node:fs/promises").then(fs => fs.readFile("./drizzle/0053_analytics_events_recovery.sql", "utf8"));
    const dashboard = await import("node:fs/promises").then(fs => fs.readFile("./client/src/pages/AdminDashboard.tsx", "utf8"));
    expect(migration).toContain("CREATE TABLE IF NOT EXISTS `analytics_events`");
    expect(migration).toContain("page_view_end");
    expect(dashboard).toContain('trpc.analytics.overview.useQuery({ days: 7 }');
    expect(dashboard).toContain('Seitenaufrufe · 7 Tage');
    expect(dashboard).toContain('Besuche · 7 Tage');
  });
});
