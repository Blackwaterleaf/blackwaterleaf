import {
  type AnyMySqlColumn,
  boolean,
  decimal,
  foreignKey,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    name: text("name"),
    username: varchar("username", { length: 32 }),
    email: varchar("email", { length: 320 }),
    loginMethod: varchar("loginMethod", { length: 64 }),
    role: mysqlEnum("role", ["user", "moderator", "admin"]).default("user").notNull(),
    status: mysqlEnum("status", ["active", "suspended", "banned"]).default("active").notNull(),
    locale: mysqlEnum("locale", ["de", "en"]).default("de").notNull(),
    unitSystem: mysqlEnum("unitSystem", ["metric", "imperial"]).default("metric").notNull(),
    profileVisibility: mysqlEnum("profileVisibility", ["private", "unlisted", "public"])
      .default("private")
      .notNull(),
    avatarUrl: text("avatarUrl"),
    avatarStorageKey: text("avatarStorageKey"),
    bio: text("bio"),
    location: varchar("location", { length: 128 }),
    socialInstagram: varchar("socialInstagram", { length: 255 }),
    socialTiktok: varchar("socialTiktok", { length: 255 }),
    socialYoutube: varchar("socialYoutube", { length: 255 }),
    socialFacebook: varchar("socialFacebook", { length: 255 }),
    socialWebsite: varchar("socialWebsite", { length: 255 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  },
  table => [uniqueIndex("users_username_unique").on(table.username), index("users_status_idx").on(table.status)],
);

export const userConsents = mysqlTable(
  "user_consents",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id),
    purpose: mysqlEnum("purpose", [
      "terms",
      "privacy",
      "profile_publication",
      "observation_publishing",
      "media_processing",
      "community_publishing",
      "location_processing",
      "ai_processing",
    ]).notNull(),
    policyVersion: varchar("policyVersion", { length: 32 }).notNull(),
    granted: boolean("granted").default(false).notNull(),
    grantedAt: timestamp("grantedAt"),
    revokedAt: timestamp("revokedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("user_consents_user_purpose_version_unique").on(
      table.userId,
      table.purpose,
      table.policyVersion,
    ),
  ],
);

/** Current, policy-versioned consent state used by all authorization checks. */
export const userConsentCurrent = mysqlTable(
  "user_consent_current",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id),
    purpose: mysqlEnum("purpose", [
      "terms",
      "privacy",
      "profile_publication",
      "observation_publishing",
      "media_processing",
      "community_publishing",
      "location_processing",
      "ai_processing",
    ]).notNull(),
    policyVersion: varchar("policyVersion", { length: 32 }).notNull(),
    granted: boolean("granted").default(false).notNull(),
    grantedAt: timestamp("grantedAt"),
    revokedAt: timestamp("revokedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("user_consent_current_user_purpose_unique").on(table.userId, table.purpose),
    index("user_consent_current_authorization_idx").on(table.userId, table.purpose, table.granted),
  ],
);

/** Append-only consent history. Existing consent rows are copied as baseline events. */
export const userConsentEvents = mysqlTable(
  "user_consent_events",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id),
    purpose: mysqlEnum("purpose", [
      "terms",
      "privacy",
      "profile_publication",
      "observation_publishing",
      "media_processing",
      "community_publishing",
      "location_processing",
      "ai_processing",
    ]).notNull(),
    policyVersion: varchar("policyVersion", { length: 32 }).notNull(),
    granted: boolean("granted").notNull(),
    eventType: mysqlEnum("eventType", ["baseline", "member_update"]).notNull(),
    occurredAt: timestamp("occurredAt").defaultNow().notNull(),
  },
  table => [index("user_consent_events_user_purpose_occurred_idx").on(table.userId, table.purpose, table.occurredAt)],
);

/** Local email/password identity. Passwords are stored as scrypt hashes only. */
export const localCredentials = mysqlTable(
  "local_credentials",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id),
    email: varchar("email", { length: 320 }).notNull(),
    normalizedEmail: varchar("normalizedEmail", { length: 320 }).notNull(),
    passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
    emailVerifiedAt: timestamp("emailVerifiedAt"),
    passwordChangedAt: timestamp("passwordChangedAt").defaultNow().notNull(),
    lastSignedInAt: timestamp("lastSignedInAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("local_credentials_user_unique").on(table.userId),
    uniqueIndex("local_credentials_normalized_email_unique").on(table.normalizedEmail),
  ],
);

