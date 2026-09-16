import { describe, expect, it } from "vitest";
import { canActivatePartnerProduct, hasActivePartnerPublication, isPublicPartnerProduct, partnersRouter } from "./routers/partners";
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
    await expect(caller.products({ partnerId: 1 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.createProduct({ partnerId: 1, product: { title: "Product", destinationUrl: "https://example.com/product" } })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.uploadProductImage({ productId: 1, base64: "AAAA", mimeType: "image/png" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("only permits public placement for an approved, currently authorized partner inside its validity window", () => {
    const now = Date.parse("2026-09-16T12:00:00.000Z");
    const base = { partnerStatus: "approved" as const, authorizationState: "granted" as const, placementStatus: "active" as const, startsAt: new Date("2026-09-16T11:00:00.000Z"), endsAt: new Date("2026-09-16T13:00:00.000Z"), now };
    expect(hasActivePartnerPublication(base)).toBe(true);
    expect(hasActivePartnerPublication({ ...base, authorizationState: "revoked" })).toBe(false);
    expect(hasActivePartnerPublication({ ...base, partnerStatus: "draft" })).toBe(false);
    expect(hasActivePartnerPublication({ ...base, partnerStatus: "removed" })).toBe(false);
    expect(hasActivePartnerPublication({ ...base, placementStatus: "paused" })).toBe(false);
    expect(hasActivePartnerPublication({ ...base, endsAt: new Date("2026-09-16T11:59:59.000Z") })).toBe(false);
  });

  it("allows product activation and public display only with the same current partner publication gate", () => {
    const current = { partnerStatus: "approved" as const, authorizationState: "granted" as const, placementStatus: "active" as const, startsAt: null, endsAt: null, now: Date.parse("2026-09-16T12:00:00.000Z") };
    expect(canActivatePartnerProduct(current)).toBe(true);
    expect(canActivatePartnerProduct({ ...current, placementStatus: "draft" })).toBe(false);
    expect(canActivatePartnerProduct({ ...current, authorizationState: "revoked" })).toBe(false);
    expect(isPublicPartnerProduct({ ...current, productStatus: "active" })).toBe(true);
    expect(isPublicPartnerProduct({ ...current, productStatus: "draft" })).toBe(false);
  });

  it("keeps a product image private until the product itself passes the current publication gate", () => {
    const imageBearingProduct = { productStatus: "active" as const, partnerStatus: "approved" as const, authorizationState: "granted" as const, placementStatus: "active" as const, startsAt: null, endsAt: null, now: Date.parse("2026-09-16T12:00:00.000Z") };
    expect(isPublicPartnerProduct(imageBearingProduct)).toBe(true);
    expect(isPublicPartnerProduct({ ...imageBearingProduct, placementStatus: "paused" })).toBe(false);
    expect(isPublicPartnerProduct({ ...imageBearingProduct, authorizationState: "revoked" })).toBe(false);
  });

  it("reproduces the public partner lifecycle from active to paused, removed and restored", () => {
    const active = { partnerStatus: "approved" as const, authorizationState: "granted" as const, placementStatus: "active" as const, startsAt: null, endsAt: null, now: Date.parse("2026-09-16T12:00:00.000Z") };
    const lifecycle = [
      { name: "active", input: active, visible: true },
      { name: "paused", input: { ...active, placementStatus: "paused" as const }, visible: false },
      { name: "removed", input: { ...active, partnerStatus: "removed" as const, placementStatus: "paused" as const }, visible: false },
      { name: "restored", input: active, visible: true },
    ];
    for (const step of lifecycle) expect(hasActivePartnerPublication(step.input)).toBe(step.visible);
  });
});
