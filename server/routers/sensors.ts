import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc";
import { fetchOutdoorWeather, OutdoorWeatherError, outdoorWeatherInputSchema } from "../weather";
import { getDb } from "../db";
import { hasCurrentConsent } from "../consents";

/**
 * Outdoor weather is available after an explicit browser location permission.
 * The browser transmits coordinates only for the current request; this endpoint
 * stores neither coordinates nor a location history.
 */
export const sensorsRouter = router({
  outdoor: publicProcedure.input(outdoorWeatherInputSchema).mutation(async ({ ctx, input }) => {
    ctx.res.setHeader("Cache-Control", "no-store, private");
    ctx.res.setHeader("Referrer-Policy", "no-referrer");
    if (ctx.user) {
      const db = await getDb();
      if (!db || !(await hasCurrentConsent(db, ctx.user.id, "location_processing"))) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "location_processing_consent_required" });
      }
    }
    try {
      return await fetchOutdoorWeather(input);
    } catch (error) {
      if (error instanceof OutdoorWeatherError) {
        throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: error.message });
      }
      throw error;
    }
  }),
});
