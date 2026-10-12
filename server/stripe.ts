import crypto from "node:crypto";
import type { Express, Request, Response } from "express";
import { and, eq, sql } from "drizzle-orm";
import { AI_CREDIT_PACKS, PRO_MONTHLY_PRICE_EUR, PRO_YEARLY_PRICE_EUR, type AiCreditPackKey } from "@shared/monetization";
import { accountEntitlements, aiCreditPurchases, aiCreditWallets, billingAccounts, donations } from "../drizzle/schema";
import { getDb } from "./db";
import { awardXpIfReady } from "./gamification";

type CheckoutKind = "credits" | "pro_monthly" | "pro_yearly" | "donation";

type StripeObject = Record<string, unknown>;

function stripeSecret() {
  return process.env.STRIPE_SECRET_KEY?.trim() || null;
}

function appOrigin(req: Request) {
  const origin = req.header("origin");
  return origin && /^https:\/\//i.test(origin) ? origin : "https://blackwaterleaf.com";
}

async function stripeRequest(path: string, params: URLSearchParams) {
  const secret = stripeSecret();
  if (!secret) throw new Error("payments_not_configured");
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });
  const body = await response.json() as StripeObject;
  if (!response.ok) throw new Error(typeof body.error === "object" && body.error && "message" in body.error ? String(body.error.message) : "stripe_request_failed");
  return body;
}

async function retrieveCheckoutSession(sessionId: string) {
  const secret = stripeSecret();
  if (!secret) throw new Error("payments_not_configured");
  const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  const body = await response.json() as StripeObject;
  if (!response.ok) throw new Error(typeof body.error === "object" && body.error && "message" in body.error ? String(body.error.message) : "stripe_session_lookup_failed");
  return body;
}

export async function createCheckoutSession(input: { userId?: number; email?: string | null; name?: string | null; anonymous?: boolean; kind: CheckoutKind; packKey?: AiCreditPackKey; donationAmountEur?: number; req: Request }) {
  const origin = appOrigin(input.req);
  const params = new URLSearchParams();
  params.set("mode", input.kind === "credits" || input.kind === "donation" ? "payment" : "subscription");
  const returnPath = input.kind === "donation" ? "/support" : "/pro";
  params.set("success_url", `${origin}${returnPath}?checkout=success&session_id={CHECKOUT_SESSION_ID}${input.anonymous ? "&anonymous=1" : ""}`);
  params.set("cancel_url", `${origin}${returnPath}?checkout=cancelled`);
  params.set("allow_promotion_codes", "true");
  params.set("managed_payments[enabled]", "false");
  if (!input.anonymous && input.userId !== undefined) {
    params.set("client_reference_id", String(input.userId));
    params.set("metadata[user_id]", String(input.userId));
    params.set("metadata[customer_email]", input.email ?? "");
    params.set("metadata[customer_name]", input.name ?? "");
  }
  if (input.kind === "donation") params.set("metadata[anonymous]", input.anonymous ? "true" : "false");

  if (input.kind === "credits") {
    const pack = AI_CREDIT_PACKS.find(item => item.key === input.packKey);
    if (!pack) throw new Error("credit_pack_not_found");
    params.set("metadata[pack_key]", pack.key);
    params.set("metadata[credits]", String(pack.credits));
    params.set("line_items[0][price_data][currency]", "eur");
    params.set("line_items[0][price_data][unit_amount]", String(Math.round(pack.priceEur * 100)));
    params.set("line_items[0][price_data][product_data][name]", `BlackWaterLeaf · ${pack.label}`);
    params.set("line_items[0][price_data][product_data][description]", "KI-Pflanzenbestimmungen für BlackWaterLeaf");
    params.set("line_items[0][quantity]", "1");
  } else if (input.kind === "donation") {
    const amount = input.donationAmountEur;
    const amountCents = amount === undefined ? 0 : Math.round(amount * 100);
    if (!Number.isFinite(amountCents) || amountCents < 100 || amountCents > 50000 || Math.abs(amountCents / 100 - amount!) > 0.000001) throw new Error("donation_amount_invalid");
    params.set("metadata[purpose]", "nature_project_support");
    params.set("metadata[donation_amount_eur]", (amountCents / 100).toFixed(2));
    params.set("line_items[0][price_data][currency]", "eur");
    params.set("line_items[0][price_data][unit_amount]", String(amountCents));
    params.set("line_items[0][price_data][product_data][name]", "BlackWaterLeaf · Naturprojekt unterstützen");
    params.set("line_items[0][price_data][product_data][description]", "Freiwillige Unterstützung für Naturwissen, Community und unabhängige Entwicklung");
    params.set("line_items[0][quantity]", "1");
  } else {
    const yearly = input.kind === "pro_yearly";
    params.set("metadata[plan]", "pro");
    params.set("line_items[0][price_data][currency]", "eur");
    params.set("line_items[0][price_data][unit_amount]", String(Math.round((yearly ? PRO_YEARLY_PRICE_EUR : PRO_MONTHLY_PRICE_EUR) * 100)));
    params.set("line_items[0][price_data][recurring][interval]", yearly ? "year" : "month");
    params.set("line_items[0][price_data][product_data][name]", "BlackWaterLeaf Pro");
    params.set("line_items[0][price_data][product_data][description]", "Private Anlagen, Pflegehistorie und monatliches KI-Kontingent");
    params.set("line_items[0][quantity]", "1");
  }
  if (input.email) params.set("customer_email", input.email);
  const session = await stripeRequest("checkout/sessions", params);
  if (typeof session.url !== "string" || typeof session.id !== "string") throw new Error("stripe_checkout_url_missing");
  return { id: session.id, url: session.url };
}

