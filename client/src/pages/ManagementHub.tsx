import { useAuth } from "@/_core/hooks/useAuth";
import { ObservatoryContextHeader, ObservatoryStateSurface } from "@/components/ObservatoryPrimitives";
import { StatePanel } from "@/components/StatePanel";
import { trpc } from "@/lib/trpc";
import { Bell, BookMarked, ChartNoAxesCombined, ChevronRight, Database, Globe2, Inbox, Leaf, LockKeyhole, Settings2, ShieldCheck, Trophy, UserRound, Wrench } from "lucide-react";
import { Link } from "wouter";

const groups = [
  {
    label: "KONTO & ALLTAG",
    items: [
      { title: "Konto & Profil", note: "Name, Bio, Bild und verknüpfte Profile", href: "/profile/private", icon: UserRound, tone: "plant" },
      { title: "Anlagen & Pflege", note: "Botanik, Aquaristik, Terraristik", href: "/profile/habitats", icon: Leaf, tone: "plant" },
      { title: "Kommunikation", note: "Postfach, Community und Benachrichtigungen", href: "/messages", icon: Inbox, tone: "water" },
      { title: "Datenschutz & Sicherheit", note: "Freigaben, Sitzungen und Kontoschutz", href: "/profile/privacy", icon: ShieldCheck, tone: "security" },
    ],
  },
  {
    label: "WEITERE EINSTELLUNGEN",
    items: [
      { title: "Sprache & Barrierefreiheit", note: "Sprache, Einheiten und Darstellung", href: "/profile/preferences", icon: Globe2, tone: "plant" },
      { title: "Fortschritt & Merkliste", note: "XP, Level und gespeicherte Inhalte", href: "/profile/progress", icon: Trophy, tone: "gold" },
      { title: "Host-Dashboard", note: "Nur Eigentümerkonto blackwaterleaf.com", href: "/admin", icon: ChartNoAxesCombined, tone: "host", ownerOnly: true },
      { title: "Hilfe, Daten & Werkzeuge", note: "Datenexport, Smart-Geräte und Quellen", href: "/profile/tools", icon: Wrench, tone: "security" },
    ],
  },
] as const;

export default function ManagementHub() {
  const auth = useAuth();
  const profile = trpc.profile.me.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  if (auth.loading || (auth.isAuthenticated && profile.isLoading)) return <div className="observatory-route observatory-route--botany"><StatePanel code="MANAGEMENT/LOAD" state="loading" title="MANAGEMENT WIRD GELADEN" body="Deine Einstellungen werden sicher vorbereitet …" /></div>;
  if (!auth.isAuthenticated) return <div className="observatory-route observatory-route--botany"><ObservatoryStateSurface tone="botany" code="MANAGEMENT/AUTH" title="ANMELDUNG ERFORDERLICH" body="Der Management-Hub ist nur für angemeldete Konten verfügbar." action={<Link className="primary-action" href="/login">SICHER ANMELDEN</Link>} /></div>;
  if (profile.isError || !profile.data) return <div className="observatory-route observatory-route--botany"><StatePanel code="MANAGEMENT/ERROR" state="error" title="HUB NICHT VERFÜGBAR" body="Das Konto konnte nicht geladen werden." /></div>;
  const isOwner = profile.data.email?.trim().toLowerCase() === "blackwaterleaf@gmail.com";
  return <div className="observatory-route observatory-route--botany management-hub">
    <ObservatoryContextHeader tone="botany" eyebrow="BLACKWATERLEAF · VERWALTEN" title="EINSTELLUNGEN & WERKZEUGE" subtitle="Ein zentraler Ort für dein Profil, deine Anlagen, deine Kommunikation und deinen Datenschutz." icon={Settings2} badge="KONTOZENTRUM" />
    {groups.map(group => <section key={group.label} className="management-group" aria-labelledby={`management-${group.label}`}><div className="management-group__heading"><span className="eyebrow" id={`management-${group.label}`}>{group.label}</span><small>Alles an einem Ort</small></div><div className="management-grid">{group.items.filter(item => !("ownerOnly" in item && item.ownerOnly) || isOwner).map(item => { const Icon = item.icon; return <Link key={item.title} href={item.href} className={`management-tile management-tile--${item.tone}`}><span className="management-tile__icon"><Icon size={21} /></span><span className="management-tile__copy"><strong>{item.title}</strong><small>{item.note}</small></span><ChevronRight size={18} /></Link>; })}</div></section>)}
    <section className="management-principles"><LockKeyhole size={18} /><div><strong>Privat bleibt privat.</strong><p>Private Anlagen, Nachrichten, genaue Standorte und nicht freigegebene Medien werden nicht öffentlich angezeigt.</p></div></section>
  </div>;
}
