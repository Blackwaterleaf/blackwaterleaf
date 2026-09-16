import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { knowledgeArticles } from "../../drizzle/schema";
import {
  BLACKWATERLEAF_CONTRACT_VERSION,
  evidenceStateSchema,
  knowledgeSourceSchema,
  localeSchema,
  observationRealmSchema,
} from "../../shared/blackwaterleaf-contract-v1";
import { publicProcedure, router, staffProcedure } from "../_core/trpc";
import { getDb } from "../db";

async function requireDatabase() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "database_unavailable" });
  return db;
}

function serializeArticle(article: typeof knowledgeArticles.$inferSelect) {
  return {
    contractVersion: BLACKWATERLEAF_CONTRACT_VERSION,
    id: String(article.id),
    slug: article.slug,
    locale: article.locale,
    title: article.title,
    excerpt: article.excerpt,
    realm: article.realm,
    evidenceState: article.evidenceState,
    sources: knowledgeSourceSchema.array().parse(article.sources),
    publishedAt: (article.publishedAt ?? article.updatedAt).toISOString(),
    updatedAt: article.updatedAt.toISOString(),
  } as const;
}

export const knowledgeRouter = router({
  listPublished: publicProcedure
    .input(
      z.object({
        locale: localeSchema,
        realm: observationRealmSchema.optional(),
        limit: z.number().int().min(1).max(50).default(20),
      }),
    )
    .query(async ({ input }) => {
      const db = await requireDatabase();
      const rows = await db
        .select()
        .from(knowledgeArticles)
        .where(
          input.realm
            ? and(
                eq(knowledgeArticles.isPublished, true),
                eq(knowledgeArticles.locale, input.locale),
                eq(knowledgeArticles.realm, input.realm),
              )
            : and(eq(knowledgeArticles.isPublished, true), eq(knowledgeArticles.locale, input.locale)),
        )
        .orderBy(desc(knowledgeArticles.updatedAt))
        .limit(input.limit);
      return rows.map(serializeArticle);
    }),

  createDraft: staffProcedure
    .input(
      z.object({
        slug: z.string().trim().min(1).max(160).regex(/^[a-z0-9-]+$/),
        locale: localeSchema,
        title: z.string().trim().min(1).max(200),
        excerpt: z.string().trim().min(1).max(500),
        content: z.string().trim().min(1).max(100_000),
        realm: observationRealmSchema.nullable(),
        evidenceState: evidenceStateSchema,
        sources: z.array(knowledgeSourceSchema).min(1).max(50),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await requireDatabase();
      const inserted = await db.insert(knowledgeArticles).values({ ...input, isPublished: false });
      return { id: String(inserted[0].insertId), status: "draft" } as const;
    }),
});
