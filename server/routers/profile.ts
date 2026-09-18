import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { mediaAssets, users } from "../../drizzle/schema";
import {
  BLACKWATERLEAF_CONTRACT_VERSION,
  consentPurposeSchema,
  localeSchema,
  unitSystemSchema,
  visibilitySchema,
} from "../../shared/blackwaterleaf-contract-v1";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { storageGetSignedUrl, storagePut } from "../storage";
import { validateImageUpload } from "../uploadValidation";
import { canReadProfile } from "../accessPolicy";
import { hasCurrentConsent, listCurrentConsents, recordCurrentConsent } from "../consents";
import { assertValidMediaContext } from "../mediaIntegrity";

const socialUrl = z.string().url().max(255).nullable().optional();
async function requireDatabase() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "database_unavailable" });
  return db;
}

async function serializeProfile(user: typeof users.$inferSelect, includePrivate: boolean) {
  const avatarUrl = user.avatarStorageKey
    ? await storageGetSignedUrl(user.avatarStorageKey).catch(() => null)
    : null;

  return {
    contractVersion: BLACKWATERLEAF_CONTRACT_VERSION,
    id: String(user.id),
    name: user.name,
    username: user.username,
    email: includePrivate ? user.email : null,
    role: user.role,
    status: user.status,
    avatarUrl,
    bio: user.bio,
    location: user.location,
    profileVisibility: user.profileVisibility,
    locale: user.locale,
    unitSystem: user.unitSystem,
    socialLinks: {
      instagram: user.socialInstagram,
      tiktok: user.socialTiktok,
      youtube: user.socialYoutube,
      facebook: user.socialFacebook,
      website: user.socialWebsite,
    },
    roleOrigin: "server_verified",
  } as const;
}

export const profileRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => serializeProfile(ctx.user, true)),

  consents: protectedProcedure.query(async ({ ctx }) => {
    const db = await requireDatabase();
    return listCurrentConsents(db, ctx.user.id);
  }),

  publicById: publicProcedure.input(z.object({ id: z.number().int().positive() })).query(async ({ input }) => {
    const db = await requireDatabase();
    const rows = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.id, input.id),
          eq(users.status, "active"),
          eq(users.profileVisibility, "public"),
        ),
      )
      .limit(1);
    return rows[0] && canReadProfile({
      viewerId: null,
      ownerId: rows[0].id,
      ownerStatus: rows[0].status,
      visibility: rows[0].profileVisibility,
    })
      ? serializeProfile(rows[0], false)
      : null;
  }),

  update: protectedProcedure
    .input(
      z.object({
        name: z.string().trim().min(1).max(160).nullable().optional(),
        username: z
          .string()
          .trim()
          .min(3)
          .max(32)
          .regex(/^[a-zA-Z0-9_.-]+$/)
          .nullable()
          .optional(),
        bio: z.string().trim().max(2_000).nullable().optional(),
        location: z.string().trim().max(128).nullable().optional(),
        locale: localeSchema.optional(),
        unitSystem: unitSystemSchema.optional(),
        profileVisibility: visibilitySchema.optional(),
        socialInstagram: socialUrl,
        socialTiktok: socialUrl,
        socialYoutube: socialUrl,
        socialFacebook: socialUrl,
        socialWebsite: socialUrl,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = await requireDatabase();
      if (input.profileVisibility === "public" && !(await hasCurrentConsent(db, ctx.user.id, "profile_publication"))) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "profile_publication_consent_required" });
      }

      await db.update(users).set(input).where(eq(users.id, ctx.user.id));
      const updated = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      if (!updated[0]) throw new TRPCError({ code: "NOT_FOUND", message: "profile_not_found" });
      return serializeProfile(updated[0], true);
    }),

  closeAccount: protectedProcedure
    .input(z.object({ confirmation: z.literal("LÖSCHEN") }))
    .mutation(async ({ ctx }) => {
      const db = await requireDatabase();
      await db.update(users).set({
        name: "Gelöschtes Konto",
        username: null,
        email: null,
        bio: null,
        location: null,
        socialInstagram: null,
        socialTiktok: null,
        socialYoutube: null,
        socialFacebook: null,
        socialWebsite: null,
        avatarUrl: null,
        avatarStorageKey: null,
        profileVisibility: "private",
        status: "banned",
      }).where(eq(users.id, ctx.user.id));
      return { success: true } as const;
    }),

  setConsent: protectedProcedure
    .input(
      z.object({
        purpose: consentPurposeSchema,
        policyVersion: z.string().trim().min(1).max(32),
        granted: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = await requireDatabase();
      await recordCurrentConsent(db, { userId: ctx.user.id, ...input });
      return { success: true } as const;
    }),

  uploadAvatar: protectedProcedure
    .input(z.object({ base64: z.string().min(1), mimeType: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDatabase();
      if (!(await hasCurrentConsent(db, ctx.user.id, "media_processing"))) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "media_processing_consent_required" });
      }

      const image = validateImageUpload(input.base64, input.mimeType);
      assertValidMediaContext({ kind: "avatar", observationId: null, postId: null });
      const stored = await storagePut(
        `users/${ctx.user.id}/avatars/avatar.${image.extension}`,
        image.buffer,
        image.mimeType,
      );
      await db.insert(mediaAssets).values({
        userId: ctx.user.id,
        kind: "avatar",
        mimeType: image.mimeType,
        byteSize: image.byteSize,
        accessUrl: stored.url,
        storageKey: stored.key,
        visibility: ctx.user.profileVisibility,
      });
      await db
        .update(users)
        .set({ avatarUrl: stored.url, avatarStorageKey: stored.key })
        .where(eq(users.id, ctx.user.id));

      return { accessUrl: await storageGetSignedUrl(stored.key) };
    }),
});
