import { useState } from "react";
import { ArrowRight, BookOpen, Fish, Leaf, List, Map, Search, ShieldCheck, Sprout, WifiOff } from "lucide-react";
import { Link } from "wouter";
import { useI18n } from "@/i18n";
import { trpc } from "@/lib/trpc";
import { REFERENCE_ASSETS, WORLD_ASSETS } from "@/lib/worlds";
import { ObservatoryContextHeader } from "@/components/ObservatoryPrimitives";
import { MapView } from "@/components/Map";
import type { OpenStreetMapPoint } from "@/components/OpenStreetMap";

type RealmFilter = "all" | "botany" | "aquarium" | "terrarium";
type ViewMode = "map" | "list";

const portalCards = [
  { title: "Botanik", subtitle: "Wasserpflanzen", href: "/botanik", image: WORLD_ASSETS.botany, tone: "botany", icon: Leaf },
  { title: "Aquaristik", subtitle: "Fische & Wirbellose", href: "/aquaristik", image: WORLD_ASSETS.aquarium, tone: "aquarium", icon: Fish },
  { title: "Terraristik", subtitle: "Reptilien & Amphibien", href: "/terraristik", image: WORLD_ASSETS.terrarium, tone: "terrarium", icon: Sprout },
] as const;

const realmLabels: Record<RealmFilter, string> = { all: "Alle", botany: "Botanik", aquarium: "Aquaristik", terrarium: "Terraristik" };

const plantInspiration = [
  [10, "Anubias barteri", "Robuste Aufsitzerpflanze", "Schattenplätze · langsam wachsend", "anubias.jpg"],
  [30062, "Bucephalandra motleyana", "Kleine Blätter, große Wirkung", "Auf Holz und Stein · Strömung", "buce.jpg"],
  [13, "Cryptocoryne wendtii", "Wandelbare Unterwasserrosette", "Mittelgrund · ruhige Eingewöhnung", "crypt.jpg"],
  [30073, "Echinodorus palaefolius", "Der grüne Solitär", "Hintergrund · nährstoffreicher Boden", "echinodorus.jpg"],
  [17, "Microsorum pteropus", "Javafarn für natürliche Räume", "Aufsitzer · wenig Licht", "microsorum.jpg"],
  [30076, "Hygrophila polysperma", "Schneller grüner Akzent", "Hintergrund · regelmäßiger Rückschnitt", "hygrophila.jpg"],
  [18, "Taxiphyllum barbieri", "Weiches Moos für Holz und Stein", "Aufsitzer · dichter Rückschnitt", "moss.jpg"],
  [19, "Vesicularia dubyana", "Klassisches Javamoos", "Dunklere Plätze · langsam etablieren", "vesicularia.jpg"],
  [20, "Hemianthus callitrichoides", "Feiner grüner Bodenteppich", "Starkes Licht · CO₂ hilfreich", "hemianthus.jpg"],
  [24, "Alternanthera reineckii", "Roter Farbakzent", "Licht und Nährstoffe · Rückschnitt", "alternanthera.jpg"],
] as const;
type PlantFilter = "all" | "Aufsitzer" | "Bodendecker" | "Schnellwachsend";
const plantTags: Record<number, PlantFilter[]> = { 10: ["Aufsitzer"], 30062: ["Aufsitzer"], 13: ["Schnellwachsend"], 30073: ["Schnellwachsend"], 17: ["Aufsitzer"], 30076: ["Schnellwachsend"], 18: ["Aufsitzer"], 19: ["Aufsitzer"], 20: ["Bodendecker"], 24: ["Schnellwachsend"] };
const plantSource = "Recherchierte Referenzquelle";
const plantLicense = "Lizenzhinweis am Original";

