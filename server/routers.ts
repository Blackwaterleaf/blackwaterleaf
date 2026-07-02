import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "./db";
import {
  users, plants, plantPhotos, aquariums, aquariumPhotos, aquariumEvents,
  posts, likes, comments, notifications, aiChats,
  knowledgeArticles, userStats, badges, userBadges, challenges, aiCorrections
} from "../drizzle/schema";
import { ensureUserStats, awardXp, grantBadge, levelForXp, LEVELS } from "./db";
import { eq, desc, and, like, or, sql, ne } from "drizzle-orm";
import { storagePut } from "./storage";
import { invokeLLM } from "./_core/llm";
import { nanoid } from "nanoid";
import { socialRouter, threadsRouter } from "./routers/community";
import { groupsRouter, messagingRouter } from "./routers/groups-messaging";
import { moderationRouter, adminRouter, searchRouter } from "./routers/moderation-admin";
import { featuredRouter } from "./routers/featured";

// ─── Auth Router ──────────────────────────────────────────────────────────────
const authRouter = router({
  me: publicProcedure.query(opts => opts.ctx.user),
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),
});

// ─── Users Router ─────────────────────────────────────────────────────────────
const usersRouter = router({
  getProfile: publicProcedure
    .input(z.object({ userId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB not available");
      const targetId = input.userId ?? ctx.user?.id;
      if (!targetId) return null;
      const result = await db.select().from(users).where(eq(users.id, targetId)).limit(1);
      return result[0] ?? null;
    }),

  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(64).optional(),
      bio: z.string().max(500).optional(),
      location: z.string().max(128).optional(),
      avatarUrl: z.string().url().optional().nullable(),
      // Oeffentliche Social-Media-Links (leerer String = entfernen).
      socialInstagram: z.string().max(255).optional().nullable(),
      socialTiktok: z.string().max(255).optional().nullable(),
      socialYoutube: z.string().max(255).optional().nullable(),
      socialFacebook: z.string().max(255).optional().nullable(),
      socialWebsite: z.string().max(255).optional().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB not available");
      await db.update(users).set({ ...input, updatedAt: new Date() }).where(eq(users.id, ctx.user.id));
      return { success: true };
    }),

  uploadAvatar: protectedProcedure
    .input(z.object({ base64: z.string(), mimeType: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const buffer = Buffer.from(input.base64, "base64");
      const ext = input.mimeType.split("/")[1] ?? "jpg";
      const key = `avatars/${ctx.user.id}-${Date.now()}.${ext}`;
      const { url } = await storagePut(key, buffer, input.mimeType);
      const db = await getDb();
      if (db) await db.update(users).set({ avatarUrl: url }).where(eq(users.id, ctx.user.id));
      return { url };
    }),
});

// ─── Plants Router ────────────────────────────────────────────────────────────
const plantsRouter = router({
  list: protectedProcedure
    .input(z.object({ userId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const uid = input.userId ?? ctx.user.id;
      return db.select().from(plants)
        .where(and(eq(plants.userId, uid), eq(plants.isPublic, true)))
        .orderBy(desc(plants.createdAt));
    }),

  myList: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(plants).where(eq(plants.userId, ctx.user.id)).orderBy(desc(plants.createdAt));
  }),

  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      // SECURITY FIX: Only return public plants
      const result = await db.select().from(plants)
        .where(and(eq(plants.id, input.id), eq(plants.isPublic, true))).limit(1);
      return result[0] ?? null;
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(128),
      scientificName: z.string().max(128).optional(),
      category: z.enum(["aquatic", "tropical", "alocasia", "monstera", "philodendron", "other"]).default("other"),
      description: z.string().max(2000).optional(),
      coverImageUrl: z.string().optional().nullable(),
      coverImageBase64: z.string().optional(),
      coverImageMimeType: z.string().optional(),
      lightRequirement: z.enum(["low", "medium", "high"]).optional(),
      wateringFrequency: z.string().max(64).optional(),
      humidity: z.enum(["low", "medium", "high"]).optional(),
      temperature: z.string().max(64).optional(),
      substrate: z.string().max(128).optional(),
      fertilizing: z.string().max(128).optional(),
      difficulty: z.enum(["beginner", "intermediate", "expert"]).optional(),
      isPublic: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB not available");
      const { coverImageBase64, coverImageMimeType, ...rest } = input;
      let coverImageUrl = rest.coverImageUrl;
      // Upload base64 image to S3 if provided
      if (coverImageBase64 && coverImageMimeType) {
        try {
          const buffer = Buffer.from(coverImageBase64, "base64");
          const ext = coverImageMimeType.split("/")[1] ?? "jpg";
          const key = `plants/${ctx.user.id}/${Date.now()}.${ext}`;
          const stored = await storagePut(key, buffer, coverImageMimeType);
          coverImageUrl = stored.url;
        } catch (e) { /* ignore upload errors, plant still created */ }
      }
      const result = await db.insert(plants).values({ ...rest, coverImageUrl, userId: ctx.user.id });
      try { await awardXp(ctx.user.id, 15); await grantBadge(ctx.user.id, "plant_expert"); } catch {}
      return { id: Number(result[0].insertId) };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).max(128).optional(),
      scientificName: z.string().max(128).optional(),
      category: z.enum(["aquatic", "tropical", "alocasia", "monstera", "philodendron", "other"]).optional(),
      description: z.string().max(2000).optional(),
      coverImageUrl: z.string().optional().nullable(),
      lightRequirement: z.enum(["low", "medium", "high"]).optional(),
      wateringFrequency: z.string().max(64).optional(),
      humidity: z.enum(["low", "medium", "high"]).optional(),
      temperature: z.string().max(64).optional(),
      substrate: z.string().max(128).optional(),
      fertilizing: z.string().max(128).optional(),
      difficulty: z.enum(["beginner", "intermediate", "expert"]).optional(),
      isPublic: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB not available");
      const { id, ...data } = input;
      await db.update(plants).set({ ...data, updatedAt: new Date() })
        .where(and(eq(plants.id, id), eq(plants.userId, ctx.user.id)));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB not available");
      await db.delete(plants).where(and(eq(plants.id, input.id), eq(plants.userId, ctx.user.id)));
      return { success: true };
    }),

  addPhoto: protectedProcedure
    .input(z.object({
      plantId: z.number(),
      base64: z.string(),
      mimeType: z.string(),
      caption: z.string().max(500).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB not available");
      // ✅ SECURITY FIX: Verify ownership of plant
      const plant = await db.select().from(plants)
        .where(eq(plants.id, input.plantId)).limit(1);
      if (!plant[0] || plant[0].userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You don't have permission to add photos to this plant" });
      }
      const buffer = Buffer.from(input.base64, "base64");
      const ext = input.mimeType.split("/")[1] ?? "jpg";
      const key = `plants/${input.plantId}/${Date.now()}.${ext}`;
      const { url } = await storagePut(key, buffer, input.mimeType);
      await db.insert(plantPhotos).values({
        plantId: input.plantId, userId: ctx.user.id,
        imageUrl: url, storageKey: key, caption: input.caption,
      });
      // Update cover if first photo
      if (!plant[0].coverImageUrl) {
        await db.update(plants).set({ coverImageUrl: url }).where(eq(plants.id, input.plantId));
      }
      return { url };
    }),

  getPhotos: publicProcedure
    .input(z.object({ plantId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      // SECURITY FIX: Check if plant is public before returning photos
      const plant = await db.select().from(plants)
        .where(eq(plants.id, input.plantId)).limit(1);
      if (!plant[0] || !plant[0].isPublic) return [];
      return db.select().from(plantPhotos).where(eq(plantPhotos.plantId, input.plantId)).orderBy(desc(plantPhotos.takenAt));
    }),
});

