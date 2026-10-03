import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, ChevronLeft, ChevronRight, Fish, Leaf, List, Map, Search, ShieldCheck, Sprout, WifiOff, X } from "lucide-react";
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

type PlantInspiration = { id: number; name: string; hook: string; note: string; image: string; care: string[] };
const plantInspiration: PlantInspiration[] = [
  { id: 10, name: "Anubias barteri", hook: "Robuste Aufsitzerpflanze", note: "Schattenplätze · langsam wachsend", image: "anubias.jpg", care: ["Licht: niedrig–mittel", "pH: 6,0–7,8", "Temperatur: 22–28 °C", "CO₂: optional", "Wasserhärte: weich–hart"] },
  { id: 30062, name: "Bucephalandra motleyana", hook: "Kleine Blätter, große Wirkung", note: "Auf Holz und Stein · Strömung", image: "buce.jpg", care: ["Licht: niedrig–mittel", "pH: 5,5–7,5", "Temperatur: 20–28 °C", "CO₂: optional", "Rhizom: nicht einpflanzen"] },
  { id: 13, name: "Cryptocoryne wendtii", hook: "Wandelbare Unterwasserrosette", note: "Mittelgrund · ruhige Eingewöhnung", image: "crypt.jpg", care: ["Licht: niedrig–mittel", "pH: 6,0–8,0", "Temperatur: 22–28 °C", "CO₂: hilfreich", "Boden: nährstoffreich"] },
  { id: 30073, name: "Echinodorus palaefolius", hook: "Der grüne Solitär", note: "Hintergrund · nährstoffreicher Boden", image: "echinodorus.jpg", care: ["Licht: mittel–hoch", "pH: 6,0–7,5", "Temperatur: 22–28 °C", "CO₂: hilfreich", "Boden: tief und nährstoffreich"] },
  { id: 17, name: "Microsorum pteropus", hook: "Javafarn für natürliche Räume", note: "Aufsitzer · wenig Licht", image: "microsorum.jpg", care: ["Licht: niedrig–mittel", "pH: 5,5–8,0", "Temperatur: 20–28 °C", "CO₂: optional", "Rhizom: aufbinden"] },
  { id: 30076, name: "Hygrophila polysperma", hook: "Schneller grüner Akzent", note: "Hintergrund · regelmäßiger Rückschnitt", image: "hygrophila.jpg", care: ["Licht: niedrig–hoch", "pH: 6,0–8,0", "Temperatur: 20–30 °C", "CO₂: optional", "Pflege: häufig trimmen"] },
  { id: 18, name: "Taxiphyllum barbieri", hook: "Weiches Moos für Holz und Stein", note: "Aufsitzer · dichter Rückschnitt", image: "moss.jpg", care: ["Licht: niedrig–mittel", "pH: 5,0–8,0", "Temperatur: 18–30 °C", "CO₂: optional", "Pflege: regelmäßig ausdünnen"] },
  { id: 19, name: "Vesicularia dubyana", hook: "Klassisches Javamoos", note: "Dunklere Plätze · langsam etablieren", image: "vesicularia.jpg", care: ["Licht: niedrig–mittel", "pH: 5,5–8,0", "Temperatur: 20–28 °C", "CO₂: optional", "Aufsitzer: nicht bedecken"] },
  { id: 20, name: "Hemianthus callitrichoides", hook: "Feiner grüner Bodenteppich", note: "Starkes Licht · CO₂ hilfreich", image: "hemianthus.jpg", care: ["Licht: hoch", "pH: 5,5–7,5", "Temperatur: 20–28 °C", "CO₂: empfohlen", "Boden: feiner Soil"] },
  { id: 24, name: "Alternanthera reineckii", hook: "Roter Farbakzent", note: "Licht und Nährstoffe · Rückschnitt", image: "alternanthera.jpg", care: ["Licht: mittel–hoch", "pH: 6,0–7,5", "Temperatur: 22–28 °C", "CO₂: empfohlen", "Pflege: Triebspitzen schneiden"] },
  { id: 4, name: "Vallisneria spiralis", hook: "Bandblätter für den Hintergrund", note: "Robuster Ausläufer · schnell etablierend", image: "/manus-storage/catalog/taxa/plant/4/inat-167562447_1334157f.jpg", care: ["Licht: niedrig–mittel", "pH: 6,0–8,5", "Temperatur: 18–30 °C", "CO₂: optional", "Boden: Wurzelzehrer"] },
  { id: 22, name: "Rotala rotundifolia", hook: "Variable Stängelpflanze", note: "Mittelgrund · bei Licht rötlich", image: "/manus-storage/catalog/taxa/plant/22/inat-117331653_d2a483c1.jpg", care: ["Licht: mittel–hoch", "pH: 5,5–7,5", "Temperatur: 20–30 °C", "CO₂: hilfreich", "Pflege: Triebe regelmäßig kürzen"] },
  { id: 23, name: "Ludwigia repens", hook: "Roter Kontrast im Pflanzengrupp", note: "Hintergrund · kräftige Nährstoffzehrerin", image: "/manus-storage/catalog/taxa/plant/23/inat-354310043_e7c983a9.jpg", care: ["Licht: mittel–hoch", "pH: 6,0–7,5", "Temperatur: 20–28 °C", "CO₂: hilfreich", "Nährstoffe: Nitrat und Eisen"] },
  { id: 30077, name: "Limnophila aquatica", hook: "Große feinfiedrige Blätter", note: "Hintergrund · regelmäßiger Rückschnitt", image: "/manus-storage/catalog/taxa/plant/30077/inat-191539749_cabfe9b6.jpg", care: ["Licht: mittel–hoch", "pH: 6,0–7,5", "Temperatur: 22–28 °C", "CO₂: empfohlen", "Pflege: Kopfstecklinge setzen"] },
  { id: 30078, name: "Limnophila aromatica", hook: "Aromatische Farbstruktur", note: "Mittelgrund · bei starkem Licht kompakt", image: "/manus-storage/catalog/taxa/plant/30078/inat-298348334_15eb1083.jpg", care: ["Licht: hoch", "pH: 5,5–7,0", "Temperatur: 22–28 °C", "CO₂: empfohlen", "Nährstoffe: Mikro- und Makroelemente"] },
  { id: 30079, name: "Limnophila sessiliflora", hook: "Pflegeleichte Fiederpflanze", note: "Hintergrund · schnell wachsend", image: "/manus-storage/catalog/taxa/plant/30079/inat-218527569_8ac21c5c.jpg", care: ["Licht: niedrig–mittel", "pH: 5,5–8,0", "Temperatur: 20–30 °C", "CO₂: optional", "Pflege: wöchentlich auslichten"] },
  { id: 30082, name: "Ludwigia palustris", hook: "Kompakter roter Stängel", note: "Mittelgrund · starke Farbe bei viel Licht", image: "/manus-storage/catalog/taxa/plant/30082/inat-310494289_5fc27722.jpg", care: ["Licht: mittel–hoch", "pH: 6,0–7,5", "Temperatur: 18–28 °C", "CO₂: hilfreich", "Pflege: Kopfstecklinge vermehren"] },
  { id: 30089, name: "Staurogyne repens", hook: "Kompakter Bodendecker", note: "Vordergrund · buschig durch Rückschnitt", image: "/images/discover-plants/crypt.jpg", care: ["Licht: mittel–hoch", "pH: 6,0–7,5", "Temperatur: 20–28 °C", "CO₂: hilfreich", "Boden: nährstoffreich"] },
];
type PlantFilter = "all" | "Aufsitzer" | "Bodendecker" | "Schnellwachsend";
const plantTags: Record<number, PlantFilter[]> = { 10: ["Aufsitzer"], 30062: ["Aufsitzer"], 13: ["Schnellwachsend"], 30073: ["Schnellwachsend"], 17: ["Aufsitzer"], 30076: ["Schnellwachsend"], 18: ["Aufsitzer"], 19: ["Aufsitzer"], 20: ["Bodendecker"], 24: ["Schnellwachsend"], 4: ["Schnellwachsend"], 22: ["Schnellwachsend"], 23: ["Schnellwachsend"], 30077: ["Schnellwachsend"], 30078: ["Schnellwachsend"], 30079: ["Schnellwachsend"], 30082: ["Schnellwachsend"], 30089: ["Bodendecker"] };
const plantSource = "Recherchierte Referenzquelle";
const plantLicense = "Lizenzhinweis am Original";
const plantImageSrc = (image: string) => image.startsWith("/") ? image : `/images/discover-plants/${image}`;

