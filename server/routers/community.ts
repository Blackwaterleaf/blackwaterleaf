import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, gt, isNull, lt, lte, notInArray, or, sql } from "drizzle-orm";
import { z } from "zod";
import { communityPosts, communityReports, mediaAssets, notifications, postComments, postLikes, userBlocks, userFollows, users } from "../../drizzle/schema";
import { BLACKWATERLEAF_CONTRACT_VERSION, observationRealmSchema } from "../../shared/blackwaterleaf-contract-v1";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { storageGetSignedUrl, storagePut } from "../storage";
import { validateImageUpload } from "../uploadValidation";
import { MAX_VIDEO_BYTES, validateVideoUpload } from "../videoUploadValidation";
import { canReadCommunityPost, canReadMedia, isResourceOwner } from "../accessPolicy";
import { hasCurrentConsent } from "../consents";
import { appendAuditEntry } from "../auditLedger";
import { assertValidMediaContext } from "../mediaIntegrity";
import { assertSafetyGateAllows } from "../safetyGates";
import { awardXpIfReady, XP_REWARDS } from "../gamification";

async function requireDatabase() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "database_unavailable" });
  return db;
}

const sexualContentPattern = /\b(?:sex|porno|pornografie|porn|xxx|onlyfans|ficken|vergewaltig|nackt|nacktbilder|intimfoto|sexuell)\w*\b/i;

async function suspendForSexualContent(db: Awaited<ReturnType<typeof requireDatabase>>, userId: number, content: string): Promise<never> {
  await db.update(users).set({ status: "suspended" }).where(eq(users.id, userId));
  await appendAuditEntry({ actorId: userId, action: "community_sexual_content_blocked", targetType: "user", targetId: userId, payload: { contentBlocked: true, contentLength: content.length, automatic: true, accountStatus: "suspended" } });
  throw new TRPCError({ code: "FORBIDDEN", message: "community_content_policy_violation_account_suspended" });
}

async function enforceCommunityContentPolicy(db: Awaited<ReturnType<typeof requireDatabase>>, userId: number, content: string) {
  if (sexualContentPattern.test(content.normalize("NFKC"))) await suspendForSexualContent(db, userId, content);
}

async function assertNoBlockingRelationship(db: Awaited<ReturnType<typeof requireDatabase>>, firstUserId: number, secondUserId: number) {
  if (firstUserId === secondUserId) return;
  const relation = await db
    .select({ blockerId: userBlocks.blockerId })
    .from(userBlocks)
    .where(
      or(
        and(eq(userBlocks.blockerId, firstUserId), eq(userBlocks.blockedId, secondUserId)),
        and(eq(userBlocks.blockerId, secondUserId), eq(userBlocks.blockedId, firstUserId)),
      ),
    )
    .limit(1);
  if (relation[0]) throw new TRPCError({ code: "FORBIDDEN", message: "blocked_relationship" });
}

async function publicMediaForPost(postId: number, userId: number) {
  const db = await requireDatabase();
  const rows = await db
    .select()
    .from(mediaAssets)
    .where(
      and(
        eq(mediaAssets.postId, postId),
        eq(mediaAssets.userId, userId),
        eq(mediaAssets.visibility, "public"),
      ),
    );
  const uniqueRows = rows.filter((item, index, all) => {
    const identity = `${item.kind}:${item.storageKey ?? item.id}`;
    return all.findIndex(candidate => `${candidate.kind}:${candidate.storageKey ?? candidate.id}` === identity) === index;
  });
  return Promise.all(
    uniqueRows
      .filter(item => canReadMedia({
        viewerId: null,
        ownerId: item.userId,
        ownerStatus: "active",
        assetVisibility: item.visibility,
        parentVisibility: "public",
        parentPublicationStatus: "published",
      }))
      .map(async item => ({
      id: String(item.id),
      ownerId: String(item.userId),
      kind: item.kind,
      mimeType: item.mimeType,
      byteSize: item.byteSize,
      width: item.width,
      height: item.height,
      accessUrl: await storageGetSignedUrl(item.storageKey),
      visibility: item.visibility,
      createdAt: item.createdAt.toISOString(),
      })),
  );
}

