import { describe, expect, it } from "vitest";
import type { TrpcContext } from "./_core/context";
import { aquariumContext, assistantRouter } from "./routers/assistant";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const assistantSource = readFileSync(resolve(import.meta.dirname, "routers/assistant.ts"), "utf8");

function anonymousContext(): TrpcContext { return { user: null, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] }; }

describe("assistant operations", () => {
  it("rejects anonymous chat, plant-image, and aquarium-analysis requests before accessing data", async () => {
    const caller = assistantRouter.createCaller(anonymousContext());
    await expect(caller.chat({ clientRequestId: "00000000-0000-4000-8000-000000000001", message: "Wie geht es meiner Pflanze?", history: [] })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.plantIdentify({ clientRequestId: "00000000-0000-4000-8000-000000000002", imageBase64: "aGVsbG8=", mimeType: "image/jpeg" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.aquariumAnalyze({ clientRequestId: "00000000-0000-4000-8000-000000000003", habitatId: 1 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("creates an explicit private aquarium context without inventing missing values", () => {
    const context = aquariumContext("Schwarzwasser 240", { volumeLiters: 240, lengthCm: null, widthCm: null, heightCm: null, occupants: null, plants: null, temperatureC: 0, ph: 6.4, gh: null, kh: null, nitriteMgL: null, nitrateMgL: null, conductivityUs: null, equipment: null, notes: null });
    expect(context).toContain("Privates Aquarium: Schwarzwasser 240");
    expect(context).toContain("Volumen: 240 l");
    expect(context).toContain("Temperatur: 0 °C");
    expect(context).toContain("pH: 6.4");
    expect(context).not.toContain("undefined");
  });

  it("uses the configured IONOS multimodal model with bounded triage", () => {
    expect(assistantSource).toContain("const PLANT_TRIAGE_MODEL = ENV.ionosModel");
    expect(assistantSource).toContain("const PLANT_ESCALATION_MODEL = ENV.ionosModel");
    expect(assistantSource).toContain("plantResultNeedsEscalation");
    expect(assistantSource).toContain('detail: model === PLANT_TRIAGE_MODEL ? "low"');
    expect(assistantSource).toContain('model === PLANT_TRIAGE_MODEL ? 1_800 : 5_000');
    expect(assistantSource).toContain("usageTotals(triageUsage, response.usage)");
    expect(assistantSource).toContain('"assistant_response_truncated"');
    expect(assistantSource).toContain('"assistant_empty_response"');
  });

  it("bypasses the daily assistant limit only for administrators", () => {
    expect(assistantSource).toContain('user.role !== "admin" && await hasAssistantCallsToday');
    expect(assistantSource).toContain('role: "user" | "moderator" | "admin"');
  });
});
