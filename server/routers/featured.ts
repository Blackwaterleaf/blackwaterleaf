/**
 * featured — Werbe-/Promo-Accounts (Werbeträger).
 *
 * Admin-verwaltete Einträge, die auf EXTERNE Profile verlinken
 * (Instagram, TikTok, Facebook, WhatsApp, YouTube, Website).
 *
 *  - public:  listHome  → "Account des Tages" (showOnHome, aktiv)
 *  - public:  listCommunity → Promo-Leiste im Community-Bereich (showInCommunity, aktiv)
 *  - admin:   listAll / create / update / remove / uploadImage
 *
 * Für Familie/Freunde kostenlos vom Admin gepflegt; bezahlte Fremd-Werbung (isPaid)
 * ist als Feld vorbereitet, der Buchungs-/Zahlungsflow folgt in V2.
 */

import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "../db";
import { featuredAccounts } from "../../drizzle/schema";
import { eq, and, asc, desc } from "drizzle-orm";
import { storagePut } from "../storage";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin-Rechte erforderlich." });
  }
  return next({ ctx });
});

const platformEnum = z.enum(["instagram", "tiktok", "facebook", "whatsapp", "youtube", "website"]);

export const featuredRouter = router({
  /** Öffentlich: hervorgehobener Account für die Startseite ("Account des Tages"). */
  listHome: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(featuredAccounts)
      .where(and(eq(featuredAccounts.active, true), eq(featuredAccounts.showOnHome, true)))
      .orderBy(asc(featuredAccounts.sortOrder), desc(featuredAccounts.createdAt))
      .limit(1);
  }),

  /** Öffentlich: Promo-Leiste im Community-Bereich (mehrere Accounts nebeneinander). */
  listCommunity: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(featuredAccounts)
      .where(and(eq(featuredAccounts.active, true), eq(featuredAccounts.showInCommunity, true)))
      .orderBy(asc(featuredAccounts.sortOrder), desc(featuredAccounts.createdAt))
      .limit(6);
  }),

  /** Admin: alle Einträge (auch inaktive) verwalten. */
  listAll: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(featuredAccounts)
      .orderBy(asc(featuredAccounts.sortOrder), desc(featuredAccounts.createdAt));
  }),

  /** Admin: Bild hochladen (S3), gibt url + key zurück. */
  uploadImage: adminProcedure
    .input(z.object({ base64: z.string(), mimeType: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const buffer = Buffer.from(input.base64, "base64");
      const ext = (input.mimeType.split("/")[1] ?? "jpg").replace("jpeg", "jpg");
      const key = `featured/${ctx.user.id}-${Date.now()}.${ext}`;
      const { url } = await storagePut(key, buffer, input.mimeType);
      return { url, key };
    }),

  /** Admin: neuen Promo-Eintrag anlegen. */
  create: adminProcedure
    .input(z.object({
      name: z.string().min(1).max(120),
      tagline: z.string().max(160).optional().nullable(),
      platform: platformEnum,
      url: z.string().url().max(2000),
      imageUrl: z.string().url().optional().nullable(),
      imageKey: z.string().optional().nullable(),
      showOnHome: z.boolean().default(false),
      showInCommunity: z.boolean().default(true),
      active: z.boolean().default(true),
      sortOrder: z.number().int().default(0),
      isPaid: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });
      const [res] = await db.insert(featuredAccounts).values({
        ...input,
        tagline: input.tagline ?? null,
        imageUrl: input.imageUrl ?? null,
        imageKey: input.imageKey ?? null,
        createdBy: ctx.user.id,
      });
      return { success: true, id: (res as any)?.insertId ?? null };
    }),

  /** Admin: Eintrag bearbeiten. */
  update: adminProcedure
    .input(z.object({
      id: z.number().int(),
      name: z.string().min(1).max(120).optional(),
      tagline: z.string().max(160).optional().nullable(),
      platform: platformEnum.optional(),
      url: z.string().url().max(2000).optional(),
      imageUrl: z.string().url().optional().nullable(),
      imageKey: z.string().optional().nullable(),
      showOnHome: z.boolean().optional(),
      showInCommunity: z.boolean().optional(),
      active: z.boolean().optional(),
      sortOrder: z.number().int().optional(),
      isPaid: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });
      const { id, ...rest } = input;
      await db.update(featuredAccounts).set({ ...rest, updatedAt: new Date() }).where(eq(featuredAccounts.id, id));
      return { success: true };
    }),

  /** Admin: Eintrag löschen. */
  remove: adminProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB not available" });
      await db.delete(featuredAccounts).where(eq(featuredAccounts.id, input.id));
      return { success: true };
    }),
});
