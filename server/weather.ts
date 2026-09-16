import { z } from "zod";
import { weatherConditionForWmoCode, weatherEffectForCondition } from "../shared/current-weather";

const WEATHER_ENDPOINT = "https://api.open-meteo.com/v1/forecast";
const WEATHER_TIMEOUT_MS = 6_000;

export const outdoorWeatherInputSchema = z.object({
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
}).strict();

const providerResponseSchema = z.object({
  current: z.object({
    temperature_2m: z.number().finite(),
    relative_humidity_2m: z.number().finite().min(0).max(100),
    weather_code: z.number().int().min(0).max(99),
  }),
}).passthrough();

export type OutdoorWeather = {
  temperatureC: number;
  humidityPercent: number;
  weatherCode: number;
  condition: ReturnType<typeof weatherConditionForWmoCode>;
  effect: ReturnType<typeof weatherEffectForCondition>;
  observedAt: string;
  source: "open_meteo";
};

export class OutdoorWeatherError extends Error {
  constructor(message: "weather_provider_unavailable" | "weather_provider_response_invalid") {
    super(message);
    this.name = "OutdoorWeatherError";
  }
}

/**
 * Requests only current outdoor conditions. Coordinates are used for this request,
 * never written to the application database, and are not returned to the client.
 */
export async function fetchOutdoorWeather(
  input: z.infer<typeof outdoorWeatherInputSchema>,
  request: typeof fetch = globalThis.fetch,
): Promise<OutdoorWeather> {
  const location = outdoorWeatherInputSchema.parse(input);
  const url = new URL(WEATHER_ENDPOINT);
  url.searchParams.set("latitude", String(location.latitude));
  url.searchParams.set("longitude", String(location.longitude));
  url.searchParams.set("current", "temperature_2m,relative_humidity_2m,weather_code");
  url.searchParams.set("timezone", "auto");

  let response: Response;
  try {
    response = await request(url, {
      signal: AbortSignal.timeout(WEATHER_TIMEOUT_MS),
      headers: { accept: "application/json" },
    });
  } catch {
    throw new OutdoorWeatherError("weather_provider_unavailable");
  }
  if (!response.ok) throw new OutdoorWeatherError("weather_provider_unavailable");

  let parsed: z.infer<typeof providerResponseSchema>;
  try {
    parsed = providerResponseSchema.parse(await response.json());
  } catch {
    throw new OutdoorWeatherError("weather_provider_response_invalid");
  }

  const condition = weatherConditionForWmoCode(parsed.current.weather_code);
  return {
    temperatureC: parsed.current.temperature_2m,
    humidityPercent: parsed.current.relative_humidity_2m,
    weatherCode: parsed.current.weather_code,
    condition,
    effect: weatherEffectForCondition(condition),
    observedAt: new Date().toISOString(),
    source: "open_meteo",
  };
}
