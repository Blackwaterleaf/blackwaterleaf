import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, like, lt, notInArray, or, sql } from "drizzle-orm";
import { z } from "zod";
import { aquariumTaxa, communityPosts, knowledgeArticles, partnerProfiles, partnerProducts, plantTaxa, terrariumTaxa, userBlocks, users } from "../../drizzle/schema";
import { evidenceStateSchema, localeSchema, observationRealmSchema } from "../../shared/blackwaterleaf-contract-v1";
import { belongsToOfficialMediaSource, belongsToOfficialSource, isCommerciallyReusableCatalogImageLicense, isDisallowedCatalogSource, isOfficialTaxonSourceUrl, isStoredCatalogueTaxonImage, isVerifiedOpenCatalogueMediaSource, officialTaxonSource } from "../../shared/taxon-source-policy";
import { publicProcedure, router, staffProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { cachedPublicQuery } from "../publicQueryCache";

const searchKindSchema = z.enum(["all", "plant", "aquarium", "knowledge", "profile", "community", "product"]);
const taxaRecordSchema = z.object({
  sourceRecordId: z.string().trim().min(1).max(160),
  sourceRecordUrl: z.string().url().max(1_000).nullable().optional(),
  sourceLicense: z.string().trim().max(128).nullable().optional(),
  sourceCitation: z.string().trim().max(10_000).nullable().optional(),
  sourceRetrievedAt: z.coerce.date().nullable().optional(),
  taxonomicStatus: z.string().trim().max(48).nullable().optional(),
  matchConfidence: z.number().int().min(0).max(100).nullable().optional(),
  scientificName: z.string().trim().min(1).max(240),
  acceptedScientificName: z.string().trim().max(240).nullable().optional(),
  rank: z.string().trim().max(48).nullable().optional(),
  family: z.string().trim().max(160).nullable().optional(),
  genus: z.string().trim().max(160).nullable().optional(),
  commonNames: z.array(z.string().trim().min(1).max(160)).max(50).default([]),
  synonyms: z.array(z.string().trim().min(1).max(240)).max(100).default([]),
  summary: z.string().trim().max(10_000).nullable().optional(),
  careProfile: z.record(z.string(), z.unknown()).nullable().optional(),
  imageUrl: z.string().max(1_000).refine(value => value.startsWith("/manus-storage/") || z.string().url().safeParse(value).success, "invalid_image_url").nullable().optional(),
  imageSourceUrl: z.string().url().max(1_000).nullable().optional(),
  imageLicense: z.string().trim().max(128).nullable().optional(),
  imageAttribution: z.string().trim().max(2_000).nullable().optional(),
  evidenceState: evidenceStateSchema.default("confirmed"),
});

function assertApprovedMediaSource(source: string, records: Array<z.infer<typeof taxaRecordSchema>>, publish: boolean) {
  const configuredSource = officialTaxonSource(source);
  const values = [source, ...records.flatMap(record => [record.imageUrl, record.imageSourceUrl, record.imageAttribution, record.imageLicense])];
  if (values.some(isDisallowedCatalogSource)) {
    throw new TRPCError({ code: "PRECONDITION_FAILED", message: "disallowed_media_source" });
  }
  if (publish && !configuredSource) {
    throw new TRPCError({ code: "PRECONDITION_FAILED", message: "official_taxon_source_required" });
  }
  for (const record of records) {
    if (publish && (!record.sourceRecordUrl || !record.sourceLicense || !record.sourceCitation || !record.sourceRetrievedAt)) {
      throw new TRPCError({ code: "PRECONDITION_FAILED", message: "taxon_source_provenance_required" });
    }
    if (record.sourceRecordUrl && (!configuredSource || !isOfficialTaxonSourceUrl(record.sourceRecordUrl) || !belongsToOfficialSource(source, record.sourceRecordUrl))) {
      throw new TRPCError({ code: "PRECONDITION_FAILED", message: "unapproved_taxon_source" });
    }
    if (!record.imageUrl && !record.imageSourceUrl) continue;
    if (!configuredSource || !record.imageUrl || !record.imageSourceUrl) {
      throw new TRPCError({ code: "PRECONDITION_FAILED", message: "official_taxon_source_required" });
    }
    const verifiedOpenCataloguePhoto = isStoredCatalogueTaxonImage(record.imageUrl)
      && isVerifiedOpenCatalogueMediaSource(record.imageSourceUrl)
      && record.imageAttribution?.includes("iNaturalist photo #");
    const officialSourcePhoto = isOfficialTaxonSourceUrl(record.imageSourceUrl)
      && belongsToOfficialMediaSource(source, record.imageUrl)
      && belongsToOfficialSource(source, record.imageSourceUrl);
    if (!verifiedOpenCataloguePhoto && !officialSourcePhoto) {
      throw new TRPCError({ code: "PRECONDITION_FAILED", message: "unapproved_media_source" });
    }
    if (publish && !isCommerciallyReusableCatalogImageLicense(record.imageLicense)) {
      throw new TRPCError({ code: "PRECONDITION_FAILED", message: "catalog_image_license_not_reusable" });
    }
  }
}

async function requireDatabase() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "database_unavailable" });
  return db;
}

