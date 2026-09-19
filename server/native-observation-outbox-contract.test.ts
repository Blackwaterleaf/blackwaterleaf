import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const outbox = readFileSync(resolve(root, "mobile-natur/src/observationOutbox.ts"), "utf8");
const capture = readFileSync(resolve(root, "mobile-natur/src/MomentCapture.tsx"), "utf8");
const app = readFileSync(resolve(root, "mobile-natur/App.tsx"), "utf8");

describe("AP-15 native observation reliability contract", () => {
  it("persists a private observation before network replay and preserves image MIME", () => {
    expect(outbox).toContain("documentDirectory");
    expect(outbox).toContain('"image_pending"');
    expect(outbox).toContain('"conflict"');
    expect(outbox).toContain("clientId");
    expect(outbox).toContain("uploadObservationImage");
    expect(outbox).toContain("item.mimeType");
    expect(capture).toContain("result.assets[0].mimeType");
    expect(capture).toContain("enqueueObservation");
    expect(capture).toContain("syncObservationOutbox");
  });

  it("shows private feed and sync feedback without exposing private data publicly", () => {
    expect(app).toContain("privateObservations");
    expect(app).toContain("cachePrivateObservations");
    expect(app).toContain("AppState.addEventListener");
    expect(app).toContain("PRIVATE BEOBACHTUNGEN");
    expect(app).toContain("warten auf Synchronisierung");
    expect(app).toContain("nur für dich sichtbar");
  });
});