/** One-time, hashed and expiry-bound tokens for local account verification and recovery. */
export const localAuthTokens = mysqlTable(
  "local_auth_tokens",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id),
    purpose: mysqlEnum("purpose", ["email_verification", "password_reset"]).notNull(),
    tokenHash: varchar("tokenHash", { length: 64 }).notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    usedAt: timestamp("usedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    uniqueIndex("local_auth_tokens_hash_unique").on(table.tokenHash),
    index("local_auth_tokens_user_purpose_expires_idx").on(table.userId, table.purpose, table.expiresAt),
  ],
);

export const observations = mysqlTable(
  "observations",
  {
    id: int("id").autoincrement().primaryKey(),
    clientId: varchar("clientId", { length: 128 }).notNull(),
    userId: int("userId")
      .notNull()
      .references(() => users.id),
    realm: mysqlEnum("realm", ["botany", "aquarium", "terrarium"]).notNull(),
    subject: varchar("subject", { length: 128 }),
    scientificName: varchar("scientificName", { length: 160 }),
    note: text("note"),
    metrics: json("metrics").notNull(),
    evidenceState: mysqlEnum("evidenceState", [
      "confirmed",
      "contextual",
      "unverified",
      "conflicting",
      "insufficient",
    ])
      .default("unverified")
      .notNull(),
    visibility: mysqlEnum("visibility", ["private", "unlisted", "public"])
      .default("private")
      .notNull(),
    syncState: mysqlEnum("syncState", [
      "local_only",
      "queued_for_review",
      "synced",
      "sync_failed",
      "conflict",
    ])
      .default("synced")
      .notNull(),
    revision: int("revision").default(1).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("observations_user_client_unique").on(table.userId, table.clientId),
    index("observations_owner_realm_updated_idx").on(table.userId, table.realm, table.updatedAt),
    index("observations_user_updated_idx").on(table.userId, table.updatedAt),
    index("observations_visibility_updated_idx").on(table.visibility, table.updatedAt),
  ],
);

export const communityPosts = mysqlTable(
  "community_posts",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id),
    content: text("content").notNull(),
    realm: mysqlEnum("realm", ["botany", "aquarium", "terrarium"]),
    visibility: mysqlEnum("visibility", ["private", "unlisted", "public"])
      .default("private")
      .notNull(),
    status: mysqlEnum("status", ["draft", "published", "hidden", "removed"])
      .default("draft")
      .notNull(),
    likesCount: int("likesCount").default(0).notNull(),
    commentsCount: int("commentsCount").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("community_posts_feed_idx").on(table.status, table.visibility, table.createdAt),
    index("community_posts_user_updated_idx").on(table.userId, table.updatedAt),
  ],
);

export const mediaAssets = mysqlTable(
  "media_assets",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id),
    observationId: int("observationId").references(() => observations.id),
    postId: int("postId").references(() => communityPosts.id),
    kind: mysqlEnum("kind", ["avatar", "observation_image", "post_image"]).notNull(),
    mimeType: mysqlEnum("mimeType", ["image/jpeg", "image/png", "image/webp"]).notNull(),
    byteSize: int("byteSize").notNull(),
    width: int("width"),
    height: int("height"),
    accessUrl: text("accessUrl").notNull(),
    storageKey: varchar("storageKey", { length: 512 }).notNull(),
    visibility: mysqlEnum("visibility", ["private", "unlisted", "public"])
      .default("private")
      .notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    uniqueIndex("media_assets_storage_key_unique").on(table.storageKey),
    index("media_assets_owner_idx").on(table.userId, table.createdAt),
    index("media_assets_post_user_visibility_idx").on(table.postId, table.userId, table.visibility),
    index("media_assets_observation_user_created_idx").on(table.observationId, table.userId, table.createdAt),
  ],
);

