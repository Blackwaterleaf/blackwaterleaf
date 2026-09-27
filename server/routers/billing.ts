import { and, desc, eq, gt, sql } from "drizzle-orm";
import { z } from "zod";
import { aiCreditPurchases, aiCreditWallets, aiUsagePolicies, aiUserUsageDays, aiUserUsageMonths, billingAccounts } from "../../drizzle/schema";
import { AI_CREDIT_PACKS, DEFAULT_FREE_DAILY_IDENTIFICATIONS, DEFAULT_GLOBAL_DAILY_IDENTIFICATIONS, DEFAULT_PRO_MONTHLY_IDENTIFICATIONS, FREE_FEATURES, PRO_FEATURES, PRO_MONTHLY_PRICE_EUR, PRO_YEARLY_PRICE_EUR, type AiCreditPackKey } from "@shared/monetization";
import { getDb } from "../db";
import { getProAccess } from "../entitlements";
import { createCheckoutSession, getCheckoutConfirmation, getDonationConfirmation } from "../stripe";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";

const checkoutInput = z.object({ kind: z.enum(["credits", "pro_monthly", "pro_yearly", "donation"]), packKey: z.string().optional(), donationAmountEur: z.number().min(1).max(500).optional() });

function utcDayKey(date = new Date()) { return date.toISOString().slice(0, 10); }
function utcMonthKey(date = new Date()) { return date.toISOString().slice(0, 7); }
async function requireDatabase() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "database_unavailable" });
  return db;
}

