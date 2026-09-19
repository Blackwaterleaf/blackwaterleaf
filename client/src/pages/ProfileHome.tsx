import { ObservatoryContextHeader, ObservatoryStateSurface } from "@/components/ObservatoryPrimitives";
import { StatePanel } from "@/components/StatePanel";
import { useAuth } from "@/_core/hooks/useAuth";
import { useI18n } from "@/i18n";
import { trpc } from "@/lib/trpc";
import { Camera, ChevronRight, Fish, Leaf, LogIn, Settings, Trophy, UserRound, Box } from "lucide-react";
import { Link } from "wouter";

const habitatChoices = [
  { key: "plant", label: "Botanik", note: "Pflanzen-Anlagen", icon: Leaf, className: "profile-habitat-card--plant" },
  { key: "aquarium", label: "Aquaristik", note: "Aquarien & Wasserwerte", icon: Fish, className: "profile-habitat-card--aquarium" },
  { key: "terrarium", label: "Terraristik", note: "Terrarien & Pflege", icon: Box, className: "profile-habitat-card--terrarium" },
] as const;

export default function ProfileHome() {
  const auth = useAuth();
  const { locale, t } = useI18n();
  const profile = trpc.profile.me.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const ownUserId = Number(auth.user?.id);
  const publicPosts = trpc.profile.publicPosts.useQuery({ userId: ownUserId, limit: 6 }, { enabled: auth.isAuthenticated && Number.isSafeInteger(ownUserId) && ownUserId > 0, retry: false });
  const experience = trpc.gamification.summary.useQuery(undefined, { enabled: auth.isAuthenticated });
  const habitats = trpc.habitats.mine.useQuery(undefined, { enabled: auth.isAuthenticated });

  if (auth.loading) return <div className="observatory-route observatory-route--botany"><StatePanel code="PROFILE/AUTH_LOAD" state="loading" title={t("common.loading")} body="Dein geschützter Profilbereich wird geprüft …" /></div>;
  if (!auth.isAuthenticated) return <div className="observatory-route observatory-route--botany profile-auth-landing"><ObservatoryStateSurface tone="botany" code="PROFILE/AUTH" title="DEIN BEREICH WARTET AUF DICH" body="Melde dich sicher an, um dein Profil, eigene Beiträge und private Anlagen zu sehen. Datenschutz, Sprache und Werkzeuge bleiben im Profilmenü." action={<Link className="primary-action" href="/login"><LogIn size={16} />SICHER ANMELDEN</Link>} /></div>;
  if (profile.isLoading) return <div className="observatory-route observatory-route--botany"><StatePanel code="PROFILE/LOAD" state="loading" title={t("common.loading")} body="Profil wird geladen …" /></div>;
  if (profile.isError || !profile.data) return <div className="observatory-route observatory-route--botany"><StatePanel code="PROFILE/ERROR" state="error" title={t("common.error")} body="Profil konnte nicht geladen werden." /></div>;

  const habitatCount = habitats.isError ? "—" : habitats.data?.length ?? 0;
  const name = profile.data.name ?? profile.data.username ?? "Name nicht hinterlegt";
  const xp = experience.isError ? "—" : experience.data?.status === "ready" ? experience.data.totalXp : "…";
  const level = experience.isError ? "—" : experience.data?.status === "ready" ? experience.data.level : "…";

  return <div className="observatory-route observatory-route--botany profile-observatory-page">
    <ObservatoryContextHeader tone="botany" eyebrow="BLACKWATERLEAF · PROFIL" title={name} subtitle="Private Anlagen, Fortschritt und freigegebene Beiträge in einer geschützten Übersicht." icon={UserRound} badge="PRIVAT" children={<Link className="secondary-action" href="/profile/private"><Settings size={15} />VERWALTEN</Link>} />
    <section className="profile-observatory-metrics observatory-data-panel" aria-label="Profilfortschritt"><Link href="/ranking"><Trophy size={16} /><span><strong>{xp}</strong><small>XP</small></span></Link><Link href="/ranking"><span><strong>{level}</strong><small>LEVEL</small></span></Link><Link href="/profile/habitats"><span><strong>{habitatCount}</strong><small>ANLAGEN</small></span><ChevronRight size={15} /></Link></section>
    {habitats.isError || experience.isError ? <StatePanel code="PROFILE/PARTIAL_ERROR" state="error" title="TEILDATEN NICHT VERFÜGBAR" body="Anlagen oder Fortschritt konnten nicht vollständig geladen werden. Bitte später erneut versuchen." action={<button type="button" className="secondary-action" onClick={() => { void habitats.refetch(); void experience.refetch(); }}>ERNEUT VERSUCHEN</button>} /> : null}
    <section className="profile-observatory-habitats observatory-data-panel"><div className="observatory-data-panel__heading"><span className="eyebrow">PRIVATE SAMMLUNG</span><Link className="section-link" href="/profile/habitats">ALLE ANLAGEN<ChevronRight size={14} /></Link></div><div className="profile-habitat-choice-grid">{habitatChoices.map(({ key, label, note, icon: Icon, className }) => <Link key={key} href={`/profile/habitats?kind=${key}`} className={`profile-habitat-card ${className}`}><Icon size={20} /><span><strong>{label}</strong><small>{note}</small></span><ChevronRight size={16} /></Link>)}</div></section>
    <section className="profile-observatory-posts observatory-data-panel"><div className="observatory-data-panel__heading"><span className="eyebrow">FREIGEGEBENE BEITRÄGE</span><Link className="secondary-action" href="/community?compose=1"><Camera size={14} />POST</Link></div>{publicPosts.isLoading ? <p className="observatory-inline-state">Beiträge werden geladen …</p> : publicPosts.isError ? <p className="observatory-inline-state">Beiträge sind derzeit nicht erreichbar.</p> : publicPosts.data?.length ? <div className="profile-observatory-post-list">{publicPosts.data.slice(0, 4).map(post => <article key={post.id}><div><strong>{post.realm?.toUpperCase() ?? "COMMUNITY"}</strong><p>{post.content}</p><small>{new Date(post.updatedAt).toLocaleString(locale)}</small></div><Link href={`/community?post=${post.id}`} aria-label="Öffentlichen Beitrag öffnen"><ChevronRight size={15} /></Link></article>)}</div> : <p className="observatory-inline-state">Noch keine öffentlichen Beiträge freigegeben.</p>}</section>
  </div>;
}
