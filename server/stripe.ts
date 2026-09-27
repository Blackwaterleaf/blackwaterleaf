import crypto from "node:crypto";
import type { Express, Request, Response } from "express";
import { and, eq, sql } from "drizzle-orm";
import { AI_CREDIT_PACKS, type AiCreditPackKey } from "@shared/monetization";
import { aiCreditPurchases, aiCreditWallets, billingAccounts } from "../drizzle/schema";
import { getDb } from "./db";

type CheckoutKind = "credits" | "pro_monthly" | "pro_yearly";

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

export async function createCheckoutSession(input: { userId: number; email: string | null; name: string | null; kind: CheckoutKind; packKey?: AiCreditPackKey; req: Request }) {
  const origin = appOrigin(input.req);
  const params = new URLSearchParams();
  params.set("mode", input.kind === "credits" ? "payment" : "subscription");
  params.set("success_url", `${origin}/pro?checkout=success&session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${origin}/pro?checkout=cancelled`);
  params.set("allow_promotion_codes", "true");
  params.set("managed_payments[enabled]", "false");
  params.set("client_reference_id", String(input.userId));
  params.set("metadata[user_id]", String(input.userId));
  params.set("metadata[customer_email]", input.email ?? "");
  params.set("metadata[customer_name]", input.name ?? "");

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
  } else {
    const yearly = input.kind === "pro_yearly";
    params.set("metadata[plan]", "pro");
    params.set("line_items[0][price_data][currency]", "eur");
    params.set("line_items[0][price_data][unit_amount]", String(yearly ? 3_999 : 499));
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
    if (object.mode === "payment") await completeCreditPurchase(object);
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