export default function Explore() {
  const { locale } = useI18n();
  const [realm, setRealm] = useState<RealmFilter>("all");
  const [view, setView] = useState<ViewMode>("map");
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapAttempt, setMapAttempt] = useState(0);
  const [plantFilter, setPlantFilter] = useState<PlantFilter>("all");
  const observations = trpc.observations.publicFeed.useQuery({ realm: realm === "all" ? undefined : realm, limit: 20 }, { retry: false });
  const mapObservations = trpc.observations.map.useQuery({ realm: realm === "all" ? undefined : realm, limit: 200 }, { retry: false });
  const title = locale === "de" ? "WASSER VERBINDET." : "WATER CONNECTS.";
  const intro = locale === "de" ? "FORSCHEN · ENTDECKEN · SCHÜTZEN" : "RESEARCH · DISCOVER · PROTECT";
  const observationRows = observations.data ?? [];
  const observationBusy = observations.isLoading || observations.isFetching;
  const visiblePlants = plantInspiration.filter(([id]) => plantFilter === "all" || plantTags[id].includes(plantFilter));
  const mapPoints: OpenStreetMapPoint[] = (mapObservations.data ?? []).map(point => ({
    lat: point.latitude,
    lng: point.longitude,
    label: point.label,
    detail: `${realmLabels[point.realm]} · ${point.geoprivacy === "obscured" ? "vergröberter Ort" : "öffentlicher Ort"}`,
  }));

  return (
    <div className="observatory-route observatory-route--botany observatory-explore-page">
      <Link className="observatory-search-bar" href="/search">
        <Search size={18} /><span>{locale === "de" ? "Arten, Orte, Themen, Community …" : "Species, places, topics, community …"}</span><ArrowRight size={16} />
      </Link>

      <ObservatoryContextHeader tone="botany" image={REFERENCE_ASSETS.aquarium} eyebrow="UNSER OBSERVATORIUM" title={title} subtitle={intro} icon={Map} badge="PORTALE" />

      <section className="observatory-section" aria-labelledby="portal-heading">
        <div className="observatory-section__heading"><span className="eyebrow">PORTALE</span><h2 id="portal-heading">{locale === "de" ? "Deine Fachbereiche" : "Your specialist areas"}</h2></div>
        <div className="observatory-portal-grid">
          {portalCards.map(({ title: cardTitle, subtitle, href, image, tone, icon: Icon }) => <Link key={href} href={href} className={`observatory-portal-card observatory-portal-card--${tone}`} style={{ backgroundImage: `url(${image})` }}><span className="observatory-portal-card__icon"><Icon size={22} /></span><span><strong>{cardTitle}</strong><small>{subtitle}</small></span><ArrowRight size={17} /></Link>)}
        </div>
      </section>

      <section className="explore-inspiration" aria-labelledby="inspiration-heading">
        <div className="observatory-section__heading"><div><span className="eyebrow">NEUE IDEEN · BOTANIK</span><h2 id="inspiration-heading">PFLANZEN ZUM ENTDECKEN</h2></div><Link className="secondary-action" href="/search">KATALOG ÖFFNEN <ArrowRight size={14} /></Link></div>
        <p className="explore-inspiration__intro">Lass dich von echten Arten inspirieren und öffne den Katalog für Quellen, Standort und Pflegewissen.</p>
        <div className="explore-inspiration__filters" role="group" aria-label="Pflanzenfilter">{(["all", "Aufsitzer", "Bodendecker", "Schnellwachsend"] as PlantFilter[]).map(filter => <button type="button" key={filter} className={plantFilter === filter ? "active" : ""} onClick={() => setPlantFilter(filter)}>{filter === "all" ? "Alle Arten" : filter}</button>)}</div>
        <div className="explore-inspiration__grid">{visiblePlants.map(([id, name, hook, note, image], index) => { const second = visiblePlants[(index + 1) % visiblePlants.length]?.[4] ?? image; return <Link key={id} href={`/plant/${id}`} className={`explore-inspiration-card explore-inspiration-card--${(index % 3) + 1}`} aria-label={`${name} – ausführliche Pflegehinweise öffnen`}><span className="explore-inspiration-card__number">0{index + 1}</span><div className="explore-inspiration-card__gallery"><img src={`/images/discover-plants/${image}`} alt={`${name} – Pflanzenbild`} loading="lazy" /><img src={`/images/discover-plants/${second}`} alt={`${name} – weiteres Pflanzenbild`} loading="lazy" /></div><span><strong>{name}</strong><b>{hook}</b><small>{note}</small><small className="explore-inspiration-card__credit">Quelle: {plantSource} · Lizenz: {plantLicense}</small></span><ArrowRight size={16} /></Link>; })}</div>
      </section>

      <section className="observatory-observation-panel" id="map" aria-labelledby="observation-heading">
        <div className="observatory-section__heading"><div><span className="eyebrow">KARTE &amp; LISTE · SYNCHRONISIERT</span><h2 id="observation-heading">{locale === "de" ? "Beobachten. Einordnen. Teilen." : "Observe. Classify. Share."}</h2></div><span className={`observatory-status observatory-status--${observations.isError ? "error" : observationBusy ? "loading" : observations.isSuccess && !observations.isFetching ? "ready" : "loading"}`}><i />{observations.isError ? "NICHT VERFÜGBAR" : observationBusy ? "SYNC …" : observations.isSuccess && !observations.isFetching ? "BEREIT" : "AKTUALISIERT"}</span></div>
        <div className="observatory-observation-toolbar" role="group" aria-label="Beobachtungsbereich">
          <div className="observatory-filter-pills">{(Object.keys(realmLabels) as RealmFilter[]).map(key => <button type="button" key={key} className={realm === key ? "active" : ""} aria-pressed={realm === key} onClick={() => setRealm(key)}>{realmLabels[key]}</button>)}</div>
          <div className="observatory-view-toggle" role="group" aria-label="Ansicht"><button type="button" className={view === "map" ? "active" : ""} aria-pressed={view === "map"} onClick={() => setView("map")}><Map size={15} /> Karte</button><button type="button" className={view === "list" ? "active" : ""} aria-pressed={view === "list"} onClick={() => setView("list")}><List size={15} /> Liste</button></div>
        </div>
        <div className={`observatory-observation-grid observatory-observation-grid--${view}`}>
          <div className="observatory-map-panel observatory-map-panel--interactive">
            <div className="observatory-map-fallback" aria-hidden="true"><span>ÖFFENTLICHE DATENEBENE</span><span>EUROPA · GENERALISIERTE ORTE</span><i /></div>
            <MapView key={mapAttempt} className="observatory-google-map" initialCenter={{ lat: 51.1657, lng: 10.4515 }} initialZoom={5} points={mapPoints} onMapError={error => setMapError(error.message)} />
            <div className="observatory-map-overlay"><span className="eyebrow">BLACKWATERLEAF · ÖFFENTLICHE KARTENBASIS</span><strong>{observations.isError || mapObservations.isError ? "Datenfeed nicht erreichbar" : mapPoints.length ? `${mapPoints.length} freigegebene Kartenpunkt${mapPoints.length === 1 ? "" : "e"}` : "Noch keine öffentlichen Kartenpunkte"}</strong><small>{mapError ? "Die interaktive Kartenbasis konnte nicht geladen werden. Die Liste bleibt als sichere Alternative verfügbar." : "Exakte private Standorte bleiben verborgen. Pins erscheinen erst, wenn generalisierte Ortsdaten ausdrücklich freigegeben sind."}</small>{mapError ? <button type="button" className="secondary-action" onClick={() => { setMapError(null); setMapAttempt(attempt => attempt + 1); }}>KARTE ERNEUT LADEN</button> : null}</div>
          </div>
          <div className="observatory-catalog-list"><div className="observatory-list-heading"><span>BEOBACHTUNGEN · {realmLabels[realm].toUpperCase()}</span><Link href="/search">KATALOG öffnen <ArrowRight size={14} /></Link></div>{observationBusy ? <p className="observatory-inline-state">Beobachtungen werden synchronisiert …</p> : observations.isError ? <p className="observatory-inline-state">Beobachtungen derzeit nicht erreichbar. Die Katalogsuche bleibt nutzbar.</p> : observationRows.length ? observationRows.map(row => <div key={row.id} className="observatory-observation-item"><span className="observatory-observation-item__icon">{row.realm === "aquarium" ? <Fish size={20} /> : row.realm === "terrarium" ? <Sprout size={20} /> : <Leaf size={20} />}</span><span><strong>{row.scientificName ?? row.subject ?? "Unbestimmte Beobachtung"}</strong><small>{realmLabels[row.realm as RealmFilter] ?? row.realm} · {row.evidenceState === "confirmed" ? "bestätigt" : "Nachweis wird geprüft"}</small></span><span className="observatory-observation-item__state">{row.visibility === "public" ? "öffentlich" : "geschützt"}</span></div>) : <p className="observatory-inline-state">Noch keine öffentlichen Beobachtungen in diesem Bereich. Private Daten bleiben geschützt.</p>}</div>
        </div>
      </section>

      <section className="observatory-feature-card observatory-feature-card--catalog">
        <div className="observatory-feature-card__visual" aria-hidden="true"><BookOpen size={34} /></div>
        <div><span className="eyebrow">KATALOG · ARTEN</span><h2>{locale === "de" ? "VALIDIERTE ARTEN SUCHEN" : "SEARCH VALIDATED SPECIES"}</h2><p>{locale === "de" ? "Öffne die Suche für veröffentlichte Taxa mit transparentem Nachweisstatus." : "Open search for published taxa with a transparent evidence status."}</p></div>
        <Link href="/search" aria-label="Katalogsuche öffnen"><ArrowRight size={22} /></Link>
      </section>

      <section className="observatory-evidence-panel"><div><BookOpen size={22} /><span><strong>QUELLEN &amp; BELEGE</strong><small>Fachliteratur, Beobachtungen, Fotos und Community</small></span></div><Link href="/knowledge"><ShieldCheck size={18} /> Quellen öffnen <ArrowRight size={15} /></Link></section>
      <section className="observatory-offline-panel"><WifiOff size={21} /><span><strong>Offline-Hinweis</strong><small>Eine Offline-Synchronisierung wird nur angezeigt, wenn sie technisch aktiv ist.</small></span></section>
    </div>
  );
}
