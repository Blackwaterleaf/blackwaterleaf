import { Loader2, Search as SearchIcon, UserRound, BookOpen, Leaf, Fish, MessageCircle, ShoppingBag, ArrowRight, ShieldCheck, Sprout } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { StatePanel } from "@/components/StatePanel";
import { ObservatoryContextHeader } from "@/components/ObservatoryPrimitives";

type SearchKind = "all" | "plant" | "aquarium" | "knowledge" | "profile" | "community" | "product";
const tabs: Array<{ key: SearchKind; label: string; icon: typeof Leaf }> = [
  { key: "all", label: "Alles", icon: SearchIcon },
  { key: "plant", label: "Pflanzen", icon: Leaf },
  { key: "aquarium", label: "Aquaristik", icon: Fish },
  { key: "knowledge", label: "Wissen", icon: BookOpen },
  { key: "profile", label: "Profile", icon: UserRound },
  { key: "community", label: "Community", icon: MessageCircle },
  { key: "product", label: "Marktplatz", icon: ShoppingBag },
];

const realmCopy = {
  botany: { tone: "botany", title: "BOTANIK", subtitle: "Wasserpflanzen alphabetisch entdecken – mit großem Bild, gebräuchlichem Namen und botanischer Einordnung.", icon: Leaf, label: "PFLANZENKATALOG", back: "/botanik" },
  aquarium: { tone: "aquarium", title: "AQUARISTIK", subtitle: "Fische und Wirbellose strukturiert nach ihrem wissenschaftlichen Namen entdecken.", icon: Fish, label: "AQUARISTIK-KATALOG", back: "/aquaristik" },
  terrarium: { tone: "terrarium", title: "TERRARISTIK", subtitle: "Der Katalog wächst ausschließlich mit geprüften, veröffentlichten Terraristik-Datensätzen.", icon: Sprout, label: "TERRARISTIK-KATALOG", back: "/terraristik" },
} as const;
type CatalogRealm = keyof typeof realmCopy;

function hasVerifiedImage(item: { imageUrl?: string | null; imageSourceUrl?: string | null; imageLicense?: string | null; imageAttribution?: string | null; imageVerifiedAt?: Date | string | null }) {
  return Boolean(item.imageUrl && item.imageSourceUrl && item.imageLicense && item.imageAttribution && item.imageVerifiedAt);
}

function CatalogCard({ item, realm }: { item: Record<string, unknown>; realm: CatalogRealm }) {
  const id = String(item.id);
  const scientific = String(item.acceptedScientificName ?? item.scientificName);
  const botanical = String(item.scientificName);
  const common = Array.isArray(item.commonNames) ? String(item.commonNames[0] ?? "") : "";
  const verified = hasVerifiedImage(item as never);
  return <Link className={`catalog-card catalog-card--${realm}`} href={realm === "aquarium" ? `/aquarium-fish/${id}` : `/plant/${id}`}>
    <div className="catalog-card__image">{verified ? <img src={String(item.imageUrl)} alt={`${common || scientific} – ${botanical}`} loading="lazy" /> : realm === "aquarium" ? <Fish size={34} aria-label="Kein verifiziertes Bild" /> : <Leaf size={34} aria-label="Kein verifiziertes Bild" />}</div>
    <div className="catalog-card__body"><strong>{common || scientific}</strong><em>{botanical}</em><small>{scientific !== botanical ? scientific : String(item.family ?? "Katalogtaxon")}</small></div><ArrowRight className="catalog-card__arrow" size={17} />
  </Link>;
}

