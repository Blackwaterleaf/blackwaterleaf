import { Bookmark, ArrowLeft, Leaf, BookOpen, UserRound, MessageCircle, ShoppingBag } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { StatePanel } from "@/components/StatePanel";
import { ObservatoryContextHeader, ObservatoryStateSurface } from "@/components/ObservatoryPrimitives";

const labels = { post: "Community-Beitrag", knowledge: "Wissensartikel", plant_taxon: "Pflanzentaxon", product: "Marktplatz-Produkt", profile: "Profil" } as const;
function iconFor(type: keyof typeof labels) { return type === "post" ? MessageCircle : type === "knowledge" ? BookOpen : type === "plant_taxon" ? Leaf : type === "product" ? ShoppingBag : UserRound; }
function hrefFor(type: keyof typeof labels, id: number) { return type === "post" ? `/community?post=${id}` : type === "knowledge" ? "/knowledge" : type === "plant_taxon" ? `/plant/${id}` : type === "product" ? `/marketplace/product/${id}` : `/member/${id}`; }

export default function SavedItems() {
  const auth = useAuth();
  const saved = trpc.social.saved.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  if (!auth.isAuthenticated) return <div className="observatory-route observatory-route--botany saved-page"><ObservatoryStateSurface tone="botany" code="SAVED/AUTH" title="ANMELDUNG ERFORDERLICH" body="Melde dich an, um gespeicherte öffentliche Inhalte zu sehen." action={<Link href="/login" className="primary-action">ANMELDEN</Link>} /></div>;
  return <div className="observatory-route observatory-route--botany saved-page">
    <Link className="page-back-link" href="/profile"><ArrowLeft size={16} />Profil</Link>
    <ObservatoryContextHeader tone="botany" eyebrow="DEIN MERKRAUM" title="GESPEICHERT" subtitle="Öffentliche Inhalte, die du für später markiert hast." icon={Bookmark} badge={`${saved.data?.length ?? 0} EINTRÄGE`} />
    {saved.isLoading ? <StatePanel code="SAVED/LOAD" state="loading" title="GESPEICHERTE INHALTE WERDEN GELADEN" body="Deine Merkliste wird sicher abgefragt …" /> : saved.isError ? <StatePanel code="SAVED/ERROR" state="error" title="MERKLISTE NICHT VERFÜGBAR" body="Gespeicherte Inhalte konnten nicht geladen werden." /> : !saved.data?.length ? <ObservatoryStateSurface tone="botany" code="SAVED/EMPTY" title="NOCH NICHTS GESPEICHERT" body="Markiere öffentliche Pflanzen, Beiträge, Profile oder Wissen, um sie hier wiederzufinden." /> : <section className="saved-list observatory-data-panel">{saved.data.map(item => { const type = item.targetType as keyof typeof labels; const Icon = iconFor(type); return <Link className="saved-row" key={item.id} href={hrefFor(type, item.targetId)}><span className="search-result-icon"><Icon size={18} /></span><span><strong>{labels[type]}</strong><small>Öffentlicher Datensatz · #{item.targetId}</small><em>{new Date(item.createdAt).toLocaleDateString("de-DE")}</em></span></Link>; })}</section>}
  </div>;
}
