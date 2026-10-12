import { Droplets, Gauge, Leaf, Ruler, Sun, Thermometer, Waves } from "lucide-react";

type Props = {
  realm: "botany" | "aquarium" | "terrarium";
  profile: Record<string, unknown> | null;
};

const labels: Record<string, string> = {
  careLevel: "PFLEGEAUFWAND",
  light: "LICHT",
  water: "WASSER",
  temperature: "TEMPERATUR",
  humidity: "LUFTFEUCHTE",
  substrate: "SUBSTRAT",
  size: "GRÖSSE",
  feeding: "ERNÄHRUNG",
  behavior: "VERHALTEN",
  habitat: "LEBENSRAUM",
  nativeHabitat: "NATÜRLICHES HABITAT",
  nativeRange: "NATÜRLICHE VERBREITUNG",
  origin: "HERKUNFT",
  distribution: "VERBREITUNG",
};

const iconFor = (key: string) => key === "light" ? Sun : key === "water" ? Waves : key === "temperature" ? Thermometer : key === "humidity" ? Droplets : key === "size" ? Ruler : key === "careLevel" ? Gauge : Leaf;

function valueOf(value: unknown) {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

export function TaxonFactSheet({ realm, profile }: Props) {
  const entries = Object.entries(profile ?? {}).map(([key, value]) => [key, valueOf(value)] as const).filter((entry): entry is readonly [string, string] => Boolean(entry[1]) && Boolean(labels[entry[0]]));
  if (!entries.length) return <section className={`taxon-facts taxon-facts--${realm} observatory-data-panel`}><div className="section-heading"><div><span className="eyebrow">{realm === "botany" ? "BOTANIK" : realm === "aquarium" ? "AQUARISTIK" : "TERRARISTIK"}</span><h2>STECKBRIEF</h2></div><Leaf size={22} /></div><p className="taxon-facts__empty">Für diesen Datensatz sind noch keine geprüften Pflege- und Haltungsfelder veröffentlicht.</p></section>;
  return <section className={`taxon-facts taxon-facts--${realm} observatory-data-panel`}><div className="section-heading"><div><span className="eyebrow">{realm === "botany" ? "BOTANIK" : realm === "aquarium" ? "AQUARISTIK" : "TERRARISTIK"} · DATENBLATT</span><h2>STECKBRIEF</h2></div><Leaf size={22} /></div><div className="taxon-facts__grid">{entries.map(([key, value]) => { const Icon = iconFor(key); return <div className="taxon-fact" key={key}><Icon size={17} aria-hidden="true" /><div><strong>{labels[key]}</strong><span>{value}</span></div></div>; })}</div><p className="taxon-disclaimer">Quellengebundener Katalogauszug. Pflege, Haltung und Tierwohl bitte vor der Umsetzung mit den vollständigen Fachquellen abgleichen.</p></section>;
}
