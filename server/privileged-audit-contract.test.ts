import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const read = (file: string) => readFileSync(resolve(root, file), "utf8");

describe("AP-11 privileged action audit coverage", () => {
  it("audits staff challenge creation and publication", () => {
    const router = read("server/routers/challenges.ts");
    expect(router).toContain('import { appendAuditEntry } from "../auditLedger"');
    expect(router).toContain('action: "challenge_draft_created"');
    expect(router).toContain('action: "challenge_published"');
    expect(router).toContain('message: "challenge_not_found"');
  });

  it("audits staff knowledge draft creation without retaining article content in the ledger", () => {
    const router = read("server/routers/knowledge.ts");
    expect(router).toContain('import { appendAuditEntry } from "../auditLedger"');
    expect(router).toContain('action: "knowledge_draft_created"');
    expect(router).toContain('targetType: "knowledge_article"');
    expect(router).not.toContain("content: input.content");
  });

  it("keeps the tamper-evident chain contract", () => {
    const ledger = read("server/auditLedger.ts");
    expect(ledger).toContain("previousHash");
    expect(ledger).toContain("hasValidLedgerEntry");
    expect(ledger).toContain("head_hash_mismatch");
    expect(ledger).toContain("timingSafeEqual");
  });
});