// ─── Aquariums Router ─────────────────────────────────────────────────────────
const aquariumsRouter = router({
  list: protectedProcedure
    .input(z.object({ userId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const uid = input.userId ?? ctx.user.id;
      return db.select().from(aquariums)
        .where(and(eq(aquariums.userId, uid), eq(aquariums.isPublic, true)))
        .orderBy(desc(aquariums.createdAt));
    }),

  myList: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(aquariums).where(eq(aquariums.userId, ctx.user.id)).orderBy(desc(aquariums.createdAt));
  }),

  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      // SECURITY FIX: Only return public aquariums
      const result = await db.select().from(aquariums)
        .where(and(eq(aquariums.id, input.id), eq(aquariums.isPublic, true))).limit(1);
      return result[0] ?? null;
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(128),
      description: z.string().max(2000).optional(),
      type: z.enum(["freshwater", "saltwater", "blackwater", "planted", "biotope", "other"]).default("freshwater"),
      volumeLiters: z.number().positive().optional(),
      lengthCm: z.number().positive().optional(),
      widthCm: z.number().positive().optional(),
      heightCm: z.number().positive().optional(),
      phValue: z.number().optional(),
      ghValue: z.number().optional(),
      khValue: z.number().optional(),
      temperatureCelsius: z.number().optional(),
      conductivity: z.number().optional(),
      nitrate: z.number().optional(),
      nitrite: z.number().optional(),
      ammonia: z.number().optional(),
      filterType: z.string().max(128).optional(),
      lightingType: z.string().max(128).optional(),
      substrate: z.string().max(128).optional(),
      inhabitants: z.string().max(1000).optional(),
      plants: z.string().max(1000).optional(),
      isPublic: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB not available");
      const result = await db.insert(aquariums).values({ ...input, userId: ctx.user.id });
      try { await awardXp(ctx.user.id, 15); await grantBadge(ctx.user.id, "aquatic_pro"); } catch {}
      return { id: Number(result[0].insertId) };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).max(128).optional(),
      description: z.string().max(2000).optional(),
      type: z.enum(["freshwater", "saltwater", "blackwater", "planted", "biotope", "other"]).optional(),
      volumeLiters: z.number().positive().optional(),
      phValue: z.number().optional(),
      ghValue: z.number().optional(),
      khValue: z.number().optional(),
      temperatureCelsius: z.number().optional(),
      conductivity: z.number().optional(),
      nitrate: z.number().optional(),
      nitrite: z.number().optional(),
      ammonia: z.number().optional(),
      filterType: z.string().max(128).optional(),
      lightingType: z.string().max(128).optional(),
      substrate: z.string().max(128).optional(),
      inhabitants: z.string().max(1000).optional(),
      plants: z.string().max(1000).optional(),
      isPublic: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB not available");
      const { id, ...data } = input;
      await db.update(aquariums).set({ ...data, updatedAt: new Date() })
        .where(and(eq(aquariums.id, id), eq(aquariums.userId, ctx.user.id)));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB not available");
      await db.delete(aquariums).where(and(eq(aquariums.id, input.id), eq(aquariums.userId, ctx.user.id)));
      return { success: true };
    }),

  addPhoto: protectedProcedure
    .input(z.object({
      aquariumId: z.number(),
      base64: z.string(),
      mimeType: z.string(),
      caption: z.string().max(500).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB not available");
      // ✅ SECURITY FIX: Verify ownership of aquarium
      const aquarium = await db.select().from(aquariums)
        .where(eq(aquariums.id, input.aquariumId)).limit(1);
      if (!aquarium[0] || aquarium[0].userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You don't have permission to add photos to this aquarium" });
      }
      const buffer = Buffer.from(input.base64, "base64");
      const ext = input.mimeType.split("/")[1] ?? "jpg";
      const key = `aquariums/${input.aquariumId}/${Date.now()}.${ext}`;
      const { url } = await storagePut(key, buffer, input.mimeType);
      await db.insert(aquariumPhotos).values({
        aquariumId: input.aquariumId, userId: ctx.user.id,
        imageUrl: url, storageKey: key, caption: input.caption,
      });
      if (!aquarium[0].coverImageUrl) {
        await db.update(aquariums).set({ coverImageUrl: url }).where(eq(aquariums.id, input.aquariumId));
      }
      return { url };
    }),

  getPhotos: publicProcedure
    .input(z.object({ aquariumId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      // SECURITY FIX: Check if aquarium is public before returning photos
      const aquarium = await db.select().from(aquariums)
        .where(eq(aquariums.id, input.aquariumId)).limit(1);
      if (!aquarium[0] || !aquarium[0].isPublic) return [];
      return db.select().from(aquariumPhotos).where(eq(aquariumPhotos.aquariumId, input.aquariumId)).orderBy(desc(aquariumPhotos.takenAt));
    }),

  addEvent: protectedProcedure
    .input(z.object({
      aquariumId: z.number(),
      type: z.enum(["water_change", "feeding", "fertilizing", "maintenance", "measurement", "new_inhabitant", "health_issue", "other"]),
      title: z.string().min(1).max(128),
      description: z.string().max(1000).optional(),
      data: z.record(z.string(), z.unknown()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB not available");
      // SECURITY FIX: Verify ownership of aquarium
      const aquarium = await db.select().from(aquariums)
        .where(eq(aquariums.id, input.aquariumId)).limit(1);
      if (!aquarium[0] || aquarium[0].userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You don't have permission to add events to this aquarium" });
      }
      await db.insert(aquariumEvents).values({ ...input, userId: ctx.user.id });
      return { success: true };
    }),

  getEvents: publicProcedure
    .input(z.object({ aquariumId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      // SECURITY FIX: Check if aquarium is public before returning events
      const aquarium = await db.select().from(aquariums)
        .where(eq(aquariums.id, input.aquariumId)).limit(1);
      if (!aquarium[0] || !aquarium[0].isPublic) return [];
      return db.select().from(aquariumEvents)
        .where(eq(aquariumEvents.aquariumId, input.aquariumId))
        .orderBy(desc(aquariumEvents.occurredAt))
        .limit(50);
    }),
});

// ─── Posts Router ─────────────────────────────────────────────────────────────
const postsRouter = router({
  list: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(20),
      offset: z.number().min(0).default(0),
      category: z.enum(["plant", "aquarium", "question", "tip", "showcase", "marketplace", "other"]).optional(),
      userId: z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { posts: [], total: 0 };
      const conditions = [];
      if (input.category) conditions.push(eq(posts.category, input.category));
      if (input.userId) conditions.push(eq(posts.userId, input.userId));
      const whereClause = conditions.length === 1 ? conditions[0] : conditions.length > 1 ? and(...(conditions as [typeof conditions[0], typeof conditions[0], ...typeof conditions])) : undefined;
      const postList = await db.select({
        id: posts.id, userId: posts.userId, content: posts.content,
        imageUrl: posts.imageUrl, videoUrl: posts.videoUrl, mediaType: posts.mediaType,
        category: posts.category,
        plantId: posts.plantId, aquariumId: posts.aquariumId,
        likesCount: posts.likesCount, commentsCount: posts.commentsCount,
        createdAt: posts.createdAt,
        userName: users.name, userAvatarUrl: users.avatarUrl,
      })
        .from(posts)
        .leftJoin(users, eq(posts.userId, users.id))
        .where(whereClause)
        .orderBy(desc(posts.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      // Check if current user liked each post
      let likedPostIds = new Set<number>();
      if (ctx.user) {
        const userLikes = await db.select({ postId: likes.postId })
          .from(likes).where(eq(likes.userId, ctx.user.id));
        likedPostIds = new Set(userLikes.map(l => l.postId));
      }

      return {
        posts: postList.map(p => ({ ...p, isLiked: likedPostIds.has(p.id) })),
        total: postList.length,
      };
    }),

  create: protectedProcedure
    .input(z.object({
      content: z.string().min(1).max(2000),
      category: z.enum(["plant", "aquarium", "question", "tip", "showcase", "marketplace", "other"]).default("other"),
      imageBase64: z.string().optional(),
      imageMimeType: z.string().optional(),
      // Video upload (e.g. for Showcase): base64-encoded file + mime type
      videoBase64: z.string().optional(),
      videoMimeType: z.string().optional(),
      plantId: z.number().optional(),
      aquariumId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB not available");
      let imageUrl: string | undefined;
      let storageKey: string | undefined;
      let videoUrl: string | undefined;
      let videoStorageKey: string | undefined;
      let mediaType: "none" | "image" | "video" = "none";

      // Video takes precedence as the primary media for a post
      if (input.videoBase64 && input.videoMimeType) {
        const allowedVideo = ["video/mp4", "video/webm", "video/quicktime", "video/ogg"];
        if (!allowedVideo.includes(input.videoMimeType)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Nicht unterstütztes Videoformat. Erlaubt: MP4, WebM, MOV, OGG." });
        }
        const buffer = Buffer.from(input.videoBase64, "base64");
        // Limit video to ~25MB to protect storage and the request pipeline
        if (buffer.length > 25 * 1024 * 1024) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Video ist zu groß (max. 25 MB)." });
        }
        const ext = input.videoMimeType === "video/quicktime" ? "mov" : (input.videoMimeType.split("/")[1] ?? "mp4");
        const key = `posts/${ctx.user.id}/${Date.now()}.${ext}`;
        const stored = await storagePut(key, buffer, input.videoMimeType);
        videoUrl = stored.url;
        videoStorageKey = key;
        mediaType = "video";
      }

      if (input.imageBase64 && input.imageMimeType) {
        const buffer = Buffer.from(input.imageBase64, "base64");
        const ext = input.imageMimeType.split("/")[1] ?? "jpg";
        const key = `posts/${ctx.user.id}/${Date.now()}.${ext}`;
        const stored = await storagePut(key, buffer, input.imageMimeType);
        imageUrl = stored.url;
        storageKey = key;
        if (mediaType === "none") mediaType = "image";
      }
      const result = await db.insert(posts).values({
        userId: ctx.user.id, content: input.content,
        category: input.category, imageUrl, storageKey,
        videoUrl, videoStorageKey, mediaType,
        plantId: input.plantId, aquariumId: input.aquariumId,
      });
      try {
        await awardXp(ctx.user.id, 10);
        await grantBadge(ctx.user.id, "first_post");
        if (imageUrl) await grantBadge(ctx.user.id, "top_photographer");
      } catch {}
      return { id: Number(result[0].insertId) };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB not available");
      await db.delete(posts).where(and(eq(posts.id, input.id), eq(posts.userId, ctx.user.id)));
      return { success: true };
    }),

  like: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB not available");
      const existing = await db.select().from(likes)
        .where(and(eq(likes.userId, ctx.user.id), eq(likes.postId, input.postId))).limit(1);
      if (existing.length > 0) return { liked: true };
      await db.insert(likes).values({ userId: ctx.user.id, postId: input.postId });
      await db.update(posts).set({ likesCount: sql`${posts.likesCount} + 1` }).where(eq(posts.id, input.postId));
      // Notify post author
      const post = await db.select().from(posts).where(eq(posts.id, input.postId)).limit(1);
      if (post[0] && post[0].userId !== ctx.user.id) {
        await db.insert(notifications).values({
          userId: post[0].userId, type: "like",
          title: "Neues Like",
          message: `${ctx.user.name ?? "Jemand"} hat deinen Beitrag geliked.`,
          relatedPostId: input.postId, relatedUserId: ctx.user.id,
        });
      }
      return { liked: true };
    }),

  unlike: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB not available");
      await db.delete(likes).where(and(eq(likes.userId, ctx.user.id), eq(likes.postId, input.postId)));
      await db.update(posts).set({ likesCount: sql`GREATEST(${posts.likesCount} - 1, 0)` }).where(eq(posts.id, input.postId));
      return { liked: false };
    }),

  getComments: publicProcedure
    .input(z.object({ postId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select({
        id: comments.id, userId: comments.userId, postId: comments.postId,
        content: comments.content, createdAt: comments.createdAt,
        userName: users.name, userAvatarUrl: users.avatarUrl,
      })
        .from(comments)
        .leftJoin(users, eq(comments.userId, users.id))
        .where(eq(comments.postId, input.postId))
        .orderBy(comments.createdAt);
    }),

  addComment: protectedProcedure
    .input(z.object({ postId: z.number(), content: z.string().min(1).max(1000) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB not available");
      await db.insert(comments).values({ userId: ctx.user.id, postId: input.postId, content: input.content });
      await db.update(posts).set({ commentsCount: sql`${posts.commentsCount} + 1` }).where(eq(posts.id, input.postId));
      // Notify post author
      const post = await db.select().from(posts).where(eq(posts.id, input.postId)).limit(1);
      if (post[0] && post[0].userId !== ctx.user.id) {
        await db.insert(notifications).values({
          userId: post[0].userId, type: "comment",
          title: "Neuer Kommentar",
          message: `${ctx.user.name ?? "Jemand"} hat deinen Beitrag kommentiert: "${input.content.substring(0, 60)}..."`,
          relatedPostId: input.postId, relatedUserId: ctx.user.id,
        });
      }
      return { success: true };
    }),
});

// ─── Notifications Router ─────────────────────────────────────────────────────
const notificationsRouter = router({
  list: protectedProcedure
    .input(z.object({ limit: z.number().default(30) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(notifications)
        .where(eq(notifications.userId, ctx.user.id))
        .orderBy(desc(notifications.createdAt))
        .limit(input.limit);
    }),

  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { count: 0 };
    const result = await db.select({ count: sql<number>`COUNT(*)` })
      .from(notifications)
      .where(and(eq(notifications.userId, ctx.user.id), eq(notifications.isRead, false)));
    return { count: Number(result[0]?.count ?? 0) };
  }),

  markRead: protectedProcedure
    .input(z.object({ id: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB not available");
      if (input.id) {
        await db.update(notifications).set({ isRead: true })
          .where(and(eq(notifications.id, input.id), eq(notifications.userId, ctx.user.id)));
      } else {
        await db.update(notifications).set({ isRead: true })
          .where(eq(notifications.userId, ctx.user.id));
      }
      return { success: true };
    }),
});

// ─── Discover Router ──────────────────────────────────────────────────────────
const discoverRouter = router({
  search: publicProcedure
    .input(z.object({
      query: z.string().max(100).optional(),
      type: z.enum(["all", "plants", "aquariums", "posts"]).default("all"),
      limit: z.number().min(1).max(50).default(20),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { plants: [], aquariums: [], posts: [] };
      const q = input.query ? `%${input.query}%` : "%";

      const [plantResults, aquariumResults, postResults] = await Promise.all([
        (input.type === "all" || input.type === "plants")
          ? db.select({
            id: plants.id, name: plants.name, scientificName: plants.scientificName,
            category: plants.category, coverImageUrl: plants.coverImageUrl,
            difficulty: plants.difficulty, userId: plants.userId,
            userName: users.name,
          }).from(plants)
            .leftJoin(users, eq(plants.userId, users.id))
            .where(and(eq(plants.isPublic, true), or(like(plants.name, q), like(plants.scientificName, q))))
            .orderBy(desc(plants.createdAt)).limit(input.limit)
          : Promise.resolve([]),

        (input.type === "all" || input.type === "aquariums")
          ? db.select({
            id: aquariums.id, name: aquariums.name, type: aquariums.type,
            coverImageUrl: aquariums.coverImageUrl, volumeLiters: aquariums.volumeLiters,
            userId: aquariums.userId, userName: users.name,
          }).from(aquariums)
            .leftJoin(users, eq(aquariums.userId, users.id))
            .where(and(eq(aquariums.isPublic, true), like(aquariums.name, q)))
            .orderBy(desc(aquariums.createdAt)).limit(input.limit)
          : Promise.resolve([]),

        (input.type === "all" || input.type === "posts")
          ? db.select({
            id: posts.id, content: posts.content, imageUrl: posts.imageUrl,
            category: posts.category, likesCount: posts.likesCount,
            commentsCount: posts.commentsCount, createdAt: posts.createdAt,
            userId: posts.userId, userName: users.name, userAvatarUrl: users.avatarUrl,
          }).from(posts)
            .leftJoin(users, eq(posts.userId, users.id))
            .where(like(posts.content, q))
            .orderBy(desc(posts.likesCount)).limit(input.limit)
          : Promise.resolve([]),
      ]);

      return { plants: plantResults, aquariums: aquariumResults, posts: postResults };
    }),

  hub: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return {
      trendingPosts: [], newPlants: [], newAquariums: [],
      featuredArticles: [], topMembers: [], challenge: null,
    };

    const [trendingPosts, newPlants, newAquariums, featuredArticles, topMembers, challengeRows] = await Promise.all([
      db.select({
        id: posts.id, content: posts.content, imageUrl: posts.imageUrl,
        category: posts.category, likesCount: posts.likesCount,
        commentsCount: posts.commentsCount, createdAt: posts.createdAt,
        userName: users.name, userAvatarUrl: users.avatarUrl,
      }).from(posts)
        .leftJoin(users, eq(posts.userId, users.id))
        .orderBy(desc(posts.likesCount), desc(posts.createdAt)).limit(6),

      db.select({
        id: plants.id, name: plants.name, scientificName: plants.scientificName,
        category: plants.category, coverImageUrl: plants.coverImageUrl,
        userName: users.name,
      }).from(plants)
        .leftJoin(users, eq(plants.userId, users.id))
        .where(eq(plants.isPublic, true))
        .orderBy(desc(plants.createdAt)).limit(8),

      db.select({
        id: aquariums.id, name: aquariums.name, type: aquariums.type,
        coverImageUrl: aquariums.coverImageUrl, volumeLiters: aquariums.volumeLiters,
        userName: users.name,
      }).from(aquariums)
        .leftJoin(users, eq(aquariums.userId, users.id))
        .where(eq(aquariums.isPublic, true))
        .orderBy(desc(aquariums.createdAt)).limit(8),

      db.select().from(knowledgeArticles)
        .orderBy(desc(knowledgeArticles.isFeatured), desc(knowledgeArticles.viewsCount)).limit(4),

      db.select({
        userId: userStats.userId, xp: userStats.xp, level: userStats.level,
        userName: users.name, userAvatarUrl: users.avatarUrl,
      }).from(userStats)
        .innerJoin(users, eq(userStats.userId, users.id))
        .orderBy(desc(userStats.xp)).limit(5),

      db.select().from(challenges).where(eq(challenges.isActive, true))
        .orderBy(desc(challenges.startsAt)).limit(1),
    ]);

    return {
      trendingPosts, newPlants, newAquariums, featuredArticles, topMembers,
      challenge: challengeRows[0] ?? null,
    };
  }),
});

