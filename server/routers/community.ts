import { TRPCError } from "@trpc/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { communityPosts, mediaAssets, postComments, postLikes, users } from "../../drizzle/schema";
import { BLACKWATERLEAF_CONTRACT_VERSION, observationRealmSchema } from "../../shared/blackwaterleaf-contract-v1";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { storageGetSignedUrl, storagePut } from "../storage";
import { validateImageUpload } from "../uploadValidation";
import { canReadCommunityPost, isResourceOwner } from "../accessPolicy";
import { hasCurrentConsent } from "../consents";
import { assertValidMediaContext } from "../mediaIntegrity";

async function requireDatabase() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "database_unavailable" });
  return db;
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
  return Promise.all(
    rows.map(async item => ({
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
  feed: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(20) }))
    .query(async ({ input }) => {
      const db = await requireDatabase();
      const rows = await db
        .select({ post: communityPosts, author: users })
        .from(communityPosts)
        .innerJoin(users, eq(communityPosts.userId, users.id))
        .where(
          and(
            eq(communityPosts.status, "published"),
            eq(communityPosts.visibility, "public"),
            eq(users.status, "active"),
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
              publicationStatus: post.status,
            }),
          )
          .map(async ({ post, author }) => ({
          contractVersion: BLACKWATERLEAF_CONTRACT_VERSION,
          id: String(post.id),
          author: {
            id: String(author.id),
            name: author.name,
            username: author.username,
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
      assertValidMediaContext({ kind: "post_image", observationId: null, postId: post.id });
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
      return { id: String(inserted[0].insertId), accessUrl: await storageGetSignedUrl(stored.key) };
    }),

  publish: protectedProcedure.input(z.object({ postId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
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

  like: protectedProcedure.input(z.object({ postId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    const db = await requireDatabase();
    const visible = await db
      .select({ id: communityPosts.id })
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

    const existing = await db
      .select({ id: postLikes.id })
      .from(postLikes)
      .where(and(eq(postLikes.postId, input.postId), eq(postLikes.userId, ctx.user.id)))
      .limit(1);
    if (existing[0]) return { liked: true } as const;

    await db.transaction(async tx => {
      await tx.insert(postLikes).values({ postId: input.postId, userId: ctx.user.id });
      await tx
        .update(communityPosts)
        .set({ likesCount: sql`${communityPosts.likesCount} + 1` })
        .where(eq(communityPosts.id, input.postId));
    });
    return { liked: true } as const;
  }),

  comments: publicProcedure.input(z.object({ postId: z.number().int().positive() })).query(async ({ input }) => {
    const db = await requireDatabase();
    const visible = await db
      .select({ id: communityPosts.id })
      .from(communityPosts)
      .where(
        and(
          eq(communityPosts.id, input.postId),
          eq(communityPosts.status, "published"),
          eq(communityPosts.visibility, "public"),
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
        ),
      )
      .orderBy(postComments.createdAt);
  }),

  addComment: protectedProcedure
    .input(z.object({ postId: z.number().int().positive(), parentId: z.number().int().positive().nullable().optional(), content: z.string().trim().min(1).max(2_000) }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDatabase();
      const visible = await db
        .select({ id: communityPosts.id })
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

      if (input.parentId) {
        const parents = await db
          .select({ id: postComments.id })
          .from(postComments)
          .where(and(eq(postComments.id, input.parentId), eq(postComments.postId, input.postId)))
          .limit(1);
        if (!parents[0]) throw new TRPCError({ code: "BAD_REQUEST", message: "parent_comment_not_in_post" });
      }

      await db.transaction(async tx => {
        await tx.insert(postComments).values({
          postId: input.postId,
          userId: ctx.user.id,
          parentId: input.parentId ?? null,
          content: input.content,
        });
        await tx
          .update(communityPosts)
          .set({ commentsCount: sql`${communityPosts.commentsCount} + 1` })
          .where(eq(communityPosts.id, input.postId));
      });
      return { success: true } as const;
    }),
});
