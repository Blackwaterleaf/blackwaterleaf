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
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  avatarUrl: text("avatarUrl"),
  bio: text("bio"),
  location: varchar("location", { length: 128 }),
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
  category: mysqlEnum("category", ["plant", "aquarium", "question", "tip", "showcase", "marketplace", "other"]).default("other").notNull(),
  plantId: int("plantId"),
  aquariumId: int("aquariumId"),
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
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Comment = typeof comments.$inferSelect;

// ─── Notifications ────────────────────────────────────────────────────────────
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["like", "comment", "follow", "care_reminder", "system"]).notNull(),
  title: varchar("title", { length: 128 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  relatedPostId: int("relatedPostId"),
  relatedUserId: int("relatedUserId"),
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
  contextType: mysqlEnum("contextType", ["general", "plant", "aquarium"]),
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
