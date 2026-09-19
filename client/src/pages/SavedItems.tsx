import { Bookmark, ArrowLeft, Leaf, BookOpen, UserRound, MessageCircle, ShoppingBag } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { StatePanel } from "@/components/StatePanel";

const labels = { post: "Community-Beitrag", knowledge: "Wissensartikel", plant_taxon: "Pflanzentaxon", product: "Marktplatz-Produkt", profile: "Profil" } as const;
function iconFor(type: keyof typeof labels) { return type === "post" ? MessageCircle : type === "knowledge" ? BookOpen : type === "plant_taxon" ? Leaf : type === "product" ? ShoppingBag : UserRound; }
function hrefFor(type: keyof typeof labels, id: number) { return type === "post" ? `/community?post=${id}` : type === "knowledge" ? "/knowledge" : type === "plant_taxon" ? `/plant/${id}` : type === "product" ? `/marketplace/product/${id}` : `/member/${id}`; }

export default function SavedItems() {
  const auth = useAuth();
  const saved = trpc.social.saved.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  if (!auth.isAuthenticated) return <div className="reference-page"><StatePanel code="SAVED/AUTH" state="locked" title="ANMELDUNG ERFORDERLICH" body="Melde dich an, um gespeicherte Inhalte zu sehen." /></div>;
  return <div className="reference-page saved-page"><Link className="page-back-link" href="/profile"><ArrowLeft size={16} />Profil</Link><section className="saved-intro glass-panel"><Bookmark size={24} /><div><span className="eyebrow">DEIN MERKRAUM</span><h1>GESPEICHERT</h1><p>Öffentliche Inhalte, die du für später markiert hast.</p></div></section>{saved.isLoading ? <StatePanel code="SAVED/LOAD" state="loading" title="GESPEICHERTE INHALTE WERDEN GELADEN" body="Deine Merkliste wird synchronisiert …" /> : saved.isError ? <StatePanel code="SAVED/ERROR" state="error" title="MERKLISTE NICHT VERFÜGBAR" body="Gespeicherte Inhalte konnten nicht geladen werden." /> : !saved.data?.length ? <StatePanel code="SAVED/EMPTY" state="empty" title="NOCH NICHTS GESPEICHERT" body="Markiere öffentliche Pflanzen, Beiträge, Profile oder Wissen, um sie hier wiederzufinden." /> : <div className="saved-list">{saved.data.map(item => { const type = item.targetType as keyof typeof labels; const Icon = iconFor(type); return <Link className="saved-row glass-panel" key={item.id} href={hrefFor(type, item.targetId)}><span className="search-result-icon"><Icon size={18} /></span><span><strong>{labels[type]}</strong><small>Öffentlicher Datensatz · #{item.targetId}</small><em>{new Date(item.createdAt).toLocaleDateString("de-DE")}</em></span></Link>; })}</div>}</div>;
}
