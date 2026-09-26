import { TRPCError } from "@trpc/server";

/** AP-01: release freeze for unresolved P0 paths. Gates fail closed. */
export const P0_SAFETY_GATES = {
  mediaUpload: { active: false, packageId: "AP-03/AP-04", messageKey: "media_upload_enabled", summary: "Medien-Uploads sind mit Ownership-, MIME-, Signatur-, Größen- und Consent-Prüfung aktiv." },
  publicPublication: { active: true, packageId: "AP-07/AP-08", messageKey: "public_publication_safety_review_active", summary: "Öffentliche Veröffentlichungen sind während der Moderationsprüfung vorübergehend pausiert." },
  marketplaceActivation: { active: true, packageId: "AP-09", messageKey: "marketplace_compliance_review_active", summary: "Neue öffentliche Marktplatzaktivierungen sind bis zur Compliance-Prüfung pausiert." },
  accountErasure: { active: true, packageId: "AP-05", messageKey: "account_erasure_safety_review_active", summary: "Die Kontolöschung ist bis zum vollständigen Löschprozess pausiert." },
  databaseMigration: { active: true, packageId: "AP-06", messageKey: "database_migration_baseline_required", summary: "Produktive Datenbankmigrationen bleiben bis zur Restore-Abnahme gesperrt." },
} as const;

export type P0SafetyGate = keyof typeof P0_SAFETY_GATES;

export function assertSafetyGateAllows(gate: P0SafetyGate): void {
  const state = P0_SAFETY_GATES[gate];
  if (state.active) throw new TRPCError({ code: "PRECONDITION_FAILED", message: state.messageKey });
}

export function getPublicSafetyGateStatus() {
  return Object.entries(P0_SAFETY_GATES).map(([id, state]) => ({ id, active: state.active, packageId: state.packageId, summary: state.summary }));
}
