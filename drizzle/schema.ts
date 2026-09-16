import {
  boolean,
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
  table => [index("community_posts_feed_idx").on(table.status, table.visibility, table.createdAt)],
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
    eventType: mysqlEnum("eventType", ["daily_check_in", "observation_photo", "assistant_response"]).notNull(),
    eventKey: varchar("eventKey", { length: 160 }).notNull(),
    amount: int("amount").notNull(),
    metadata: json("metadata"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    uniqueIndex("xp_events_user_event_key_unique").on(table.userId, table.eventKey),
    index("xp_events_user_type_created_idx").on(table.userId, table.eventType, table.createdAt),
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
    parentId: int("parentId"),
    content: text("content").notNull(),
    status: mysqlEnum("status", ["visible", "hidden", "removed"]).default("visible").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("post_comments_post_status_idx").on(table.postId, table.status, table.createdAt)],
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

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type UserConsent = typeof userConsents.$inferSelect;
export type ObservationRecord = typeof observations.$inferSelect;
export type InsertObservationRecord = typeof observations.$inferInsert;
export type MediaAssetRecord = typeof mediaAssets.$inferSelect;
export type XpEventRecord = typeof xpEvents.$inferSelect;
export type AssistantUsageRecord = typeof assistantUsage.$inferSelect;
export type KnowledgeArticleRecord = typeof knowledgeArticles.$inferSelect;
export type CommunityPostRecord = typeof communityPosts.$inferSelect;
