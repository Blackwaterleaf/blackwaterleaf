import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const route = readFileSync(resolve(root, "client/src/pages/AssistantResult.tsx"), "utf8");
const assistant = readFileSync(resolve(root, "client/src/pages/Assistant.tsx"), "utf8");
const router = readFileSync(resolve(root, "server/routers/assistant.ts"), "utf8");
const schema = readFileSync(resolve(root, "drizzle/schema.ts"), "utf8");
const app = readFileSync(resolve(root, "client/src/App.tsx"), "utf8");

describe("assistant result workspace route", () => {
  it("registers a protected, expiring session route rather than putting the result into the URL", () => {
    expect(app).toContain('path={"/assistant/result"}');
    expect(route).toContain("resultBySession.useQuery");
    expect(route).toContain("auth.isAuthenticated");
    expect(route).toContain("session");
    expect(route).toContain("30 Minuten");
    expect(route).not.toContain("?answer=");
    expect(route).not.toContain("?identification=");
  });

  it("stores only a hash and structured payload with user ownership and expiry", () => {
    expect(schema).toContain("assistantResultSessions");
    expect(schema).toContain('sessionHash: varchar("sessionHash", { length: 64 })');
    expect(schema).toContain('expiresAt: timestamp("expiresAt")');
    expect(schema).toContain("payload: json(\"payload\")");
    expect(router).toContain("randomBytes(32).toString(\"hex\")");
    expect(router).toContain("hashResultSession(sessionId)");
    expect(router).toContain("RESULT_SESSION_TTL_MS = 30 * 60_000");
    expect(router).toContain("eq(assistantResultSessions.userId, ctx.user.id)");
    expect(router).toContain("assistant_result_session_not_found");
  });

  it("moves both fresh and cached determinations to the focused workspace", () => {
    expect(assistant).toContain("setLocation(`/assistant/result?session=${response.sessionId}`)");
    expect(assistant).toContain("export function PlantResultWorkspace");
    expect(assistant).toContain("PlantCorrectionForm assistantUsageId");
    expect(router).toContain("const sessionId = await createResultSession");
  });
});
