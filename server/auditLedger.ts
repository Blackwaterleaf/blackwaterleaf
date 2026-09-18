import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { asc, desc, eq } from "drizzle-orm";
import { auditLedgerEntries, auditLedgerHeads } from "../drizzle/schema";
import { ENV } from "./_core/env";
import { getDb } from "./db";

const GENESIS_HASH = "BLACKWATERLEAF_AUDIT_GENESIS_V1";

export type AuditActionInput = {
  actorId: number;
  action: string;
  targetType: string;
  targetId: number;
  payload: Record<string, unknown>;
};

function canonicalJson(value: Record<string, unknown>): string {
  return JSON.stringify(value, Object.keys(value).sort());
}

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function signAuditHash(entryHash: string, secret: string): string {
  return createHmac("sha256", secret).update(entryHash).digest("hex");
}

export function createAuditHashes(input: {
  eventId: string;
  actorId: number;
  action: string;
  targetType: string;
  targetId: number;
  payload: Record<string, unknown>;
  previousHash: string | null;
  secret: string;
}) {
  const payloadHash = sha256(canonicalJson(input.payload));
  const entryHash = sha256(
    [
      input.previousHash ?? GENESIS_HASH,
      input.eventId,
      input.actorId,
      input.action,
      input.targetType,
      input.targetId,
      payloadHash,
    ].join("|"),
  );
  return { payloadHash, entryHash, signature: signAuditHash(entryHash, input.secret) };
}

export function hasValidAuditSignature(entryHash: string, signature: string, secret: string): boolean {
  const expected = Buffer.from(signAuditHash(entryHash, secret), "hex");
  const received = Buffer.from(signature, "hex");
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export function hasValidLedgerEntry(input: {
  eventId: string;
  actorId: number;
  action: string;
  targetType: string;
  targetId: number;
  payloadHash: string;
  previousHash: string | null;
  entryHash: string;
  signature: string;
  secret: string;
}): boolean {
  const expectedEntryHash = sha256(
    [
      input.previousHash ?? GENESIS_HASH,
      input.eventId,
      input.actorId,
      input.action,
      input.targetType,
      input.targetId,
      input.payloadHash,
    ].join("|"),
  );
  return expectedEntryHash === input.entryHash && hasValidAuditSignature(input.entryHash, input.signature, input.secret);
}

export async function appendAuditEntry(input: AuditActionInput) {
  const db = await getDb();
  if (!db) throw new Error("database_unavailable");
  if (!ENV.cookieSecret) throw new Error("audit_signing_secret_unavailable");

  return db.transaction(async tx => {
    await tx
      .insert(auditLedgerHeads)
      .values({ id: 1, lastEntryHash: null })
      .onDuplicateKeyUpdate({ set: { id: 1 } });

    const heads = await tx.select().from(auditLedgerHeads).where(eq(auditLedgerHeads.id, 1)).for("update");
    const previousHash = heads[0]?.lastEntryHash ?? null;
    const eventId = randomUUID();
    const hashes = createAuditHashes({ ...input, eventId, previousHash, secret: ENV.cookieSecret });

    const inserted = await tx.insert(auditLedgerEntries).values({
      eventId,
      actorId: input.actorId,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      payloadHash: hashes.payloadHash,
      previousHash,
      entryHash: hashes.entryHash,
      signature: hashes.signature,
    });
    await tx.update(auditLedgerHeads).set({ lastEntryHash: hashes.entryHash }).where(eq(auditLedgerHeads.id, 1));

    return { id: Number(inserted[0].insertId), eventId, ...hashes } as const;
  });
}

export async function getRecentAuditEntries(limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("database_unavailable");
  return db.select().from(auditLedgerEntries).orderBy(desc(auditLedgerEntries.createdAt)).limit(limit);
}

export async function verifyAuditLedgerIntegrity() {
  const db = await getDb();
  if (!db) throw new Error("database_unavailable");
  if (!ENV.cookieSecret) throw new Error("audit_signing_secret_unavailable");

  const entries = await db
    .select()
    .from(auditLedgerEntries)
    .orderBy(asc(auditLedgerEntries.createdAt), asc(auditLedgerEntries.id));
  const head = await db.select().from(auditLedgerHeads).where(eq(auditLedgerHeads.id, 1)).limit(1);
  let previousHash: string | null = null;

  for (const entry of entries) {
    if (entry.previousHash !== previousHash) {
      return { valid: false, checkedEntries: entries.length, reason: "previous_hash_mismatch" } as const;
    }
    if (!hasValidLedgerEntry({ ...entry, secret: ENV.cookieSecret })) {
      return { valid: false, checkedEntries: entries.length, reason: "entry_signature_or_hash_invalid" } as const;
    }
    previousHash = entry.entryHash;
  }

  if ((head[0]?.lastEntryHash ?? null) !== previousHash) {
    return { valid: false, checkedEntries: entries.length, reason: "head_hash_mismatch" } as const;
  }
  return { valid: true, checkedEntries: entries.length, reason: null } as const;
}
