import { Globe2, MapPin, ShieldCheck } from "lucide-react";
import { officialTaxonSource } from "@shared/taxon-source-policy";
import { MapView } from "@/components/Map";
import { useState } from "react";
import { useI18n } from "@/i18n";

type TaxonRangeMapProps = {
  realm: "botany" | "aquarium" | "terrarium";
  summary?: string | null;
  careProfile?: Record<string, unknown> | null;
  source?: string | null;
  sourceUrl?: string | null;
};

type RegionPoint = {
  label: string;
  lat: number;
  lng: number;
};

const realmCopy = {
  de: {
    botany: { label: "BOTANIK", title: "NATÜRLICHER FUNDORT", empty: "Für dieses Taxon liegt noch keine quellengebundene Verbreitungsangabe vor." },
    aquarium: { label: "AQUARISTIK", title: "FUNDORT & VERBREITUNG", empty: "Für diesen Fisch liegt noch keine quellengebundene Verbreitungsangabe vor." },
    terrarium: { label: "TERRARISTIK", title: "NATÜRLICHER FUNDORT", empty: "Für dieses Tier liegt noch keine quellengebundene Verbreitungsangabe vor." },
  },
  en: {
    botany: { label: "BOTANY", title: "NATIVE RANGE", empty: "No source-bound distribution record is available for this taxon yet." },
    aquarium: { label: "AQUATICS", title: "RANGE & DISTRIBUTION", empty: "No source-bound distribution record is available for this fish yet." },
    terrarium: { label: "TERRARIUM", title: "NATIVE RANGE", empty: "No source-bound distribution record is available for this animal yet." },
  },
} as const;

/**
 * These are region-centre coordinates, not occurrence points. They are only
 * used when the authoritative catalogue text explicitly names the region.
 * This deliberately avoids exposing a private observation or inventing an
 * exact wild location for a species.
 */
const REGION_POINTS: Array<{ aliases: string[]; point: RegionPoint }> = [
  { aliases: ["philippin", "philippines"], point: { label: "Philippinen", lat: 12.8797, lng: 121.774 } },
  { aliases: ["indonesien", "indonesia"], point: { label: "Indonesien", lat: -0.7893, lng: 113.9213 } },
  { aliases: ["malaysia", "borneo"], point: { label: "Malaysia / Borneo", lat: 4.2105, lng: 109.6729 } },
  { aliases: ["thailand"], point: { label: "Thailand", lat: 15.87, lng: 100.9925 } },
  { aliases: ["myanmar", "burma"], point: { label: "Myanmar", lat: 21.9162, lng: 95.956 } },
  { aliases: ["vietnam", "viet nam"], point: { label: "Vietnam", lat: 14.0583, lng: 108.2772 } },
  { aliases: ["südostasien", "südostasi", "south east asia", "southeast asia"], point: { label: "Südostasien", lat: 8.5, lng: 105.5 } },
  { aliases: ["tropisches asien", "tropische asien", "tropisches asi"], point: { label: "Tropisches Asien", lat: 15, lng: 105 } },
  { aliases: ["ostasien", "ostasi", "east asia", "china"], point: { label: "Ostasien", lat: 35, lng: 110 } },
  { aliases: ["japan"], point: { label: "Japan", lat: 36.2048, lng: 138.2529 } },
  { aliases: ["sri lanka", "sri la"], point: { label: "Sri Lanka", lat: 7.8731, lng: 80.7718 } },
  { aliases: ["papua-neuguinea", "papua-neugui", "papua new guinea"], point: { label: "Papua-Neuguinea", lat: -6.315, lng: 143.9555 } },
  { aliases: ["pazifik", "pacific"], point: { label: "Pazifikraum", lat: 0, lng: 160 } },
  { aliases: ["australien", "australie", "australia"], point: { label: "Australien", lat: -25.2744, lng: 133.7751 } },
  { aliases: ["westafrika", "westafri", "west africa"], point: { label: "Westafrika", lat: 9.1, lng: -10.8 } },
  { aliases: ["mexiko", "mexico"], point: { label: "Mexiko", lat: 23.6345, lng: -102.5528 } },
  { aliases: ["mittelamerika", "mittel- u", "central america"], point: { label: "Mittelamerika", lat: 14.6, lng: -90.5 } },
  { aliases: ["brasilien", "brasilie", "brazil"], point: { label: "Brasilien", lat: -14.235, lng: -51.9253 } },
  { aliases: ["peru"], point: { label: "Peru", lat: -9.19, lng: -75.0152 } },
  { aliases: ["ecuador"], point: { label: "Ecuador", lat: -1.8312, lng: -78.1834 } },
  { aliases: ["kolumbien", "kolumbie", "colombia"], point: { label: "Kolumbien", lat: 4.5709, lng: -74.2973 } },
  { aliases: ["südamerika", "südameri", "south america"], point: { label: "Südamerika", lat: -14, lng: -58 } },
  { aliases: ["karibik", "carribean"], point: { label: "Karibik", lat: 18.2, lng: -66.5 } },
  { aliases: ["europa", "europe"], point: { label: "Europa", lat: 50.5, lng: 15 } },
  { aliases: ["nordamerika", "north america"], point: { label: "Nordamerika", lat: 45, lng: -100 } },
];