/** Immutable, server-created experience-point journal. */
export const xpEvents = mysqlTable(
  "xp_events",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id),
    eventType: mysqlEnum("eventType", ["daily_login", "photo_upload", "ai_use"]).notNull(),
    points: int("points").notNull(),
    eventKey: varchar("eventKey", { length: 191 }).notNull(),
    sourceType: mysqlEnum("sourceType", ["session", "media_asset", "ai_request"]).notNull(),
    sourceId: varchar("sourceId", { length: 191 }).notNull(),
    dayKey: varchar("dayKey", { length: 10 }).notNull(),
    policyVersion: varchar("policyVersion", { length: 32 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    uniqueIndex("xp_events_event_key_unique").on(table.eventKey),
    index("xp_events_user_created_idx").on(table.userId, table.createdAt),
    index("xp_events_user_type_day_idx").on(table.userId, table.eventType, table.dayKey),
  ],
);

/** Minimal audit record for paid AI calls; prompts and responses are intentionally not retained. */
export const assistantUsage = mysqlTable(
  "assistant_usage",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id),
    clientRequestId: varchar("clientRequestId", { length: 96 }).notNull(),
    realm: mysqlEnum("realm", ["botany", "aquarium", "terrarium"]),
    model: varchar("model", { length: 96 }).notNull(),
    promptChars: int("promptChars").notNull(),
    completionChars: int("completionChars").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    uniqueIndex("assistant_usage_user_request_unique").on(table.userId, table.clientRequestId),
    index("assistant_usage_user_created_idx").on(table.userId, table.createdAt),
  ],
);

/** Private, structured setup records for a member's living worlds. */
export const privateHabitats = mysqlTable(
  "private_habitats",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id),
    kind: mysqlEnum("kind", ["aquarium", "plant", "terrarium"]).notNull(),
    name: varchar("name", { length: 128 }).notNull(),
    details: json("details").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("private_habitats_user_kind_updated_idx").on(table.userId, table.kind, table.updatedAt),
    index("private_habitats_user_updated_idx").on(table.userId, table.updatedAt),
  ],
);

/**
 * A user's private smart-device selection. OAuth/API credentials are deliberately
 * not stored here; a provider-specific authorization is required before sync.
 */
export const smartDeviceConnections = mysqlTable(
  "smart_device_connections",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id),
    habitatId: int("habitatId").references(() => privateHabitats.id),
    provider: mysqlEnum("provider", ["home_assistant", "aquarium_controller", "water_monitor", "zigbee_matter", "other"]).notNull(),
    modelLabel: varchar("modelLabel", { length: 128 }),
    requestedMetrics: json("requestedMetrics").notNull(),
    status: mysqlEnum("status", ["selected", "awaiting_authorization", "connected", "disabled"]).default("selected").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("smart_device_connections_user_updated_idx").on(table.userId, table.updatedAt),
    index("smart_device_connections_habitat_idx").on(table.habitatId),
  ],
);

/** Append-only private water-value timeline. Credentials and raw provider payloads are never stored. */
export const smartDeviceMeasurements = mysqlTable(
  "smart_device_measurements",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id),
    habitatId: int("habitatId")
      .notNull()
      .references(() => privateHabitats.id),
    deviceConnectionId: int("deviceConnectionId"),
    metric: mysqlEnum("metric", [
      "temperatureC",
      "ph",
      "gh",
      "kh",
      "nitriteMgL",
      "nitrateMgL",
      "conductivityUs",
    ]).notNull(),
    valueDecimal: decimal("valueDecimal", { precision: 12, scale: 4 }).notNull(),
    unit: varchar("unit", { length: 32 }).notNull(),
    source: mysqlEnum("source", ["manual", "smart_device"]).notNull(),
    quality: mysqlEnum("quality", ["reported", "estimated", "rejected"]).default("reported").notNull(),
    observedAt: timestamp("observedAt").notNull(),
    receivedAt: timestamp("receivedAt").defaultNow().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    uniqueIndex("smart_device_measurements_device_metric_observed_unique").on(
      table.deviceConnectionId,
      table.metric,
      table.observedAt,
    ),
    foreignKey({
      columns: [table.deviceConnectionId],
      foreignColumns: [smartDeviceConnections.id],
      name: "smart_meas_device_fk",
    }).onDelete("no action").onUpdate("no action"),
    index("smart_device_measurements_habitat_metric_observed_idx").on(
      table.habitatId,
      table.metric,
      table.observedAt,
    ),
    index("smart_device_measurements_user_observed_idx").on(table.userId, table.observedAt),
  ],
);

