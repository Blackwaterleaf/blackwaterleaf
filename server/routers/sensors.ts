import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc";
import { fetchOutdoorWeather, OutdoorWeatherError, outdoorWeatherInputSchema } from "../weather";

/**
 * Outdoor weather is available after an explicit browser location permission.
 * The browser transmits coordinates only for the current request; this endpoint
 * stores neither coordinates nor a location history.
 */
export const sensorsRouter = router({
  outdoor: publicProcedure.input(outdoorWeatherInputSchema).query(async ({ input }) => {
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