export const billingRouter = router({
  plans: publicProcedure.query(() => ({
    free: { name: "Free", features: FREE_FEATURES },
    pro: { name: "BlackWaterLeaf Pro", monthlyPriceEur: PRO_MONTHLY_PRICE_EUR, yearlyPriceEur: PRO_YEARLY_PRICE_EUR, features: PRO_FEATURES },
    creditPacks: AI_CREDIT_PACKS,
    creator: { name: "Creator / Expert", status: "later" as const, features: ["Fach-LIVEs", "Subscriber-only Videos", "Creator-Statistiken", "Community-Badges"] },
  })),

  me: protectedProcedure.query(async ({ ctx }) => {
    const db = await requireDatabase();
    const dayKey = utcDayKey();
    const monthKey = utcMonthKey();
    const [[account], [policy], [wallet], [day], [month]] = await Promise.all([
      db.select({ plan: billingAccounts.plan, status: billingAccounts.status, currentPeriodEnd: billingAccounts.currentPeriodEnd }).from(billingAccounts).where(eq(billingAccounts.userId, ctx.user.id)).limit(1),
      db.select({ freeDailyIdentifications: aiUsagePolicies.freeDailyIdentifications, proMonthlyIdentifications: aiUsagePolicies.proMonthlyIdentifications, globalDailyIdentifications: aiUsagePolicies.globalDailyIdentifications }).from(aiUsagePolicies).where(eq(aiUsagePolicies.id, 1)).limit(1),
      db.select({ credits: aiCreditWallets.credits }).from(aiCreditWallets).where(eq(aiCreditWallets.userId, ctx.user.id)).limit(1),
      db.select({ freeIdentifications: aiUserUsageDays.freeIdentifications }).from(aiUserUsageDays).where(and(eq(aiUserUsageDays.userId, ctx.user.id), eq(aiUserUsageDays.dayKey, dayKey))).limit(1),
      db.select({ proIdentifications: aiUserUsageMonths.proIdentifications }).from(aiUserUsageMonths).where(and(eq(aiUserUsageMonths.userId, ctx.user.id), eq(aiUserUsageMonths.monthKey, monthKey))).limit(1),
    ]);
    const access = await getProAccess(db, ctx.user);
    const freeLimit = policy?.freeDailyIdentifications ?? DEFAULT_FREE_DAILY_IDENTIFICATIONS;
    const monthlyLimit = policy?.proMonthlyIdentifications ?? DEFAULT_PRO_MONTHLY_IDENTIFICATIONS;
    const isPro = access.active;
    return {
      plan: isPro ? "pro" as const : "free" as const,
      active: isPro,
      accessSource: access.source,
      accessExpiresAt: access.expiresAt,
      paymentReady: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET),
      currentPeriodEnd: account?.currentPeriodEnd ?? null,
      aiCredits: wallet?.credits ?? 0,
      freeIdentificationsRemaining: Math.max(0, freeLimit - (day?.freeIdentifications ?? 0)),
      monthlyIdentificationsRemaining: isPro ? Math.max(0, monthlyLimit - (month?.proIdentifications ?? 0)) : 0,
      dailyLimit: freeLimit,
      monthlyLimit,
      globalDailyLimit: policy?.globalDailyIdentifications ?? DEFAULT_GLOBAL_DAILY_IDENTIFICATIONS,
    };
  }),

  history: protectedProcedure.query(async ({ ctx }) => {
    const db = await requireDatabase();
    return db.select({
      id: aiCreditPurchases.id,
      packKey: aiCreditPurchases.packKey,
      credits: aiCreditPurchases.credits,
      status: aiCreditPurchases.status,
      createdAt: aiCreditPurchases.createdAt,
      completedAt: aiCreditPurchases.completedAt,
    }).from(aiCreditPurchases)
      .where(eq(aiCreditPurchases.userId, ctx.user.id))
      .orderBy(desc(aiCreditPurchases.createdAt))
      .limit(50);
  }),

  checkoutConfirmation: protectedProcedure.input(z.object({ sessionId: z.string().min(1).max(200) })).query(async ({ ctx, input }) => {
    try {
      return await getCheckoutConfirmation({ userId: ctx.user.id, sessionId: input.sessionId });
    } catch (error) {
      const message = error instanceof Error ? error.message : "checkout_confirmation_failed";
      if (message === "checkout_session_invalid" || message === "checkout_session_forbidden") throw new TRPCError({ code: "FORBIDDEN", message });
      throw new TRPCError({ code: "BAD_GATEWAY", message: "checkout_confirmation_failed" });
    }
  }),

  donationConfirmation: protectedProcedure.input(z.object({ sessionId: z.string().min(1).max(200) })).query(async ({ ctx, input }) => {
    try {
      return await getDonationConfirmation({ userId: ctx.user.id, sessionId: input.sessionId });
    } catch (error) {
      const message = error instanceof Error ? error.message : "donation_confirmation_failed";
      if (message === "checkout_session_invalid" || message === "checkout_session_forbidden") throw new TRPCError({ code: "FORBIDDEN", message });
      throw new TRPCError({ code: "BAD_GATEWAY", message: "donation_confirmation_failed" });
    }
  }),

  createCheckout: protectedProcedure.input(checkoutInput).mutation(async ({ ctx, input }) => {
    if (input.kind === "credits" && !input.packKey) throw new TRPCError({ code: "BAD_REQUEST", message: "credit_pack_required" });
    if (input.kind === "donation" && !input.donationAmountEur) throw new TRPCError({ code: "BAD_REQUEST", message: "donation_amount_required" });
    try {
      const session = await createCheckoutSession({ userId: ctx.user.id, email: ctx.user.email ?? null, name: ctx.user.name ?? null, kind: input.kind, packKey: input.packKey as AiCreditPackKey | undefined, donationAmountEur: input.donationAmountEur, req: ctx.req });
      return session;
    } catch (error) {
      const message = error instanceof Error ? error.message : "checkout_failed";
      if (message === "payments_not_configured") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "payments_not_configured" });
      if (message === "credit_pack_not_found") throw new TRPCError({ code: "BAD_REQUEST", message });
      if (message === "donation_amount_invalid") throw new TRPCError({ code: "BAD_REQUEST", message });
      throw new TRPCError({ code: "BAD_GATEWAY", message: "checkout_failed" });
    }
  }),
});