export default function Explore() {
  const { locale } = useI18n();
  const [realm, setRealm] = useState<RealmFilter>("all");
  const [view, setView] = useState<ViewMode>("map");
  const [mapMode, setMapMode] = useState(false);
  const [plantMapQuery, setPlantMapQuery] = useState("");
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapAttempt, setMapAttempt] = useState(0);
  const [plantFilter, setPlantFilter] = useState<PlantFilter>("all");
  const [gallery, setGallery] = useState<{ name: string; images: string[]; index: number } | null>(null);
  const observations = trpc.observations.publicFeed.useQuery({ realm: realm === "all" ? undefined : realm, limit: 20 }, { retry: false, enabled: mapMode });
  const mapObservations = trpc.observations.map.useQuery({ realm: realm === "all" ? undefined : realm, limit: 200 }, { retry: false, enabled: mapMode });
  const title = locale === "de" ? "WASSER VERBINDET." : "WATER CONNECTS.";
  const intro = locale === "de" ? "FORSCHEN · ENTDECKEN · SCHÜTZEN" : "RESEARCH · DISCOVER · PROTECT";
  const observationRows = observations.data ?? [];
  const observationBusy = observations.isLoading || observations.isFetching;
  const visiblePlants = plantInspiration.filter(({ id }) => plantFilter === "all" || plantTags[id].includes(plantFilter));
  const mapPoints: OpenStreetMapPoint[] = (mapObservations.data ?? []).filter(point => !plantMapQuery.trim() || `${point.label} ${point.realm}`.toLocaleLowerCase().includes(plantMapQuery.trim().toLocaleLowerCase())).map(point => ({
    lat: point.latitude,
    lng: point.longitude,
    label: point.label,
    detail: `${realmLabels[point.realm]} · ${point.geoprivacy === "obscured" ? "vergröberter Ort" : "öffentlicher Ort"}`,
  }));

  useEffect(() => {
    const syncHash = () => setMapMode(window.location.hash === "#map");
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  return (
    <div className="observatory-route observatory-route--botany observatory-explore-page">
      <Link className="observatory-search-bar" href="/search">
        <Search size={18} /><span>{locale === "de" ? "Arten, Orte, Themen, Community …" : "Species, places, topics, community …"}</span><ArrowRight size={16} />
      </Link>

      <ObservatoryContextHeader tone="botany" image={REFERENCE_ASSETS.aquarium} eyebrow="UNSER OBSERVATORIUM" title={title} subtitle={intro} icon={Map} badge="PORTALE" />

      {!mapMode ? <section className="observatory-section" aria-labelledby="portal-heading">
        <div className="observatory-section__heading"><span className="eyebrow">PORTALE</span><h2 id="portal-heading">{locale === "de" ? "Deine Fachbereiche" : "Your specialist areas"}</h2></div>
        <div className="observatory-portal-grid">
          {portalCards.map(({ title: cardTitle, subtitle, href, image, tone, icon: Icon }) => <Link key={href} href={href} className={`observatory-portal-card observatory-portal-card--${tone}`} style={{ backgroundImage: `url(${image})` }}><span className="observatory-portal-card__icon"><Icon size={22} /></span><span><strong>{cardTitle}</strong><small>{subtitle}</small></span><ArrowRight size={17} /></Link>)}
        </div>
      </section> : null}

      {!mapMode ? <section className="explore-inspiration" aria-labelledby="inspiration-heading">
        <div className="observatory-section__heading"><div><span className="eyebrow">NEUE IDEEN · BOTANIK</span><h2 id="inspiration-heading">PFLANZEN ZUM ENTDECKEN</h2></div><Link className="secondary-action" href="/search">KATALOG ÖFFNEN <ArrowRight size={14} /></Link></div>
        <p className="explore-inspiration__intro">Lass dich von echten Arten inspirieren und öffne den Katalog für Quellen, Standort und Pflegewissen.</p>
        <div className="explore-inspiration__filters" role="group" aria-label="Pflanzenfilter">{(["all", "Aufsitzer", "Bodendecker", "Schnellwachsend"] as PlantFilter[]).map(filter => <button type="button" key={filter} className={plantFilter === filter ? "active" : ""} onClick={() => setPlantFilter(filter)}>{filter === "all" ? "Alle Arten" : filter}</button>)}</div>
        <div className="explore-inspiration__grid">{visiblePlants.map((plant, index) => { const second = visiblePlants[(index + 1) % visiblePlants.length]?.image ?? plant.image; return <Link key={plant.id} href={`/plant/${plant.id}`} className={`explore-inspiration-card explore-inspiration-card--${(index % 3) + 1}`} aria-label={`${plant.name} – ausführliche Pflegehinweise öffnen`}><span className="explore-inspiration-card__number">{String(index + 1).padStart(2, "0")}</span><div className="explore-inspiration-card__gallery"><img src={plantImageSrc(plant.image)} alt={`${plant.name} – Pflanzenbild`} loading="lazy" onClick={event => { event.preventDefault(); event.stopPropagation(); setGallery({ name: plant.name, images: [plant.image, second], index: 0 }); }} /><img src={plantImageSrc(second)} alt={`${plant.name} – weiteres Pflanzenbild`} loading="lazy" onClick={event => { event.preventDefault(); event.stopPropagation(); setGallery({ name: plant.name, images: [plant.image, second], index: 1 }); }} /></div><span><strong>{plant.name}</strong><b>{plant.hook}</b><small>{plant.note}</small><div className="explore-inspiration-card__care" aria-label={`${plant.name} Pflegeparameter`}>{plant.care.map(parameter => <small key={parameter}>{parameter}</small>)}</div><small className="explore-inspiration-card__credit">Quelle: {plant.id >= 4 && plant.id !== 10 && plant.id !== 13 && plant.id !== 17 && plant.id !== 18 && plant.id !== 19 && plant.id !== 20 && plant.id !== 24 ? "iNaturalist · " : "Recherchierte Referenzquelle · "}Lizenz: {plant.id >= 4 && plant.id !== 10 && plant.id !== 13 && plant.id !== 17 && plant.id !== 18 && plant.id !== 19 && plant.id !== 20 && plant.id !== 24 ? "CC BY / Originalhinweis" : plantLicense}</small></span><ArrowRight size={16} /></Link>; })}</div>
      </section> : null}
      {gallery ? <div className="discover-gallery-lightbox" role="dialog" aria-modal="true" aria-label={`${gallery.name} Bildergalerie`} onMouseDown={event => { if (event.target === event.currentTarget) setGallery(null); }}><button type="button" className="discover-gallery-lightbox__close" aria-label="Galerie schließen" onClick={() => setGallery(null)}><X size={22} /></button>{gallery.images.length > 1 ? <button type="button" className="discover-gallery-lightbox__nav discover-gallery-lightbox__nav--prev" aria-label="Vorheriges Bild" onClick={() => setGallery(current => current ? { ...current, index: (current.index - 1 + current.images.length) % current.images.length } : null)}><ChevronLeft size={34} /></button> : null}<figure><img src={plantImageSrc(gallery.images[gallery.index])} alt={`${gallery.name} – Vollbild`} /><figcaption>{gallery.name} · {gallery.index + 1} / {gallery.images.length}</figcaption></figure>{gallery.images.length > 1 ? <button type="button" className="discover-gallery-lightbox__nav discover-gallery-lightbox__nav--next" aria-label="Nächstes Bild" onClick={() => setGallery(current => current ? { ...current, index: (current.index + 1) % current.images.length } : null)}><ChevronRight size={34} /></button> : null}</div> : null}

      {mapMode ? <section className="observatory-observation-panel" id="map" aria-labelledby="observation-heading">
        <div className="observatory-section__heading"><div><span className="eyebrow">KARTE &amp; LISTE · SYNCHRONISIERT</span><h2 id="observation-heading">{locale === "de" ? "Beobachten. Einordnen. Teilen." : "Observe. Classify. Share."}</h2></div><span className={`observatory-status observatory-status--${observations.isError ? "error" : observationBusy ? "loading" : observations.isSuccess && !observations.isFetching ? "ready" : "loading"}`}><i />{observations.isError ? "NICHT VERFÜGBAR" : observationBusy ? "SYNC …" : observations.isSuccess && !observations.isFetching ? "BEREIT" : "AKTUALISIERT"}</span></div>
        <div className="observatory-observation-toolbar" role="group" aria-label="Beobachtungsbereich">
          <div className="observatory-filter-pills">{(Object.keys(realmLabels) as RealmFilter[]).map(key => <button type="button" key={key} className={realm === key ? "active" : ""} aria-pressed={realm === key} onClick={() => setRealm(key)}>{realmLabels[key]}</button>)}</div><label className="observatory-map-search"><Search size={15} /><input value={plantMapQuery} onChange={event => setPlantMapQuery(event.target.value)} placeholder={locale === "de" ? "Pflanze oder Ort auf Karte suchen …" : "Search plant or place on map …"} aria-label={locale === "de" ? "Pflanze oder Ort auf Karte suchen" : "Search plant or place on map"} /></label>
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
      </section> : null}

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
