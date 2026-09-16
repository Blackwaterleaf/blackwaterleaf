import { describe, expect, it } from "vitest";
import { weatherConditionForWmoCode, weatherEffectForCondition } from "../shared/current-weather";
import { fetchOutdoorWeather, outdoorWeatherInputSchema } from "./weather";

describe("live outdoor weather", () => {
  it("maps official WMO codes to the appropriate living atmosphere without guessing", () => {
    expect(weatherConditionForWmoCode(0)).toBe("clear");
    expect(weatherConditionForWmoCode(45)).toBe("fog");
    expect(weatherConditionForWmoCode(53)).toBe("drizzle");
    expect(weatherConditionForWmoCode(63)).toBe("rain");
    expect(weatherConditionForWmoCode(95)).toBe("thunderstorm");
    expect(weatherEffectForCondition("fog")).toBe("fog");
    expect(weatherEffectForCondition("rain")).toBe("rain");
    expect(weatherEffectForCondition("clear")).toBe("none");
  });

  it("strictly validates transient browser coordinates", () => {
    expect(outdoorWeatherInputSchema.parse({ latitude: 50.11, longitude: 8.68 })).toEqual({ latitude: 50.11, longitude: 8.68 });
    expect(() => outdoorWeatherInputSchema.parse({ latitude: 91, longitude: 8 })).toThrow();
    expect(() => outdoorWeatherInputSchema.parse({ latitude: 50, longitude: 181 })).toThrow();
  });

  it("returns only validated current data and derives a rain effect", async () => {
    const request = async (url: URL | RequestInfo) => {
      expect(String(url)).toContain("current=temperature_2m%2Crelative_humidity_2m%2Cweather_code");
      return new Response(JSON.stringify({ current: { temperature_2m: 16.4, relative_humidity_2m: 77, weather_code: 61 } }), { status: 200 });
    };
    const result = await fetchOutdoorWeather({ latitude: 50.11, longitude: 8.68 }, request as typeof fetch);
    expect(result).toMatchObject({ temperatureC: 16.4, humidityPercent: 77, weatherCode: 61, condition: "rain", effect: "rain", source: "open_meteo" });
    expect(result).not.toHaveProperty("latitude");
    expect(result).not.toHaveProperty("longitude");
  });
});