// ─── AI Router ────────────────────────────────────────────────────────────────
// Build a system-prompt block of community-verified facts. These corrections from
// members override generic AI knowledge so the platform stays fact-based.
async function getCommunityFactsBlock(query: string): Promise<string> {
  const db = await getDb();
  if (!db) return "";
  const rows = await db.select({ topic: aiCorrections.topic, correctedText: aiCorrections.correctedText })
    .from(aiCorrections)
    .where(eq(aiCorrections.status, "approved"))
    .orderBy(desc(aiCorrections.upvotes), desc(aiCorrections.createdAt))
    .limit(40);
  if (!rows.length) return "";
  // Lightweight relevance filter: prefer corrections whose topic appears in the query.
  const q = (query || "").toLowerCase();
  const ranked = rows.sort((a, b) => {
    const aHit = a.topic && q.includes(a.topic.toLowerCase()) ? 1 : 0;
    const bHit = b.topic && q.includes(b.topic.toLowerCase()) ? 1 : 0;
    return bHit - aHit;
  }).slice(0, 12);
  const lines = ranked.map(r => `- ${r.topic ? r.topic + ": " : ""}${r.correctedText}`).join("\n");
  return `\n\nVERIFIZIERTE COMMUNITY-FAKTEN (von erfahrenen BlackwaterLeaf-Mitgliedern korrigiert; diese haben VORRANG vor allgemeinem Wissen, wenn sie zum Thema passen):\n${lines}`;
}

