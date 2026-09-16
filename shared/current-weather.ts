export type WeatherEffect = "none" | "rain" | "fog";
export type WeatherCondition = "clear" | "cloudy" | "fog" | "drizzle" | "rain" | "snow" | "thunderstorm";

/** Maps official WMO weather codes to an honest presentation state. */
export function weatherConditionForWmoCode(code: number): WeatherCondition {
  if (code === 0) return "clear";
  if ([1, 2, 3].includes(code)) return "cloudy";
  if ([45, 48].includes(code)) return "fog";
  if ([51, 53, 55, 56, 57].includes(code)) return "drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
  if ([95, 96, 99].includes(code)) return "thunderstorm";
  return "cloudy";
}

/** Only current fog and liquid precipitation activate decorative atmosphere effects. */
export function weatherEffectForCondition(condition: WeatherCondition): WeatherEffect {
  if (condition === "fog") return "fog";
  if (condition === "drizzle" || condition === "rain" || condition === "thunderstorm") return "rain";
  return "none";
}
