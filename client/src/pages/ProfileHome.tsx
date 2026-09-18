import { useAuth } from "@/_core/hooks/useAuth";
import { StatePanel } from "@/components/StatePanel";
import { useI18n } from "@/i18n";
import { trpc } from "@/lib/trpc";
import { Camera, ChevronRight, Leaf, Pencil, RefreshCw, Settings, Trophy, UserRound } from "lucide-react";
import { Link } from "wouter";

export default function ProfileHome() {
  const auth = useAuth();
  const { locale, t } = useI18n();
  const profile = trpc.profile.me.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const posts = trpc.community.myPosts.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const experience = trpc.gamification.summary.useQuery(undefined, { enabled: auth.isAuthenticated });
  const habitats = trpc.habitats.mine.useQuery(undefined, { enabled: auth.isAuthenticated });

  if (!auth.isAuthenticated) return <div className="reference-page profile-page-only"><StatePanel code="PROFILE/AUTH" state="locked" title="ANMELDUNG ERFORDERLICH" body="Melde dich an, um dein Profil und deine eigenen Beiträge zu sehen." /></div>;
  if (profile.isLoading) return <div className="reference-page profile-page-only"><StatePanel code="PROFILE/LOAD" state="loading" title={t("common.loading")} body="Profil wird geladen …" /></div>;
  if (profile.isError || !profile.data) return <div className="reference-page profile-page-only"><StatePanel code="PROFILE/ERROR" state="error" title={t("common.error")} body="Profil konnte nicht geladen werden." /></div>;

  const visibleHabitatCount = habitats.data?.length ?? 0;
  return <div className="reference-page reference-page--botany profile-page-only profile-reference-home">
    <Link className="profile-reference-private-entry glass-panel" href="/profile/private"><Settings size={17} /><span><strong>PROFIL VERWALTEN</strong><small>Privatbereich, Anzeigename und Profilbild bearbeiten</small></span><ChevronRight size={16} /></Link>

    <Link className="profile-reference-identity glass-panel" href="/ranking">
      <div className="profile-reference-avatar">{profile.data.avatarUrl ? <img src={profile.data.avatarUrl} alt="" /> : <UserRound size={34} />}</div>
      <div className="profile-reference-name"><h1>{profile.data.name ?? profile.data.username ?? "BlackWaterLeaf"}</h1><p>{profile.data.email ?? `@${profile.data.username ?? "blackwaterleaf"}`}</p></div>
      <div className="profile-reference-stats"><div><Trophy size={16} /><strong>{experience.data?.status === "ready" ? experience.data.totalXp : "…"}</strong><small>XP</small></div><div><strong>{experience.data?.status === "ready" ? experience.data.level : "…"}</strong><small>LEVEL</small></div><div><strong>{visibleHabitatCount}</strong><small>ANLAGEN</small></div></div>
    </Link>

    <details className="profile-reference-display glass-panel"><summary><span><b>ANZEIGEN</b><small>Welche Anlagen sollen im Profil erscheinen?</small></span><span className="profile-reference-plus">+</span></summary><div className="profile-reference-display-body"><Link href="/profile/settings#habitats">Anlagen verwalten <ChevronRight size={14} /></Link><Link href="/profile/settings#profile-preferences">Sichtbarkeit einstellen <ChevronRight size={14} /></Link></div></details>

    <section className="profile-reference-habitats"><div className="profile-reference-title"><div><span className="eyebrow">PRIVATE SAMMLUNG</span><h2>MEINE ANLAGEN & WERTE</h2><p>Privat · Aquarien, Pflanzen & Terrarien</p></div><Link href="/profile/habitats" aria-label="Anlagen öffnen"><ChevronRight size={22} /></Link></div><div className="profile-reference-habitat-grid"><Link href="/profile/habitats" className="profile-reference-habitat-card"><Leaf size={18} /><span>Pflanzen, Aquarien & Terrarien</span><b>{visibleHabitatCount}</b></Link><Link href="/ranking" className="profile-reference-habitat-card"><Trophy size={18} /><span>Punkte & Fortschritt</span><b>{experience.data?.status === "ready" ? experience.data.totalXp : "…"}</b></Link></div></section>

    <section className="profile-reference-posts glass-panel"><div className="profile-reference-title"><div><span className="eyebrow">MEIN BEREICH</span><h2>EIGENE BEITRÄGE</h2></div><div className="profile-reference-post-actions"><button type="button" className="secondary-action" onClick={() => void posts.refetch()} disabled={posts.isFetching}><RefreshCw size={14} className={posts.isFetching ? "action-spinner" : undefined} />{posts.isFetching ? "AKTUALISIERE …" : "AKTUALISIEREN"}</button><Link className="secondary-action" href="/community?compose=1"><Camera size={14} />POST</Link></div></div>{posts.isLoading ? <p className="form-status">Beiträge werden geladen …</p> : !posts.data?.length ? <p className="reference-list-empty">Noch keine eigenen Beiträge.</p> : <div className="profile-reference-post-list">{posts.data.slice(0, 6).map(post => <article key={post.id}><div><strong>{post.visibility === "public" ? "ÖFFENTLICH" : "PRIVAT"} · {post.realm ?? "ohne Bereich"}</strong><p>{post.content}</p><small>{new Date(post.updatedAt).toLocaleString(locale)}</small></div><Link href="/community"><Pencil size={14} /></Link></article>)}</div>}</section>

    <Link className="profile-reference-settings glass-panel" href="/profile/settings"><Settings size={17} /><span><strong>PROFIL BEARBEITEN & EINSTELLUNGEN</strong><small>Name, Bio, Profilbild, Datenschutz und weitere Werkzeuge</small></span><ChevronRight size={16} /></Link>
  </div>;
}

export function ProfileSettingsRoute() { return <Profile />; }
import Profile from "./Profile";
export function ProfilePostsRoute() { return <ProfileHome />; }