const aiRouter = router({
  chat: protectedProcedure
    .input(z.object({
      message: z.string().min(1).max(2000),
      sessionId: z.string().optional(),
      contextType: z.enum(["general", "plant", "aquarium", "channa"]).default("general"),
      contextId: z.number().optional(),
      history: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })).default([]),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const sessionId = input.sessionId ?? nanoid();

      // Build context info
      let contextInfo = "";
      let channaKnowledge = "";
      if (input.contextType === "channa" && db) {
        // Eigene Channa-KI: nutzt die Channa-Wissensartikel der Plattform als Wissensbasis
        const articles = await db.select({ title: knowledgeArticles.title, excerpt: knowledgeArticles.excerpt, content: knowledgeArticles.content })
          .from(knowledgeArticles)
          .where(eq(knowledgeArticles.category, "channa"))
          .limit(20);
        if (articles.length) {
          const blocks = articles.map(a => {
            const body = (a.content || a.excerpt || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 1200);
            return `### ${a.title}\n${body}`;
          }).join("\n\n");
          channaKnowledge = `\n\nINTERNE CHANNA-WISSENSBASIS (BlackwaterLeaf-Artprofile – nutze diese Fakten bevorzugt; wenn eine Channa-Art hier beschrieben ist, stelle ihre Daten genau so dar):\n${blocks}`;
        }
      }
      if (input.contextType === "plant" && input.contextId && db) {
        const plant = await db.select().from(plants).where(eq(plants.id, input.contextId)).limit(1);
        if (plant[0]) {
          contextInfo = `\n\nKontext – Pflanze: ${plant[0].name} (${plant[0].scientificName ?? "unbekannt"}), Kategorie: ${plant[0].category}, Schwierigkeit: ${plant[0].difficulty ?? "unbekannt"}.`;
        }
      } else if (input.contextType === "aquarium" && input.contextId && db) {
        const aq = await db.select().from(aquariums).where(eq(aquariums.id, input.contextId)).limit(1);
        if (aq[0]) {
          contextInfo = `\n\nKontext – Aquarium: ${aq[0].name}, Typ: ${aq[0].type}, Volumen: ${aq[0].volumeLiters ?? "?"}L, pH: ${aq[0].phValue ?? "?"}, Temp: ${aq[0].temperatureCelsius ?? "?"}°C.`;
        }
      }

      const channaPersona = `Du bist der CHANNA-EXPERTE von BlackwaterLeaf – ein hochspezialisierter KI-Assistent ausschließlich für Schlangenkopffische (Gattung Channa). Du kennst dich aus mit:
- Allen relevanten Channa-Arten (z.B. andrao, bleheri, gachua, pulchra, asiatica, micropeltes, aurantimaculata, barca, stewartii)
- Artgerechter Haltung: Beckengröße, Abdeckung (Springer!), Wasserwerte, Schwarzwasser-Setup, Temperatur, Winterruhe
- Verhalten, Sozialisierung, Paarhaltung vs. Einzelhaltung, Aggression
- Ernährung (Frostfutter, Lebendfutter, kein Säugetierfleisch), Zucht und Aufzucht
- Krankheiten, Quarantäne und Problemdiagnose

WICHTIG: Bleibe beim Thema Channa. Wenn jemand etwas völlig Themenfremdes fragt, weise freundlich zurück zum Channa-Thema. Sei präzise und faktenbasiert – erfinde KEINE Artdaten. Wenn du dir bei einer konkreten Art unsicher bist, sag das ehrlich.`;

      const generalPersona = `Du bist der KI-Assistent von BlackwaterLeaf – einer Community-Plattform für Aquaristik- und Pflanzenliebhaber. Du bist ein erfahrener Experte für:
- Aquaristik (Süßwasser, Salzwasser, Schwarzwasser, Aquascaping)
- Channa-Haltung und Schwarzwasser-Biotope
- Tropische Zimmerpflanzen (Alocasia, Monstera, Philodendron)
- Wasserpflanzen und Aquascaping
- Pflanzenbestimmung und Problemdiagnose
- Pflegepläne und Optimierungsempfehlungen`;

      const systemPrompt = `${input.contextType === "channa" ? channaPersona : generalPersona}

Antworte immer auf Deutsch, präzise, freundlich und mit konkreten Handlungsempfehlungen. Nutze Markdown für Formatierungen.${contextInfo}${channaKnowledge}${await getCommunityFactsBlock(input.message)}`;

      const messages = [
        { role: "system" as const, content: systemPrompt },
        ...input.history.map(h => ({ role: h.role as "user" | "assistant", content: h.content })),
        { role: "user" as const, content: input.message },
      ];

      const response = await invokeLLM({ messages });
      const rawContent = response.choices[0]?.message?.content;
      const assistantMessage = typeof rawContent === "string" ? rawContent : "Entschuldigung, ich konnte keine Antwort generieren.";

      // Save to DB
      if (db) {
        await db.insert(aiChats).values({ userId: ctx.user.id, sessionId, role: "user" as const, content: input.message, contextType: input.contextType, contextId: input.contextId });
        await db.insert(aiChats).values({ userId: ctx.user.id, sessionId, role: "assistant" as const, content: assistantMessage, contextType: input.contextType, contextId: input.contextId });
      }

      return { message: assistantMessage, sessionId };
    }),

  getHistory: protectedProcedure
    .input(z.object({ sessionId: z.string().optional(), limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const conditions = [eq(aiChats.userId, ctx.user.id)];
      if (input.sessionId) conditions.push(eq(aiChats.sessionId, input.sessionId));
      return db.select().from(aiChats)
        .where(and(...conditions))
        .orderBy(aiChats.createdAt)
        .limit(input.limit);
    }),

  // Save a community correction to AI output. Treated as authoritative facts.
  submitCorrection: protectedProcedure
    .input(z.object({
      kind: z.enum(["chat", "identify"]),
      topic: z.string().max(255).optional(),
      originalAnswer: z.string().max(4000).optional(),
      correctedText: z.string().min(3).max(4000),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB not available");
      await db.insert(aiCorrections).values({
        userId: ctx.user.id,
        kind: input.kind,
        topic: input.topic ?? null,
        originalAnswer: input.originalAnswer ?? null,
        correctedText: input.correctedText,
        status: "approved",
      });
      try { await awardXp(ctx.user.id, 8); await grantBadge(ctx.user.id, "fact_checker"); } catch {}
      return { success: true };
    }),

  // List recent community corrections (knowledge contributed by members).
  corrections: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(20) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select({
        id: aiCorrections.id, kind: aiCorrections.kind, topic: aiCorrections.topic,
        correctedText: aiCorrections.correctedText, createdAt: aiCorrections.createdAt,
        userName: users.name, userAvatarUrl: users.avatarUrl,
      }).from(aiCorrections)
        .innerJoin(users, eq(aiCorrections.userId, users.id))
        .where(eq(aiCorrections.status, "approved"))
        .orderBy(desc(aiCorrections.createdAt))
        .limit(input.limit);
    }),

  identify: protectedProcedure
    .input(z.object({
      imageBase64: z.string().optional(),
      imageMimeType: z.string().optional(),
      imageUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Build the image URL for the LLM.
      // The LLM API requires a publicly accessible URL or a base64 data URL.
      // We pass base64 directly as a data URL to avoid S3 URL accessibility issues.
      let imageUrl = input.imageUrl;
      if (!imageUrl && input.imageBase64 && input.imageMimeType) {
        // Use base64 data URL directly – works with vision models without needing public S3 URL
        imageUrl = `data:${input.imageMimeType};base64,${input.imageBase64}`;
        console.log("[AI.identify] Using base64 data URL, length:", imageUrl.length);
      }
      if (!imageUrl) throw new Error("Kein Bild übergeben");

      const systemPrompt = `Du bist ein botanischer und aquaristischer Bestimmungsexperte für BlackwaterLeaf. Analysiere das gezeigte Foto einer Pflanze oder eines Aquarienbewohners und bestimme es so genau wie möglich. Antworte ausschließlich auf Deutsch.${await getCommunityFactsBlock("")}`;
      const userPrompt = `Bestimme die abgebildete Pflanze/den Organismus. Gib ein JSON-Objekt zurück mit den Feldern: commonName (deutscher Name), scientificName (wissenschaftlicher Name oder "unsicher"), confidence (0-100 als Zahl), category (eines von: aquatic, tropical, alocasia, monstera, philodendron, other), summary (1-2 Sätze), care (kurzer Pflegehinweis: Licht, Wasser, Schwierigkeit), alternatives (Array möglicher Alternativen als Strings).`;

      try {
        console.log("[AI.identify] Calling LLM with image URL:", imageUrl);
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: [
              { type: "text", text: userPrompt },
              { type: "image_url", image_url: { url: imageUrl, detail: "high" } },
            ] },
          ],
          responseFormat: { type: "json_object" },
        });
        console.log("[AI.identify] LLM response received");
        const raw = response.choices[0]?.message?.content;
        const text = typeof raw === "string" ? raw : "";
        console.log("[AI.identify] LLM response length:", text.length, "first 200 chars:", text.substring(0, 200));
        let parsed: any = {};
        try { parsed = JSON.parse(text); } catch (e) {
          console.log("[AI.identify] JSON parse failed:", e instanceof Error ? e.message : String(e));
          const m = text.match(/\{[\s\S]*\}/);
          if (m) { try { parsed = JSON.parse(m[0]); } catch { parsed = {}; } }
        }
        console.log("[AI.identify] Final parsed:", JSON.stringify(parsed).substring(0, 300));
        try { await awardXp(ctx.user.id, 10); await grantBadge(ctx.user.id, "plant_detective"); } catch {}
        return {
        imageUrl,
          commonName: typeof parsed.commonName === "string" ? parsed.commonName : "Unbekannt",
          scientificName: typeof parsed.scientificName === "string" ? parsed.scientificName : "unsicher",
          confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0,
          category: typeof parsed.category === "string" ? parsed.category : "other",
          summary: typeof parsed.summary === "string" ? parsed.summary : "",
          care: typeof parsed.care === "string" ? parsed.care : "",
          alternatives: Array.isArray(parsed.alternatives) ? parsed.alternatives.map(String) : [],
        };
      } catch (llmError) {
        console.error("[AI.identify] LLM error:", llmError);
        throw new Error(`KI-Bestimmung fehlgeschlagen: ${llmError instanceof Error ? llmError.message : String(llmError)}`);
      }
    }),

  addCorrection: protectedProcedure
    .input(z.object({
      kind: z.enum(["chat", "identify"]),
      topic: z.string().max(255).optional(),
      originalAnswer: z.string().optional(),
      correctedText: z.string().min(1).max(5000),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB not available");
      await db.insert(aiCorrections).values({
        userId: ctx.user.id,
        kind: input.kind,
        topic: input.topic,
        originalAnswer: input.originalAnswer,
        correctedText: input.correctedText,
        status: "pending",
      });
      return { success: true, message: "Korrektur eingereicht. Danke fuer dein Feedback!" };
    }),
});

