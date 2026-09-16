import { z } from "zod";

export const BLACKWATERLEAF_CONTRACT_VERSION = "1.0.0" as const;

export const accountRoleSchema = z.enum(["user", "moderator", "admin"]);
export const accountStatusSchema = z.enum(["active", "suspended", "banned"]);
export const localeSchema = z.enum(["de", "en"]);
export const unitSystemSchema = z.enum(["metric", "imperial"]);
export const visibilitySchema = z.enum(["private", "unlisted", "public"]);
export const observationRealmSchema = z.enum(["botany", "aquarium", "terrarium"]);
export const evidenceStateSchema = z.enum([
  "confirmed",
  "contextual",
  "unverified",
  "conflicting",
  "insufficient",
]);
export const syncStateSchema = z.enum([
  "local_only",
  "queued_for_review",
  "synced",
  "sync_failed",
  "conflict",
]);
export const featureStateSchema = z.enum([
  "available",
  "not_connected",
  "disabled_by_policy",
  "temporarily_unavailable",
]);

export const consentPurposeSchema = z.enum([
  "terms",
  "privacy",
  "profile_publication",
  "observation_publishing",
  "media_processing",
  "community_publishing",
  "location_processing",
  "ai_processing",
]);

export const apiErrorCodeSchema = z.enum([
  "AUTH_REQUIRED",
  "FORBIDDEN",
  "NOT_FOUND",
  "VALIDATION_FAILED",
  "CONFLICT",
  "OFFLINE",
  "UNAVAILABLE",
  "POLICY_BLOCKED",
  "INTERNAL_ERROR",
]);

export const apiErrorSchema = z.object({
  contractVersion: z.literal(BLACKWATERLEAF_CONTRACT_VERSION),
  code: apiErrorCodeSchema,
  messageKey: z.string().min(1).max(128),
  retryable: z.boolean(),
  requestId: z.string().min(1).max(128).nullable(),
});

export const socialLinksSchema = z
  .object({
    instagram: z.string().url().nullable().optional(),
    tiktok: z.string().url().nullable().optional(),
    youtube: z.string().url().nullable().optional(),
    facebook: z.string().url().nullable().optional(),
    website: z.string().url().nullable().optional(),
  })
  .strict();

export const verifiedAccountProfileSchema = z.object({
  contractVersion: z.literal(BLACKWATERLEAF_CONTRACT_VERSION),
  id: z.string().min(1),
  name: z.string().max(160).nullable(),
  username: z.string().max(32).nullable(),
  email: z.string().email().nullable(),
  role: accountRoleSchema,
  status: accountStatusSchema,
  avatarUrl: z.string().url().nullable(),
  bio: z.string().max(2_000).nullable(),
  location: z.string().max(128).nullable(),
  profileVisibility: visibilitySchema,
  locale: localeSchema,
  unitSystem: unitSystemSchema,
  socialLinks: socialLinksSchema,
  roleOrigin: z.literal("server_verified"),
});

export const observationMetricSchema = z.object({
  key: z.string().trim().min(1).max(64),
  value: z.union([z.string().max(256), z.number().finite(), z.boolean()]),
  unit: z.string().trim().min(1).max(32).optional(),
});

export const mediaAssetSchema = z.object({
  id: z.string().min(1),
  ownerId: z.string().min(1),
  kind: z.enum(["avatar", "observation_image", "post_image"]),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  byteSize: z.number().int().positive(),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
  accessUrl: z.string().url(),
  visibility: visibilitySchema,
  createdAt: z.string().datetime(),
});

