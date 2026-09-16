import { describe, expect, it } from "vitest";
import { createAuditHashes, hasValidAuditSignature, hasValidLedgerEntry } from "./auditLedger";

describe("tamper-evident audit ledger", () => {
  const secret = "test-only-signing-secret";
  const entry = {
    eventId: "00000000-0000-4000-8000-000000000001",
    actorId: 1,
    action: "role_grant_admin",
    targetType: "user",
    targetId: 1,
    payload: { after: "admin", before: "user", verified: true },
    previousHash: null,
    secret,
  };

  it("creates a stable signed entry hash", () => {
    const first = createAuditHashes(entry);
    const second = createAuditHashes(entry);
    expect(first).toEqual(second);
    expect(hasValidAuditSignature(first.entryHash, first.signature, secret)).toBe(true);
  });

  it("detects a changed entry hash or a different secret", () => {
    const hashes = createAuditHashes(entry);
    expect(hasValidAuditSignature(`${hashes.entryHash}0`, hashes.signature, secret)).toBe(false);
    expect(hasValidAuditSignature(hashes.entryHash, hashes.signature, "wrong-secret")).toBe(false);
  });

  it("verifies the complete stored-field shape and rejects a broken chain", () => {
    const hashes = createAuditHashes(entry);
    expect(hasValidLedgerEntry({ ...entry, ...hashes })).toBe(true);
    expect(hasValidLedgerEntry({ ...entry, ...hashes, previousHash: "different-chain-head" })).toBe(false);
  });

  it("includes the preceding chain hash in every later entry", () => {
    const first = createAuditHashes(entry);
    const second = createAuditHashes({ ...entry, eventId: "00000000-0000-4000-8000-000000000002", previousHash: first.entryHash });
    expect(second.entryHash).not.toBe(first.entryHash);
    expect(second.payloadHash).toBe(first.payloadHash);
  });
});