// ─── Knowledge Base Router ───────────────────────────────
const knowledgeRouter = router({
  list: publicProcedure
    .input(z.object({
      category: z.enum(["aquaristik", "aquascaping", "channa", "blackwater", "houseplants", "basics"]).optional(),
      genus: z.string().optional(),
      limit: z.number().min(1).max(50).default(30),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const conditions = [];
      if (input.category) conditions.push(eq(knowledgeArticles.category, input.category));
      if (input.genus) conditions.push(eq(knowledgeArticles.genus, input.genus));
      return db.select().from(knowledgeArticles)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(knowledgeArticles.isFeatured), desc(knowledgeArticles.createdAt))
        .limit(input.limit);
    }),

  featured: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(knowledgeArticles)
      .orderBy(desc(knowledgeArticles.isFeatured), desc(knowledgeArticles.viewsCount))
      .limit(6);
  }),

  categories: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const rows = await db.select({ category: knowledgeArticles.category, count: sql<number>`count(*)` })
      .from(knowledgeArticles)
      .groupBy(knowledgeArticles.category);
    return rows.map((r) => ({ category: r.category, count: Number(r.count) }));
  }),

  genera: publicProcedure
    .input(z.object({
      category: z.enum(["aquaristik", "aquascaping", "channa", "blackwater", "houseplants", "basics"]).optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [] as { genus: string; count: number }[];
      const conditions = [ne(knowledgeArticles.genus, "")];
      if (input?.category) conditions.push(eq(knowledgeArticles.category, input.category));
      const rows = await db.select({ genus: knowledgeArticles.genus, count: sql<number>`count(*)` })
        .from(knowledgeArticles)
        .where(and(...conditions))
        .groupBy(knowledgeArticles.genus);
      return rows
        .filter((r) => r.genus)
        .map((r) => ({ genus: r.genus as string, count: Number(r.count) }));
    }),

  get: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const rows = await db.select().from(knowledgeArticles).where(eq(knowledgeArticles.slug, input.slug)).limit(1);
      const article = rows[0] ?? null;
      if (article) {
        await db.update(knowledgeArticles).set({ viewsCount: article.viewsCount + 1 }).where(eq(knowledgeArticles.id, article.id));
      }
      return article;
    }),
});

