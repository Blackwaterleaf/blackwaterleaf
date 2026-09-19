import { ArrowRight, BookOpen, CheckCircle2, Fish, Leaf, List, Map, MapPin, Search, ShieldCheck, Sprout, WifiOff } from "lucide-react";
import { Link } from "wouter";
import { useI18n } from "@/i18n";
import { trpc } from "@/lib/trpc";
import { REFERENCE_ASSETS, WORLD_ASSETS } from "@/lib/worlds";

type CatalogRecord = {
  id: string;
  scientificName: string;
  acceptedScientificName?: string | null;
  commonNames?: string[] | null;
  family?: string | null;
  summary?: string | null;
  imageUrl?: string | null;
  evidenceState?: string | null;
};

const portalCards = [
  { title: "Botanik", subtitle: "Wasserpflanzen", href: "/botanik", image: WORLD_ASSETS.botany, tone: "botany", icon: Leaf },
  { title: "Aquaristik", subtitle: "Fische & Wirbellose", href: "/aquaristik", image: WORLD_ASSETS.aquarium, tone: "aquarium", icon: Fish },
  { title: "Terraristik", subtitle: "Reptilien & Amphibien", href: "/terraristik", image: WORLD_ASSETS.terrarium, tone: "terrarium", icon: Sprout },
] as const;

export default function Explore() {
  const { locale } = useI18n();
  const catalog = trpc.search.unified.useQuery({ q: "Channa", kind: "all", locale, limit: 3 }, { retry: false });
  const records = [ ...(catalog.data?.aquarium ?? []), ...(catalog.data?.taxa ?? []) ] as CatalogRecord[];
  const featured = records[0];
  const title = locale === "de" ? "WASSER VERBINDET." : "WATER CONNECTS.";
  const intro = locale === "de" ? "FORSCHEN · ENTDECKEN · SCHÜTZEN" : "RESEARCH · DISCOVER · PROTECT";

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

      <section className="observatory-observation-panel" id="map">
        <div className="observatory-section__heading"><div><span className="eyebrow">KARTE &amp; LISTE · SYNCHRONISIERT</span><h2>{locale === "de" ? "Beobachten. Einordnen. Teilen." : "Observe. Classify. Share."}</h2></div><span className="observatory-status"><i />{catalog.isLoading ? "SYNC …" : "BEREIT"}</span></div>
        <div className="observatory-observation-grid">
          <div className="observatory-map-panel" style={{ backgroundImage: `url(${WORLD_ASSETS.aquarium})` }}><div className="observatory-map-panel__tools"><button type="button" aria-label="Kartenansicht"><Map size={16} /></button><button type="button" aria-label="Listenansicht"><List size={16} /></button></div><span className="observatory-map-pin observatory-map-pin--one"><MapPin size={21} /></span><span className="observatory-map-pin observatory-map-pin--two"><MapPin size={21} /></span><span className="observatory-map-caption">{locale === "de" ? "Geschützte Orte · genaue Positionen privat" : "Protected places · exact positions private"}</span></div>
          <div className="observatory-catalog-list"><div className="observatory-list-heading"><span>KATALOG · ARTEN</span><Link href="/search">Alle öffnen <ArrowRight size={14} /></Link></div>{catalog.isLoading ? <p className="observatory-inline-state">Katalog wird synchronisiert …</p> : catalog.isError ? <p className="observatory-inline-state">Katalog derzeit nicht erreichbar.</p> : records.length ? records.map(record => <Link key={`${record.id}-${record.scientificName}`} href={record.family ? `/aquarium-fish/${record.id}` : `/plant/${record.id}`} className="observatory-catalog-item">{record.imageUrl ? <img src={record.imageUrl} alt="" /> : <span className="observatory-catalog-item__placeholder"><Fish size={20} /></span>}<span><strong>{record.acceptedScientificName ?? record.scientificName}</strong><small>{record.commonNames?.[0] ?? record.family ?? "Verifizierter Katalogeintrag"}</small></span><ArrowRight size={16} /></Link>) : <p className="observatory-inline-state">Noch keine passenden Einträge.</p>}</div>
        </div>
      </section>

      <section className="observatory-feature-card">
        {featured?.imageUrl ? <img src={featured.imageUrl} alt="" /> : <div className="observatory-feature-card__visual" style={{ backgroundImage: `url(${REFERENCE_ASSETS.aquarium})` }} />}
        <div><span className="eyebrow">KATALOG · ARTEN</span><h2>{featured?.acceptedScientificName ?? featured?.scientificName ?? "Channa"}</h2><p>{featured?.family ? `Familie: ${featured.family}` : "Fachlich eingeordnete Süßwasserarten"}</p><span className="observatory-verified"><CheckCircle2 size={15} /> Wissenschaftlich geprüft</span></div>
        {featured ? <Link href={featured.family ? `/aquarium-fish/${featured.id}` : `/plant/${featured.id}`} aria-label="Katalogeintrag öffnen"><ArrowRight size={22} /></Link> : null}
      </section>

      <section className="observatory-evidence-panel"><div><BookOpen size={22} /><span><strong>QUELLEN &amp; BELEGE</strong><small>Fachliteratur, Beobachtungen, Fotos und Community</small></span></div><Link href="/knowledge"><ShieldCheck size={18} /> Quellen öffnen <ArrowRight size={15} /></Link></section>
      <section className="observatory-offline-panel"><WifiOff size={21} /><span><strong>Offline-Bereitschaft</strong><small>Neue Daten werden synchronisiert, sobald eine Verbindung besteht.</small></span><span className="observatory-offline-panel__ring" /></section>
    </div>
  );
}
