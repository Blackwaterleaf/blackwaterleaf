import { useState } from "react";
import { ArrowRight, BookOpen, Fish, Leaf, List, Map, MapPin, Search, ShieldCheck, Sprout, WifiOff } from "lucide-react";
import { Link } from "wouter";
import { useI18n } from "@/i18n";
import { trpc } from "@/lib/trpc";
import { REFERENCE_ASSETS, WORLD_ASSETS } from "@/lib/worlds";

type RealmFilter = "all" | "botany" | "aquarium" | "terrarium";
type ViewMode = "map" | "list";

const portalCards = [
  { title: "Botanik", subtitle: "Wasserpflanzen", href: "/botanik", image: WORLD_ASSETS.botany, tone: "botany", icon: Leaf },
  { title: "Aquaristik", subtitle: "Fische & Wirbellose", href: "/aquaristik", image: WORLD_ASSETS.aquarium, tone: "aquarium", icon: Fish },
  { title: "Terraristik", subtitle: "Reptilien & Amphibien", href: "/terraristik", image: WORLD_ASSETS.terrarium, tone: "terrarium", icon: Sprout },
] as const;

const realmLabels: Record<RealmFilter, string> = { all: "Alle", botany: "Botanik", aquarium: "Aquaristik", terrarium: "Terraristik" };

export default function Explore() {
  const { locale } = useI18n();
  const [realm, setRealm] = useState<RealmFilter>("all");
  const [view, setView] = useState<ViewMode>("map");
  const observations = trpc.observations.publicFeed.useQuery({ realm: realm === "all" ? undefined : realm, limit: 20 }, { retry: false });
  const title = locale === "de" ? "WASSER VERBINDET." : "WATER CONNECTS.";
  const intro = locale === "de" ? "FORSCHEN · ENTDECKEN · SCHÜTZEN" : "RESEARCH · DISCOVER · PROTECT";
  const observationRows = observations.data ?? [];
  const observationBusy = observations.isLoading || observations.isFetching;

  return (
    <div className="observatory-explore-page">
      <header className="observatory-mobile-header">
        <div><span className="eyebrow">BLACKWATERLEAF</span><strong>B: WATER OBSERVATORY PORTAL</strong></div>
        <Link href="/search" aria-label="Suche"><Search size={21} /></Link>
      </header>

      <Link className="observatory-search-bar" href="/search">
        <Search size={18} /><span>{locale === "de" ? "Arten, Orte, Themen, Community …" : "Species, places, topics, community …"}</span><ArrowRight size={16} />
      </Link>

      <section className="observatory-explore-hero" style={{ backgroundImage: `url(${REFERENCE_ASSETS.aquarium})` }}>
        <div className="observatory-explore-hero__copy"><span className="eyebrow">UNSER OBSERVATORIUM</span><h1>{title}</h1><p>{intro}</p></div>
        <span className="observatory-explore-hero__note">Tiefere Einblicke.<br />Gemeinsam.</span>
      </section>

      <section className="observatory-section" aria-labelledby="portal-heading">
        <div className="observatory-section__heading"><span className="eyebrow">PORTALE</span><h2 id="portal-heading">{locale === "de" ? "Deine Fachbereiche" : "Your specialist areas"}</h2></div>
        <div className="observatory-portal-grid">
          {portalCards.map(({ title: cardTitle, subtitle, href, image, tone, icon: Icon }) => <Link key={href} href={href} className={`observatory-portal-card observatory-portal-card--${tone}`} style={{ backgroundImage: `url(${image})` }}><span className="observatory-portal-card__icon"><Icon size={22} /></span><span><strong>{cardTitle}</strong><small>{subtitle}</small></span><ArrowRight size={17} /></Link>)}
        </div>
      </section>

      <section className="observatory-observation-panel" id="map" aria-labelledby="observation-heading">
        <div className="observatory-section__heading"><div><span className="eyebrow">KARTE &amp; LISTE · SYNCHRONISIERT</span><h2 id="observation-heading">{locale === "de" ? "Beobachten. Einordnen. Teilen." : "Observe. Classify. Share."}</h2></div><span className={`observatory-status observatory-status--${observations.isError ? "error" : observationBusy ? "loading" : "ready"}`}><i />{observations.isError ? "NICHT VERFÜGBAR" : observationBusy ? "SYNC …" : "BEREIT"}</span></div>
        <div className="observatory-observation-toolbar" role="group" aria-label="Beobachtungsbereich">
          <div className="observatory-filter-pills">{(Object.keys(realmLabels) as RealmFilter[]).map(key => <button type="button" key={key} className={realm === key ? "active" : ""} aria-pressed={realm === key} onClick={() => setRealm(key)}>{realmLabels[key]}</button>)}</div>
          <div className="observatory-view-toggle" role="group" aria-label="Ansicht"><button type="button" className={view === "map" ? "active" : ""} aria-pressed={view === "map"} onClick={() => setView("map")}><Map size={15} /> Karte</button><button type="button" className={view === "list" ? "active" : ""} aria-pressed={view === "list"} onClick={() => setView("list")}><List size={15} /> Liste</button></div>
        </div>
        <div className={`observatory-observation-grid observatory-observation-grid--${view}`}>
          <div className="observatory-map-panel">
            {observationBusy ? <div className="observatory-map-empty"><MapPin size={26} /><strong>Beobachtungen werden synchronisiert</strong><small>Öffentliche Orte werden erst nach erfolgreicher Prüfung angezeigt.</small></div> : observations.isError ? <div className="observatory-map-empty"><WifiOff size={26} /><strong>Karte derzeit nicht verfügbar</strong><small>Die Verbindung konnte nicht hergestellt werden. Bitte erneut versuchen.</small><button type="button" className="secondary-action" onClick={() => void observations.refetch()}>ERNEUT VERSUCHEN</button></div> : observationRows.length ? <><span className="observatory-map-caption">{locale === "de" ? "Geschützte Orte · genaue Positionen privat" : "Protected places · exact positions private"}</span><span className="observatory-map-data-badge"><MapPin size={15} /> {observationRows.length} freigegebene Beobachtung{observationRows.length === 1 ? "" : "en"}</span></> : <div className="observatory-map-empty"><MapPin size={26} /><strong>Keine Kartenpunkte freigegeben</strong><small>Es werden keine Pins dargestellt, solange keine öffentliche Beobachtung mit zulässiger Ortsangabe vorliegt.</small></div>}
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
