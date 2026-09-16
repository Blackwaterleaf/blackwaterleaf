import { verifyAuditLedgerIntegrity } from "../server/auditLedger";

const result = await verifyAuditLedgerIntegrity();
console.log(JSON.stringify(result));
process.exit(result.valid ? 0 : 1);
