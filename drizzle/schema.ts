import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  float,
  json,
} from "drizzle-orm/mysql-core";

// ─── Users ───────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  // Öffentlicher, eindeutiger Handle (z. B. @pflanzentante). Optional bis gesetzt.
  username: varchar("username", { length: 32 }).unique(),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "moderator", "admin"]).default("user").notNull(),
  // Kontostatus für Moderation (Sperren etc.)
  status: mysqlEnum("status", ["active", "suspended", "banned"]).default("active").notNull(),
  // Abo-Stufe gemäß Business Handbook (Monetarisierung). Enforcement erst in V2.
  plan: mysqlEnum("plan", ["free", "premium", "pro"]).default("free").notNull(),
  // Erfahrungslevel aus Onboarding (Personalisierung).
  experienceLevel: mysqlEnum("experienceLevel", ["beginner", "intermediate", "expert"]),
  // Interessen-Tags als JSON-Array (z. B. ["aquaristik","pflanzen"]).
  interests: json("interests"),
  avatarUrl: text("avatarUrl"),
  bio: text("bio"),
  location: varchar("location", { length: 128 }),
  // Öffentliche Social-Media-Links im Profil (optional, vom Nutzer gesetzt).
  socialInstagram: varchar("socialInstagram", { length: 255 }),
  socialTiktok: varchar("socialTiktok", { length: 255 }),
  socialYoutube: varchar("socialYoutube", { length: 255 }),
  socialFacebook: varchar("socialFacebook", { length: 255 }),
  socialWebsite: varchar("socialWebsite", { length: 255 }),
  // Denormalisierte Zähler für Profile (Performance).
  followersCount: int("followersCount").default(0).notNull(),
  followingCount: int("followingCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Plants ──────────────────────────────────────────────────────────────────
export const plants = mysqlTable("plants", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  scientificName: varchar("scientificName", { length: 128 }),
  category: mysqlEnum("category", ["aquatic", "tropical", "alocasia", "monstera", "philodendron", "other"]).default("other").notNull(),
  description: text("description"),
  coverImageUrl: text("coverImageUrl"),
  // Care parameters
  lightRequirement: mysqlEnum("lightRequirement", ["low", "medium", "high"]),
  wateringFrequency: varchar("wateringFrequency", { length: 64 }),
  humidity: mysqlEnum("humidity", ["low", "medium", "high"]),
  temperature: varchar("temperature", { length: 64 }),
  substrate: varchar("substrate", { length: 128 }),
  fertilizing: varchar("fertilizing", { length: 128 }),
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "expert"]),
  isPublic: boolean("isPublic").default(true).notNull(),
  acquiredAt: timestamp("acquiredAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Plant = typeof plants.$inferSelect;
export type InsertPlant = typeof plants.$inferInsert;

// ─── Plant Photos ─────────────────────────────────────────────────────────────
export const plantPhotos = mysqlTable("plant_photos", {
  id: int("id").autoincrement().primaryKey(),
  plantId: int("plantId").notNull(),
  userId: int("userId").notNull(),
  imageUrl: text("imageUrl").notNull(),
  storageKey: text("storageKey").notNull(),
  caption: text("caption"),
  takenAt: timestamp("takenAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PlantPhoto = typeof plantPhotos.$inferSelect;

// ─── Aquariums ────────────────────────────────────────────────────────────────
export const aquariums = mysqlTable("aquariums", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  coverImageUrl: text("coverImageUrl"),
  type: mysqlEnum("type", ["freshwater", "saltwater", "blackwater", "planted", "biotope", "other"]).default("freshwater").notNull(),
  volumeLiters: float("volumeLiters"),
  lengthCm: float("lengthCm"),
  widthCm: float("widthCm"),
  heightCm: float("heightCm"),
  // Water parameters
  phValue: float("phValue"),
  ghValue: float("ghValue"),
  khValue: float("khValue"),
  temperatureCelsius: float("temperatureCelsius"),
  conductivity: float("conductivity"),
  nitrate: float("nitrate"),
  nitrite: float("nitrite"),
  ammonia: float("ammonia"),
  // Setup info
  filterType: varchar("filterType", { length: 128 }),
  lightingType: varchar("lightingType", { length: 128 }),
  substrate: varchar("substrate", { length: 128 }),
  inhabitants: text("inhabitants"),
  plants: text("plants"),
  setupDate: timestamp("setupDate"),
  isPublic: boolean("isPublic").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Aquarium = typeof aquariums.$inferSelect;
export type InsertAquarium = typeof aquariums.$inferInsert;

// ─── Aquarium Photos ──────────────────────────────────────────────────────────
export const aquariumPhotos = mysqlTable("aquarium_photos", {
  id: int("id").autoincrement().primaryKey(),
  aquariumId: int("aquariumId").notNull(),
  userId: int("userId").notNull(),
  imageUrl: text("imageUrl").notNull(),
  storageKey: text("storageKey").notNull(),
  caption: text("caption"),
  takenAt: timestamp("takenAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AquariumPhoto = typeof aquariumPhotos.$inferSelect;

// ─── Aquarium Events ──────────────────────────────────────────────────────────
export const aquariumEvents = mysqlTable("aquarium_events", {
  id: int("id").autoincrement().primaryKey(),
  aquariumId: int("aquariumId").notNull(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["water_change", "feeding", "fertilizing", "maintenance", "measurement", "new_inhabitant", "health_issue", "other"]).notNull(),
  title: varchar("title", { length: 128 }).notNull(),
  description: text("description"),
  data: json("data"), // flexible JSON for measurements etc.
  occurredAt: timestamp("occurredAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AquariumEvent = typeof aquariumEvents.$inferSelect;

// ─── Posts ────────────────────────────────────────────────────────────────────
export const posts = mysqlTable("posts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  content: text("content").notNull(),
  imageUrl: text("imageUrl"),
  storageKey: text("storageKey"),
  videoUrl: text("videoUrl"),
  videoStorageKey: text("videoStorageKey"),
  mediaType: mysqlEnum("mediaType", ["none", "image", "video"]).default("none").notNull(),
  category: mysqlEnum("category", ["plant", "aquarium", "question", "tip", "showcase", "marketplace", "other"]).default("other").notNull(),
  plantId: int("plantId"),
  aquariumId: int("aquariumId"),
  // Optionale Zuordnung zu einer Fachgruppe (null = allgemeiner Feed).
  groupId: int("groupId"),
  likesCount: int("likesCount").default(0).notNull(),
  commentsCount: int("commentsCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;

// ─── Likes ────────────────────────────────────────────────────────────────────
export const likes = mysqlTable("likes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  postId: int("postId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Like = typeof likes.$inferSelect;

// ─── Comments ─────────────────────────────────────────────────────────────────
export const comments = mysqlTable("comments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  postId: int("postId").notNull(),
  // Threaded replies: null = Top-Level-Kommentar, sonst Verweis auf Eltern-Kommentar.
  parentId: int("parentId"),
  content: text("content").notNull(),
  likesCount: int("likesCount").default(0).notNull(),
  repliesCount: int("repliesCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Comment = typeof comments.$inferSelect;

// ─── Notifications ────────────────────────────────────────────────────────────
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["like", "comment", "reply", "follow", "mention", "message", "group_invite", "group_post", "moderation", "care_reminder", "system"]).notNull(),
  title: varchar("title", { length: 128 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  relatedPostId: int("relatedPostId"),
  relatedUserId: int("relatedUserId"),
  relatedCommentId: int("relatedCommentId"),
  relatedGroupId: int("relatedGroupId"),
  relatedConversationId: int("relatedConversationId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;

// ─── AI Chat History ──────────────────────────────────────────────────────────
export const aiChats = mysqlTable("ai_chats", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  contextType: mysqlEnum("contextType", ["general", "plant", "aquarium", "channa"]),
  contextId: int("contextId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AiChat = typeof aiChats.$inferSelect;

// ─── Knowledge Base Articles ────────────────────────────────────────────────
export const knowledgeArticles = mysqlTable("knowledge_articles", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  title: varchar("title", { length: 200 }).notNull(),
  category: mysqlEnum("category", ["aquaristik", "aquascaping", "channa", "blackwater", "houseplants", "basics"]).default("basics").notNull(),
  // Plant genus for houseplants (e.g., "Alocasia", "Monstera", "Philodendron")
  genus: varchar("genus", { length: 64 }).default(""),
  excerpt: varchar("excerpt", { length: 320 }).notNull(),
  content: text("content").notNull(),
  coverImageUrl: text("coverImageUrl"),
  author: varchar("author", { length: 128 }).default("BlackwaterLeaf Redaktion").notNull(),
  readingMinutes: int("readingMinutes").default(5).notNull(),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  viewsCount: int("viewsCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type KnowledgeArticle = typeof knowledgeArticles.$inferSelect;
export type InsertKnowledgeArticle = typeof knowledgeArticles.$inferInsert;

// ─── Gamification: User Stats ───────────────────────────────────────────────
export const userStats = mysqlTable("user_stats", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  xp: int("xp").default(0).notNull(),
  level: int("level").default(1).notNull(),
  points: int("points").default(0).notNull(),
  streak: int("streak").default(0).notNull(),
  longestStreak: int("longestStreak").default(0).notNull(),
  lastCheckIn: timestamp("lastCheckIn"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = typeof userStats.$inferInsert;

// ─── Gamification: Badges (catalog) ─────────────────────────────────────────
export const badges = mysqlTable("badges", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  description: varchar("description", { length: 320 }).notNull(),
  icon: varchar("icon", { length: 64 }).default("award").notNull(),
  tier: mysqlEnum("tier", ["bronze", "silver", "gold", "special"]).default("bronze").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Badge = typeof badges.$inferSelect;

// ─── Gamification: User Badges (earned) ─────────────────────────────────────
export const userBadges = mysqlTable("user_badges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  badgeId: int("badgeId").notNull(),
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
});

export type UserBadge = typeof userBadges.$inferSelect;

// ─── Gamification: Weekly Challenges ────────────────────────────────────────
export const challenges = mysqlTable("challenges", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  rewardXp: int("rewardXp").default(50).notNull(),
  category: mysqlEnum("category", ["photo", "post", "care", "knowledge", "community"]).default("community").notNull(),
  startsAt: timestamp("startsAt").defaultNow().notNull(),
  endsAt: timestamp("endsAt").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Challenge = typeof challenges.$inferSelect;

/**
 * Community-sourced corrections to AI output. These are treated as authoritative
 * facts and fed back into the AI context so the platform relies on real expertise
 * rather than generic content.
 */
export const aiCorrections = mysqlTable("ai_corrections", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // "chat" | "identify" — which AI feature was corrected
  kind: varchar("kind", { length: 32 }).notNull(),
  // The user prompt or subject the correction relates to (e.g. plant name, question)
  topic: varchar("topic", { length: 255 }),
  // What the AI originally said (optional snapshot)
  originalAnswer: text("originalAnswer"),
  // The corrected, factual statement from the community
  correctedText: text("correctedText").notNull(),
  // moderation: pending | approved | rejected
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("approved").notNull(),
  upvotes: int("upvotes").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AiCorrection = typeof aiCorrections.$inferSelect;
export type InsertAiCorrection = typeof aiCorrections.$inferInsert;

// ─── Follows (Nutzer folgt Nutzer) ──────────────────────────────────────────
export const follows = mysqlTable("follows", {
  id: int("id").autoincrement().primaryKey(),
  followerId: int("followerId").notNull(),
  followingId: int("followingId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Follow = typeof follows.$inferSelect;

// ─── Comment Likes ──────────────────────────────────────────────────────────
export const commentLikes = mysqlTable("comment_likes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  commentId: int("commentId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CommentLike = typeof commentLikes.$inferSelect;

// ─── Fachgruppen ────────────────────────────────────────────────────────────
export const groups = mysqlTable("groups", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 96 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  coverImageUrl: text("coverImageUrl"),
  // Fachbereich der Gruppe.
  topic: mysqlEnum("topic", ["plants", "aquaristics", "terraristics", "general"]).default("general").notNull(),
  visibility: mysqlEnum("visibility", ["public", "private"]).default("public").notNull(),
  createdBy: int("createdBy").notNull(),
  membersCount: int("membersCount").default(0).notNull(),
  postsCount: int("postsCount").default(0).notNull(),
  // Offizielle, von der Redaktion gepflegte Kern-Fachgruppen.
  isOfficial: boolean("isOfficial").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Group = typeof groups.$inferSelect;
export type InsertGroup = typeof groups.$inferInsert;

// ─── Gruppen-Mitgliedschaften ───────────────────────────────────────────────
export const groupMembers = mysqlTable("group_members", {
  id: int("id").autoincrement().primaryKey(),
  groupId: int("groupId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["member", "moderator", "owner"]).default("member").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export type GroupMember = typeof groupMembers.$inferSelect;

// ─── Private Konversationen (1:1 und Gruppenchat) ───────────────────────────
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  // direct = 1:1, group = Gruppenchat mit Titel.
  kind: mysqlEnum("kind", ["direct", "group"]).default("direct").notNull(),
  title: varchar("title", { length: 128 }),
  createdBy: int("createdBy").notNull(),
  lastMessageAt: timestamp("lastMessageAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;

// ─── Konversations-Teilnehmer ───────────────────────────────────────────────
export const conversationParticipants = mysqlTable("conversation_participants", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  userId: int("userId").notNull(),
  // Zeitpunkt des letzten Lesens für Ungelesen-Zähler.
  lastReadAt: timestamp("lastReadAt"),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export type ConversationParticipant = typeof conversationParticipants.$inferSelect;

// ─── Nachrichten ────────────────────────────────────────────────────────────
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  senderId: int("senderId").notNull(),
  content: text("content").notNull(),
  imageUrl: text("imageUrl"),
  storageKey: text("storageKey"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;

// ─── Meldungen (Moderation) ─────────────────────────────────────────────────
export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  reporterId: int("reporterId").notNull(),
  // Art des gemeldeten Inhalts.
  targetType: mysqlEnum("targetType", ["post", "comment", "user", "message", "group"]).notNull(),
  targetId: int("targetId").notNull(),
  reason: mysqlEnum("reason", ["spam", "harassment", "misinformation", "inappropriate", "illegal", "other"]).notNull(),
  details: text("details"),
  status: mysqlEnum("status", ["open", "reviewing", "resolved", "dismissed"]).default("open").notNull(),
  handledBy: int("handledBy"),
  resolutionNote: text("resolutionNote"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Report = typeof reports.$inferSelect;

// ─── Moderations-/Audit-Log ─────────────────────────────────────────────────
export const moderationLogs = mysqlTable("moderation_logs", {
  id: int("id").autoincrement().primaryKey(),
  actorId: int("actorId").notNull(),
  action: varchar("action", { length: 64 }).notNull(),
  targetType: varchar("targetType", { length: 32 }).notNull(),
  targetId: int("targetId").notNull(),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ModerationLog = typeof moderationLogs.$inferSelect;

// ─── Featured / Promo Accounts (Werbeträger) ────────────────────────────────
// Admin-verwaltete Werbe-Einträge, die auf EXTERNE Profile verlinken
// (Instagram, TikTok, Facebook, WhatsApp, YouTube). Für Familie/Freunde
// kostenlos vom Admin gepflegt; bezahlte Fremd-Werbung folgt in V2.
export const featuredAccounts = mysqlTable("featured_accounts", {
  id: int("id").autoincrement().primaryKey(),
  // Anzeigename, z. B. "Pflanzentante" oder "Kim Kumpel"
  name: varchar("name", { length: 120 }).notNull(),
  // Kurzer Untertitel/Beschreibung (optional), z. B. "Seltene Zimmerpflanzen"
  tagline: varchar("tagline", { length: 160 }),
  // Plattform des verlinkten Profils
  platform: mysqlEnum("platform", ["instagram", "tiktok", "facebook", "whatsapp", "youtube", "website"]).notNull(),
  // Ziel-Link (externe URL, z. B. https://instagram.com/...)
  url: text("url").notNull(),
  // Hochgeladenes Profilbild (S3-URL) – wird manuell gesetzt, da Plattformen
  // das automatische Auslesen von Profilbildern blockieren.
  imageUrl: text("imageUrl"),
  imageKey: text("imageKey"),
  // Platzierung: auf der Startseite ("Account des Tages") und/oder in der
  // Community-Promo-Leiste anzeigen.
  showOnHome: boolean("showOnHome").default(false).notNull(),
  showInCommunity: boolean("showInCommunity").default(true).notNull(),
  // Aktiv/sichtbar schalten ohne Löschen.
  active: boolean("active").default(true).notNull(),
  // Sortierreihenfolge (kleiner = weiter vorne/oben).
  sortOrder: int("sortOrder").default(0).notNull(),
  // Ist dies ein bezahlter Werbeplatz? (V2-Vorbereitung; Standard: nein)
  isPaid: boolean("isPaid").default(false).notNull(),
  // Wer hat den Eintrag erstellt (Admin-User-Id).
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FeaturedAccount = typeof featuredAccounts.$inferSelect;
export type InsertFeaturedAccount = typeof featuredAccounts.$inferInsert;
