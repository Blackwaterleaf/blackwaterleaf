import { assistantUsage, xpEvents } from "../drizzle/schema";
import { getDb } from "./db";

export type AssistantReadiness = {
  state: "available" | "disabled_by_policy" | "temporarily_unavailable";
  reason: "pending_provider_approval" | "pending_migration" | "available";
};

function isMissingStagedSchema(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /xp_events|assistant_usage|doesn't exist|ER_NO_SUCH_TABLE/i.test(message);
}

/** The assistant is exposed only after its audit and XP tables are present. */
export async function getAssistantReadiness(): Promise<AssistantReadiness> {
  const db = await getDb();
  if (!db) return { state: "temporarily_unavailable", reason: "pending_migration" };
  if (!process.env.BUILT_IN_FORGE_API_URL || !process.env.BUILT_IN_FORGE_API_KEY) {
    return { state: "disabled_by_policy", reason: "pending_provider_approval" };
  }

  try {
    await db.select({ id: xpEvents.id }).from(xpEvents).limit(1);
    await db.select({ id: assistantUsage.id }).from(assistantUsage).limit(1);
    return { state: "available", reason: "available" };
  } catch (error) {
    if (isMissingStagedSchema(error)) {
      return { state: "disabled_by_policy", reason: "pending_migration" };
    }
    return { state: "temporarily_unavailable", reason: "pending_migration" };
  }
}
