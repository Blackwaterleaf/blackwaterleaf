import { createHash, randomBytes } from "node:crypto";
import { and, desc, eq, gt, isNull, lt, or, sql } from "drizzle-orm";
import { z } from "zod";
import { accountEntitlements, promoCodeRedemptions, promoCodes, xpEvents } from "../../drizzle/schema";
import { appendAuditEntry } from "../auditLedger";
import { getDb } from "../db";
import { getProAccess } from "../entitlements";
import { adminProcedure, protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";

const DURATION_DAYS = {
  week_1: 7,
  week_2: 14,
  month_1: 30,
  month_2: 60,
} as const;

const codeAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

async function requireDatabase() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "database_unavailable" });
  return db;
}

function normalizeCode(value: string) {
  return value.trim().toUpperCase().replace(/[\s-]/g, "");
}

function digestCode(value: string) {
  return createHash("sha256").update(normalizeCode(value), "utf8").digest("hex");
}

function createPlainCode() {
  const bytes = randomBytes(12);
  let value = "";
  for (let index = 0; index < bytes.length; index += 1) value += codeAlphabet[bytes[index] % codeAlphabet.length];
  return `BWL-${value.slice(0, 4)}-${value.slice(4, 8)}-${value.slice(8, 12)}`;
}

function addDays(from: Date, days: number) {
  return new Date(from.getTime() + days * 24 * 60 * 60 * 1000);
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export const promoCodesRouter = router({
  redeem: protectedProcedure
    .input(z.object({ code: z.string().trim().min(8).max(64) }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDatabase();
      const digest = digestCode(input.code);
      try {
        const result = await db.transaction(async tx => {
          const [code] = await tx.select().from(promoCodes).where(eq(promoCodes.codeDigest, digest)).limit(1);
          if (!code) throw new TRPCError({ code: "NOT_FOUND", message: "promo_code_invalid" });
          const now = new Date();
          if (code.revokedAt) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "promo_code_revoked" });
          if (code.expiresAt && code.expiresAt.getTime() <= now.getTime()) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "promo_code_expired" });
          if (code.redemptionCount >= code.maxRedemptions) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "promo_code_limit_reached" });

          const existing = await tx.select({ id: promoCodeRedemptions.id }).from(promoCodeRedemptions).where(and(eq(promoCodeRedemptions.promoCodeId, code.id), eq(promoCodeRedemptions.userId, ctx.user.id))).limit(1);
          if (existing[0]) throw new TRPCError({ code: "CONFLICT", message: "promo_code_already_redeemed" });

          const incremented = await tx.update(promoCodes)
            .set({ redemptionCount: sql`${promoCodes.redemptionCount} + 1` })
            .where(and(
              eq(promoCodes.id, code.id),
              lt(promoCodes.redemptionCount, promoCodes.maxRedemptions),
              isNull(promoCodes.revokedAt),
              or(isNull(promoCodes.expiresAt), gt(promoCodes.expiresAt, now)),
            ));
          if (Number(incremented[0].affectedRows) !== 1) throw new TRPCError({ code: "CONFLICT", message: "promo_code_limit_reached" });

          const currentGrant = await tx.select({ status: accountEntitlements.status, expiresAt: accountEntitlements.expiresAt })
            .from(accountEntitlements)
            .where(and(eq(accountEntitlements.userId, ctx.user.id), eq(accountEntitlements.featureKey, "pro_override")))
            .limit(1);
          const entitlementExpiresAt = addDays(now, code.premiumDays);
          const currentExpiry = currentGrant[0]?.expiresAt;
          const effectiveExpiry = currentExpiry && currentExpiry.getTime() > entitlementExpiresAt.getTime() ? currentExpiry : entitlementExpiresAt;
          if (currentGrant[0]) {
            await tx.update(accountEntitlements).set({ status: "active", grantedByUserId: ctx.user.id, expiresAt: effectiveExpiry }).where(and(eq(accountEntitlements.userId, ctx.user.id), eq(accountEntitlements.featureKey, "pro_override")));
          } else {
            await tx.insert(accountEntitlements).values({ userId: ctx.user.id, featureKey: "pro_override", status: "active", grantedByUserId: ctx.user.id, expiresAt: effectiveExpiry });
          }

          await tx.insert(promoCodeRedemptions).values({ promoCodeId: code.id, userId: ctx.user.id, premiumDays: code.premiumDays, bonusPoints: code.bonusPoints, entitlementExpiresAt: effectiveExpiry });
          if (code.bonusPoints > 0) {
            await tx.insert(xpEvents).values({
              userId: ctx.user.id,
              eventType: "promo_code",
              eventKey: `promo-code:${code.id}:${ctx.user.id}`,
              points: code.bonusPoints,
              sourceType: "promo_code",
              sourceId: String(code.id),
              dayKey: now.toISOString().slice(0, 10),
              policyVersion: "xp-2026-10-12-promo-v1",
            }).onDuplicateKeyUpdate({ set: { eventKey: `promo-code:${code.id}:${ctx.user.id}` } });
          }
          return { id: code.id, label: code.codeLabel, premiumDays: code.premiumDays, bonusPoints: code.bonusPoints, expiresAt: effectiveExpiry.toISOString() };
        });
        await appendAuditEntry({ actorId: ctx.user.id, action: "promo_code_redeemed", targetType: "promo_code", targetId: result.id, payload: { premiumDays: result.premiumDays, bonusPoints: result.bonusPoints } });
        return { success: true as const, ...result };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        if (/duplicate|ER_DUP_ENTRY/i.test(errorMessage(error))) throw new TRPCError({ code: "CONFLICT", message: "promo_code_already_redeemed" });
        throw error;
      }
    }),

  myRedemptions: protectedProcedure.query(async ({ ctx }) => {
    const db = await requireDatabase();
    return db.select({ id: promoCodeRedemptions.id, label: promoCodes.codeLabel, premiumDays: promoCodeRedemptions.premiumDays, bonusPoints: promoCodeRedemptions.bonusPoints, entitlementExpiresAt: promoCodeRedemptions.entitlementExpiresAt, createdAt: promoCodeRedemptions.createdAt })
      .from(promoCodeRedemptions)
      .innerJoin(promoCodes, eq(promoCodes.id, promoCodeRedemptions.promoCodeId))
      .where(eq(promoCodeRedemptions.userId, ctx.user.id))
      .orderBy(desc(promoCodeRedemptions.createdAt))
      .limit(30);
  }),

  create: adminProcedure
    .input(z.object({ duration: z.enum(["week_1", "week_2", "month_1", "month_2"]), bonusPoints: z.number().int().min(0).max(5000).default(0), maxRedemptions: z.number().int().min(1).max(100000).default(1), label: z.string().trim().min(1).max(32).default("AKTION"), expiresAt: z.coerce.date().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDatabase();
      if (input.expiresAt && input.expiresAt.getTime() <= Date.now()) throw new TRPCError({ code: "BAD_REQUEST", message: "promo_code_expiry_must_be_future" });
      const plainCode = createPlainCode();
      const days = DURATION_DAYS[input.duration];
      const inserted = await db.insert(promoCodes).values({ codeDigest: digestCode(plainCode), codeLabel: input.label, premiumDays: days, bonusPoints: input.bonusPoints, maxRedemptions: input.maxRedemptions, createdByUserId: ctx.user.id, expiresAt: input.expiresAt ?? null });
      const id = Number(inserted[0].insertId);
      await appendAuditEntry({ actorId: ctx.user.id, action: "promo_code_created", targetType: "promo_code", targetId: id, payload: { duration: input.duration, premiumDays: days, bonusPoints: input.bonusPoints, maxRedemptions: input.maxRedemptions, expiresAt: input.expiresAt?.toISOString() ?? null } });
      return { id, code: plainCode, label: input.label, premiumDays: days, bonusPoints: input.bonusPoints, maxRedemptions: input.maxRedemptions, expiresAt: input.expiresAt?.toISOString() ?? null };
    }),

  list: adminProcedure.query(async () => {
    const db = await requireDatabase();
    return db.select({ id: promoCodes.id, label: promoCodes.codeLabel, premiumDays: promoCodes.premiumDays, bonusPoints: promoCodes.bonusPoints, maxRedemptions: promoCodes.maxRedemptions, redemptionCount: promoCodes.redemptionCount, expiresAt: promoCodes.expiresAt, revokedAt: promoCodes.revokedAt, createdAt: promoCodes.createdAt })
      .from(promoCodes)
      .orderBy(desc(promoCodes.createdAt))
      .limit(100);
  }),

  revoke: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDatabase();
      const result = await db.update(promoCodes).set({ revokedAt: new Date() }).where(and(eq(promoCodes.id, input.id), isNull(promoCodes.revokedAt)));
      if (Number(result[0].affectedRows) !== 1) throw new TRPCError({ code: "NOT_FOUND", message: "promo_code_not_found_or_already_revoked" });
      await appendAuditEntry({ actorId: ctx.user.id, action: "promo_code_revoked", targetType: "promo_code", targetId: input.id, payload: {} });
      return { revoked: true as const, id: input.id };
    }),

  status: protectedProcedure.query(async ({ ctx }) => {
    const db = await requireDatabase();
    const access = await getProAccess(db, ctx.user);
    return { active: access.active, source: access.source, expiresAt: access.expiresAt?.toISOString() ?? null };
  }),
});