function ResultCard({ type, item }: { type: SearchKind; item: Record<string, unknown> }) {
  const id = String(item.id);
  const commonName = Array.isArray(item.commonNames) ? item.commonNames[0] : undefined;
  const imageUrl = typeof item.imageUrl === "string" && item.imageUrl ? item.imageUrl : null;
  const icon = type === "aquarium" ? <Fish size={19} /> : <Leaf size={19} />;
  const media = type === "plant" || type === "aquarium" ? <span className={`search-result-icon search-result-icon--${type}`}>{imageUrl ? <img src={imageUrl} alt="" loading="lazy" /> : icon}</span> : null;
  if (type === "plant") return <Link className="search-result-card" href={`/plant/${id}`}>{media}<span><strong>{String(item.scientificName)}</strong><small>{String(item.acceptedScientificName ?? item.family ?? "Taxon-Datensatz")}</small><em><ShieldCheck size={12} />{String(item.evidenceState ?? "Nachweis offen")}</em></span><ArrowRight size={16} /></Link>;
  if (type === "aquarium") return <Link className="search-result-card" href={`/aquarium-fish/${id}`}>{media}<span><strong>{String(item.scientificName)}</strong><small>{String(commonName ?? item.family ?? "Aquaristik-Datensatz")}</small><em><ShieldCheck size={12} />{String(item.evidenceState ?? "Nachweis offen")}</em></span><ArrowRight size={16} /></Link>;
  if (type === "knowledge") return <Link className="search-result-card" href="/knowledge"><span className="search-result-icon"><BookOpen size={19} /></span><span><strong>{String(item.title)}</strong><small>{String(item.excerpt ?? "")}</small><em>{String(item.realm ?? "Wissen")}</em></span><ArrowRight size={16} /></Link>;
  if (type === "profile") return <Link className="search-result-card" href={`/member/${id}`}><span className="search-result-icon"><UserRound size={19} /></span><span><strong>{String(item.name ?? item.username ?? "Profilname nicht hinterlegt")}</strong><small>{item.username ? `@${String(item.username)}` : "Öffentliches Profil"}</small><em>Profil öffnen</em></span><ArrowRight size={16} /></Link>;
  if (type === "community") return <Link className="search-result-card" href={`/community?post=${id}`}><span className="search-result-icon"><MessageCircle size={19} /></span><span><strong>{String(item.realm ?? "Community")}</strong><small>{String(item.content)}</small><em>Öffentlicher Beitrag</em></span><ArrowRight size={16} /></Link>;
  if (type === "product") return <a className="search-result-card" href={String(item.destinationUrl)} target="_blank" rel="sponsored nofollow noopener"><span className="search-result-icon"><ShoppingBag size={19} /></span><span><strong>{String(item.title)}</strong><small>{String(item.partnerName ?? "Freigegebener Händler")}</small><em>{String(item.priceLabel ?? "Marktplatz")}</em></span><ArrowRight size={16} /></a>;
  return null;
}