export const knowledgeArticles = mysqlTable(
  "knowledge_articles",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 160 }).notNull(),
    locale: mysqlEnum("locale", ["de", "en"]).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    excerpt: varchar("excerpt", { length: 500 }).notNull(),
    content: text("content").notNull(),
    realm: mysqlEnum("realm", ["botany", "aquarium", "terrarium"]),
    evidenceState: mysqlEnum("evidenceState", [
      "confirmed",
      "contextual",
      "unverified",
      "conflicting",
      "insufficient",
    ]).notNull(),
    sources: json("sources").notNull(),
    isPublished: boolean("isPublished").default(false).notNull(),
    publishedAt: timestamp("publishedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("knowledge_slug_locale_unique").on(table.slug, table.locale),
    index("knowledge_public_locale_idx").on(table.isPublished, table.locale, table.updatedAt),
  ],
);

export const postLikes = mysqlTable(
  "post_likes",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id),
    postId: int("postId")
      .notNull()
      .references(() => communityPosts.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [uniqueIndex("post_likes_user_post_unique").on(table.userId, table.postId)],
);

export const postComments = mysqlTable(
  "post_comments",
  {
    id: int("id").autoincrement().primaryKey(),
    postId: int("postId")
      .notNull()
      .references(() => communityPosts.id),
    userId: int("userId")
      .notNull()
      .references(() => users.id),
    parentId: int("parentId").references((): AnyMySqlColumn => postComments.id, { onDelete: "set null" }),
    content: text("content").notNull(),
    status: mysqlEnum("status", ["visible", "hidden", "removed"]).default("visible").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("post_comments_post_status_idx").on(table.postId, table.status, table.createdAt),
    index("post_comments_parent_idx").on(table.postId, table.parentId, table.createdAt),
  ],
);

