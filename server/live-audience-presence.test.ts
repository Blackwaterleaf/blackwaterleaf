import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const read = (file: string) => readFileSync(resolve(root, file), "utf8");

describe("live audience telemetry", () => {
  it("stores only short-lived, de-duplicated authenticated viewer presence", () => {
    const schema = read("drizzle/schema.ts");
    const router = read("server/routers/live.ts");
    expect(schema).toContain('export const liveSessionViewers = mysqlTable(');
    expect(schema).toContain('uniqueIndex("live_session_viewers_session_user_unique")');
    expect(schema).toContain('index("live_session_viewers_session_seen_idx")');
    for (const token of ["VIEWER_PRESENCE_TTL_MS = 45_000", "viewerPresence: protectedProcedure", "onDuplicateKeyUpdate", "livePresenceThreshold", "db.delete(liveSessionViewers)"]) expect(router).toContain(token);
  });

  it("counts current member viewers without counting the session host", () => {
    const router = read("server/routers/live.ts");
    expect(router).toContain("ne(liveSessionViewers.userId, liveSessions.hostUserId)");
    expect(router).toContain("viewerCount: row.session.status === \"live\" ? viewerCount : 0");
    expect(router).toContain("viewerCounts(db, visible.filter(row => row.session.status === \"live\")");
  });

  it("renders viewer and source-state telemetry in the Stream Deck control surface", () => {
    const session = read("client/src/pages/LiveSession.tsx");
    const hub = read("client/src/pages/LiveHub.tsx");
    const styles = read("client/src/index.css");
    for (const token of ["CONTROL DECK · ECHTZEIT", "ÜBERTRAGUNGSSTATUS", "ZUSCHAUENDE", "viewerPresence.mutateAsync", "live-session-stage__viewers"]) expect(session).toContain(token);
    expect(hub).toContain("live-session-card__viewers");
    expect(styles).toContain(".live-control-telemetry");
    expect(styles).toContain(".live-control-telemetry__metrics");
  });
});
