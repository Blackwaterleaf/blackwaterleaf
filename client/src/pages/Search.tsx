import { Loader2, Search as SearchIcon, UserRound, BookOpen, Leaf, Fish, MessageCircle, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { StatePanel } from "@/components/StatePanel";

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

function ResultCard({ type, item }: { type: SearchKind; item: Record<string, unknown> }) {
  const id = String(item.id);
  const commonName = Array.isArray(item.commonNames) ? item.commonNames[0] : undefined;
  if (type === "plant") return <Link className="search-result-card" href={`/plant/${id}`}><span className="search-result-icon search-result-icon--plant"><Leaf size={19} /></span><span><strong>{String(item.scientificName)}</strong><small>{String(item.acceptedScientificName ?? item.family ?? "Validierter Taxon-Datensatz")}</small><em><ShieldCheck size={12} />{String(item.evidenceState ?? "confirmed")}</em></span><ArrowRight size={16} /></Link>;
  if (type === "aquarium") return <Link className="search-result-card" href={`/aquarium-fish/${id}`}><span className="search-result-icon search-result-icon--aquarium"><Fish size={19} /></span><span><strong>{String(item.scientificName)}</strong><small>{String(commonName ?? item.family ?? "Validierter Aquaristik-Datensatz")}</small><em><ShieldCheck size={12} />{String(item.evidenceState ?? "confirmed")}</em></span><ArrowRight size={16} /></Link>;
  if (type === "knowledge") return <Link className="search-result-card" href="/knowledge"><span className="search-result-icon"><BookOpen size={19} /></span><span><strong>{String(item.title)}</strong><small>{String(item.excerpt ?? "")}</small><em>{String(item.realm ?? "Wissen")}</em></span><ArrowRight size={16} /></Link>;
  if (type === "profile") return <Link className="search-result-card" href={`/member/${id}`}><span className="search-result-icon"><UserRound size={19} /></span><span><strong>{String(item.name ?? item.username ?? "BlackWaterLeaf-Nutzer")}</strong><small>{item.username ? `@${String(item.username)}` : "Öffentliches Profil"}</small><em>Profil öffnen</em></span><ArrowRight size={16} /></Link>;
  if (type === "community") return <Link className="search-result-card" href={`/community?post=${id}`}><span className="search-result-icon"><MessageCircle size={19} /></span><span><strong>{String(item.realm ?? "Community")}</strong><small>{String(item.content)}</small><em>Öffentlicher Beitrag</em></span><ArrowRight size={16} /></Link>;
  if (type === "product") return <a className="search-result-card" href={String(item.destinationUrl)} target="_blank" rel="sponsored nofollow noopener"><span className="search-result-icon"><ShoppingBag size={19} /></span><span><strong>{String(item.title)}</strong><small>{String(item.partnerName ?? "Freigegebener Händler")}</small><em>{String(item.priceLabel ?? "Marktplatz")}</em></span><ArrowRight size={16} /></a>;
  return null;
}

export default function Search() {
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<SearchKind>("all");
  const [cursor, setCursor] = useState<string | undefined>();
  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(draft.trim()), 240);
    return () => window.clearTimeout(timer);
  }, [draft]);
  useEffect(() => setCursor(undefined), [query, kind]);
  const search = trpc.search.unified.useQuery({ q: query, kind, locale: "de", limit: 18, cursor }, { enabled: query.length >= 2, retry: false, staleTime: 15_000 });
  const data = search.data;
  const selected = kind === "plant" ? data?.taxa : kind === "aquarium" ? data?.aquarium : kind === "knowledge" ? data?.knowledge : kind === "profile" ? data?.profiles : kind === "community" ? data?.community : kind === "product" ? data?.products : [];
  const groups = kind === "all" ? [
    ["plant", data?.taxa ?? []], ["aquarium", data?.aquarium ?? []], ["knowledge", data?.knowledge ?? []], ["profile", data?.profiles ?? []], ["community", data?.community ?? []], ["product", data?.products ?? []],
  ] as const : [[kind, selected ?? []] as const];

  return <div className="reference-page search-page">
    <section className="search-hero glass-panel"><span className="eyebrow">BLACKWATERLEAF · KATALOG</span><h1>SUCHEN & ENTDECKEN</h1><p>Ein Einstieg für validierte Pflanzen, Wissen, Community, Profile und freigegebene Händler.</p><label className="search-input-wrap"><SearchIcon size={20} /><input value={draft} onChange={event => setDraft(event.target.value)} placeholder="Pflanze, Profil, Wissen oder Produkt suchen …" aria-label="Suche" autoFocus />{search.isFetching ? <Loader2 className="action-spinner" size={18} /> : null}</label></section>
    <div className="search-tabs" role="tablist" aria-label="Suchbereiche">{tabs.map(({ key, label, icon: Icon }) => <button key={key} type="button" role="tab" aria-selected={kind === key} className={kind === key ? "is-active" : ""} onClick={() => setKind(key)}><Icon size={15} />{label}</button>)}</div>
    {!query ? <StatePanel code="SEARCH/READY" state="empty" title="BEREIT ZUM SUCHEN" body="Beginne mit einem Pflanzennamen oder einer Kategorie. Es werden nur veröffentlichte und freigegebene Datensätze angezeigt." /> : search.isLoading ? <StatePanel code="SEARCH/LOAD" state="loading" title="KATALOG WIRD DURCHSUCHT" body="Die Suchergebnisse werden aus den verbundenen Datenquellen geladen …" /> : search.isError ? <StatePanel code="SEARCH/ERROR" state="error" title="SUCHE NICHT VERFÜGBAR" body="Die Suche konnte gerade nicht geladen werden. Bitte versuche es erneut." /> : !data || (kind !== "all" && !selected?.length) || (kind === "all" && !groups.some(([, rows]) => rows.length)) ? <StatePanel code="SEARCH/EMPTY" state="empty" title="KEIN ERGEBNIS" body="Für diesen Begriff gibt es aktuell keinen veröffentlichten Datensatz." /> : <div className="search-results">{groups.map(([group, rows]) => rows.length ? <section key={group} className="search-group"><div className="section-heading"><div><span className="eyebrow">{tabs.find(tab => tab.key === group)?.label}</span><h2>{query}</h2></div><span className="system-chip">{rows.length} TREFFER</span></div><div className="search-result-list">{rows.map(item => <ResultCard key={`${group}-${String(item.id)}`} type={group as SearchKind} item={item} />)}</div></section> : null)}{data.nextCursor ? <button type="button" className="primary-action search-load-more" disabled={search.isFetching} onClick={() => setCursor(data.nextCursor ?? undefined)}>{search.isFetching ? "WEITERE TREFFER WERDEN GELADEN …" : "WEITERE TREFFER"}</button> : null}</div>}
  </div>;
}