function extractHabitat(summary?: string | null) {
  if (!summary) return null;
  const match = summary.match(/(?:Lebensraum|Fundort|Verbreitung|Habitat)\s*:\s*([^\n]+)/i);
  return match?.[1]?.split(/\s+(?:Merkmale|Pflege|Haltung)\s*:/i)[0]?.trim() || null;
}

function textValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function regionPoints(text: string | null) {
  if (!text) return [];
  const normalized = text.toLocaleLowerCase("de");
  const points: RegionPoint[] = [];
  for (const candidate of REGION_POINTS) {
    if (candidate.aliases.some(alias => normalized.includes(alias))) {
      if (!points.some(point => point.label === candidate.point.label)) points.push(candidate.point);
    }
  }
  return points.slice(0, 5);
}

export function TaxonRangeMap({ realm, summary, careProfile, source, sourceUrl }: TaxonRangeMapProps) {
  const { locale } = useI18n();
  const copy = realmCopy[locale][realm];
  const profile = careProfile ?? {};
  const habitat = extractHabitat(summary) ?? textValue(profile.habitat) ?? textValue(profile.nativeHabitat) ?? textValue(profile.distribution);
  const origin = textValue(profile.nativeRange) ?? textValue(profile.origin) ?? textValue(profile.nativeRegion);
  const regionText = [origin, habitat].filter(Boolean).join(" · ");
  const points = regionPoints(regionText || null);
  const conditions = [
    origin ? `${locale === "de" ? "Herkunft" : "Origin"}: ${origin}` : null,
    habitat ? `${locale === "de" ? "Habitat" : "Habitat"}: ${habitat}` : null,
    textValue(profile.water) ? `${locale === "de" ? "Wasser" : "Water"}: ${textValue(profile.water)}` : null,
    textValue(profile.temperature) ? `${locale === "de" ? "Temperatur" : "Temperature"}: ${textValue(profile.temperature)}` : null,
  ].filter(Boolean) as string[];
  const officialSource = officialTaxonSource(source);
  const verifiedSourceUrl = officialSource?.homepageUrl ?? sourceUrl ?? null;
  const verifiedSourceLabel = officialSource?.label ?? source ?? "Katalogquelle";
  const initialCenter = points[0] ?? { lat: 20, lng: 10 };
  const [mapError, setMapError] = useState<string | null>(null);

  return (
    <section className={`taxon-range-map taxon-range-map--${realm}`} aria-labelledby="taxon-range-heading">
      <div className="taxon-range-map__heading">
        <div><span className="eyebrow">{copy.label} · QUELLENKARTE</span><h2 id="taxon-range-heading">{copy.title}</h2></div>
        <Globe2 size={22} aria-hidden="true" />
      </div>
      {points.length ? (
        <div className="taxon-range-map__visual" role="region" aria-label={`Regionale Herkunftsorientierung: ${points.map(point => point.label).join(", ")}`}>
          <MapView
            key={points.map(point => point.label).join("|")}
            className="taxon-range-map__map"
            initialCenter={initialCenter}
            initialZoom={points.length === 1 ? 5 : 3}
            fallbackPoints={points}
            locale={locale}
            onMapError={error => setMapError(error.message)}
            onMapReady={map => {
              const bounds = new google.maps.LatLngBounds();
              for (const point of points) {
                new google.maps.Marker({ map, position: { lat: point.lat, lng: point.lng }, title: `${point.label} · regionale Orientierung` });
                bounds.extend({ lat: point.lat, lng: point.lng });
              }
              if (points.length > 1) map.fitBounds(bounds, 42);
            }}
          />
          {mapError ? <div className="taxon-range-map__map-error"><MapPin size={16} /><strong>{locale === "de" ? "Kartenbasis derzeit nicht verfügbar" : "Map base currently unavailable"}</strong><span>{mapError}</span></div> : null}
          <div className="taxon-range-map__map-caption"><MapPin size={14} />{points.map(point => point.label).join(" · ")}</div>
        </div>
      ) : (
        <div className="taxon-range-map__empty"><MapPin size={24} /><strong>{copy.empty}</strong><span>{locale === "de" ? "Keine Schätzung und kein erfundener Fundort werden angezeigt." : "No estimate or invented occurrence is shown."}</span></div>
      )}
      {conditions.length ? <ul className="taxon-range-map__facts">{conditions.map(fact => <li key={fact}>{fact}</li>)}</ul> : null}
      <div className="taxon-range-map__meta">
        <span><ShieldCheck size={14} /> {points.length ? "Regionale Orientierung · keine exakten Koordinaten" : "Keine Schätzung · keine erfundenen Fundorte"}</span>
        {verifiedSourceUrl ? <a href={verifiedSourceUrl} target="_blank" rel="noreferrer">Quelle: {verifiedSourceLabel}</a> : <small>Die Angabe wird erst nach fachlicher Prüfung veröffentlicht.</small>}
      </div>
    </section>
  );
}

export default TaxonRangeMap;