export const observationSchema = z.object({
  contractVersion: z.literal(BLACKWATERLEAF_CONTRACT_VERSION),
  id: z.string().min(1),
  clientId: z.string().min(1).max(128).nullable(),
  ownerId: z.string().min(1),
  realm: observationRealmSchema,
  subject: z.string().max(128).nullable(),
  scientificName: z.string().max(160).nullable(),
  note: z.string().max(2_000).nullable(),
  metrics: z.array(observationMetricSchema).max(64),
  media: z.array(mediaAssetSchema).max(20),
  evidenceState: evidenceStateSchema,
  visibility: visibilitySchema,
  syncState: syncStateSchema,
  revision: z.number().int().positive(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createObservationInputSchema = observationSchema
  .omit({
    contractVersion: true,
    id: true,
    ownerId: true,
    media: true,
    syncState: true,
    revision: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    clientId: z.string().min(1).max(128),
    visibility: visibilitySchema.default("private"),
    evidenceState: evidenceStateSchema.default("unverified"),
  });

export const knowledgeSourceSchema = z.object({
  label: z.string().min(1).max(200),
  url: z.string().url(),
  accessedAt: z.string().datetime().nullable(),
});

export const knowledgeArticleSchema = z.object({
  contractVersion: z.literal(BLACKWATERLEAF_CONTRACT_VERSION),
  id: z.string().min(1),
  slug: z.string().min(1).max(160),
  locale: localeSchema,
  title: z.string().min(1).max(200),
  excerpt: z.string().min(1).max(500),
  realm: observationRealmSchema.nullable(),
  evidenceState: evidenceStateSchema,
  sources: z.array(knowledgeSourceSchema).min(1),
  publishedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const communityAuthorSchema = verifiedAccountProfileSchema.pick({
  id: true,
  name: true,
  username: true,
  avatarUrl: true,
  role: true,
  status: true,
  roleOrigin: true,
});

export const communityPostSchema = z.object({
  contractVersion: z.literal(BLACKWATERLEAF_CONTRACT_VERSION),
  id: z.string().min(1),
  author: communityAuthorSchema,
  content: z.string().min(1).max(10_000),
  realm: observationRealmSchema.nullable(),
  media: z.array(mediaAssetSchema).max(10),
  visibility: z.literal("public"),
  likesCount: z.number().int().nonnegative(),
  commentsCount: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const platformAvailabilitySchema = z.object({
  contractVersion: z.literal(BLACKWATERLEAF_CONTRACT_VERSION),
  api: featureStateSchema,
  database: featureStateSchema,
  authentication: featureStateSchema,
  mediaStorage: featureStateSchema,
  community: featureStateSchema,
  knowledge: featureStateSchema,
  aiAssistant: featureStateSchema,
  aiReason: z
    .enum(["pending_provider_approval", "pending_cost_approval", "pending_migration", "available"])
    .nullable(),
});

export const experienceSummarySchema = z.object({
  totalXp: z.number().int().nonnegative(),
  level: z.number().int().positive(),
  nextLevelXp: z.number().int().positive(),
  recentEvents: z.array(
    z.object({
      id: z.string().min(1),
      eventType: z.enum(["daily_check_in", "observation_photo", "assistant_response"]),
      amount: z.number().int().positive(),
      createdAt: z.string().datetime(),
    }),
  ),
});

export const privateHabitatKindSchema = z.enum(["aquarium", "plant", "terrarium"]);

const nullableNumber = (min: number, max: number) => z.number().finite().min(min).max(max).nullable();
const nullableText = (max: number) => z.string().trim().max(max).nullable();

export const aquariumDetailsSchema = z
  .object({
    volumeLiters: nullableNumber(1, 100_000),
    lengthCm: nullableNumber(1, 10_000),
    widthCm: nullableNumber(1, 10_000),
    heightCm: nullableNumber(1, 10_000),
    occupants: nullableText(4_000),
    plants: nullableText(4_000),
    temperatureC: nullableNumber(-5, 60),
    ph: nullableNumber(0, 14),
    gh: nullableNumber(0, 100),
    kh: nullableNumber(0, 100),
    nitriteMgL: nullableNumber(0, 100),
    nitrateMgL: nullableNumber(0, 1_000),
    conductivityUs: nullableNumber(0, 20_000),
    equipment: nullableText(4_000),
    notes: nullableText(4_000),
  })
  .strict();

export const plantDetailsSchema = z
  .object({
    scientificName: nullableText(160),
    quantity: nullableNumber(1, 100_000),
    location: nullableText(256),
    substrate: nullableText(1_000),
    potSizeCm: nullableNumber(1, 1_000),
    light: nullableText(512),
    watering: nullableText(1_000),
    humidityPercent: nullableNumber(0, 100),
    temperatureC: nullableNumber(-5, 60),
    fertilizer: nullableText(1_000),
    notes: nullableText(4_000),
  })
  .strict();

export const terrariumDetailsSchema = z
  .object({
    volumeLiters: nullableNumber(1, 100_000),
    lengthCm: nullableNumber(1, 10_000),
    widthCm: nullableNumber(1, 10_000),
    heightCm: nullableNumber(1, 10_000),
    occupants: nullableText(4_000),
    plants: nullableText(4_000),
    dayTemperatureC: nullableNumber(-5, 60),
    nightTemperatureC: nullableNumber(-5, 60),
    humidityPercent: nullableNumber(0, 100),
    substrate: nullableText(1_000),
    equipment: nullableText(4_000),
    notes: nullableText(4_000),
  })
  .strict();

export const privateHabitatInputSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("aquarium"), name: z.string().trim().min(1).max(128), details: aquariumDetailsSchema }),
  z.object({ kind: z.literal("plant"), name: z.string().trim().min(1).max(128), details: plantDetailsSchema }),
  z.object({ kind: z.literal("terrarium"), name: z.string().trim().min(1).max(128), details: terrariumDetailsSchema }),
]);

export const privateHabitatSchema = privateHabitatInputSchema.and(
  z.object({
    id: z.string().min(1),
    ownerId: z.string().min(1),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }),
);

export type AccountRole = z.infer<typeof accountRoleSchema>;
export type AccountStatus = z.infer<typeof accountStatusSchema>;
export type AppLocale = z.infer<typeof localeSchema>;
export type UnitSystem = z.infer<typeof unitSystemSchema>;
export type Visibility = z.infer<typeof visibilitySchema>;
export type ObservationRealm = z.infer<typeof observationRealmSchema>;
export type EvidenceState = z.infer<typeof evidenceStateSchema>;
export type SyncState = z.infer<typeof syncStateSchema>;
export type VerifiedAccountProfile = z.infer<typeof verifiedAccountProfileSchema>;
export type Observation = z.infer<typeof observationSchema>;
export type CreateObservationInput = z.infer<typeof createObservationInputSchema>;
export type KnowledgeArticle = z.infer<typeof knowledgeArticleSchema>;
export type CommunityPost = z.infer<typeof communityPostSchema>;
export type PlatformAvailability = z.infer<typeof platformAvailabilitySchema>;
export type PrivateHabitat = z.infer<typeof privateHabitatSchema>;
export type PrivateHabitatInput = z.infer<typeof privateHabitatInputSchema>;
export type ExperienceSummary = z.infer<typeof experienceSummarySchema>;

export function canUseStaffControls(profile: VerifiedAccountProfile | null): boolean {
  return Boolean(
    profile &&
      profile.roleOrigin === "server_verified" &&
      profile.status === "active" &&
      (profile.role === "moderator" || profile.role === "admin"),
  );
}

export function canUseAdminControls(profile: VerifiedAccountProfile | null): boolean {
  return Boolean(
    profile &&
      profile.roleOrigin === "server_verified" &&
      profile.status === "active" &&
      profile.role === "admin",
  );
}
