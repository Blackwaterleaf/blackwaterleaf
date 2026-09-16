import { sql } from "drizzle-orm";
import { BLACKWATERLEAF_CONTRACT_VERSION } from "../../shared/blackwaterleaf-contract-v1";
import { getAssistantReadiness } from "../assistantReadiness";
import { getDb } from "../db";
import { publicProcedure, router } from "../_core/trpc";

export const platformRouter = router({
  availability: publicProcedure.query(async () => {
    const db = await getDb();
    let database: "available" | "not_connected" | "temporarily_unavailable" = "not_connected";

    if (db) {
      try {
        await db.execute(sql`SELECT 1`);
        database = "available";
      } catch {
        database = "temporarily_unavailable";
      }
    }

    const api = database === "available" ? "available" : "temporarily_unavailable";
    const mediaStorage =
      process.env.BUILT_IN_FORGE_API_URL && process.env.BUILT_IN_FORGE_API_KEY
        ? "available"
        : "not_connected";
    const assistant = await getAssistantReadiness();

    return {
      contractVersion: BLACKWATERLEAF_CONTRACT_VERSION,
      api,
      database,
      authentication: "available",
      mediaStorage,
      community: database === "available" ? "available" : "temporarily_unavailable",
      knowledge: database === "available" ? "available" : "temporarily_unavailable",
      aiAssistant: assistant.state,
      aiReason: assistant.reason,
    } as const;
  }),
});
