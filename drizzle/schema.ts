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
    locale: mysqlEnum("locale", ["de", "en", "zh-CN", "es", "fr", "it", "pt-BR", "ja", "ko", "nl", "tr", "pl", "ar"]).default("de").notNull(),
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

/** Additional capabilities; the legacy users.role remains the primary backward-compatible role. */
export const userRoles = mysqlTable(
  "user_roles",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    role: mysqlEnum("role", ["admin", "moderator", "merchant"]).notNull(),
    assignedBy: int("assignedBy").references(() => users.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [uniqueIndex("user_roles_user_role_unique").on(table.userId, table.role), index("user_roles_user_idx").on(table.userId)],
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

/** Server-revocable session registry for web and native clients. Tokens are never stored in plaintext. */
export const userSessions = mysqlTable(
  "user_sessions",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    sessionHash: varchar("sessionHash", { length: 64 }).notNull(),
    provider: mysqlEnum("provider", ["manus", "local"]).notNull(),
    deviceId: varchar("deviceId", { length: 128 }),
    clientAgent: varchar("userAgent", { length: 512 }),
    issuedAt: timestamp("issuedAt"),
    expiresAt: timestamp("expiresAt").notNull(),
    lastSeenAt: timestamp("lastSeenAt").defaultNow().notNull(),
    revokedAt: timestamp("revokedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    uniqueIndex("user_sessions_hash_unique").on(table.sessionHash),
    index("user_sessions_user_active_idx").on(table.userId, table.revokedAt, table.expiresAt),
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
    taxonRank: varchar("taxonRank", { length: 32 }),
    observedAt: timestamp("observedAt"),
    basisOfRecord: mysqlEnum("basisOfRecord", ["human_observation", "machine_observation", "material_sample"]).default("human_observation").notNull(),
    wildStatus: mysqlEnum("wildStatus", ["wild", "cultivated", "captive", "unknown"]).default("unknown").notNull(),
    latitude: decimal("latitude", { precision: 10, scale: 7 }),
    longitude: decimal("longitude", { precision: 10, scale: 7 }),
    coordinateUncertaintyM: decimal("coordinateUncertaintyM", { precision: 12, scale: 2 }),
    publicLatitude: decimal("publicLatitude", { precision: 10, scale: 7 }),
    publicLongitude: decimal("publicLongitude", { precision: 10, scale: 7 }),
    geoprivacy: mysqlEnum("geoprivacy", ["private", "obscured", "public", "embargoed"]).default("private").notNull(),
    embargoUntil: timestamp("embargoUntil"),
    note: text("note"),
    metrics: json("metrics").notNull(),
    userStatus: mysqlEnum("userStatus", ["draft", "saved", "help_requested", "question_open", "proposal_received", "queued_for_review"]).default("saved").notNull(),
    aiCandidates: json("aiCandidates"),
    aiModel: varchar("aiModel", { length: 128 }),
    aiCatalogVersion: varchar("aiCatalogVersion", { length: 128 }),
    evidenceState: mysqlEnum("evidenceState", [
      "confirmed",
      "contextual",
      "unverified",
      "conflicting",
      "insufficient",
    ])
      .default("unverified")
      .notNull(),
    reviewNote: text("reviewNote"),
    reviewedByUserId: int("reviewedByUserId").references(() => users.id),
    reviewedAt: timestamp("reviewedAt"),
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
    index("observations_public_geo_idx").on(table.visibility, table.geoprivacy, table.observedAt),
  ],
);

export const observationResponses = mysqlTable(
  "observation_responses",
  {
    id: int("id").autoincrement().primaryKey(),
    observationId: int("observationId").notNull().references(() => observations.id, { onDelete: "cascade" }),
    authorUserId: int("authorUserId").notNull().references(() => users.id, { onDelete: "cascade" }),
    parentId: int("parentId").references((): AnyMySqlColumn => observationResponses.id, { onDelete: "set null" }),
    kind: mysqlEnum("kind", ["confirm", "taxon_suggestion", "question", "answer"]).notNull(),
    proposedScientificName: varchar("proposedScientificName", { length: 160 }),
    taxonRank: varchar("taxonRank", { length: 32 }),
    content: varchar("content", { length: 2_000 }),
    status: mysqlEnum("status", ["visible", "hidden", "removed"]).default("visible").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("observation_responses_observation_created_idx").on(table.observationId, table.status, table.createdAt),
    index("observation_responses_parent_idx").on(table.parentId, table.createdAt),
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
    publishAt: timestamp("publishAt"),
    expiresAt: timestamp("expiresAt"),
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

export const notifications = mysqlTable(
  "notifications",
  {
    id: int("id").autoincrement().primaryKey(),
    recipientId: int("recipientId").notNull().references(() => users.id),
    actorId: int("actorId").notNull().references(() => users.id),
    type: mysqlEnum("type", ["comment", "like", "report", "moderation", "feedback", "partner_inquiry", "system", "message"]).notNull(),
    postId: int("postId").references(() => communityPosts.id),
    commentId: int("commentId"),
    observationId: int("observationId").references(() => observations.id, { onDelete: "cascade" }),
    observationResponseId: int("observationResponseId").references(() => observationResponses.id, { onDelete: "cascade" }),
    feedbackId: int("feedbackId").references(() => feedbackEntries.id, { onDelete: "cascade" }),
    partnerInquiryId: int("partnerInquiryId").references(() => partnerInquiries.id, { onDelete: "cascade" }),
    message: varchar("message", { length: 255 }).notNull(),
    readAt: timestamp("readAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    index("notifications_recipient_created_idx").on(table.recipientId, table.createdAt),
    index("notifications_recipient_read_idx").on(table.recipientId, table.readAt),
  ],
);

/** A private two-member conversation. Participant ordering is normalized server-side. */
export const directConversations = mysqlTable(
  "direct_conversations",
  {
    id: int("id").autoincrement().primaryKey(),
    participantOneId: int("participantOneId").notNull().references(() => users.id),
    participantTwoId: int("participantTwoId").notNull().references(() => users.id),
    lastMessageAt: timestamp("lastMessageAt").defaultNow().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("direct_conversations_participants_unique").on(table.participantOneId, table.participantTwoId),
    index("direct_conversations_participant_one_updated_idx").on(table.participantOneId, table.updatedAt),
    index("direct_conversations_participant_two_updated_idx").on(table.participantTwoId, table.updatedAt),
  ],
);

/** Private member messages. Visibility and read state are server-controlled. */
export const directMessages = mysqlTable(
  "direct_messages",
  {
    id: int("id").autoincrement().primaryKey(),
    conversationId: int("conversationId").notNull().references(() => directConversations.id, { onDelete: "cascade" }),
    senderId: int("senderId").notNull().references(() => users.id),
    content: varchar("content", { length: 2_000 }).notNull(),
    status: mysqlEnum("status", ["visible", "removed"]).default("visible").notNull(),
    readAt: timestamp("readAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("direct_messages_conversation_created_idx").on(table.conversationId, table.createdAt),
    index("direct_messages_conversation_read_idx").on(table.conversationId, table.readAt),
    index("direct_messages_sender_created_idx").on(table.senderId, table.createdAt),
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
    habitatId: int("habitatId").references(() => privateHabitats.id),
    kind: mysqlEnum("kind", ["avatar", "observation_image", "post_image", "post_video", "habitat_image"]).notNull(),
    mimeType: mysqlEnum("mimeType", ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"]).notNull(),
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
    index("media_assets_habitat_user_created_idx").on(table.habitatId, table.userId, table.createdAt),
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
    promptTokens: int("promptTokens"),
    completionTokens: int("completionTokens"),
    totalTokens: int("totalTokens"),
    creditSource: mysqlEnum("creditSource", ["free", "pro", "purchased"]).default("free").notNull(),
    creditsConsumed: int("creditsConsumed").default(1).notNull(),
    requestOutcome: mysqlEnum("requestOutcome", ["reserved", "completed", "failed", "timeout", "quota_exceeded"]).default("reserved").notNull(),
    provider: varchar("provider", { length: 64 }),
    tariffVersion: varchar("tariffVersion", { length: 64 }),
    plantnetEngineVersion: varchar("plantnetEngineVersion", { length: 96 }),
    plantnetRateLimitRemaining: int("plantnetRateLimitRemaining"),
    plantnetRateLimitResetAt: timestamp("plantnetRateLimitResetAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    uniqueIndex("assistant_usage_user_request_unique").on(table.userId, table.clientRequestId),
    index("assistant_usage_user_created_idx").on(table.userId, table.createdAt),
  ],
);

/** Host-controlled policy for free, Pro and global plant-identification budgets. */
export const aiUsagePolicies = mysqlTable("ai_usage_policies", {
  id: int("id").primaryKey(),
  freeDailyIdentifications: int("freeDailyIdentifications").default(2).notNull(),
  proMonthlyIdentifications: int("proMonthlyIdentifications").default(60).notNull(),
  globalDailyIdentifications: int("globalDailyIdentifications").default(100).notNull(),
  updatedByUserId: int("updatedByUserId").references(() => users.id),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Atomic per-user wallet for purchased or staff-granted identification credits. */
export const aiCreditWallets = mysqlTable("ai_credit_wallets", {
  userId: int("userId").primaryKey().references(() => users.id),
  credits: int("credits").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** One row per UTC day makes the global kill-switch auditable and inexpensive to query. */
export const aiGlobalUsageDays = mysqlTable("ai_global_usage_days", {
  dayKey: varchar("dayKey", { length: 10 }).primaryKey(),
  plantIdentifications: int("plantIdentifications").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Atomic free allowance counter per user and UTC day. */
export const aiUserUsageDays = mysqlTable(
  "ai_user_usage_days",
  {
    userId: int("userId").notNull().references(() => users.id),
    dayKey: varchar("dayKey", { length: 10 }).notNull(),
    freeIdentifications: int("freeIdentifications").default(0).notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("ai_user_usage_days_pk").on(table.userId, table.dayKey), index("ai_user_usage_days_user_idx").on(table.userId, table.dayKey)],
);

/** Atomic Pro allowance counter per user and UTC month. */
export const aiUserUsageMonths = mysqlTable(
  "ai_user_usage_months",
  {
    userId: int("userId").notNull().references(() => users.id),
    monthKey: varchar("monthKey", { length: 7 }).notNull(),
    proIdentifications: int("proIdentifications").default(0).notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("ai_user_usage_months_pk").on(table.userId, table.monthKey), index("ai_user_usage_months_user_idx").on(table.userId, table.monthKey)],
);

/** Cache of the business entitlement; Stripe remains the source of billing truth. */
export const billingAccounts = mysqlTable("billing_accounts", {
  userId: int("userId").primaryKey().references(() => users.id),
  stripeCustomerId: varchar("stripeCustomerId", { length: 128 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 128 }),
  plan: mysqlEnum("plan", ["free", "pro"]).default("free").notNull(),
  status: mysqlEnum("status", ["inactive", "active", "past_due", "canceled"]).default("inactive").notNull(),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Host-controlled access grants for paid capabilities. Stripe remains the billing source; this table stores only the business entitlement. */
export const accountEntitlements = mysqlTable(
  "account_entitlements",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    featureKey: varchar("featureKey", { length: 64 }).notNull(),
    status: mysqlEnum("status", ["active", "revoked"]).default("active").notNull(),
    grantedByUserId: int("grantedByUserId").notNull().references(() => users.id),
    expiresAt: timestamp("expiresAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("account_entitlements_user_feature_unique").on(table.userId, table.featureKey),
    index("account_entitlements_user_status_idx").on(table.userId, table.status),
  ],
);

/** Idempotent record linking a completed Stripe Checkout session to credits. */
export const aiCreditPurchases = mysqlTable(
  "ai_credit_purchases",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    stripeCheckoutSessionId: varchar("stripeCheckoutSessionId", { length: 128 }).notNull(),
    packKey: varchar("packKey", { length: 48 }).notNull(),
    credits: int("credits").notNull(),
    status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending").notNull(),
    completedAt: timestamp("completedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [uniqueIndex("ai_credit_purchases_session_unique").on(table.stripeCheckoutSessionId), index("ai_credit_purchases_user_created_idx").on(table.userId, table.createdAt)],
);

/** User-submitted correction of an AI plant result; the original result remains immutable for review. */
export const aiIdentificationCorrections = mysqlTable(
  "ai_identification_corrections",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("user_id").notNull().references(() => users.id),
    assistantUsageId: int("assistant_usage_id").references(() => assistantUsage.id),
    originalAnswer: text("original_answer").notNull(),
    correctedName: varchar("corrected_name", { length: 255 }).notNull(),
    correctionNote: text("correction_note"),
    status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
    reviewNote: text("review_note"),
    reviewedByUserId: int("reviewed_by_user_id").references(() => users.id),
    reviewedAt: timestamp("reviewed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("ai_corrections_user_created_idx").on(table.userId, table.createdAt),
    index("ai_corrections_status_created_idx").on(table.status, table.createdAt),
    index("ai_corrections_usage_idx").on(table.assistantUsageId),
  ],
);

/** Consent-gated, aggregate-friendly product analytics. No IP, user-agent, name, or content is stored. */
export const analyticsEvents = mysqlTable(
  "analytics_events",
  {
    id: int("id").autoincrement().primaryKey(),
    sessionKey: varchar("sessionKey", { length: 128 }).notNull(),
    eventType: mysqlEnum("eventType", ["page_view", "page_view_end", "session_start", "login_success"]).notNull(),
    path: varchar("path", { length: 255 }),
    countryCode: varchar("countryCode", { length: 2 }),
    durationSeconds: int("durationSeconds").default(0).notNull(),
    occurredAt: timestamp("occurredAt").defaultNow().notNull(),
  },
  table => [
    index("analytics_events_occurred_idx").on(table.occurredAt),
    index("analytics_events_type_occurred_idx").on(table.eventType, table.occurredAt),
    index("analytics_events_country_occurred_idx").on(table.countryCode, table.occurredAt),
    index("analytics_events_session_occurred_idx").on(table.sessionKey, table.occurredAt),
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
    careStatus: mysqlEnum("careStatus", ["unknown", "stable", "attention", "critical"]).default("unknown").notNull(),
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
    locale: mysqlEnum("locale", ["de", "en", "zh-CN", "es", "fr", "it", "pt-BR", "ja", "ko", "nl", "tr", "pl", "ar"]).notNull(),
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

/** Source-traceable public organism catalogue. Records are imported from a validated source; no seed data is created here. */
export const plantTaxa = mysqlTable(
  "plant_taxa",
  {
    id: int("id").autoincrement().primaryKey(),
    source: varchar("source", { length: 96 }).notNull(),
    sourceVersion: varchar("sourceVersion", { length: 96 }).notNull(),
    sourceRecordId: varchar("sourceRecordId", { length: 160 }).notNull(),
    sourceRecordUrl: varchar("sourceRecordUrl", { length: 1_000 }),
    sourceLicense: varchar("sourceLicense", { length: 128 }),
    sourceCitation: text("sourceCitation"),
    sourceRetrievedAt: timestamp("sourceRetrievedAt"),
    taxonomicStatus: varchar("taxonomicStatus", { length: 48 }),
    matchConfidence: int("matchConfidence"),
    scientificName: varchar("scientificName", { length: 240 }).notNull(),
    acceptedScientificName: varchar("acceptedScientificName", { length: 240 }),
    rank: varchar("rank", { length: 48 }),
    family: varchar("family", { length: 160 }),
    genus: varchar("genus", { length: 160 }),
    commonNames: json("commonNames").notNull(),
    synonyms: json("synonyms").notNull(),
    summary: text("summary"),
    careProfile: json("careProfile"),
    imageUrl: varchar("imageUrl", { length: 1_000 }),
    imageSourceUrl: varchar("imageSourceUrl", { length: 1_000 }),
    imageLicense: varchar("imageLicense", { length: 128 }),
    imageAttribution: text("imageAttribution"),
    imageVerifiedAt: timestamp("imageVerifiedAt"),
    evidenceState: mysqlEnum("evidenceState", ["confirmed", "contextual", "unverified", "conflicting", "insufficient"]).default("confirmed").notNull(),
    status: mysqlEnum("status", ["draft", "published", "retired"]).default("draft").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("plant_taxa_source_record_unique").on(table.source, table.sourceVersion, table.sourceRecordId),
    index("plant_taxa_scientific_name_idx").on(table.scientificName),
    index("plant_taxa_genus_family_idx").on(table.status, table.genus, table.family),
    index("plant_taxa_published_rank_updated_idx").on(table.status, table.rank, table.updatedAt),
  ],
);

/** Source-traceable public aquarium organism catalogue, kept separate from plant taxonomy. */
export const aquariumTaxa = mysqlTable(
  "aquarium_taxa",
  {
    id: int("id").autoincrement().primaryKey(),
    source: varchar("source", { length: 96 }).notNull(),
    sourceVersion: varchar("sourceVersion", { length: 96 }).notNull(),
    sourceRecordId: varchar("sourceRecordId", { length: 160 }).notNull(),
    sourceRecordUrl: varchar("sourceRecordUrl", { length: 1_000 }),
    sourceLicense: varchar("sourceLicense", { length: 128 }),
    sourceCitation: text("sourceCitation"),
    sourceRetrievedAt: timestamp("sourceRetrievedAt"),
    taxonomicStatus: varchar("taxonomicStatus", { length: 48 }),
    matchConfidence: int("matchConfidence"),
    scientificName: varchar("scientificName", { length: 240 }).notNull(),
    acceptedScientificName: varchar("acceptedScientificName", { length: 240 }),
    rank: varchar("rank", { length: 48 }),
    family: varchar("family", { length: 160 }),
    genus: varchar("genus", { length: 160 }),
    commonNames: json("commonNames").notNull(),
    synonyms: json("synonyms").notNull(),
    summary: text("summary"),
    careProfile: json("careProfile"),
    imageUrl: varchar("imageUrl", { length: 1_000 }),
    imageSourceUrl: varchar("imageSourceUrl", { length: 1_000 }),
    imageLicense: varchar("imageLicense", { length: 128 }),
    imageAttribution: text("imageAttribution"),
    imageVerifiedAt: timestamp("imageVerifiedAt"),
    evidenceState: mysqlEnum("evidenceState", ["confirmed", "contextual", "unverified", "conflicting", "insufficient"]).default("confirmed").notNull(),
    status: mysqlEnum("status", ["draft", "published", "retired"]).default("draft").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("aquarium_taxa_source_record_unique").on(table.source, table.sourceVersion, table.sourceRecordId),
    index("aquarium_taxa_scientific_name_idx").on(table.scientificName),
    index("aquarium_taxa_genus_family_idx").on(table.status, table.genus, table.family),
    index("aquarium_taxa_published_rank_updated_idx").on(table.status, table.rank, table.updatedAt),
  ],
);

/** Source-traceable public terrarium organism catalogue, kept separate from plants and aquarium organisms. */
export const terrariumTaxa = mysqlTable(
  "terrarium_taxa",
  {
    id: int("id").autoincrement().primaryKey(),
    source: varchar("source", { length: 96 }).notNull(),
    sourceVersion: varchar("sourceVersion", { length: 96 }).notNull(),
    sourceRecordId: varchar("sourceRecordId", { length: 160 }).notNull(),
    sourceRecordUrl: varchar("sourceRecordUrl", { length: 1_000 }),
    sourceLicense: varchar("sourceLicense", { length: 128 }),
    sourceCitation: text("sourceCitation"),
    sourceRetrievedAt: timestamp("sourceRetrievedAt"),
    taxonomicStatus: varchar("taxonomicStatus", { length: 48 }),
    matchConfidence: int("matchConfidence"),
    scientificName: varchar("scientificName", { length: 240 }).notNull(),
    acceptedScientificName: varchar("acceptedScientificName", { length: 240 }),
    rank: varchar("rank", { length: 48 }),
    family: varchar("family", { length: 160 }),
    genus: varchar("genus", { length: 160 }),
    commonNames: json("commonNames").notNull(),
    synonyms: json("synonyms").notNull(),
    summary: text("summary"),
    careProfile: json("careProfile"),
    imageUrl: varchar("imageUrl", { length: 1_000 }),
    imageSourceUrl: varchar("imageSourceUrl", { length: 1_000 }),
    imageLicense: varchar("imageLicense", { length: 128 }),
    imageAttribution: text("imageAttribution"),
    imageVerifiedAt: timestamp("imageVerifiedAt"),
    evidenceState: mysqlEnum("evidenceState", ["confirmed", "contextual", "unverified", "conflicting", "insufficient"]).default("confirmed").notNull(),
    status: mysqlEnum("status", ["draft", "published", "retired"]).default("draft").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("terrarium_taxa_source_record_unique").on(table.source, table.sourceVersion, table.sourceRecordId),
    index("terrarium_taxa_scientific_name_idx").on(table.scientificName),
    index("terrarium_taxa_genus_family_idx").on(table.status, table.genus, table.family),
    index("terrarium_taxa_published_rank_updated_idx").on(table.status, table.rank, table.updatedAt),
  ],
);

/** Server-synchronised following relationship; private accounts never leak through public search. */
export const userFollows = mysqlTable(
  "user_follows",
  {
    id: int("id").autoincrement().primaryKey(),
    followerId: int("followerId").notNull().references(() => users.id),
    followingId: int("followingId").notNull().references(() => users.id),
    status: mysqlEnum("status", ["active", "removed"]).default("active").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("user_follows_pair_unique").on(table.followerId, table.followingId),
    index("user_follows_following_status_idx").on(table.followingId, table.status, table.createdAt),
  ],
);

/** A server-side block relationship used by feeds, search and notifications. */
export const userBlocks = mysqlTable(
  "user_blocks",
  {
    id: int("id").autoincrement().primaryKey(),
    blockerId: int("blockerId").notNull().references(() => users.id),
    blockedId: int("blockedId").notNull().references(() => users.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    uniqueIndex("user_blocks_pair_unique").on(table.blockerId, table.blockedId),
    index("user_blocks_blocked_idx").on(table.blockedId, table.createdAt),
  ],
);

/** Account-synchronised saves for public records, never private records. */
export const savedItems = mysqlTable(
  "saved_items",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    targetType: mysqlEnum("targetType", ["post", "knowledge", "plant_taxon", "aquarium_taxon", "product", "profile"]).notNull(),
    targetId: int("targetId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    uniqueIndex("saved_items_user_target_unique").on(table.userId, table.targetType, table.targetId),
    index("saved_items_user_created_idx").on(table.userId, table.createdAt),
  ],
);

/** Published, auditable challenges. Progress is derived from valid server events only. */
export const challenges = mysqlTable(
  "challenges",
  {
    id: int("id").autoincrement().primaryKey(),
    title: varchar("title", { length: 180 }).notNull(),
    description: text("description").notNull(),
    realm: mysqlEnum("realm", ["botany", "aquarium", "terrarium"]),
    ruleText: text("ruleText").notNull(),
    startsAt: timestamp("startsAt").notNull(),
    endsAt: timestamp("endsAt").notNull(),
    rewardPoints: int("rewardPoints").default(0).notNull(),
    status: mysqlEnum("status", ["draft", "published", "closed"]).default("draft").notNull(),
    createdByUserId: int("createdByUserId").notNull().references(() => users.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("challenges_status_window_idx").on(table.status, table.startsAt, table.endsAt)],
);

export const challengeProgress = mysqlTable(
  "challenge_progress",
  {
    id: int("id").autoincrement().primaryKey(),
    challengeId: int("challengeId").notNull().references(() => challenges.id, { onDelete: "cascade" }),
    userId: int("userId").notNull().references(() => users.id),
    progress: int("progress").default(0).notNull(),
    status: mysqlEnum("status", ["joined", "completed", "withdrawn"]).default("joined").notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("challenge_progress_pair_unique").on(table.challengeId, table.userId),
    index("challenge_progress_user_status_idx").on(table.userId, table.status, table.updatedAt),
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

/** Authenticated community streams and staff-approved expert lectures. */
export const liveSessions = mysqlTable(
  "live_sessions",
  {
    id: int("id").autoincrement().primaryKey(),
    hostUserId: int("hostUserId").notNull().references(() => users.id),
    track: mysqlEnum("track", ["community", "expert"]).notNull(),
    title: varchar("title", { length: 180 }).notNull(),
    description: text("description").notNull(),
    realm: mysqlEnum("realm", ["botany", "aquarium", "terrarium"]),
    presenterName: varchar("presenterName", { length: 160 }).notNull(),
    presenterCredential: varchar("presenterCredential", { length: 160 }),
    streamUrl: varchar("streamUrl", { length: 1_000 }),
    /** SHA-256 digest only; the one-time own-media ingest key is never stored in cleartext. */
    selfHostedIngestKeyHash: varchar("selfHostedIngestKeyHash", { length: 128 }),
    selfHostedKeyVersion: int("selfHostedKeyVersion").default(0).notNull(),
    status: mysqlEnum("status", ["scheduled", "live", "ended", "cancelled"]).default("scheduled").notNull(),
    startsAt: timestamp("startsAt").notNull(),
    endsAt: timestamp("endsAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("live_sessions_member_feed_idx").on(table.status, table.track, table.startsAt),
    index("live_sessions_host_status_idx").on(table.hostUserId, table.status, table.updatedAt),
  ],
);

/** Short-lived member presence used only for current live audience counts. */
export const liveSessionViewers = mysqlTable(
  "live_session_viewers",
  {
    id: int("id").autoincrement().primaryKey(),
    sessionId: int("sessionId").notNull().references(() => liveSessions.id, { onDelete: "cascade" }),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    lastSeenAt: timestamp("lastSeenAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("live_session_viewers_session_user_unique").on(table.sessionId, table.userId),
    index("live_session_viewers_session_seen_idx").on(table.sessionId, table.lastSeenAt),
  ],
);

/** Moderated authenticated chat attached to a single live session. */
export const liveSessionMessages = mysqlTable(
  "live_session_messages",
  {
    id: int("id").autoincrement().primaryKey(),
    sessionId: int("sessionId").notNull().references(() => liveSessions.id, { onDelete: "cascade" }),
    userId: int("userId").notNull().references(() => users.id),
    content: varchar("content", { length: 2_000 }).notNull(),
    status: mysqlEnum("status", ["visible", "hidden", "removed"]).default("visible").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("live_session_messages_session_status_created_idx").on(table.sessionId, table.status, table.createdAt),
    index("live_session_messages_user_created_idx").on(table.userId, table.createdAt),
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

/** User-submitted moderation reports. Reports are immutable intake records; staff decisions live in the audit ledger. */
export const communityReports = mysqlTable(
  "community_reports",
  {
    id: int("id").autoincrement().primaryKey(),
    reporterId: int("reporterId").notNull().references(() => users.id),
    postId: int("postId").references(() => communityPosts.id),
    commentId: int("commentId").references(() => postComments.id),
    reason: mysqlEnum("reason", ["sexual_content", "harassment", "misinformation", "copyright", "other"]).notNull(),
    note: varchar("note", { length: 1_000 }),
    status: mysqlEnum("status", ["pending", "reviewed", "dismissed"]).default("pending").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("community_reports_status_created_idx").on(table.status, table.createdAt),
    index("community_reports_reporter_created_idx").on(table.reporterId, table.createdAt),
  ],
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

/** Authenticated or public requests to join the BlackWaterLeaf partner network. */
export const partnerInquiries = mysqlTable(
  "partner_inquiries",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").references(() => users.id),
    organizationName: varchar("organizationName", { length: 220 }),
    contactName: varchar("contactName", { length: 160 }),
    organizationType: varchar("organizationType", { length: 80 }),
    contactEmail: varchar("contactEmail", { length: 320 }).notNull(),
    website: varchar("website", { length: 500 }),
    message: text("message").notNull(),
    status: mysqlEnum("status", ["received", "reviewing", "accepted", "declined"]).default("received").notNull(),
    adminNote: text("adminNote"),
    responseMessage: text("responseMessage"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("partner_inquiries_user_created_idx").on(table.userId, table.createdAt), index("partner_inquiries_status_created_idx").on(table.status, table.createdAt)],
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
    sourceDescriptionHtml: text("sourceDescriptionHtml"),
    destinationUrl: varchar("destinationUrl", { length: 500 }).notNull(),
    priceLabel: varchar("priceLabel", { length: 80 }),
    sourceHandle: varchar("sourceHandle", { length: 255 }),
    sourceVendor: varchar("sourceVendor", { length: 160 }),
    marketplaceCategory: varchar("marketplaceCategory", { length: 64 }),
    sourceProductCategory: varchar("sourceProductCategory", { length: 1_000 }),
    productType: varchar("productType", { length: 160 }),
    sourceTags: text("sourceTags"),
    variantSummary: varchar("variantSummary", { length: 1_000 }),
    variantCount: int("variantCount").default(0).notNull(),
    sourceVariants: json("sourceVariants"),
    sourceImageUrl: varchar("sourceImageUrl", { length: 1_000 }),
    imageAltText: varchar("imageAltText", { length: 512 }),
    seoTitle: varchar("seoTitle", { length: 160 }),
    seoDescription: varchar("seoDescription", { length: 320 }),
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
    index("partner_products_catalog_category_idx").on(table.partnerId, table.marketplaceCategory, table.status, table.updatedAt),
    uniqueIndex("partner_products_partner_destination_unique").on(table.partnerId, table.destinationUrl),
    uniqueIndex("partner_products_partner_source_handle_unique").on(table.partnerId, table.sourceHandle),
  ],
);

/** Source-traceable gallery images imported from an authorized partner catalogue. */
export const partnerProductImages = mysqlTable(
  "partner_product_images",
  {
    id: int("id").autoincrement().primaryKey(),
    productId: int("productId")
      .notNull()
      .references(() => partnerProducts.id, { onDelete: "cascade" }),
    position: int("position").notNull(),
    sourceUrl: varchar("sourceUrl", { length: 1_000 }).notNull(),
    storageKey: varchar("storageKey", { length: 512 }),
    mimeType: mysqlEnum("mimeType", ["image/jpeg", "image/png", "image/webp"]),
    byteSize: int("byteSize"),
    altText: varchar("altText", { length: 512 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("partner_product_images_product_position_unique").on(table.productId, table.position),
    index("partner_product_images_product_position_idx").on(table.productId, table.position),
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

/**
 * Attribution events for partner offers. Until a payment provider is connected,
 * these are deliberately not called completed sales: they count verified
 * outbound offer clicks and explicit purchase intents from BlackWaterLeaf.
 */
export const partnerOfferEvents = mysqlTable(
  "partner_offer_events",
  {
    id: int("id").autoincrement().primaryKey(),
    eventId: varchar("eventId", { length: 96 }).notNull(),
    partnerId: int("partnerId")
      .notNull()
      .references(() => partnerProfiles.id),
    productId: int("productId")
      .notNull()
      .references(() => partnerProducts.id),
    eventType: mysqlEnum("eventType", ["outbound_click", "purchase_intent"]).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    uniqueIndex("partner_offer_events_event_id_unique").on(table.eventId),
    index("partner_offer_events_partner_product_type_created_idx").on(table.partnerId, table.productId, table.eventType, table.createdAt),
  ],
);

/** Private recurring care plans. These records never enter public feeds or XP. */
export const carePlans = mysqlTable(
  "care_plans",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    habitatId: int("habitatId").references(() => privateHabitats.id, { onDelete: "set null" }),
    realm: mysqlEnum("realm", ["botany", "aquarium", "terrarium"]).notNull(),
    title: varchar("title", { length: 160 }).notNull(),
    timezone: varchar("timezone", { length: 64 }).default("Europe/Berlin").notNull(),
    active: boolean("active").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("care_plans_user_active_updated_idx").on(table.userId, table.active, table.updatedAt)],
);

/** A single private care action; dueAt is stored in UTC and displayed in the user's timezone. */
export const careTasks = mysqlTable(
  "care_tasks",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    planId: int("planId").notNull().references(() => carePlans.id, { onDelete: "cascade" }),
    habitatId: int("habitatId").references(() => privateHabitats.id, { onDelete: "set null" }),
    title: varchar("title", { length: 160 }).notNull(),
    dueAt: timestamp("dueAt").notNull(),
    repeatEveryDays: int("repeatEveryDays"),
    status: mysqlEnum("status", ["open", "done", "snoozed", "skipped"]).default("open").notNull(),
    skipReason: varchar("skipReason", { length: 160 }),
    completedAt: timestamp("completedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("care_tasks_user_status_due_idx").on(table.userId, table.status, table.dueAt),
    index("care_tasks_plan_due_idx").on(table.planId, table.dueAt),
  ],
);

/** Append-only private task history used for explainable completion, snooze and skip states. */
export const careEvents = mysqlTable(
  "care_events",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    taskId: int("taskId").notNull().references(() => careTasks.id, { onDelete: "cascade" }),
    eventType: mysqlEnum("eventType", ["created", "completed", "snoozed", "skipped", "reopened"]).notNull(),
    reason: varchar("reason", { length: 160 }),
    occurredAt: timestamp("occurredAt").defaultNow().notNull(),
  },
  table => [index("care_events_user_occurred_idx").on(table.userId, table.occurredAt)],
);

/** Private care journal entries; never awarded XP and never published implicitly. */
export const careJournal = mysqlTable(
  "care_journal",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    habitatId: int("habitatId").references(() => privateHabitats.id, { onDelete: "set null" }),
    taskId: int("taskId").references(() => careTasks.id, { onDelete: "set null" }),
    note: text("note").notNull(),
    observedAt: timestamp("observedAt").defaultNow().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("care_journal_user_observed_idx").on(table.userId, table.observedAt)],
);

/** Private member feedback; staff can triage it without exposing other users' messages. */
export const feedbackEntries = mysqlTable(
  "feedback_entries",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    kind: mysqlEnum("kind", ["feedback", "problem", "wish"]).notNull(),
    message: text("message").notNull(),
    page: varchar("page", { length: 255 }),
    status: mysqlEnum("status", ["received", "reviewing", "resolved"]).default("received").notNull(),
    adminNote: text("adminNote"),
    responseMessage: text("responseMessage"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("feedback_entries_user_created_idx").on(table.userId, table.createdAt), index("feedback_entries_status_created_idx").on(table.status, table.createdAt)],
);

/** Per-user notification switches, explicit and server-stored. */
export const notificationPreferences = mysqlTable(
  "notification_preferences",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    community: boolean("community").default(true).notNull(),
    messages: boolean("messages").default(true).notNull(),
    moderation: boolean("moderation").default(true).notNull(),
    system: boolean("system").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("notification_preferences_user_unique").on(table.userId)],
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
export type AnalyticsEventRecord = typeof analyticsEvents.$inferSelect;
export type PrivateHabitatRecord = typeof privateHabitats.$inferSelect;
export type SmartDeviceMeasurementRecord = typeof smartDeviceMeasurements.$inferSelect;
export type KnowledgeArticleRecord = typeof knowledgeArticles.$inferSelect;
export type CommunityPostRecord = typeof communityPosts.$inferSelect;
export type LiveSessionRecord = typeof liveSessions.$inferSelect;
export type LiveSessionMessageRecord = typeof liveSessionMessages.$inferSelect;
export type AuditLedgerEntryRecord = typeof auditLedgerEntries.$inferSelect;
export type PartnerProfileRecord = typeof partnerProfiles.$inferSelect;
export type PartnerProductRecord = typeof partnerProducts.$inferSelect;
export type PartnerPlacementRecord = typeof partnerPlacements.$inferSelect;
export type PartnerAuthorizationRecord = typeof partnerAuthorizations.$inferSelect;
export type PartnerOfferEventRecord = typeof partnerOfferEvents.$inferSelect;
export type CarePlanRecord = typeof carePlans.$inferSelect;
export type CareTaskRecord = typeof careTasks.$inferSelect;
export type CareEventRecord = typeof careEvents.$inferSelect;
export type CareJournalRecord = typeof careJournal.$inferSelect;
