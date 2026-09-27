import { TRPCError } from "@trpc/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import {
  aiIdentificationCorrections,
  auditLedgerEntries,
  assistantUsage,
  careEvents,
  careJournal,
  carePlans,
  careTasks,
  communityPosts,
  localAuthTokens,
  localCredentials,
  mediaAssets,
  observations,
  privateHabitats,
  smartDeviceConnections,
  smartDeviceMeasurements,
  userConsentCurrent,
  userConsentEvents,
  userConsents,
  userRoles,
  users,
} from "../../drizzle/schema";
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
import { assertSafetyGateAllows } from "../safetyGates";
import { appendAuditEntry } from "../auditLedger";

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
    location: includePrivate ? user.location : null,
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

async function countOwned(db: Awaited<ReturnType<typeof requireDatabase>>, table: any, userId: number) {
  const rows = await db.select({ count: sql<number>`count(*)` }).from(table).where(eq(table.userId, userId));
  return Number(rows[0]?.count ?? 0);
}

export const profileRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => serializeProfile(ctx.user, true)),

  consents: protectedProcedure.query(async ({ ctx }) => {
    const db = await requireDatabase();
    return listCurrentConsents(db, ctx.user.id);
  }),

  erasurePreview: protectedProcedure.query(async ({ ctx }) => {
    const db = await requireDatabase();
    const counts = {
      profile: 1,
      roles: await countOwned(db, userRoles, ctx.user.id),
      consents: await countOwned(db, userConsents, ctx.user.id),
      consentCurrent: await countOwned(db, userConsentCurrent, ctx.user.id),
      consentEvents: await countOwned(db, userConsentEvents, ctx.user.id),
      localCredentials: await countOwned(db, localCredentials, ctx.user.id),
      localAuthTokens: await countOwned(db, localAuthTokens, ctx.user.id),
      observations: await countOwned(db, observations, ctx.user.id),
      communityPosts: await countOwned(db, communityPosts, ctx.user.id),
      mediaAssets: await countOwned(db, mediaAssets, ctx.user.id),
      habitats: await countOwned(db, privateHabitats, ctx.user.id),
      smartDeviceConnections: await countOwned(db, smartDeviceConnections, ctx.user.id),
      smartDeviceMeasurements: await countOwned(db, smartDeviceMeasurements, ctx.user.id),
      assistantUsage: await countOwned(db, assistantUsage, ctx.user.id),
      aiCorrections: await countOwned(db, aiIdentificationCorrections, ctx.user.id),
    };
    return {
      status: "blocked_pending_ap05" as const,
      userId: String(ctx.user.id),
      counts,
      storageDeletion: "not_yet_executed" as const,
      auditRetention: "minimal_pseudonymous_record_required" as const,
    };
  }),

  exportData: protectedProcedure.query(async ({ ctx }) => {
    const db = await requireDatabase();
    await appendAuditEntry({ actorId: ctx.user.id, action: "account_export_created", targetType: "user", targetId: ctx.user.id, payload: { exportVersion: "blackwaterleaf-account-export-v1", includesSecrets: false } });
    const owned = async (table: any) => db.select().from(table).where(eq(table.userId, ctx.user.id));
    const [habitats, observationsRows, community, media, plans, tasks, events, journal, consents, smartConnections, smartMeasurements, assistant, corrections] = await Promise.all([
      owned(privateHabitats), owned(observations), owned(communityPosts), owned(mediaAssets), owned(carePlans), owned(careTasks), owned(careEvents), owned(careJournal),
      owned(userConsentEvents), owned(smartDeviceConnections), owned(smartDeviceMeasurements), owned(assistantUsage), owned(aiIdentificationCorrections),
    ]);
    const exportHistory = await db
      .select({ id: auditLedgerEntries.id, createdAt: auditLedgerEntries.createdAt })
      .from(auditLedgerEntries)
      .where(and(eq(auditLedgerEntries.actorId, ctx.user.id), eq(auditLedgerEntries.action, "account_export_created"), eq(auditLedgerEntries.targetType, "user"), eq(auditLedgerEntries.targetId, ctx.user.id)))
      .orderBy(desc(auditLedgerEntries.createdAt))
      .limit(10);
    return {
      exportVersion: "blackwaterleaf-account-export-v1",
      generatedAt: new Date().toISOString(),
      exportHistory: exportHistory.map(entry => ({ id: entry.id, createdAt: entry.createdAt.toISOString() })),
      profile: await serializeProfile(ctx.user, true),
      datasets: {
        habitats, observations: observationsRows, communityPosts: community,
        mediaAssets: media.map(item => ({ ...item, storageKey: undefined, accessUrl: undefined })),
        carePlans: plans, careTasks: tasks, careEvents: events, careJournal: journal,
        consentEvents: consents, smartDeviceConnections: smartConnections, smartDeviceMeasurements: smartMeasurements,
        assistantUsage: assistant, aiCorrections: corrections,
      },
      deletion: { accountStatus: "active", storageObjects: "not_included", note: "Eigene Daten und Medienmetadaten; geheime Storage-Schlüssel sind ausgeschlossen." },
    } as const;
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

  publicPosts: publicProcedure.input(z.object({ userId: z.number().int().positive(), limit: z.number().int().min(1).max(30).default(12) })).query(async ({ input }) => {
    const db = await requireDatabase();
    const posts = await db
      .select({ id: communityPosts.id, content: communityPosts.content, realm: communityPosts.realm, createdAt: communityPosts.createdAt, updatedAt: communityPosts.updatedAt })
      .from(communityPosts)
      .innerJoin(users, eq(communityPosts.userId, users.id))
      .where(and(
        eq(communityPosts.userId, input.userId),
        eq(users.status, "active"),
        eq(users.profileVisibility, "public"),
        eq(communityPosts.status, "published"),
        eq(communityPosts.visibility, "public"),
      ))
      .orderBy(desc(communityPosts.createdAt))
      .limit(input.limit);
    return Promise.all(posts.map(async post => ({
      ...post,
      media: await Promise.all((await db.select({ id: mediaAssets.id, kind: mediaAssets.kind, mimeType: mediaAssets.mimeType, storageKey: mediaAssets.storageKey }).from(mediaAssets).where(and(eq(mediaAssets.postId, post.id), eq(mediaAssets.userId, input.userId), eq(mediaAssets.visibility, "public")))).map(async media => ({ id: String(media.id), kind: media.kind, mimeType: media.mimeType, url: await storageGetSignedUrl(media.storageKey).catch(() => null) }))),
    })));
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
      assertSafetyGateAllows("accountErasure");
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
      assertSafetyGateAllows("mediaUpload");
      const db = await requireDatabase();
      if (!(await hasCurrentConsent(db, ctx.user.id, "media_processing"))) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "media_processing_consent_required" });
      }

      const image = validateImageUpload(input.base64, input.mimeType);
      assertValidMediaContext({ kind: "avatar", observationId: null, postId: null, habitatId: null });
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
