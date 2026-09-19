console.error("BLOCKED: pnpm db:push is disabled by BlackWaterLeaf AP-06.");
console.error("Required first: backup ID, successful TiDB-compatible restore, adopted migration baseline, reviewed additive migration and rollback plan.");
console.error("See docs/BLACKWATERLEAF_ENTERPRISE_20_STEP_MASTERPLAN_2026-09-19.md and docs/ENTERPRISE_RISK_REGISTER_2026-09-19.md.");
process.exit(1);