function verifyStripeSignature(rawBody: Buffer, signature: string, secret: string) {
  const parts = Object.fromEntries(signature.split(",").map(part => part.split("=", 2) as [string, string]));
  const timestamp = Number(parts.t);
  const expected = parts.v1;
  if (!Number.isFinite(timestamp) || !expected || Math.abs(Date.now() / 1000 - timestamp) > 300) return false;
  const digest = crypto.createHmac("sha256", secret).update(`${timestamp}.${rawBody.toString("utf8")}`).digest("hex");
  const left = Buffer.from(digest, "utf8");
  const right = Buffer.from(expected, "utf8");
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

async function completeCreditPurchase(session: StripeObject) {
  const db = await getDb();
  if (!db) throw new Error("database_unavailable");
  const metadata = (session.metadata as StripeObject | undefined) ?? {};
  const userId = Number(metadata.user_id);
  const packKey = String(metadata.pack_key ?? "");
  const pack = AI_CREDIT_PACKS.find(item => item.key === packKey);
  const sessionId = String(session.id ?? "");
  if (!Number.isInteger(userId) || !pack || !sessionId) throw new Error("stripe_credit_metadata_invalid");

  await db.transaction(async tx => {
    const [existing] = await tx.select().from(aiCreditPurchases).where(eq(aiCreditPurchases.stripeCheckoutSessionId, sessionId)).limit(1);
    if (existing?.status === "completed") return;
    if (!existing) await tx.insert(aiCreditPurchases).values({ userId, stripeCheckoutSessionId: sessionId, packKey: pack.key, credits: pack.credits, status: "pending" });
    await tx.insert(aiCreditWallets).values({ userId, credits: pack.credits }).onDuplicateKeyUpdate({ set: { credits: sql`${aiCreditWallets.credits} + ${pack.credits}` } });
    await tx.update(aiCreditPurchases).set({ status: "completed", completedAt: new Date() }).where(eq(aiCreditPurchases.stripeCheckoutSessionId, sessionId));
  });
}

async function completeDonation(session: StripeObject) {
  const db = await getDb();
  if (!db) throw new Error("database_unavailable");
  const metadata = (session.metadata as StripeObject | undefined) ?? {};
  const sessionId = String(session.id ?? "");
  const amountCents = Number(session.amount_total ?? 0) || Math.round(Number(metadata.donation_amount_eur ?? 0) * 100);
  const rawUserId = Number(metadata.user_id);
  const userId = Number.isInteger(rawUserId) ? rawUserId : null;
  const anonymous = metadata.anonymous === "true" || !userId;
  if (!sessionId || !Number.isInteger(amountCents) || amountCents < 100) throw new Error("stripe_donation_metadata_invalid");
  const [existing] = await db.select({ status: donations.status }).from(donations).where(eq(donations.stripeCheckoutSessionId, sessionId)).limit(1);
  if (existing?.status === "completed") return { awardedXp: 0, member: amountCents >= 500 && Boolean(userId) };

  await db.transaction(async tx => {
    if (!existing) await tx.insert(donations).values({ userId, stripeCheckoutSessionId: sessionId, amountCents, anonymous, displayName: anonymous ? null : String(metadata.customer_name ?? "").trim().slice(0, 160) || "Unterstützer", status: "pending" });
    if (userId && amountCents >= 500) await tx.insert(accountEntitlements).values({ userId, featureKey: "organization_member", status: "active", grantedByUserId: userId }).onDuplicateKeyUpdate({ set: { status: "active", updatedAt: new Date() } });
    await tx.update(donations).set({ status: "completed", completedAt: new Date() }).where(eq(donations.stripeCheckoutSessionId, sessionId));
  });

  const points = userId ? Math.min(500, Math.floor(amountCents / 100) * 10) : 0;
  if (userId && points > 0) await awardXpIfReady(db, { userId, eventType: "donation_support", eventKey: `donation:${sessionId}`, points, sourceType: "stripe_donation", sourceId: sessionId });
  return { awardedXp: points, member: amountCents >= 500 && Boolean(userId) };
}

export async function getCheckoutConfirmation(input: { userId: number; sessionId: string }) {
  if (!/^cs_[A-Za-z0-9_]+$/.test(input.sessionId)) throw new Error("checkout_session_invalid");
  const session = await retrieveCheckoutSession(input.sessionId);
  const metadata = (session.metadata as StripeObject | undefined) ?? {};
  const sessionUserId = Number(metadata.user_id ?? session.client_reference_id);
  if (!Number.isInteger(sessionUserId) || sessionUserId !== input.userId) throw new Error("checkout_session_forbidden");

  const packKey = String(metadata.pack_key ?? "");
  const pack = AI_CREDIT_PACKS.find(item => item.key === packKey);
  const paid = session.mode === "payment" && session.status === "complete" && session.payment_status === "paid" && Boolean(pack);
  if (paid) await completeCreditPurchase(session);

  const db = await getDb();
  const [purchase] = db
    ? await db.select({ status: aiCreditPurchases.status, completedAt: aiCreditPurchases.completedAt })
      .from(aiCreditPurchases)
      .where(and(eq(aiCreditPurchases.userId, input.userId), eq(aiCreditPurchases.stripeCheckoutSessionId, input.sessionId)))
      .limit(1)
    : [];

  return {
    sessionId: input.sessionId,
    paid,
    credited: purchase?.status === "completed",
    credits: pack?.credits ?? 0,
    packLabel: pack?.label ?? "KI-Credits",
    completedAt: purchase?.completedAt ?? null,
  };
}

export async function getDonationConfirmation(input: { userId: number; sessionId: string }) {
  if (!/^cs_[A-Za-z0-9_]+$/.test(input.sessionId)) throw new Error("checkout_session_invalid");
  const session = await retrieveCheckoutSession(input.sessionId);
  const metadata = (session.metadata as StripeObject | undefined) ?? {};
  const sessionUserId = Number(metadata.user_id ?? session.client_reference_id);
  if (!Number.isInteger(sessionUserId) || sessionUserId !== input.userId) throw new Error("checkout_session_forbidden");
  const paid = session.mode === "payment" && session.status === "complete" && session.payment_status === "paid" && metadata.purpose === "nature_project_support";
  const fulfillment = paid ? await completeDonation(session) : { awardedXp: 0, member: false };
  return {
    sessionId: input.sessionId,
    paid,
    amountEur: Number(metadata.donation_amount_eur ?? 0),
    awardedXp: fulfillment.awardedXp,
    member: fulfillment.member,
  };
}

async function syncSubscription(session: StripeObject) {
  const db = await getDb();
  if (!db) throw new Error("database_unavailable");
  const metadata = (session.metadata as StripeObject | undefined) ?? {};
  const userId = Number(metadata.user_id ?? session.client_reference_id);
  if (!Number.isInteger(userId)) throw new Error("stripe_subscription_metadata_invalid");
  const customerId = typeof session.customer === "string" ? session.customer : null;
  const subscriptionId = typeof session.subscription === "string" ? session.subscription : null;
  await db.insert(billingAccounts).values({ userId, stripeCustomerId: customerId, stripeSubscriptionId: subscriptionId, plan: "pro", status: "active" }).onDuplicateKeyUpdate({ set: { stripeCustomerId: customerId, stripeSubscriptionId: subscriptionId, plan: "pro", status: "active" } });
}

async function handleStripeEvent(event: StripeObject) {
  const type = String(event.type ?? "");
  const object = ((event.data as StripeObject | undefined)?.object ?? {}) as StripeObject;
  if (type === "checkout.session.completed") {
    if (object.mode === "payment" && (object.metadata as StripeObject | undefined)?.purpose === "nature_project_support") await completeDonation(object);
    if (object.mode === "payment" && (object.metadata as StripeObject | undefined)?.purpose !== "nature_project_support") await completeCreditPurchase(object);
    if (object.mode === "subscription") await syncSubscription(object);
  } else if (type === "customer.subscription.deleted" || type === "customer.subscription.paused") {
    const db = await getDb();
    if (db && typeof object.id === "string") await db.update(billingAccounts).set({ plan: "free", status: "canceled", stripeSubscriptionId: object.id }).where(eq(billingAccounts.stripeSubscriptionId, object.id));
  } else if (type === "customer.subscription.updated") {
    const db = await getDb();
    if (db && typeof object.id === "string") {
      const status = object.status === "active" ? "active" : object.status === "past_due" ? "past_due" : "canceled";
      await db.update(billingAccounts).set({ status, plan: status === "canceled" ? "free" : "pro", stripeSubscriptionId: object.id }).where(eq(billingAccounts.stripeSubscriptionId, object.id));
    }
  }
}

export function registerStripeWebhook(app: Express) {
  app.post("/api/stripe/webhook", (req: Request, res: Response) => {
    const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
    const signature = req.header("stripe-signature");
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? {}));
    if (!secret || !signature || !verifyStripeSignature(rawBody, signature, secret)) return res.status(400).json({ error: "invalid_stripe_signature" });
    let event: StripeObject;
    try { event = JSON.parse(rawBody.toString("utf8")) as StripeObject; } catch { return res.status(400).json({ error: "invalid_stripe_payload" }); }
    if (String(event.id ?? "").startsWith("evt_test_")) {
      console.log("[Stripe] Test event detected, returning verification response");
      return res.json({ verified: true });
    }
    void handleStripeEvent(event).then(() => res.json({ received: true })).catch(error => { console.error("[Stripe] Webhook processing failed", error); res.status(500).json({ error: "stripe_event_processing_failed" }); });
  });
}