export const communityRouter = router({
  publicPreview: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(6).default(3) }))
    .query(async ({ input }) => {
      const db = await requireDatabase();
      const now = new Date();
      const rows = await db
        .select({ post: communityPosts, author: users })
        .from(communityPosts)
        .innerJoin(users, eq(communityPosts.userId, users.id))
        .where(
          and(
            eq(communityPosts.status, "published"),
            eq(communityPosts.visibility, "public"),
            or(isNull(communityPosts.publishAt), lte(communityPosts.publishAt, now)),
            or(isNull(communityPosts.expiresAt), gt(communityPosts.expiresAt, now)),
            eq(users.status, "active"),
          ),
        )
        .orderBy(desc(communityPosts.createdAt))
        .limit(input.limit);

      return Promise.all(rows.filter(({ post, author }) => canReadCommunityPost({ authorStatus: author.status, visibility: post.visibility, publicationStatus: post.status })).map(async ({ post, author }) => ({
        id: String(post.id),
        author: { displayName: author.name?.trim() || author.username?.trim() || "BlackWaterLeaf-Nutzer" },
        content: post.content,
        realm: post.realm,
        media: await publicMediaForPost(post.id, post.userId),
        likesCount: post.likesCount,
        commentsCount: post.commentsCount,
        createdAt: post.createdAt.toISOString(),
      })));
    }),

  feed: protectedProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(20) }))
    .query(async ({ ctx, input }) => {
      const db = await requireDatabase();
      const blockedAuthorIds = (await db.select({ blockerId: userBlocks.blockerId, blockedId: userBlocks.blockedId }).from(userBlocks).where(or(eq(userBlocks.blockerId, ctx.user.id), eq(userBlocks.blockedId, ctx.user.id)))).map(item => item.blockerId === ctx.user.id ? item.blockedId : item.blockerId);
      const now = new Date();
      const rows = await db
        .select({ post: communityPosts, author: users })
        .from(communityPosts)
        .innerJoin(users, eq(communityPosts.userId, users.id))
        .where(
          and(
            or(eq(communityPosts.status, "published"), and(eq(communityPosts.status, "draft"), lte(communityPosts.publishAt, now))),
            eq(communityPosts.visibility, "public"),
            or(isNull(communityPosts.publishAt), lte(communityPosts.publishAt, now)),
            or(isNull(communityPosts.expiresAt), gt(communityPosts.expiresAt, now)),
            eq(users.status, "active"),
            ...(blockedAuthorIds.length ? [notInArray(communityPosts.userId, blockedAuthorIds)] : []),
          ),
        )
        .orderBy(desc(communityPosts.createdAt))
        .limit(input.limit);

      return Promise.all(
        rows
        .filter(({ post, author }) =>
            canReadCommunityPost({
              authorStatus: author.status,
              visibility: post.visibility,
              publicationStatus: post.status === "draft" ? "published" : post.status,
            }),
          )
          .map(async ({ post, author }) => ({
          contractVersion: BLACKWATERLEAF_CONTRACT_VERSION,
          id: String(post.id),
          author: {
            id: String(author.id),
            name: author.name,
            username: author.username,
            displayName: author.name?.trim() || author.username?.trim() || "BlackWaterLeaf-Nutzer",
            avatarUrl: author.avatarStorageKey
              ? await storageGetSignedUrl(author.avatarStorageKey).catch(() => null)
              : null,
            role: author.role,
            status: author.status,
            roleOrigin: "server_verified" as const,
          },
          content: post.content,
          realm: post.realm,
            media: await publicMediaForPost(post.id, post.userId),
          visibility: "public" as const,
          likesCount: post.likesCount,
          commentsCount: post.commentsCount,
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString(),
        })),
      );
    }),

  byId: protectedProcedure.input(z.object({ postId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const db = await requireDatabase();
    const blockedAuthorIds = (await db.select({ blockerId: userBlocks.blockerId, blockedId: userBlocks.blockedId }).from(userBlocks).where(or(eq(userBlocks.blockerId, ctx.user.id), eq(userBlocks.blockedId, ctx.user.id)))).map(item => item.blockerId === ctx.user.id ? item.blockedId : item.blockerId);
    const rows = await db.select({ post: communityPosts, author: users }).from(communityPosts).innerJoin(users, eq(communityPosts.userId, users.id)).where(and(eq(communityPosts.id, input.postId), eq(communityPosts.status, "published"), eq(communityPosts.visibility, "public"), eq(users.status, "active"), ...(blockedAuthorIds.length ? [notInArray(communityPosts.userId, blockedAuthorIds)] : []))).limit(1);
    const row = rows[0];
    if (!row || !canReadCommunityPost({ authorStatus: row.author.status, visibility: row.post.visibility, publicationStatus: row.post.status })) throw new TRPCError({ code: "NOT_FOUND", message: "community_post_not_found" });
    return {
      contractVersion: BLACKWATERLEAF_CONTRACT_VERSION,
      id: String(row.post.id),
      author: { id: String(row.author.id), name: row.author.name, username: row.author.username, displayName: row.author.name?.trim() || row.author.username?.trim() || "BlackWaterLeaf-Nutzer", avatarUrl: row.author.avatarStorageKey ? await storageGetSignedUrl(row.author.avatarStorageKey).catch(() => null) : null, role: row.author.role, status: row.author.status, roleOrigin: "server_verified" as const },
      content: row.post.content,
      realm: row.post.realm,
      media: await publicMediaForPost(row.post.id, row.post.userId),
      visibility: "public" as const,
      likesCount: row.post.likesCount,
      commentsCount: row.post.commentsCount,
      createdAt: row.post.createdAt.toISOString(),
      updatedAt: row.post.updatedAt.toISOString(),
    };
  }),

  myPosts: protectedProcedure.query(async ({ ctx }) => {
    const db = await requireDatabase();
    return db
      .select()
      .from(communityPosts)
      .where(eq(communityPosts.userId, ctx.user.id))
      .orderBy(desc(communityPosts.updatedAt));
  }),

  createDraft: protectedProcedure
    .input(
      z.object({
        content: z.string().trim().min(1).max(10_000),
        realm: observationRealmSchema.nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = await requireDatabase();
      await enforceCommunityContentPolicy(db, ctx.user.id, input.content);
      const inserted = await db.insert(communityPosts).values({
        userId: ctx.user.id,
        content: input.content,
        realm: input.realm ?? null,
        visibility: "private",
        status: "draft",
      });
      return { id: String(inserted[0].insertId), status: "draft" } as const;
    }),

  uploadDraftImage: protectedProcedure
    .input(z.object({ postId: z.number().int().positive(), base64: z.string().min(1), mimeType: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      assertSafetyGateAllows("mediaUpload");
      const db = await requireDatabase();
      const posts = await db
        .select()
        .from(communityPosts)
        .where(and(eq(communityPosts.id, input.postId), eq(communityPosts.userId, ctx.user.id)))
        .limit(1);
      const post = posts[0];
      if (!post || !isResourceOwner(ctx.user.id, post.userId)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "post_ownership_required" });
      }

      if (!(await hasCurrentConsent(db, ctx.user.id, "media_processing"))) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "media_processing_consent_required" });
      }

      const image = validateImageUpload(input.base64, input.mimeType);
      assertValidMediaContext({ kind: "post_image", observationId: null, postId: post.id, habitatId: null });
      const stored = await storagePut(
        `users/${ctx.user.id}/posts/${post.id}/image.${image.extension}`,
        image.buffer,
        image.mimeType,
      );
      const inserted = await db.insert(mediaAssets).values({
        userId: ctx.user.id,
        postId: post.id,
        kind: "post_image",
        mimeType: image.mimeType,
        byteSize: image.byteSize,
        accessUrl: stored.url,
        storageKey: stored.key,
        visibility: "private",
      });
      const xp = await awardXpIfReady(db, {
        userId: ctx.user.id,
        eventType: "photo_upload",
        eventKey: `xp:${ctx.user.id}:community-photo:${post.id}`,
        points: XP_REWARDS.communityPhoto,
        sourceType: "media_asset",
        sourceId: String(inserted[0].insertId),
      });
      const accessUrl = await storageGetSignedUrl(stored.key).catch(() => stored.url);
      return { id: String(inserted[0].insertId), accessUrl, xpAwarded: xp.amount };
    }),
  uploadDraftVideo: protectedProcedure
    .input(z.object({ postId: z.number().int().positive(), base64: z.string().min(1), mimeType: z.enum(["video/mp4", "video/webm"]) }))
    .mutation(async ({ ctx, input }) => {
      assertSafetyGateAllows("mediaUpload");
      const db = await requireDatabase();
      const posts = await db.select().from(communityPosts).where(and(eq(communityPosts.id, input.postId), eq(communityPosts.userId, ctx.user.id))).limit(1);
      const post = posts[0];
      if (!post || !isResourceOwner(ctx.user.id, post.userId)) throw new TRPCError({ code: "FORBIDDEN", message: "post_ownership_required" });
      if (!(await hasCurrentConsent(db, ctx.user.id, "media_processing"))) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "media_processing_consent_required" });
      const existing = await db.select({ id: mediaAssets.id }).from(mediaAssets).where(and(eq(mediaAssets.postId, post.id), eq(mediaAssets.userId, ctx.user.id), eq(mediaAssets.kind, "post_video"))).limit(1);
      if (existing[0]) throw new TRPCError({ code: "CONFLICT", message: "one_video_per_post" });
      const video = validateVideoUpload(input.base64, input.mimeType);
      if (video.byteSize > MAX_VIDEO_BYTES) throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "invalid_video_size" });
      assertValidMediaContext({ kind: "post_video", observationId: null, postId: post.id, habitatId: null });
      const stored = await storagePut(`users/${ctx.user.id}/posts/${post.id}/video.${video.extension}`, video.buffer, video.mimeType);
      const inserted = await db.insert(mediaAssets).values({ userId: ctx.user.id, postId: post.id, kind: "post_video", mimeType: video.mimeType, byteSize: video.byteSize, accessUrl: stored.url, storageKey: stored.key, visibility: "private" });
      return { id: String(inserted[0].insertId), accessUrl: await storageGetSignedUrl(stored.key) };
    }),

  publish: protectedProcedure.input(z.object({ postId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    assertSafetyGateAllows("publicPublication");
    const db = await requireDatabase();
    if (!(await hasCurrentConsent(db, ctx.user.id, "community_publishing"))) {
      throw new TRPCError({ code: "PRECONDITION_FAILED", message: "community_publishing_consent_required" });
    }
    const posts = await db
      .select()
      .from(communityPosts)
      .where(and(eq(communityPosts.id, input.postId), eq(communityPosts.userId, ctx.user.id)))
      .limit(1);
    if (!posts[0] || !isResourceOwner(ctx.user.id, posts[0].userId)) {
      throw new TRPCError({ code: "FORBIDDEN", message: "post_ownership_required" });
    }

    await enforceCommunityContentPolicy(db, ctx.user.id, posts[0].content);

    await db.transaction(async tx => {
      await tx
        .update(communityPosts)
        .set({ status: "published", visibility: "public" })
        .where(and(eq(communityPosts.id, input.postId), eq(communityPosts.userId, ctx.user.id)));
      await tx
        .update(mediaAssets)
        .set({ visibility: "public" })
        .where(and(eq(mediaAssets.postId, input.postId), eq(mediaAssets.userId, ctx.user.id)));
    });
    return { status: "published", visibility: "public" } as const;
  }),

  updateMine: protectedProcedure
    .input(z.object({
      postId: z.number().int().positive(),
      content: z.string().trim().min(1).max(10_000),
      realm: observationRealmSchema.nullable().optional(),
      visibility: z.enum(["private", "public"]),
    }))
    .mutation(async ({ ctx, input }) => {
      if (input.visibility === "public") assertSafetyGateAllows("publicPublication");
      const db = await requireDatabase();
      const posts = await db.select().from(communityPosts).where(and(eq(communityPosts.id, input.postId), eq(communityPosts.userId, ctx.user.id))).limit(1);
      const post = posts[0];
      if (!post || !isResourceOwner(ctx.user.id, post.userId)) throw new TRPCError({ code: "FORBIDDEN", message: "post_ownership_required" });
      if (post.status === "removed" || post.status === "hidden") throw new TRPCError({ code: "FORBIDDEN", message: "moderated_post_cannot_be_restored" });
      await enforceCommunityContentPolicy(db, ctx.user.id, input.content);
      if (input.visibility === "public" && !(await hasCurrentConsent(db, ctx.user.id, "community_publishing"))) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "community_publishing_consent_required" });
      }
      const nextStatus = input.visibility === "public" ? "published" : "draft";
      await db.transaction(async tx => {
        await tx.update(communityPosts).set({ content: input.content, realm: input.realm ?? null, visibility: input.visibility, status: nextStatus }).where(and(eq(communityPosts.id, input.postId), eq(communityPosts.userId, ctx.user.id)));
        await tx.update(mediaAssets).set({ visibility: input.visibility }).where(and(eq(mediaAssets.postId, input.postId), eq(mediaAssets.userId, ctx.user.id)));
      });
      return { id: String(input.postId), status: nextStatus, visibility: input.visibility } as const;
    }),

  deleteMine: protectedProcedure
    .input(z.object({ postId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDatabase();
      const post = await db.select({ id: communityPosts.id, userId: communityPosts.userId }).from(communityPosts).where(and(eq(communityPosts.id, input.postId), eq(communityPosts.userId, ctx.user.id))).limit(1);
      if (!post[0] || !isResourceOwner(ctx.user.id, post[0].userId)) throw new TRPCError({ code: "FORBIDDEN", message: "post_ownership_required" });
      await db.transaction(async tx => {
        await tx.update(communityPosts).set({ status: "removed", visibility: "private" }).where(and(eq(communityPosts.id, input.postId), eq(communityPosts.userId, ctx.user.id)));
        await tx.update(mediaAssets).set({ visibility: "private" }).where(and(eq(mediaAssets.postId, input.postId), eq(mediaAssets.userId, ctx.user.id)));
      });
      return { deleted: true, id: String(input.postId) } as const;
    }),

  like: protectedProcedure.input(z.object({ postId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    const db = await requireDatabase();
    const visible = await db
      .select({ id: communityPosts.id, userId: communityPosts.userId })
      .from(communityPosts)
      .innerJoin(users, eq(communityPosts.userId, users.id))
      .where(
        and(
          eq(communityPosts.id, input.postId),
          eq(communityPosts.status, "published"),
          eq(communityPosts.visibility, "public"),
          eq(users.status, "active"),
        ),
      )
      .limit(1);
    if (!visible[0]) throw new TRPCError({ code: "NOT_FOUND", message: "post_not_found" });
    await assertNoBlockingRelationship(db, ctx.user.id, visible[0].userId);

    const existing = await db
      .select({ id: postLikes.id })
      .from(postLikes)
      .where(and(eq(postLikes.postId, input.postId), eq(postLikes.userId, ctx.user.id)))
      .limit(1);
    if (existing[0]) {
      await db.transaction(async tx => {
        await tx.delete(postLikes).where(and(eq(postLikes.postId, input.postId), eq(postLikes.userId, ctx.user.id)));
        await tx.update(communityPosts).set({ likesCount: sql`GREATEST(${communityPosts.likesCount} - 1, 0)` }).where(eq(communityPosts.id, input.postId));
      });
      return { liked: false } as const;
    }

    await db.transaction(async tx => {
      await tx.insert(postLikes).values({ postId: input.postId, userId: ctx.user.id });
      await tx
        .update(communityPosts)
        .set({ likesCount: sql`${communityPosts.likesCount} + 1` })
        .where(eq(communityPosts.id, input.postId));
      if (visible[0].userId !== ctx.user.id) {
        await tx.insert(notifications).values({
          recipientId: visible[0].userId,
          actorId: ctx.user.id,
          type: "like",
          postId: input.postId,
          message: "Jemandem gefällt dein Community-Beitrag.",
        });
      }
    });
    return { liked: true } as const;
  }),

  comments: protectedProcedure.input(z.object({ postId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const db = await requireDatabase();
    const blockedUserIds = (await db.select({ blockerId: userBlocks.blockerId, blockedId: userBlocks.blockedId }).from(userBlocks).where(or(eq(userBlocks.blockerId, ctx.user.id), eq(userBlocks.blockedId, ctx.user.id)))).map(item => item.blockerId === ctx.user.id ? item.blockedId : item.blockerId);
    const visible = await db
      .select({ id: communityPosts.id })
      .from(communityPosts)
      .where(
        and(
          eq(communityPosts.id, input.postId),
          eq(communityPosts.status, "published"),
          eq(communityPosts.visibility, "public"),
          ...(blockedUserIds.length ? [notInArray(communityPosts.userId, blockedUserIds)] : []),
        ),
      )
      .limit(1);
    if (!visible[0]) return [];
    return db
      .select({
        id: postComments.id,
        postId: postComments.postId,
        parentId: postComments.parentId,
        content: postComments.content,
        createdAt: postComments.createdAt,
        authorId: users.id,
        authorName: users.name,
        authorUsername: users.username,
      })
      .from(postComments)
      .innerJoin(users, eq(postComments.userId, users.id))
      .where(
        and(
          eq(postComments.postId, input.postId),
          eq(postComments.status, "visible"),
          eq(users.status, "active"),
          ...(blockedUserIds.length ? [notInArray(postComments.userId, blockedUserIds)] : []),
        ),
      )
      .orderBy(postComments.createdAt);
  }),

  addComment: protectedProcedure
    .input(z.object({ postId: z.number().int().positive(), parentId: z.number().int().positive().nullable().optional(), content: z.string().trim().min(1).max(2_000) }))
    .mutation(async ({ ctx, input }) => {
      assertSafetyGateAllows("publicPublication");
      const db = await requireDatabase();
      await enforceCommunityContentPolicy(db, ctx.user.id, input.content);
      const visible = await db
        .select({ id: communityPosts.id, userId: communityPosts.userId })
        .from(communityPosts)
        .where(
          and(
            eq(communityPosts.id, input.postId),
            eq(communityPosts.status, "published"),
            eq(communityPosts.visibility, "public"),
          ),
        )
        .limit(1);
      if (!visible[0]) throw new TRPCError({ code: "NOT_FOUND", message: "post_not_found" });
      await assertNoBlockingRelationship(db, ctx.user.id, visible[0].userId);

      if (input.parentId) {
        const parents = await db
          .select({ id: postComments.id })
          .from(postComments)
          .where(and(eq(postComments.id, input.parentId), eq(postComments.postId, input.postId)))
          .limit(1);
        if (!parents[0]) throw new TRPCError({ code: "BAD_REQUEST", message: "parent_comment_not_in_post" });
      }

      await db.transaction(async tx => {
        const inserted = await tx.insert(postComments).values({
          postId: input.postId,
          userId: ctx.user.id,
          parentId: input.parentId ?? null,
          content: input.content,
        });
        await tx
          .update(communityPosts)
          .set({ commentsCount: sql`${communityPosts.commentsCount} + 1` })
          .where(eq(communityPosts.id, input.postId));
        if (visible[0].userId !== ctx.user.id) {
          await tx.insert(notifications).values({
            recipientId: visible[0].userId,
            actorId: ctx.user.id,
            type: "comment",
            postId: input.postId,
            commentId: Number(inserted[0].insertId),
            message: "Jemand hat deinen Community-Beitrag kommentiert.",
          });
        }
      });
      return { success: true } as const;
    }),

  updateComment: protectedProcedure
    .input(z.object({ commentId: z.number().int().positive(), content: z.string().trim().min(1).max(2_000) }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDatabase();
      await enforceCommunityContentPolicy(db, ctx.user.id, input.content);
      const [comment] = await db.select({ id: postComments.id, userId: postComments.userId, status: postComments.status }).from(postComments).where(eq(postComments.id, input.commentId)).limit(1);
      if (!comment || comment.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "comment_ownership_required" });
      if (comment.status !== "visible") throw new TRPCError({ code: "CONFLICT", message: "comment_not_editable" });
      await db.update(postComments).set({ content: input.content }).where(eq(postComments.id, input.commentId));
      await appendAuditEntry({ actorId: ctx.user.id, action: "community_comment_updated", targetType: "comment", targetId: input.commentId, payload: { contentLength: input.content.length } });
      return { id: input.commentId, updated: true } as const;
    }),

  deleteComment: protectedProcedure
    .input(z.object({ commentId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDatabase();
      const [comment] = await db.select({ id: postComments.id, postId: postComments.postId, userId: postComments.userId, status: postComments.status }).from(postComments).where(eq(postComments.id, input.commentId)).limit(1);
      if (!comment || comment.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "comment_ownership_required" });
      if (comment.status !== "visible") return { id: input.commentId, deleted: false } as const;
      await db.transaction(async tx => {
        await tx.update(postComments).set({ status: "removed" }).where(eq(postComments.id, input.commentId));
        await tx.update(communityPosts).set({ commentsCount: sql`GREATEST(${communityPosts.commentsCount} - 1, 0)` }).where(eq(communityPosts.id, comment.postId));
      });
      await appendAuditEntry({ actorId: ctx.user.id, action: "community_comment_deleted", targetType: "comment", targetId: input.commentId, payload: { postId: comment.postId } });
      return { id: input.commentId, deleted: true } as const;
    }),

  report: protectedProcedure
    .input(z.object({ postId: z.number().int().positive().optional(), commentId: z.number().int().positive().optional(), reason: z.enum(["sexual_content", "harassment", "misinformation", "copyright", "other"]), note: z.string().trim().max(1_000).optional() }))
    .mutation(async ({ ctx, input }) => {
      if (Boolean(input.postId) === Boolean(input.commentId)) throw new TRPCError({ code: "BAD_REQUEST", message: "exactly_one_report_target_required" });
      const db = await requireDatabase();
      if (input.postId) {
        const [post] = await db.select({ id: communityPosts.id, userId: communityPosts.userId, status: communityPosts.status, visibility: communityPosts.visibility }).from(communityPosts).where(eq(communityPosts.id, input.postId)).limit(1);
        if (!post || post.status !== "published" || post.visibility !== "public") throw new TRPCError({ code: "NOT_FOUND", message: "post_not_found" });
        await assertNoBlockingRelationship(db, ctx.user.id, post.userId);
      }
      if (input.commentId) {
        const [comment] = await db.select({ id: postComments.id, postId: postComments.postId, userId: postComments.userId, status: postComments.status }).from(postComments).where(eq(postComments.id, input.commentId)).limit(1);
        if (!comment || comment.status !== "visible") throw new TRPCError({ code: "NOT_FOUND", message: "comment_not_found" });
        await assertNoBlockingRelationship(db, ctx.user.id, comment.userId);
      }
      const inserted = await db.insert(communityReports).values({ reporterId: ctx.user.id, postId: input.postId ?? null, commentId: input.commentId ?? null, reason: input.reason, note: input.note?.trim() || null });
      await appendAuditEntry({ actorId: ctx.user.id, action: "community_report_submitted", targetType: input.postId ? "community_post" : "comment", targetId: input.postId ?? input.commentId!, payload: { reason: input.reason, hasNote: Boolean(input.note?.trim()) } });
      return { id: Number(inserted[0].insertId), status: "pending" } as const;
    }),

  blockUser: protectedProcedure
    .input(z.object({ userId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.id === input.userId) throw new TRPCError({ code: "BAD_REQUEST", message: "cannot_block_self" });
      const db = await requireDatabase();
      const [target] = await db.select({ id: users.id, status: users.status }).from(users).where(eq(users.id, input.userId)).limit(1);
      if (!target || target.status !== "active") throw new TRPCError({ code: "NOT_FOUND", message: "user_not_found" });
      await db.transaction(async tx => {
        await tx.insert(userBlocks).values({ blockerId: ctx.user.id, blockedId: input.userId }).onDuplicateKeyUpdate({ set: { blockedId: input.userId } });
        await tx.update(userFollows).set({ status: "removed", updatedAt: new Date() }).where(or(and(eq(userFollows.followerId, ctx.user.id), eq(userFollows.followingId, input.userId)), and(eq(userFollows.followerId, input.userId), eq(userFollows.followingId, ctx.user.id))));
      });
      await appendAuditEntry({ actorId: ctx.user.id, action: "community_user_blocked", targetType: "user", targetId: input.userId, payload: {} });
      return { blocked: true, userId: input.userId } as const;
    }),

  unblockUser: protectedProcedure
    .input(z.object({ userId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDatabase();
      await db.delete(userBlocks).where(and(eq(userBlocks.blockerId, ctx.user.id), eq(userBlocks.blockedId, input.userId)));
      await appendAuditEntry({ actorId: ctx.user.id, action: "community_user_unblocked", targetType: "user", targetId: input.userId, payload: {} });
      return { blocked: false, userId: input.userId } as const;
    }),
});