export default function Search() {
  const [location] = useLocation();
  const initialParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<SearchKind>(() => (initialParams?.get("kind") as SearchKind) || "all");
  const [cursor, setCursor] = useState<string | undefined>();
  const [catalogLetter, setCatalogLetter] = useState("Alle");
  const [familyFilter, setFamilyFilter] = useState("Alle");
  const [genusFilter, setGenusFilter] = useState("Alle");
  const [imageFilter, setImageFilter] = useState<"Alle" | "Verifiziert" | "Ohne Bild">("Alle");
  const realm = initialParams?.get("realm") === "botany" || initialParams?.get("realm") === "aquarium" || initialParams?.get("realm") === "terrarium" ? initialParams.get("realm") as CatalogRealm : undefined;
  const catalogMode = Boolean(realm && !query);
  useEffect(() => { const next = new URLSearchParams(typeof window !== "undefined" ? window.location.search : location.split("?")[1] ?? ""); const nextQuery = next.get("q") ?? ""; if (nextQuery && !draft) { setDraft(nextQuery); setQuery(nextQuery); } }, [location, draft]);
  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(draft.trim()), 240);
    return () => window.clearTimeout(timer);
  }, [draft]);
  useEffect(() => setCursor(undefined), [query, kind]);
  const catalog = trpc.search.catalogByRealm.useQuery({ realm: realm ?? "botany", limit: 200 }, { enabled: catalogMode, retry: false, staleTime: 30_000 });
  const search = trpc.search.unified.useQuery({ q: query, kind, locale: "de", realm, limit: 18, cursor: kind === "all" ? undefined : cursor }, { enabled: query.length >= 2, retry: false, staleTime: 15_000 });
  const data = search.data;
  const selected = kind === "plant" ? data?.taxa : kind === "aquarium" ? data?.aquarium : kind === "knowledge" ? data?.knowledge : kind === "profile" ? data?.profiles : kind === "community" ? data?.community : kind === "product" ? data?.products : [];
  const groups = kind === "all" ? [
    ["plant", data?.taxa ?? []], ["aquarium", data?.aquarium ?? []], ["knowledge", data?.knowledge ?? []], ["profile", data?.profiles ?? []], ["community", data?.community ?? []], ["product", data?.products ?? []],
  ] as const : [[kind, selected ?? []] as const];

  const catalogItems = (catalog.data ?? []).filter(item => {
    const text = `${JSON.stringify(item.commonNames ?? "")} ${item.scientificName} ${item.acceptedScientificName ?? ""}`.toLocaleLowerCase();
    const name = String(Array.isArray(item.commonNames) ? item.commonNames[0] ?? item.scientificName ?? "" : item.scientificName ?? "");
    const verified = hasVerifiedImage(item);
    return (!draft || text.includes(draft.toLocaleLowerCase())) && (catalogLetter === "Alle" || name.toLocaleUpperCase().startsWith(catalogLetter)) && (familyFilter === "Alle" || item.family === familyFilter) && (genusFilter === "Alle" || (item as typeof item & { genus?: string | null }).genus === genusFilter) && (imageFilter === "Alle" || (imageFilter === "Verifiziert" ? verified : !verified));
  });
  const catalogFamilies = Array.from(new Set((catalog.data ?? []).map(item => item.family).filter(Boolean))).sort();
  const catalogGenera = Array.from(new Set((catalog.data ?? []).map(item => (item as typeof item & { genus?: string | null }).genus).filter(Boolean))).sort();
  const canLoadMore = kind !== "all" && Boolean(data?.nextCursor);
  if (catalogMode && realm) {
    const meta = realmCopy[realm];
    return <div className={`observatory-route observatory-route--${meta.tone} catalog-page`}>
      <ObservatoryContextHeader tone={meta.tone} eyebrow={meta.label} title={meta.title} subtitle={meta.subtitle} icon={meta.icon} badge="KATALOG" />
      <div className="catalog-page__toolbar"><Link className="secondary-action" href={meta.back}>← ZURÜCK ZUM FACHBEREICH</Link><label className="search-input-wrap"><SearchIcon size={18} /><input value={draft} onChange={event => setDraft(event.target.value)} placeholder="Im Katalog suchen …" aria-label="Im Katalog suchen" />{catalog.isFetching ? <Loader2 className="action-spinner" size={18} /> : null}</label></div>
      {catalog.isLoading ? <StatePanel code="CATALOG/LOAD" state="loading" title="KATALOG WIRD GELADEN" body="Veröffentlichte Taxa werden alphabetisch geordnet …" /> : catalog.isError ? <StatePanel code="CATALOG/ERROR" state="error" title="KATALOG NICHT VERFÜGBAR" body="Der Fachkatalog konnte gerade nicht geladen werden." action={<button type="button" className="secondary-action" onClick={() => void catalog.refetch()}>ERNEUT VERSUCHEN</button>} /> : !catalog.data?.length ? <StatePanel code="CATALOG/EMPTY" state="empty" title="NOCH KEINE VERÖFFENTLICHTEN TAXA" body={realm === "terrarium" ? "Für Terraristik werden erst geprüfte Datensätze angezeigt. Es werden keine Beispieltiere ergänzt." : "Für diesen Fachbereich sind aktuell keine veröffentlichten Datensätze vorhanden."} /> : <section className="catalog-directory"><div className="section-heading"><div><span className="eyebrow">ALPHABETISCH · {meta.title}</span><h2>{catalogItems.length} EINTRÄGE</h2></div><span className="system-chip">ECHTE KATALOGDATEN</span></div><div className="catalog-filter-row" aria-label="Katalogfilter"><div className="catalog-letters">{["Alle", ...Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index))].map(letter => <button key={letter} type="button" className={catalogLetter === letter ? "is-active" : ""} onClick={() => setCatalogLetter(letter)}>{letter}</button>)}</div><select value={familyFilter} onChange={event => setFamilyFilter(event.target.value)} aria-label="Familie filtern"><option>Alle</option>{catalogFamilies.map(value => <option key={value}>{value}</option>)}</select><select value={genusFilter} onChange={event => setGenusFilter(event.target.value)} aria-label="Gattung filtern"><option>Alle</option>{catalogGenera.map(value => <option key={value}>{value}</option>)}</select><select value={imageFilter} onChange={event => setImageFilter(event.target.value as typeof imageFilter)} aria-label="Bildnachweis filtern"><option>Alle</option><option>Verifiziert</option><option>Ohne Bild</option></select></div><div className="catalog-grid">{catalogItems.map(item => <CatalogCard key={`${item.type}-${item.id}`} item={item as unknown as Record<string, unknown>} realm={realm} />)}</div></section>}
    </div>;
  }
  return <div className="observatory-route observatory-route--botany search-page">
    <ObservatoryContextHeader tone="botany" eyebrow="KATALOG · DURCHSUCHEN" title="SUCHEN & ENTDECKEN" subtitle="Veröffentlichte Taxa, Quellenwissen, Profile, Community und freigegebene Händler." icon={SearchIcon} badge="KATALOG" />
    <section className="search-workspace observatory-data-panel"><label className="search-input-wrap"><SearchIcon size={20} /><input value={draft} onChange={event => setDraft(event.target.value)} placeholder="Pflanze, Wissen oder Produkt …" aria-label="Suche" autoFocus />{search.isFetching ? <Loader2 className="action-spinner" size={18} /> : null}</label></section>
    <div className="search-tabs" role="tablist" aria-label="Suchbereiche">{tabs.map(({ key, label, icon: Icon }) => <button key={key} type="button" role="tab" aria-selected={kind === key} className={kind === key ? "is-active" : ""} onClick={() => setKind(key)}><Icon size={15} />{label}</button>)}</div>
    {!query ? <StatePanel code="SEARCH/READY" state="empty" title="BEREIT ZUM SUCHEN" body="Beginne mit einem Pflanzennamen oder einer Kategorie. Es werden nur veröffentlichte und freigegebene Datensätze angezeigt." /> : search.isLoading ? <StatePanel code="SEARCH/LOAD" state="loading" title="KATALOG WIRD DURCHSUCHT" body="Die Suchergebnisse werden aus den verbundenen Datenquellen geladen …" /> : search.isError ? <StatePanel code="SEARCH/ERROR" state="error" title="SUCHE NICHT VERFÜGBAR" body="Die Suche konnte gerade nicht geladen werden. Bitte versuche es erneut." action={<button type="button" className="secondary-action" onClick={() => void search.refetch()}>ERNEUT VERSUCHEN</button>} /> : !data || (kind !== "all" && !selected?.length) || (kind === "all" && !groups.some(([, rows]) => rows.length)) ? <StatePanel code="SEARCH/EMPTY" state="empty" title="KEIN ERGEBNIS" body="Für diesen Begriff gibt es aktuell keinen veröffentlichten Datensatz." /> : <div className="search-results">{groups.map(([group, rows]) => rows.length ? <section key={group} className="search-group"><div className="section-heading"><div><span className="eyebrow">{tabs.find(tab => tab.key === group)?.label}</span><h2>{query}</h2></div><span className="system-chip">{rows.length} TREFFER</span></div><div className="search-result-list">{rows.map(item => <ResultCard key={`${group}-${String(item.id)}`} type={group as SearchKind} item={item} />)}</div></section> : null)}{canLoadMore ? <button type="button" className="primary-action search-load-more" disabled={search.isFetching} onClick={() => setCursor(data?.nextCursor ?? undefined)}>{search.isFetching ? "WEITERE TREFFER WERDEN GELADEN …" : "WEITERE TREFFER"}</button> : null}</div>}
  </div>;
}
