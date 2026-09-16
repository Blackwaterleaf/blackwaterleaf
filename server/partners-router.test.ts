import { describe, expect, it } from "vitest";
import { hasActivePartnerPublication, partnersRouter } from "./routers/partners";
import type { TrpcContext } from "./_core/context";

function userContext(): TrpcContext {
  return {
    user: { id: 7, openId: "ordinary-user", name: "Ordinary", email: "user@example.com", loginMethod: "test", role: "user", status: "active", locale: "de", unitSystem: "metric", profileVisibility: "private", avatarUrl: null, avatarStorageKey: null, bio: null, location: null, socialInstagram: null, socialTiktok: null, socialYoutube: null, socialFacebook: null, socialWebsite: null, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("partner administration authorization", () => {
  it("rejects ordinary users before any partner administration can read or mutate data", async () => {
    const caller = partnersRouter.createCaller(userContext());
    await expect(caller.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.create({ displayName: "Real partner", partyType: "company", authorizationConfirmed: true, disclosureLabel: "Werbung" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("only permits public placement for an approved, currently authorized partner inside its validity window", () => {
    const now = Date.parse("2026-09-16T12:00:00.000Z");
    const base = { partnerStatus: "approved" as const, authorizationState: "granted" as const, placementStatus: "active" as const, startsAt: new Date("2026-09-16T11:00:00.000Z"), endsAt: new Date("2026-09-16T13:00:00.000Z"), now };
    expect(hasActivePartnerPublication(base)).toBe(true);
    expect(hasActivePartnerPublication({ ...base, authorizationState: "revoked" })).toBe(false);
    expect(hasActivePartnerPublication({ ...base, partnerStatus: "draft" })).toBe(false);
    expect(hasActivePartnerPublication({ ...base, endsAt: new Date("2026-09-16T11:59:59.000Z") })).toBe(false);
  });
});
