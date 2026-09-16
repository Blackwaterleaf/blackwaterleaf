import { trpc } from "@/lib/trpc";
import { useI18n } from "@/i18n";
import { useAuth } from "@/_core/hooks/useAuth";
import type { WeatherCondition, WeatherEffect } from "@shared/current-weather";
import { CloudFog, CloudRain, Droplets, Gauge, MapPin, ThermometerSun, Waves, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

type AquariumRecord = {
  kind: "aquarium" | "plant" | "terrarium";
  name: string;
  details: Record<string, unknown>;
};
type Coordinates = { latitude: number; longitude: number };
type GeolocationState = "idle" | "requesting" | "denied" | "unavailable" | "ready";

const WEATHER_LABELS: Record<"de" | "en", Record<WeatherCondition, string>> = {
  de: { clear: "Klar", cloudy: "Bewölkt", fog: "Neblig", drizzle: "Nieselregen", rain: "Regen", snow: "Schnee", thunderstorm: "Gewitter" },
  en: { clear: "Clear", cloudy: "Cloudy", fog: "Fog", drizzle: "Drizzle", rain: "Rain", snow: "Snow", thunderstorm: "Thunderstorm" },
};

function formatTemperature(value: unknown, unitSystem: "metric" | "imperial") {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const temperature = unitSystem === "imperial" ? (value * 9) / 5 + 32 : value;
  const unit = unitSystem === "imperial" ? "°F" : "°C";
  return `${new Intl.NumberFormat(unitSystem === "imperial" ? "en-US" : "de-DE", { maximumFractionDigits: 1 }).format(temperature)} ${unit}`;
}

function formatHumidity(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? `${new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 }).format(value)} %`
    : null;
}

export function LiveSensorStrip({ onWeatherEffectChange, compact = false }: { onWeatherEffectChange?: (effect: WeatherEffect) => void; compact?: boolean }) {
  const auth = useAuth();
  const { locale, unitSystem } = useI18n();
  const habitats = trpc.habitats.mine.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [geolocationState, setGeolocationState] = useState<GeolocationState>("idle");
  const [fallbackCoordinates] = useState<Coordinates>({ latitude: 0, longitude: 0 });
  const outdoor = trpc.sensors.outdoor.useQuery(coordinates ?? fallbackCoordinates, {
    enabled: coordinates !== null,
    staleTime: 4 * 60 * 1_000,
    refetchInterval: 5 * 60 * 1_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  useEffect(() => {
    onWeatherEffectChange?.(outdoor.data?.effect ?? "none");
  }, [onWeatherEffectChange, outdoor.data?.effect]);

  const aquarium = ((habitats.data ?? []) as AquariumRecord[]).find(item => item.kind === "aquarium");
  const waterTemperature = formatTemperature(aquarium?.details.temperatureC, unitSystem);
  const waterPh = typeof aquarium?.details.ph === "number" && Number.isFinite(aquarium.details.ph) ? `pH ${aquarium.details.ph}` : null;
  const hasWeather = Boolean(outdoor.data);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setGeolocationState("unavailable");
      return;
    }
    setGeolocationState("requesting");
    navigator.geolocation.getCurrentPosition(
      position => {
        setCoordinates({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setGeolocationState("ready");
      },
      () => setGeolocationState("denied"),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60 * 1_000 },
    );
  };

  const weatherTitle = outdoor.data ? WEATHER_LABELS[locale][outdoor.data.condition] : locale === "de" ? "Außenwetter" : "Outdoor weather";
  const weatherDescription = locale === "de"
    ? "Dein Standort wird nur für die aktuelle Wetterabfrage verwendet und nicht gespeichert."
    : "Your location is used only for this weather request and is not stored.";

  return (
    <section className={`home-status-card glass-panel ${compact ? "reference-sensor-rail" : ""}`} aria-label={locale === "de" ? "Live-Werte" : "Live values"}>
      <div className="home-status-heading"><span>{locale === "de" ? "Werte im Blick" : "Values at a glance"}</span><span className={`connection-pill ${hasWeather ? "is-ready" : ""}`}><i />{hasWeather ? (locale === "de" ? "AKTUELL" : "CURRENT") : locale === "de" ? "PRIVAT & LIVE" : "PRIVATE & LIVE"}</span></div>
      <div className="sensor-grid">
        <Sensor value={waterTemperature ?? "—"} label={waterTemperature ? `${locale === "de" ? "Wasser" : "Water"} · ${aquarium?.name ?? "Aquarium"}` : auth.isAuthenticated ? (locale === "de" ? "Aquarium eintragen" : "Add aquarium") : (locale === "de" ? "Anmeldung erforderlich" : "Sign-in required")} tone="mint" icon={Waves} />
        <Sensor value={waterPh ?? "—"} label={waterPh ? `${locale === "de" ? "pH-Wert" : "pH value"} · ${aquarium?.name ?? "Aquarium"}` : auth.isAuthenticated ? (locale === "de" ? "pH privat eintragen" : "Add private pH") : (locale === "de" ? "Anmeldung erforderlich" : "Sign-in required")} tone="cyan" icon={Gauge} />
        <Sensor value={outdoor.isLoading ? "…" : formatHumidity(outdoor.data?.humidityPercent) ?? "—"} label={hasWeather ? (locale === "de" ? "Außenluftfeuchte" : "Outdoor humidity") : locale === "de" ? "Außenluft" : "Outdoor air"} tone="green" icon={Droplets} />
        <Sensor value={outdoor.isLoading ? "…" : formatTemperature(outdoor.data?.temperatureC, unitSystem) ?? "—"} label={hasWeather ? weatherTitle : locale === "de" ? "Außentemperatur" : "Outdoor temperature"} tone="gold" icon={outdoor.data?.effect === "fog" ? CloudFog : outdoor.data?.effect === "rain" ? CloudRain : ThermometerSun} />
      </div>
      {auth.isAuthenticated && (!waterTemperature || !waterPh) ? <p className="sensor-note sensor-note--action">{locale === "de" ? "Wasser- und pH-Werte werden privat im Profil unter „Meine Anlagen & Werte“ gepflegt." : "Water temperature and pH are managed privately in Profile under My habitats & values."}</p> : null}
      {geolocationState === "idle" ? <button className="sensor-location-control" type="button" onClick={requestLocation}><MapPin size={15} />{locale === "de" ? "Außenwetter für diesen Moment aktivieren" : "Enable outdoor weather for this moment"}</button> : null}
      {geolocationState === "requesting" ? <p className="sensor-note">{locale === "de" ? "Standortfreigabe wird im Browser angefragt …" : "Requesting browser location permission …"}</p> : null}
      {geolocationState === "denied" || geolocationState === "unavailable" ? <button className="sensor-location-control sensor-location-control--retry" type="button" onClick={requestLocation}><MapPin size={15} />{locale === "de" ? "Standortfreigabe im Browser erneut versuchen" : "Try browser location permission again"}</button> : null}
      {coordinates && outdoor.isError ? <button className="sensor-location-control sensor-location-control--retry" type="button" onClick={() => void outdoor.refetch()}>{locale === "de" ? "Wetterdaten erneut laden" : "Reload weather data"}</button> : null}
      {hasWeather ? <p className="sensor-note">{weatherDescription}</p> : null}
    </section>
  );
}

function Sensor({ value, label, tone, icon: Icon }: { value: string; label: string; tone: string; icon: LucideIcon }) {
  return <div className={`sensor sensor-${tone}`}><Icon size={17} strokeWidth={1.7} /><div><strong>{value}</strong><span>{label}</span></div></div>;
}
