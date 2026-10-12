import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const read = (file: string) => readFileSync(resolve(root, file), "utf8");

describe("observation engagement contract", () => {
  it("keeps user progress separate from scientific review", () => {
    const schema = read("drizzle/schema.ts");
    const contract = read("shared/blackwaterleaf-contract-v1.ts");
    const router = read("server/routers/observations.ts");
    for (const token of ["userStatus", "help_requested", "question_open", "proposal_received", "aiCandidates", "aiCatalogVersion", "evidenceState"]) {
      expect(schema).toContain(token);
    }
    for (const token of ["observationUserStatusSchema", "observationCandidateSchema", "aiCandidates: z.array"]) {
      expect(contract).toContain(token);
    }
    for (const token of ["userStatus: input.userStatus", "aiCandidates: input.aiCandidates", "evidenceState: record.evidenceState"]) {
      expect(router).toContain(token);
    }
  });

  it("provides authenticated response actions with notifications", () => {
    const schema = read("drizzle/schema.ts");
    const router = read("server/routers/observations.ts");
    const web = read("client/src/pages/Realm.tsx");
    const native = read("mobile-natur/src/api.ts");
    for (const token of ["observationResponses", "observationId", "observationResponseId", "taxon_suggestion", "question", "answer"]) expect(schema).toContain(token);
    for (const token of ["responses: protectedProcedure", "respond: protectedProcedure", "invalid_response_parent", "Jemand hat auf deine Beobachtung reagiert."]) expect(router).toContain(token);
    for (const token of ["ObservationResponsePanel", "observations.responses", "observations.respond", "KI-KANDIDATEN NACH SPEICHERN PRÜFEN"]) expect(web).toContain(token);
    for (const token of ["ObservationResponse", "observationResponses", "respondToObservation"]) expect(native).toContain(token);
  });

  it("keeps location handling explicit and protected", () => {
    const router = read("server/routers/observations.ts");
    const web = read("client/src/pages/Realm.tsx");
    const native = read("mobile-natur/src/MomentCapture.tsx");
    for (const token of ["location_processing_consent_required", "public_generalized_coordinates_required", "geoprivacy"]) expect(router).toContain(token);
    for (const token of ["navigator.geolocation.getCurrentPosition", "location_processing", "ORTSSCHUTZ"]) expect(web).toContain(token);
    for (const token of ["requestForegroundPermissionsAsync", "getCurrentPositionAsync", "ORTSSCHUTZ"]) expect(native).toContain(token);
  });
});
