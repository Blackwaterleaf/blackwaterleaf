import { and, eq } from "drizzle-orm";
import { accountEntitlements, billingAccounts } from "../drizzle/schema";

type EntitlementUser = { id: number; role: "user" | "moderator" | "admin" };

export type ProAccessSource = "admin" | "admin_grant" | "stripe" | "none";

export type ProAccess = {
  active: boolean;
  source: ProAccessSource;
  expiresAt: Date | null;
};

/**
 * Returns the effective Pro access. Admins are always fully entitled; all
 * other accounts need either an active Stripe subscription or an active,
 * explicitly recorded host grant.
 */
export async function getProAccess(db: any, user: EntitlementUser): Promise<ProAccess> {
  if (user.role === "admin") return { active: true, source: "admin", expiresAt: null };

  const [[account], [grant]] = await Promise.all([
    db.select({ plan: billingAccounts.plan, status: billingAccounts.status, currentPeriodEnd: billingAccounts.currentPeriodEnd })
      .from(billingAccounts)
      .where(eq(billingAccounts.userId, user.id))
      .limit(1),
    db.select({ status: accountEntitlements.status, expiresAt: accountEntitlements.expiresAt })
      .from(accountEntitlements)
      .where(and(eq(accountEntitlements.userId, user.id), eq(accountEntitlements.featureKey, "pro"), eq(accountEntitlements.status, "active")))
      .limit(1),
  ]);

  const now = Date.now();
  if (grant && (!grant.expiresAt || grant.expiresAt.getTime() > now)) {
    return { active: true, source: "admin_grant", expiresAt: grant.expiresAt ?? null };
  }
  if (account?.plan === "pro" && account.status === "active") {
    return { active: true, source: "stripe", expiresAt: account.currentPeriodEnd ?? null };
  }
  return { active: false, source: "none", expiresAt: null };
}

export async function hasProAccess(db: any, user: EntitlementUser) {
  return (await getProAccess(db, user)).active;
}