function cursorValue(cursor: string | undefined) {
  if (!cursor) return undefined;
  const value = Number(cursor);
  if (!Number.isSafeInteger(value) || value <= 0) throw new TRPCError({ code: "BAD_REQUEST", message: "invalid_search_cursor" });
  return value;
}

export const searchRouter = router({
  unified: publicProcedure
    .input(z.object({
      q: z.string().trim().min(1).max(120),
      kind: searchKindSchema.default("all"),
      locale: localeSchema.default("de"),
      realm: observationRealmSchema.optional(),
      cursor: z.string().optional(),
      limit: z.number().int().min(1).max(30).default(12),
    }))
    .query(async ({ ctx, input }) => {
      const db = await requireDatabase();
      const match = `%${input.q}%`;
      const cursor = cursorValue(input.cursor);
      const wants = (kind: z.infer<typeof searchKindSchema>) => input.kind === "all" || input.kind === kind;
      const result = {
        taxa: [] as Array<Record<string, unknown>>,
        aquarium: [] as Array<Record<string, unknown>>,
        knowledge: [] as Array<Record<string, unknown>>,
        profiles: [] as Array<Record<string, unknown>>,
        community: [] as Array<Record<string, unknown>>,
        products: [] as Array<Record<string, unknown>>,
        nextCursor: null as string | null,
      };

      if (wants("plant")) {
        const rows = await db.select({
          id: plantTaxa.id,
          scientificName: plantTaxa.scientificName,
          acceptedScientificName: plantTaxa.acceptedScientificName,
          rank: plantTaxa.rank,
          family: plantTaxa.family,
          genus: plantTaxa.genus,
          commonNames: plantTaxa.commonNames,
          summary: plantTaxa.summary,
          imageUrl: plantTaxa.imageUrl,
          imageSourceUrl: plantTaxa.imageSourceUrl,
          imageLicense: plantTaxa.imageLicense,
          imageAttribution: plantTaxa.imageAttribution,
          imageVerifiedAt: plantTaxa.imageVerifiedAt,
          evidenceState: plantTaxa.evidenceState,
        }).from(plantTaxa).where(and(
          eq(plantTaxa.status, "published"),
          input.realm && input.realm !== "botany" ? sql`1 = 0` : undefined,
          cursor ? lt(plantTaxa.id, cursor) : undefined,
          or(
            like(plantTaxa.scientificName, match),
            like(plantTaxa.acceptedScientificName, match),
            like(plantTaxa.family, match),
            like(plantTaxa.genus, match),
            like(plantTaxa.summary, match),
            sql`JSON_SEARCH(${plantTaxa.commonNames}, 'one', ${input.q}, NULL, '$[*]') IS NOT NULL`,
            sql`JSON_SEARCH(${plantTaxa.synonyms}, 'one', ${input.q}, NULL, '$[*]') IS NOT NULL`,
          ),
        )).orderBy(desc(plantTaxa.id)).limit(input.limit);
        result.taxa = rows.map(row => ({ ...row, type: "plant" as const, id: String(row.id) }));
        if (rows.length === input.limit) result.nextCursor = String(rows[rows.length - 1].id);
      }

      if (wants("aquarium")) {
        const rows = await db.select({
          id: aquariumTaxa.id,
          scientificName: aquariumTaxa.scientificName,
          acceptedScientificName: aquariumTaxa.acceptedScientificName,
          rank: aquariumTaxa.rank,
          family: aquariumTaxa.family,
          genus: aquariumTaxa.genus,
          commonNames: aquariumTaxa.commonNames,
          summary: aquariumTaxa.summary,
          imageUrl: aquariumTaxa.imageUrl,
          imageSourceUrl: aquariumTaxa.imageSourceUrl,
          imageLicense: aquariumTaxa.imageLicense,
          imageAttribution: aquariumTaxa.imageAttribution,
          imageVerifiedAt: aquariumTaxa.imageVerifiedAt,
          evidenceState: aquariumTaxa.evidenceState,
        }).from(aquariumTaxa).where(and(
          eq(aquariumTaxa.status, "published"),
          input.realm && input.realm !== "aquarium" ? sql`1 = 0` : undefined,
          cursor ? lt(aquariumTaxa.id, cursor) : undefined,
          or(
            like(aquariumTaxa.scientificName, match),
            like(aquariumTaxa.acceptedScientificName, match),
            like(aquariumTaxa.family, match),
            like(aquariumTaxa.genus, match),
            like(aquariumTaxa.summary, match),
            sql`JSON_SEARCH(${aquariumTaxa.commonNames}, 'one', ${input.q}, NULL, '$[*]') IS NOT NULL`,
            sql`JSON_SEARCH(${aquariumTaxa.synonyms}, 'one', ${input.q}, NULL, '$[*]') IS NOT NULL`,
          ),
        )).orderBy(desc(aquariumTaxa.id)).limit(input.limit);
        result.aquarium = rows.map(row => ({ ...row, type: "aquarium" as const, id: String(row.id) }));
        if (rows.length === input.limit) result.nextCursor = String(rows[rows.length - 1].id);
      }

      if (wants("knowledge")) {
        result.knowledge = await cachedPublicQuery(
          `search:knowledge:${input.locale}:${input.realm ?? "all"}:${input.q.toLocaleLowerCase("de-DE")}:${input.limit}`,
          async () => {
            const rows = await db.select({ id: knowledgeArticles.id, slug: knowledgeArticles.slug, title: knowledgeArticles.title, excerpt: knowledgeArticles.excerpt, realm: knowledgeArticles.realm, evidenceState: knowledgeArticles.evidenceState }).from(knowledgeArticles).where(and(
              eq(knowledgeArticles.isPublished, true),
              eq(knowledgeArticles.locale, input.locale),
              input.realm ? eq(knowledgeArticles.realm, input.realm) : undefined,
              or(like(knowledgeArticles.title, match), like(knowledgeArticles.excerpt, match), like(knowledgeArticles.content, match)),
            )).orderBy(desc(knowledgeArticles.updatedAt)).limit(input.limit);
            return rows.map(row => ({ ...row, type: "knowledge" as const, id: String(row.id) }));
          },
        );
      }

      if (wants("profile")) {
        const rows = await db.select({ id: users.id, name: users.name, username: users.username, bio: users.bio, avatarUrl: users.avatarUrl }).from(users).where(and(
          eq(users.status, "active"),
          eq(users.profileVisibility, "public"),
          or(like(users.name, match), like(users.username, match), like(users.bio, match)),
        )).orderBy(desc(users.updatedAt)).limit(input.limit);
        result.profiles = rows.map(row => ({ ...row, type: "profile" as const, id: String(row.id) }));
      }

      if (wants("community")) {
        if (ctx.user) {
          const viewerId = ctx.user.id;
          const blockedIds = (await db.select({ blockerId: userBlocks.blockerId, blockedId: userBlocks.blockedId }).from(userBlocks).where(or(eq(userBlocks.blockerId, viewerId), eq(userBlocks.blockedId, viewerId)))).map(item => item.blockerId === viewerId ? item.blockedId : item.blockerId);
          const rows = await db.select({ id: communityPosts.id, content: communityPosts.content, realm: communityPosts.realm, userId: communityPosts.userId, createdAt: communityPosts.createdAt }).from(communityPosts).where(and(
            eq(communityPosts.status, "published"),
            eq(communityPosts.visibility, "public"),
            input.realm ? eq(communityPosts.realm, input.realm) : undefined,
            blockedIds.length ? notInArray(communityPosts.userId, blockedIds) : undefined,
            like(communityPosts.content, match),
          )).orderBy(desc(communityPosts.createdAt)).limit(input.limit);
          result.community = rows.map(row => ({ ...row, type: "community" as const, id: String(row.id) }));
        }
      }

      if (wants("product")) {
        const rows = await db.select({ id: partnerProducts.id, title: partnerProducts.title, description: partnerProducts.description, priceLabel: partnerProducts.priceLabel, destinationUrl: partnerProducts.destinationUrl, partnerName: partnerProfiles.displayName }).from(partnerProducts).innerJoin(partnerProfiles, eq(partnerProducts.partnerId, partnerProfiles.id)).where(and(
          eq(partnerProducts.status, "active"),
          eq(partnerProfiles.status, "approved"),
          or(like(partnerProducts.title, match), like(partnerProducts.description, match), like(partnerProducts.marketplaceCategory, match), like(partnerProducts.productType, match)),
        )).orderBy(desc(partnerProducts.updatedAt)).limit(input.limit);
        result.products = rows.map(row => ({ ...row, type: "product" as const, id: String(row.id) }));
      }

      return result;
    }),

  catalogByRealm: publicProcedure
    .input(z.object({ realm: observationRealmSchema, limit: z.number().int().min(1).max(200).default(8) }))
    .query(async ({ input }) => {
      const db = await requireDatabase();
      if (input.realm === "terrarium") {
        const rows = await db.select({
          id: terrariumTaxa.id,
          scientificName: terrariumTaxa.scientificName,
          acceptedScientificName: terrariumTaxa.acceptedScientificName,
          commonNames: terrariumTaxa.commonNames,
          family: terrariumTaxa.family,
          genus: terrariumTaxa.genus,
          imageUrl: terrariumTaxa.imageUrl,
          imageSourceUrl: terrariumTaxa.imageSourceUrl,
          imageLicense: terrariumTaxa.imageLicense,
          imageAttribution: terrariumTaxa.imageAttribution,
          imageVerifiedAt: terrariumTaxa.imageVerifiedAt,
          evidenceState: terrariumTaxa.evidenceState,
        }).from(terrariumTaxa).where(eq(terrariumTaxa.status, "published")).orderBy(desc(sql`CASE WHEN ${terrariumTaxa.imageUrl} IS NOT NULL AND ${terrariumTaxa.imageSourceUrl} IS NOT NULL AND ${terrariumTaxa.imageAttribution} IS NOT NULL THEN 1 ELSE 0 END`), asc(terrariumTaxa.acceptedScientificName), asc(terrariumTaxa.scientificName)).limit(input.limit);
        return rows.map(row => ({ ...row, type: "terrarium" as const, id: String(row.id) }));
      }
      if (input.realm === "botany") {
        const rows = await db.select({
          id: plantTaxa.id,
          scientificName: plantTaxa.scientificName,
          acceptedScientificName: plantTaxa.acceptedScientificName,
          commonNames: plantTaxa.commonNames,
          family: plantTaxa.family,
          genus: plantTaxa.genus,
          careProfile: plantTaxa.careProfile,
          imageUrl: plantTaxa.imageUrl,
          imageSourceUrl: plantTaxa.imageSourceUrl,
          imageLicense: plantTaxa.imageLicense,
          imageAttribution: plantTaxa.imageAttribution,
          imageVerifiedAt: plantTaxa.imageVerifiedAt,
          evidenceState: plantTaxa.evidenceState,
        }).from(plantTaxa).where(eq(plantTaxa.status, "published")).orderBy(desc(sql`CASE WHEN ${plantTaxa.imageUrl} IS NOT NULL AND ${plantTaxa.imageSourceUrl} IS NOT NULL AND ${plantTaxa.imageAttribution} IS NOT NULL THEN 1 ELSE 0 END`), asc(plantTaxa.acceptedScientificName), asc(plantTaxa.scientificName)).limit(input.limit);
        return rows.map(row => ({ ...row, type: "plant" as const, id: String(row.id) }));
      }
      const rows = await db.select({
        id: aquariumTaxa.id,
          scientificName: aquariumTaxa.scientificName,
          acceptedScientificName: aquariumTaxa.acceptedScientificName,
          commonNames: aquariumTaxa.commonNames,
          family: aquariumTaxa.family,
        imageUrl: aquariumTaxa.imageUrl,
        imageSourceUrl: aquariumTaxa.imageSourceUrl,
        imageLicense: aquariumTaxa.imageLicense,
        imageAttribution: aquariumTaxa.imageAttribution,
        imageVerifiedAt: aquariumTaxa.imageVerifiedAt,
        evidenceState: aquariumTaxa.evidenceState,
      }).from(aquariumTaxa).where(eq(aquariumTaxa.status, "published")).orderBy(desc(sql`CASE WHEN ${aquariumTaxa.imageUrl} IS NOT NULL AND ${aquariumTaxa.imageSourceUrl} IS NOT NULL AND ${aquariumTaxa.imageAttribution} IS NOT NULL THEN 1 ELSE 0 END`), asc(aquariumTaxa.acceptedScientificName), asc(aquariumTaxa.scientificName)).limit(input.limit);
      return rows.map(row => ({ ...row, type: "aquarium" as const, id: String(row.id) }));
    }),

  plantById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await requireDatabase();
      const rows = await db.select().from(plantTaxa).where(and(eq(plantTaxa.id, input.id), eq(plantTaxa.status, "published"))).limit(1);
      return rows[0] ?? null;
    }),

  aquariumById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await requireDatabase();
      const rows = await db.select().from(aquariumTaxa).where(and(eq(aquariumTaxa.id, input.id), eq(aquariumTaxa.status, "published"))).limit(1);
      return rows[0] ?? null;
    }),
  terrariumById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await requireDatabase();
      const rows = await db.select().from(terrariumTaxa).where(and(eq(terrariumTaxa.id, input.id), eq(terrariumTaxa.status, "published"))).limit(1);
      return rows[0] ?? null;
    }),

  importValidatedTaxa: staffProcedure
    .input(z.object({
      source: z.string().trim().min(1).max(96),
      sourceVersion: z.string().trim().min(1).max(96),
      records: z.array(taxaRecordSchema).min(1).max(5_000),
      publish: z.boolean().default(false),
    }))
    .mutation(async ({ input }) => {
      assertApprovedMediaSource(input.source, input.records, input.publish);
      if (input.publish && input.records.some(record => (record.imageUrl || record.imageSourceUrl || record.imageLicense || record.imageAttribution) && (!record.imageUrl || !record.imageSourceUrl || !record.imageLicense || !record.imageAttribution))) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "published_taxon_image_provenance_required" });
      }
      const db = await requireDatabase();
      for (const record of input.records) {
        await db.insert(plantTaxa).values({
          source: input.source,
          sourceVersion: input.sourceVersion,
          sourceRecordId: record.sourceRecordId,
          sourceRecordUrl: record.sourceRecordUrl ?? null,
          sourceLicense: record.sourceLicense ?? null,
          sourceCitation: record.sourceCitation ?? null,
          sourceRetrievedAt: record.sourceRetrievedAt ?? null,
          taxonomicStatus: record.taxonomicStatus ?? null,
          matchConfidence: record.matchConfidence ?? null,
          scientificName: record.scientificName,
          acceptedScientificName: record.acceptedScientificName ?? null,
          rank: record.rank ?? null,
          family: record.family ?? null,
          genus: record.genus ?? null,
          commonNames: record.commonNames,
          synonyms: record.synonyms,
          summary: record.summary ?? null,
          careProfile: record.careProfile ?? null,
          imageUrl: record.imageUrl ?? null,
          imageSourceUrl: record.imageSourceUrl ?? null,
          imageLicense: record.imageLicense ?? null,
          imageAttribution: record.imageAttribution ?? null,
          imageVerifiedAt: input.publish ? new Date() : null,
          evidenceState: record.evidenceState,
          status: input.publish ? "published" : "draft",
        }).onDuplicateKeyUpdate({ set: { updatedAt: new Date() } });
      }
      return { imported: input.records.length, source: input.source, sourceVersion: input.sourceVersion, status: input.publish ? "published" : "draft" } as const;
    }),

  importValidatedAquariumTaxa: staffProcedure
    .input(z.object({
      source: z.string().trim().min(1).max(96),
      sourceVersion: z.string().trim().min(1).max(96),
      records: z.array(taxaRecordSchema).min(1).max(5_000),
      publish: z.boolean().default(false),
    }))
    .mutation(async ({ input }) => {
      assertApprovedMediaSource(input.source, input.records, input.publish);
      if (input.publish && input.records.some(record => (record.imageUrl || record.imageSourceUrl || record.imageLicense || record.imageAttribution) && (!record.imageUrl || !record.imageSourceUrl || !record.imageLicense || !record.imageAttribution))) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "published_taxon_image_provenance_required" });
      }
      const db = await requireDatabase();
      for (const record of input.records) {
        await db.insert(aquariumTaxa).values({
          source: input.source,
          sourceVersion: input.sourceVersion,
          sourceRecordId: record.sourceRecordId,
          sourceRecordUrl: record.sourceRecordUrl ?? null,
          sourceLicense: record.sourceLicense ?? null,
          sourceCitation: record.sourceCitation ?? null,
          sourceRetrievedAt: record.sourceRetrievedAt ?? null,
          taxonomicStatus: record.taxonomicStatus ?? null,
          matchConfidence: record.matchConfidence ?? null,
          scientificName: record.scientificName,
          acceptedScientificName: record.acceptedScientificName ?? null,
          rank: record.rank ?? null,
          family: record.family ?? null,
          genus: record.genus ?? null,
          commonNames: record.commonNames,
          synonyms: record.synonyms,
          summary: record.summary ?? null,
          careProfile: record.careProfile ?? null,
          imageUrl: record.imageUrl ?? null,
          imageSourceUrl: record.imageSourceUrl ?? null,
          imageLicense: record.imageLicense ?? null,
          imageAttribution: record.imageAttribution ?? null,
          imageVerifiedAt: input.publish ? new Date() : null,
          evidenceState: record.evidenceState,
          status: input.publish ? "published" : "draft",
        }).onDuplicateKeyUpdate({ set: { updatedAt: new Date() } });
      }
      return { imported: input.records.length, source: input.source, sourceVersion: input.sourceVersion, status: input.publish ? "published" : "draft" } as const;
    }),
  importValidatedTerrariumTaxa: staffProcedure
    .input(z.object({
      source: z.string().trim().min(1).max(96),
      sourceVersion: z.string().trim().min(1).max(96),
      records: z.array(taxaRecordSchema).min(1).max(5_000),
      publish: z.boolean().default(false),
    }))
    .mutation(async ({ input }) => {
      assertApprovedMediaSource(input.source, input.records, input.publish);
      if (input.publish && input.records.some(record => (record.imageUrl || record.imageSourceUrl || record.imageLicense || record.imageAttribution) && (!record.imageUrl || !record.imageSourceUrl || !record.imageLicense || !record.imageAttribution))) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "published_taxon_image_provenance_required" });
      }
      const db = await requireDatabase();
      for (const record of input.records) {
        await db.insert(terrariumTaxa).values({
          source: input.source,
          sourceVersion: input.sourceVersion,
          sourceRecordId: record.sourceRecordId,
          sourceRecordUrl: record.sourceRecordUrl ?? null,
          sourceLicense: record.sourceLicense ?? null,
          sourceCitation: record.sourceCitation ?? null,
          sourceRetrievedAt: record.sourceRetrievedAt ?? null,
          taxonomicStatus: record.taxonomicStatus ?? null,
          matchConfidence: record.matchConfidence ?? null,
          scientificName: record.scientificName,
          acceptedScientificName: record.acceptedScientificName ?? null,
          rank: record.rank ?? null,
          family: record.family ?? null,
          genus: record.genus ?? null,
          commonNames: record.commonNames,
          synonyms: record.synonyms,
          summary: record.summary ?? null,
          careProfile: record.careProfile ?? null,
          imageUrl: record.imageUrl ?? null,
          imageSourceUrl: record.imageSourceUrl ?? null,
          imageLicense: record.imageLicense ?? null,
          imageAttribution: record.imageAttribution ?? null,
          imageVerifiedAt: input.publish ? new Date() : null,
          evidenceState: record.evidenceState,
          status: input.publish ? "published" : "draft",
        }).onDuplicateKeyUpdate({ set: { updatedAt: new Date() } });
      }
      return { imported: input.records.length, source: input.source, sourceVersion: input.sourceVersion, status: input.publish ? "published" : "draft" } as const;
    }),
});
