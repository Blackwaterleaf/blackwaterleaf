import { describe, expect, it } from "vitest";
import { resolveConnectionState } from "../client/src/lib/connectionState";

describe("resolveConnectionState", () => {
  it("prioritizes an actual offline browser state", () => {
    expect(resolveConnectionState({ online: false, platformError: true })).toBe("offline");
  });

  it("reports an unreachable server while the browser is online", () => {
    expect(resolveConnectionState({ online: true, platformError: true })).toBe("server_error");
  });

  it("reports a database that is not connected without inventing fallback data", () => {
    expect(resolveConnectionState({ online: true, platformError: false, database: "not_connected" })).toBe("database_not_connected");
  });

  it("reports ready only when the network, API and database are available", () => {
    expect(resolveConnectionState({ online: true, platformError: false, database: "available" })).toBe("ready");
  });
});
