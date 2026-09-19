import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const read = (file: string) => readFileSync(resolve(root, file), "utf8");

describe("AP-12 session and location contract", () => {
  it("has a server-revocable, hashed, device-aware session registry", () => {
    const schema = read("drizzle/schema.ts");
    const registry = read("server/sessionRegistry.ts");
    expect(schema).toContain('"user_sessions"');
    expect(schema).toContain("sessionHash: varchar(\"sessionHash\"");
    expect(schema).toContain("revokedAt: timestamp(\"revokedAt\")");
    expect(registry).toContain("createHash(\"sha256\")");
    expect(registry).toContain("revokeAllSessions");
    expect(registry).toContain("x-bwl-device-id");
  });

  it("checks the registry for every verified session and revokes on logout/password reset", () => {
    const sdk = read("server/_core/sdk.ts");
    const rootRouter = read("server/routers.ts");
    const localAuth = read("server/routers/localAuth.ts");
    expect(sdk).toContain("assertActiveSession");
    expect(rootRouter).toContain("revokeSessionForRequest");
    expect(rootRouter).toContain("revokeAllSessions");
    expect(localAuth).toContain("await revokeAllSessions(user.id)");
  });

  it("uses only explicit location consent for authenticated weather requests", () => {
    const sensors = read("server/routers/sensors.ts");
    const profile = read("client/src/pages/Profile.tsx");
    const native = read("mobile-natur/App.tsx");
    expect(sensors).toContain('hasCurrentConsent(db, ctx.user.id, "location_processing")');
    expect(sensors).toContain('"location_processing_consent_required"');
    expect(profile).toContain('"location_processing"');
    expect(native).toContain("location_processing");
  });

  it("rounds coordinates and keeps the endpoint POST/no-store", () => {
    const weather = read("server/weather.ts");
    const sensors = read("server/routers/sensors.ts");
    const web = read("client/src/components/LiveSensorStrip.tsx");
    const mobileApi = read("mobile-natur/src/api.ts");
    expect(weather).toContain("roundWeatherCoordinates");
    expect(weather).toContain("Math.round(input.latitude * 100) / 100");
    expect(sensors).toContain('.mutation(async ({ ctx, input })');
    expect(sensors).toContain('Cache-Control", "no-store, private"');
    expect(web).toContain("useMutation");
    expect(mobileApi).toContain('trpcPost<OutdoorWeather>');
  });

  it("does not expose free-form exact locations in public profile serialization", () => {
    const profileRouter = read("server/routers/profile.ts");
    expect(profileRouter).toContain("location: includePrivate ? user.location : null");
    expect(profileRouter).toContain("profileVisibility: \"private\"");
  });
});
