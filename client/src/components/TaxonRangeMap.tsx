import { Globe2, MapPin, ShieldCheck } from "lucide-react";
import { officialTaxonSource } from "@shared/taxon-source-policy";

type TaxonRangeMapProps = {
  realm: "botany" | "aquarium" | "terrarium";
  summary?: string | null;
  source?: string | null;
  sourceUrl?: string | null;
};

const realmCopy = {
  botany: { label: "BOTANIK", title: "NATÜRLICHER FUNDORT", empty: "Für dieses Taxon liegt noch keine quellengebundene Verbreitungsangabe vor." },
  aquarium: { label: "AQUARISTIK", title: "FUNDORT & VERBREITUNG", empty: "Für diesen Fisch liegt noch keine quellengebundene Verbreitungsangabe vor." },
  terrarium: { label: "TERRARISTIK", title: "NATÜRLICHER FUNDORT", empty: "Für dieses Tier liegt noch keine quellengebundene Verbreitungsangabe vor." },
} as const;

function extractHabitat(summary?: string | null) {
  if (!summary) return null;
  const match = summary.match(/(?:Lebensraum|Fundort|Verbreitung|Habitat)\s*:\s*([^\n]+)/i);
  return match?.[1]?.trim() || null;
}

export function TaxonRangeMap({ realm, summary, source, sourceUrl }: TaxonRangeMapProps) {
  const copy = realmCopy[realm];
  const habitat = extractHabitat(summary);
  const officialSource = officialTaxonSource(source);
  const verifiedSourceUrl = officialSource?.homepageUrl ?? sourceUrl ?? null;
  const verifiedSourceLabel = officialSource?.label ?? source ?? "Katalogquelle";
  return (
    <section className={`taxon-range-map taxon-range-map--${realm}`} aria-labelledby="taxon-range-heading">
      <div className="taxon-range-map__heading">
        <div><span className="eyebrow">{copy.label} · QUELLENKARTE</span><h2 id="taxon-range-heading">{copy.title}</h2></div>
        <Globe2 size={22} aria-hidden="true" />
      </div>
      <div className="taxon-range-map__visual" role="img" aria-label={habitat ? `Verbreitungsangabe: ${habitat}` : "Keine quellengebundene Verbreitungsangabe vorhanden"}>
        <span className="taxon-range-map__contour taxon-range-map__contour--one" />
        <span className="taxon-range-map__contour taxon-range-map__contour--two" />
        <span className="taxon-range-map__pin"><MapPin size={24} /></span>
        <span className="taxon-range-map__caption">{habitat ?? "VERBREITUNG NOCH OFFEN"}</span>
      </div>
      <div className="taxon-range-map__meta">
        <span><ShieldCheck size={14} /> {habitat ? "Quellengebunden · keine exakten Privatkoordinaten" : "Keine Schätzung · keine erfundenen Fundorte"}</span>
        {verifiedSourceUrl ? <a href={verifiedSourceUrl} target="_blank" rel="noreferrer">Quelle: {verifiedSourceLabel}</a> : <small>Die Angabe wird erst nach fachlicher Prüfung veröffentlicht.</small>}
      </div>
    </section>
  );
}

export default TaxonRangeMap;
