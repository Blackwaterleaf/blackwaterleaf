import { and, eq, inArray } from "drizzle-orm";
import { partnerProducts, partnerProfiles } from "../drizzle/schema";
import { appendAuditEntry } from "../server/auditLedger";
import { getDb } from "../server/db";

const handles = ["energiekostenpauschale"];
const db = await getDb();
if (!db) throw new Error("database_unavailable");
const [partner] = await db
  .select({ id: partnerProfiles.id, createdByUserId: partnerProfiles.createdByUserId })
  .from(partnerProfiles)
  .where(eq(partnerProfiles.displayName, "Kiemen-Kumpel"))
  .limit(1);
if (!partner) throw new Error("kiemen_kumpel_partner_not_found");
const matches = await db
  .select({ id: partnerProducts.id, sourceHandle: partnerProducts.sourceHandle, status: partnerProducts.status })
  .from(partnerProducts)
  .where(and(eq(partnerProducts.partnerId, partner.id), inArray(partnerProducts.sourceHandle, handles)));
const activeMatches = matches.filter(product => product.status === "active");
if (activeMatches.length) {
  await db
    .update(partnerProducts)
    .set({ status: "paused" })
    .where(and(eq(partnerProducts.partnerId, partner.id), inArray(partnerProducts.id, activeMatches.map(product => product.id))));
}
await appendAuditEntry({
  actorId: partner.createdByUserId,
  action: "partner_catalogue_non_merchandise_excluded",
  targetType: "partner_profile",
  targetId: partner.id,
  payload: { handles, pausedProductIds: activeMatches.map(product => product.id), reason: "operational_surcharge_not_public_merchandise" },
});
console.log(JSON.stringify({ partnerId: partner.id, matched: matches.length, paused: activeMatches.length, handles }, null, 2));