// ─── Gamification Router ───────────────────────────────
const gamificationRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    // Automatic daily login reward: grant once per calendar day on first authenticated load.
    const db = await getDb();
    let stats = await ensureUserStats(ctx.user.id);
    let loginReward: { xpAwarded: number; streak: number } | null = null;
    if (db && stats) {
      const now = new Date();
      const dayMs = 24 * 60 * 60 * 1000;
      const startOfDay = (d: Date) => Math.floor(d.getTime() / dayMs);
      const last = stats.lastCheckIn ? new Date(stats.lastCheckIn) : null;
      if (!last || startOfDay(last) !== startOfDay(now)) {
        const newStreak = last && startOfDay(now) - startOfDay(last) === 1 ? stats.streak + 1 : 1;
        const xpAwarded = 20 + Math.min(newStreak, 10) * 2;
        const newXp = stats.xp + xpAwarded;
        await db.update(userStats).set({
          streak: newStreak,
          longestStreak: Math.max(stats.longestStreak, newStreak),
          lastCheckIn: now,
          xp: newXp,
          level: levelForXp(newXp).level,
          points: stats.points + xpAwarded,
        }).where(eq(userStats.userId, ctx.user.id));
        if (newStreak >= 7) { try { await grantBadge(ctx.user.id, "streak_week"); } catch {} }
        loginReward = { xpAwarded, streak: newStreak };
        stats = { ...stats, streak: newStreak, longestStreak: Math.max(stats.longestStreak, newStreak), lastCheckIn: now, xp: newXp, level: levelForXp(newXp).level, points: stats.points + xpAwarded };
      }
    }
    let earned: any[] = [];
    if (db) {
      earned = await db.select({
        id: badges.id, code: badges.code, name: badges.name,
        description: badges.description, icon: badges.icon, tier: badges.tier,
        earnedAt: userBadges.earnedAt,
      }).from(userBadges)
        .innerJoin(badges, eq(userBadges.badgeId, badges.id))
        .where(eq(userBadges.userId, ctx.user.id))
        .orderBy(desc(userBadges.earnedAt));
    }
    const xp = stats?.xp ?? 0;
    return { stats, level: levelForXp(xp), badges: earned, levels: LEVELS, loginReward };
  }),

  allBadges: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(badges).orderBy(badges.tier);
  }),

  checkIn: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    const stats = await ensureUserStats(ctx.user.id);
    if (!db || !stats) return { ok: false, streak: 0, xpAwarded: 0, alreadyToday: false };
    const now = new Date();
    const last = stats.lastCheckIn ? new Date(stats.lastCheckIn) : null;
    const dayMs = 24 * 60 * 60 * 1000;
    const startOfDay = (d: Date) => Math.floor(d.getTime() / dayMs);
    let newStreak = 1;
    let xpAwarded = 0;
    let alreadyToday = false;
    if (last && startOfDay(last) === startOfDay(now)) {
      alreadyToday = true;
      newStreak = stats.streak;
    } else {
      newStreak = last && startOfDay(now) - startOfDay(last) === 1 ? stats.streak + 1 : 1;
      xpAwarded = 20 + Math.min(newStreak, 10) * 2;
      const newXp = stats.xp + xpAwarded;
      await db.update(userStats).set({
        streak: newStreak,
        longestStreak: Math.max(stats.longestStreak, newStreak),
        lastCheckIn: now,
        xp: newXp,
        level: levelForXp(newXp).level,
        points: stats.points + xpAwarded,
      }).where(eq(userStats.userId, ctx.user.id));
      if (newStreak >= 7) { try { await grantBadge(ctx.user.id, "streak_week"); } catch {} }
    }
    return { ok: true, streak: newStreak, xpAwarded, alreadyToday };
  }),

  leaderboard: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(10) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select({
        userId: userStats.userId, xp: userStats.xp, level: userStats.level,
        streak: userStats.streak,
        userName: users.name, userAvatarUrl: users.avatarUrl,
      }).from(userStats)
        .innerJoin(users, eq(userStats.userId, users.id))
        .orderBy(desc(userStats.xp))
        .limit(input.limit);
    }),

  activeChallenge: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return null;
    const rows = await db.select().from(challenges)
      .where(eq(challenges.isActive, true))
      .orderBy(desc(challenges.startsAt))
      .limit(1);
    return rows[0] ?? null;
  }),
});

