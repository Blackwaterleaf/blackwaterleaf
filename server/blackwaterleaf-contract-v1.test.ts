import { describe, expect, it } from "vitest";
import {
  BLACKWATERLEAF_CONTRACT_VERSION,
  canUseAdminControls,
  canUseStaffControls,
  createObservationInputSchema,
  partnerProductInputSchema,
  platformAvailabilitySchema,
  verifiedAccountProfileSchema,
} from "../shared/blackwaterleaf-contract-v1";

const verifiedModerator = verifiedAccountProfileSchema.parse({
  contractVersion: BLACKWATERLEAF_CONTRACT_VERSION,
  id: "account_1",
  name: "Verified account",
  username: null,
  email: null,
  role: "moderator",
  status: "active",
  avatarUrl: null,
  bio: null,
  location: null,
  profileVisibility: "private",
  locale: "de",
  unitSystem: "metric",
  socialLinks: {},
  roleOrigin: "server_verified",
});

describe("BlackWaterLeaf contract v1", () => {
  it("accepts staff controls only for active server-verified staff", () => {
    expect(canUseStaffControls(verifiedModerator)).toBe(true);
    expect(canUseAdminControls(verifiedModerator)).toBe(false);
    expect(canUseStaffControls({ ...verifiedModerator, status: "suspended" })).toBe(false);
    expect(canUseStaffControls({ ...verifiedModerator, role: "user" })).toBe(false);
  });

  it("preserves zero and false metric values", () => {
    const observation = createObservationInputSchema.parse({
      clientId: "device-observation-1",
      realm: "aquarium",
      subject: "Messung",
      scientificName: null,
      note: null,
      metrics: [
        { key: "nitrite", value: 0, unit: "mg/l" },
        { key: "alarm", value: false },
      ],
    });

    expect(observation.metrics[0]?.value).toBe(0);
    expect(observation.metrics[1]?.value).toBe(false);
    expect(observation.visibility).toBe("private");
    expect(observation.evidenceState).toBe("unverified");
  });

  it("rejects unsupported realms and invalid public content", () => {
    expect(() =>
      createObservationInputSchema.parse({
        clientId: "device-observation-2",
        realm: "studio",
        subject: "Not part of the nature app",
        scientificName: null,
        note: null,
        metrics: [],
      }),
    ).toThrow();
  });

  it("keeps the AI assistant policy-blocked until explicit approval", () => {
    const availability = platformAvailabilitySchema.parse({
      contractVersion: BLACKWATERLEAF_CONTRACT_VERSION,
      api: "available",
      database: "available",
      authentication: "available",
      mediaStorage: "available",
      community: "available",
      knowledge: "available",
      aiAssistant: "disabled_by_policy",
      aiReason: "pending_provider_approval",
    });

    expect(availability.aiAssistant).toBe("disabled_by_policy");
  });

  it("accepts only a secure, explicit product recommendation contract", () => {
    const product = partnerProductInputSchema.parse({
      title: "Naturprodukt",
      description: null,
      destinationUrl: "https://kiemen-kumpel.de/products/naturprodukt",
      priceLabel: "19,90 €",
    });
    expect(product.destinationUrl.startsWith("https://")).toBe(true);
    expect(product.priceLabel).toBe("19,90 €");
    expect(() => partnerProductInputSchema.parse({ title: "Unsicher", destinationUrl: "http://example.com" })).toThrow();
  });
});
