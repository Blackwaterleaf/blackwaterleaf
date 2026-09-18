import { and, eq } from "drizzle-orm";
import { userConsentCurrent, userConsentEvents, userConsents } from "../drizzle/schema";
import type { z } from "zod";
import { consentPurposeSchema } from "../shared/blackwaterleaf-contract-v1";
import { getDb } from "./db";

export type ConsentPurpose = z.infer<typeof consentPurposeSchema>;
type Database = NonNullable<Awaited<ReturnType<typeof getDb>>>;

export async function hasCurrentConsent(db: Database, userId: number, purpose: ConsentPurpose): Promise<boolean> {
  const rows = await db
    .select({ id: userConsentCurrent.id })
    .from(userConsentCurrent)
    .where(
      and(
        eq(userConsentCurrent.userId, userId),
        eq(userConsentCurrent.purpose, purpose),
        eq(userConsentCurrent.granted, true),
      ),
    )
    .limit(1);
  return Boolean(rows[0]);
}

export async function listCurrentConsents(db: Database, userId: number) {
  return db
    .select({
      purpose: userConsentCurrent.purpose,
      policyVersion: userConsentCurrent.policyVersion,
      granted: userConsentCurrent.granted,
      grantedAt: userConsentCurrent.grantedAt,
      revokedAt: userConsentCurrent.revokedAt,
      updatedAt: userConsentCurrent.updatedAt,
    })
    .from(userConsentCurrent)
    .where(eq(userConsentCurrent.userId, userId));
}

/** Writes the active state and an append-only member event in one transaction. */
export async function recordCurrentConsent(
  db: Database,
  input: { userId: number; purpose: ConsentPurpose; policyVersion: string; granted: boolean },
) {
  const now = new Date();
  return db.transaction(async tx => {
    // This compatibility row retains the original per-version contract for the currently shipped clients.
    await tx
      .insert(userConsents)
      .values({
        userId: input.userId,
        purpose: input.purpose,
        policyVersion: input.policyVersion,
        granted: input.granted,
        grantedAt: input.granted ? now : null,
        revokedAt: input.granted ? null : now,
      })
      .onDuplicateKeyUpdate({
        set: {
          granted: input.granted,
          grantedAt: input.granted ? now : null,
          revokedAt: input.granted ? null : now,
        },
      });

    await tx
      .insert(userConsentCurrent)
      .values({
        userId: input.userId,
        purpose: input.purpose,
        policyVersion: input.policyVersion,
        granted: input.granted,
        grantedAt: input.granted ? now : null,
        revokedAt: input.granted ? null : now,
      })
      .onDuplicateKeyUpdate({
        set: {
          policyVersion: input.policyVersion,
          granted: input.granted,
          grantedAt: input.granted ? now : null,
          revokedAt: input.granted ? null : now,
        },
      });

    await tx.insert(userConsentEvents).values({
      userId: input.userId,
      purpose: input.purpose,
      policyVersion: input.policyVersion,
      granted: input.granted,
      eventType: "member_update",
      occurredAt: now,
    });
  });
}
