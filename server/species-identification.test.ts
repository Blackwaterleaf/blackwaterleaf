import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  getDb: vi.fn(),
}));

vi.mock("./db", () => ({
  getDb: dbMocks.getDb,
}));

import {
  speciesIdentificationModelOutputSchema,
  speciesIdentifyInputSchema,
} from "../shared/species-identification";
import {
  MAX_SPECIES_IDENTIFICATION_TOTAL_BYTES,
  assistantRouter,
  parseSpeciesIdentificationModelOutput,
  validateSpeciesIdentificationImages,
} from "./routers/assistant";
import { getAssistantUsageQuota } from "./gamification";

function anonymousContext(): TrpcContext {
  return {
    user: null,
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function activeContext(userId = 1): TrpcContext {
  const now = new Date();
  return {
    user: {
      id: userId,
      openId: `species-test-${userId}`,
      name: null,
      username: null,
      email: null,
      loginMethod: "local",
      role: "user",
      status: "active",
      locale: "de",
      unitSystem: "metric",
      profileVisibility: "private",
      avatarUrl: null,
      avatarStorageKey: null,
      bio: null,
      location: null,
      socialInstagram: null,
      socialTiktok: null,
      socialYoutube: null,
      socialFacebook: null,
      socialWebsite: null,
      createdAt: now,
      updatedAt: now,
      lastSignedIn: now,
    },
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function jpegBase64(byteSize = 3): string {
  const image = Buffer.alloc(byteSize);
  image[0] = 0xff;
  image[1] = 0xd8;
  image[2] = 0xff;
  return image.toString("base64");
}

function feedbackDb(owned: boolean) {
  const selectLimit = vi.fn().mockResolvedValue(owned ? [{ id: 44 }] : []);
  const selectWhere = vi.fn(() => ({ limit: selectLimit }));
  const selectFrom = vi.fn(() => ({ where: selectWhere }));
  const upsert = vi.fn().mockResolvedValue(undefined);
  const insertValues = vi.fn(() => ({ onDuplicateKeyUpdate: upsert }));

  return {
    select: vi.fn(() => ({ from: selectFrom })),
    insert: vi.fn(() => ({ values: insertValues })),
    selectLimit,
    upsert,
  };
}

function capturedError(callback: () => void) {
  try {
    callback();
  } catch (error) {
    return error;
  }
  throw new Error("Expected callback to throw");
}

describe("species identification contracts and image validation", () => {
  it("accepts one to three images only and preserves the optional note bound", () => {
    const base = {
      clientRequestId: "00000000-0000-4000-8000-000000000101",
      images: [{ imageBase64: jpegBase64(), mimeType: "image/jpeg" as const }],
    };
    expect(speciesIdentifyInputSchema.safeParse(base).success).toBe(true);
    expect(
      speciesIdentifyInputSchema.safeParse({ ...base, images: [] }).success
    ).toBe(false);
    expect(
      speciesIdentifyInputSchema.safeParse({
        ...base,
        images: Array.from({ length: 4 }, () => base.images[0]),
      }).success
    ).toBe(false);
    expect(
      speciesIdentifyInputSchema.safeParse({ ...base, note: "x".repeat(501) })
        .success
    ).toBe(false);
  });

  it("rejects invalid image signatures and an aggregate decoded payload over 8 MiB", () => {
    expect(
      capturedError(() =>
        validateSpeciesIdentificationImages([
          {
            imageBase64: Buffer.from("not an image").toString("base64"),
            mimeType: "image/jpeg",
          },
        ])
      )
    ).toMatchObject({
      code: "BAD_REQUEST",
      message: "image_signature_mismatch",
    });

    const eachSize = 3 * 1024 * 1024;
    expect(eachSize).toBeLessThan(MAX_SPECIES_IDENTIFICATION_TOTAL_BYTES);
    expect(
      capturedError(() =>
        validateSpeciesIdentificationImages([
          { imageBase64: jpegBase64(eachSize), mimeType: "image/jpeg" },
          { imageBase64: jpegBase64(eachSize), mimeType: "image/jpeg" },
          { imageBase64: jpegBase64(eachSize), mimeType: "image/jpeg" },
        ])
      )
    ).toMatchObject({
      code: "PAYLOAD_TOO_LARGE",
      message: "species_identification_images_too_large",
    });
  });

  it("accepts an explicit empty candidate list but rejects invalid model schemas", () => {
    expect(parseSpeciesIdentificationModelOutput('{"candidates":[]}')).toEqual({
      candidates: [],
    });
    expect(
      speciesIdentificationModelOutputSchema.safeParse({
        candidates: [
          {
            scientificName: "Taxon example",
            commonNames: ["Handelsname"],
            confidence: 120,
            features: ["sichtbar"],
            realm: "botany",
          },
        ],
      }).success
    ).toBe(false);
    expect(
      capturedError(() =>
        parseSpeciesIdentificationModelOutput(
          '{"candidates":[],"inventedFallback":true}'
        )
      )
    ).toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      message: "species_identification_invalid_model_response",
    });
  });
});

describe("species identification access and persisted feedback", () => {
  it("rejects anonymous quota, identification and feedback calls before DB access", async () => {
    const caller = assistantRouter.createCaller(anonymousContext());
    const image = jpegBase64();
    await expect(caller.quota()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    await expect(
      caller.speciesIdentify({
        clientRequestId: "00000000-0000-4000-8000-000000000102",
        images: [{ imageBase64: image, mimeType: "image/jpeg" }],
      })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(
      caller.identificationFeedback({ usageId: 44, satisfied: true })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(dbMocks.getDb).not.toHaveBeenCalled();
  });

  it("does not accept feedback for a request outside the active user's completed species requests", async () => {
    const db = feedbackDb(false);
    dbMocks.getDb.mockResolvedValue(db);

    const caller = assistantRouter.createCaller(activeContext(1));
    await expect(
      caller.identificationFeedback({
        usageId: 44,
        satisfied: false,
        note: "falsch",
      })
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "completed_species_request_not_found",
    });
    expect(db.insert).not.toHaveBeenCalled();
  });

  it("upserts exactly one feedback record for repeat submissions instead of creating a counter", async () => {
    const db = feedbackDb(true);
    dbMocks.getDb.mockResolvedValue(db);
    const caller = assistantRouter.createCaller(activeContext(7));

    await expect(
      caller.identificationFeedback({
        usageId: 44,
        satisfied: true,
        note: "passt",
      })
    ).resolves.toEqual({ usageId: 44, saved: true });
    await expect(
      caller.identificationFeedback({ usageId: 44, satisfied: false })
    ).resolves.toEqual({ usageId: 44, saved: true });

    expect(db.insert).toHaveBeenCalledTimes(2);
    expect(db.upsert).toHaveBeenCalledTimes(2);
  });
});

describe("assistant quota", () => {
  it("derives the displayed remaining quota from completed usage rows returned by the database", async () => {
    const where = vi.fn().mockResolvedValue([{ used: "3" }]);
    const from = vi.fn(() => ({ where }));
    const db = { select: vi.fn(() => ({ from })) };

    await expect(getAssistantUsageQuota(db as never, 7)).resolves.toEqual({
      limit: 10,
      used: 3,
      remaining: 7,
    });
  });

  it("never reports a negative remaining amount when persisted usage exceeds the configured limit", async () => {
    const where = vi.fn().mockResolvedValue([{ used: 14 }]);
    const from = vi.fn(() => ({ where }));
    const db = { select: vi.fn(() => ({ from })) };

    await expect(getAssistantUsageQuota(db as never, 7)).resolves.toEqual({
      limit: 10,
      used: 14,
      remaining: 0,
    });
  });
});