// ─── Account Router (DSGVO) ─────────────────────────────────────────────────
// Vollständige Löschung aller personenbezogenen Daten des angemeldeten Nutzers.
const accountRouter = router({
  deleteMe: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });
    const uid = ctx.user.id;

    // Reihenfolge: abhängige Datensätze zuerst, dann der Nutzer selbst.
    await db.delete(likes).where(eq(likes.userId, uid));
    await db.delete(comments).where(eq(comments.userId, uid));
    await db.delete(plantPhotos).where(eq(plantPhotos.userId, uid));
    await db.delete(plants).where(eq(plants.userId, uid));
    await db.delete(aquariumPhotos).where(eq(aquariumPhotos.userId, uid));
    await db.delete(aquariumEvents).where(eq(aquariumEvents.userId, uid));
    await db.delete(aquariums).where(eq(aquariums.userId, uid));
    await db.delete(posts).where(eq(posts.userId, uid));
    await db.delete(notifications).where(eq(notifications.userId, uid));
    await db.delete(aiChats).where(eq(aiChats.userId, uid));
    await db.delete(aiCorrections).where(eq(aiCorrections.userId, uid));
    await db.delete(userBadges).where(eq(userBadges.userId, uid));
    await db.delete(userStats).where(eq(userStats.userId, uid));
    await db.delete(users).where(eq(users.id, uid));

    // Session-Cookie serverseitig löschen.
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),
});

// ─── Upload Router ────────────────────────────────────────────────────────────
const uploadRouter = router({
  photo: protectedProcedure
    .input(z.object({
      base64: z.string(),
      mimeType: z.string(),
      folder: z.string().default("uploads"),
    }))
    .mutation(async ({ ctx, input }) => {
      const buffer = Buffer.from(input.base64, "base64");
      const ext = input.mimeType.split("/")[1] ?? "jpg";
      const key = `${input.folder}/${ctx.user.id}/${Date.now()}.${ext}`;
      const { url } = await storagePut(key, buffer, input.mimeType);
      return { url, key };
    }),
});

// ─── App Router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  users: usersRouter,
  plants: plantsRouter,
  aquariums: aquariumsRouter,
  posts: postsRouter,
  notifications: notificationsRouter,
  discover: discoverRouter,
  ai: aiRouter,
  knowledge: knowledgeRouter,
  gamification: gamificationRouter,
  upload: uploadRouter,
  account: accountRouter,
  social: socialRouter,
  threads: threadsRouter,
  groups: groupsRouter,
  messaging: messagingRouter,
  moderation: moderationRouter,
  admin: adminRouter,
  search: searchRouter,
  featured: featuredRouter,
});

export type AppRouter = typeof appRouter;