export const moderationLogs = mysqlTable(
  "moderation_logs",
  {
    id: int("id").autoincrement().primaryKey(),
    actorId: int("actorId")
      .notNull()
      .references(() => users.id),
    action: varchar("action", { length: 64 }).notNull(),
    targetType: varchar("targetType", { length: 32 }).notNull(),
    targetId: int("targetId").notNull(),
    note: text("note"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("moderation_logs_target_idx").on(table.targetType, table.targetId, table.createdAt)],
);

/**
 * Tamper-evident append-only application ledger. TiDB does not support
 * triggers; entries therefore use a server-only HMAC signature and a hash chain.
 */
export const auditLedgerEntries = mysqlTable(
  "audit_ledger_entries",
  {
    id: int("id").autoincrement().primaryKey(),
    eventId: varchar("eventId", { length: 64 }).notNull(),
    actorId: int("actorId")
      .notNull()
      .references(() => users.id),
    action: varchar("action", { length: 64 }).notNull(),
    targetType: varchar("targetType", { length: 32 }).notNull(),
    targetId: int("targetId").notNull(),
    payloadHash: varchar("payloadHash", { length: 64 }).notNull(),
    previousHash: varchar("previousHash", { length: 64 }),
    entryHash: varchar("entryHash", { length: 64 }).notNull(),
    signature: varchar("signature", { length: 64 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    uniqueIndex("audit_ledger_event_id_unique").on(table.eventId),
    uniqueIndex("audit_ledger_entry_hash_unique").on(table.entryHash),
    index("audit_ledger_target_idx").on(table.targetType, table.targetId, table.createdAt),
  ],
);

/** The only mutable ledger state; it makes deletion or reordering detectable. */
export const auditLedgerHeads = mysqlTable("audit_ledger_heads", {
  id: int("id").primaryKey(),
  lastEntryHash: varchar("lastEntryHash", { length: 64 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** A real person or company that an active administrator has documented for partner review. */
export const partnerProfiles = mysqlTable(
  "partner_profiles",
  {
    id: int("id").autoincrement().primaryKey(),
    displayName: varchar("displayName", { length: 160 }).notNull(),
    partyType: mysqlEnum("partyType", ["person", "company"]).notNull(),
    destinationUrl: varchar("destinationUrl", { length: 500 }),
    disclosureLabel: varchar("disclosureLabel", { length: 80 }).default("Werbung").notNull(),
    authorizationConfirmedAt: timestamp("authorizationConfirmedAt"),
    status: mysqlEnum("status", ["draft", "approved", "paused", "removed"]).default("draft").notNull(),
    createdByUserId: int("createdByUserId")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("partner_profiles_status_idx").on(table.status, table.updatedAt)],
);

/** A merchant-managed product draft. It becomes public only through a currently authorized active partner placement. */
export const partnerProducts = mysqlTable(
  "partner_products",
  {
    id: int("id").autoincrement().primaryKey(),
    partnerId: int("partnerId")
      .notNull()
      .references(() => partnerProfiles.id),
    title: varchar("title", { length: 160 }).notNull(),
    description: text("description"),
    destinationUrl: varchar("destinationUrl", { length: 500 }).notNull(),
    priceLabel: varchar("priceLabel", { length: 80 }),
    imageStorageKey: varchar("imageStorageKey", { length: 512 }),
    imageMimeType: mysqlEnum("imageMimeType", ["image/jpeg", "image/png", "image/webp"]),
    imageByteSize: int("imageByteSize"),
    status: mysqlEnum("status", ["draft", "active", "paused", "removed"]).default("draft").notNull(),
    createdByUserId: int("createdByUserId")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("partner_products_partner_status_updated_idx").on(table.partnerId, table.status, table.updatedAt),
    uniqueIndex("partner_products_partner_destination_unique").on(table.partnerId, table.destinationUrl),
  ],
);

/** A reviewable, time-bounded placement. Only an active home placement may be public. */
export const partnerPlacements = mysqlTable(
  "partner_placements",
  {
    id: int("id").autoincrement().primaryKey(),
    partnerId: int("partnerId")
      .notNull()
      .references(() => partnerProfiles.id),
    placement: mysqlEnum("placement", ["home"]).default("home").notNull(),
    status: mysqlEnum("status", ["draft", "active", "paused", "expired", "removed"]).default("draft").notNull(),
    startsAt: timestamp("startsAt"),
    endsAt: timestamp("endsAt"),
    createdByUserId: int("createdByUserId")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("partner_placements_partner_placement_unique").on(table.partnerId, table.placement),
    index("partner_placements_public_idx").on(table.placement, table.status, table.startsAt, table.endsAt),
  ],
);

/** Versioned authorization events for real partner advertising; only the most recent event determines validity. */
export const partnerAuthorizations = mysqlTable(
  "partner_authorizations",
  {
    id: int("id").autoincrement().primaryKey(),
    eventId: varchar("eventId", { length: 64 }).notNull(),
    partnerId: int("partnerId")
      .notNull()
      .references(() => partnerProfiles.id),
    authorizationVersion: varchar("authorizationVersion", { length: 32 }).notNull(),
    state: mysqlEnum("state", ["granted", "revoked"]).notNull(),
    confirmedByUserId: int("confirmedByUserId")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    uniqueIndex("partner_authorizations_event_id_unique").on(table.eventId),
    index("partner_authorizations_partner_created_idx").on(table.partnerId, table.createdAt),
  ],
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type UserConsent = typeof userConsents.$inferSelect;
export type UserConsentCurrent = typeof userConsentCurrent.$inferSelect;
export type UserConsentEvent = typeof userConsentEvents.$inferSelect;
export type ObservationRecord = typeof observations.$inferSelect;
export type InsertObservationRecord = typeof observations.$inferInsert;
export type MediaAssetRecord = typeof mediaAssets.$inferSelect;
export type XpEventRecord = typeof xpEvents.$inferSelect;
export type AssistantUsageRecord = typeof assistantUsage.$inferSelect;
export type PrivateHabitatRecord = typeof privateHabitats.$inferSelect;
export type SmartDeviceMeasurementRecord = typeof smartDeviceMeasurements.$inferSelect;
export type KnowledgeArticleRecord = typeof knowledgeArticles.$inferSelect;
export type CommunityPostRecord = typeof communityPosts.$inferSelect;
export type AuditLedgerEntryRecord = typeof auditLedgerEntries.$inferSelect;
export type PartnerProfileRecord = typeof partnerProfiles.$inferSelect;
export type PartnerProductRecord = typeof partnerProducts.$inferSelect;
export type PartnerPlacementRecord = typeof partnerPlacements.$inferSelect;
export type PartnerAuthorizationRecord = typeof partnerAuthorizations.$inferSelect;
