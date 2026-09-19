import { useAuth } from "@/_core/hooks/useAuth";
import { StatePanel } from "@/components/StatePanel";
import { useI18n } from "@/i18n";
import { trpc } from "@/lib/trpc";
import { Camera, ChevronRight, Fish, Leaf, LogIn, RefreshCw, Settings, Trophy, UserRound, Box } from "lucide-react";
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
  const posts = trpc.community.myPosts.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const experience = trpc.gamification.summary.useQuery(undefined, { enabled: auth.isAuthenticated });
  const habitats = trpc.habitats.mine.useQuery(undefined, { enabled: auth.isAuthenticated });

  if (!auth.isAuthenticated) return <div className="reference-page profile-page-only profile-auth-landing"><StatePanel code="PROFILE/AUTH" state="locked" title="DEIN BEREICH WARTET AUF DICH" body="Melde dich sicher an, um dein Profil, deine eigenen Beiträge und deine privaten Anlagen zu sehen. Datenschutz, Sprache und Werkzeuge bleiben bewusst im Drei-Striche-Menü." action={<Link className="primary-action profile-auth-cta" href="/login"><LogIn size={16} />SICHER ANMELDEN</Link>} /></div>;
  if (profile.isLoading) return <div className="reference-page profile-page-only"><StatePanel code="PROFILE/LOAD" state="loading" title={t("common.loading")} body="Profil wird geladen …" /></div>;
  if (profile.isError || !profile.data) return <div className="reference-page profile-page-only"><StatePanel code="PROFILE/ERROR" state="error" title={t("common.error")} body="Profil konnte nicht geladen werden." /></div>;

  const habitatCount = habitats.data?.length ?? 0;
  const name = profile.data.name ?? profile.data.username ?? "BlackWaterLeaf";
  const xp = experience.data?.status === "ready" ? experience.data.totalXp : "…";
  const level = experience.data?.status === "ready" ? experience.data.level : "…";

  return <div className="reference-page reference-page--botany profile-page-only profile-reference-home">
    <Link className="profile-reference-private-entry glass-panel" href="/profile/private"><Settings size={18} /><span><strong>PROFIL VERWALTEN</strong><small>Privatbereich, Anzeigename und Profilbild bearbeiten</small></span><ChevronRight size={17} /></Link>

    <section className="profile-reference-identity glass-panel"><div className="profile-reference-avatar">{profile.data.avatarUrl ? <img src={profile.data.avatarUrl} alt="" /> : <UserRound size={34} />}</div><div className="profile-reference-name"><span className="eyebrow">BLACKWATERLEAF · PROFIL</span><h1>{name}</h1><p>{profile.data.email ?? `@${profile.data.username ?? "blackwaterleaf"}`}</p></div><Link className="profile-reference-more" href="/profile/private" aria-label="Profil bearbeiten">•••</Link><Link className="profile-reference-stat" href="/ranking"><Trophy size={16} /><strong>{xp}</strong><small>XP</small></Link><Link className="profile-reference-stat" href="/ranking"><strong>{level}</strong><small>LEVEL</small></Link><Link className="profile-reference-stat" href="/profile/habitats"><strong>{habitatCount}</strong><small>ANLAGEN</small></Link></section>

    <details className="profile-reference-display glass-panel"><summary><span><b>ANZEIGEN</b><small>Welche Anlagen sollen im Profil erscheinen?</small></span><span className="profile-reference-plus">+</span></summary><div className="profile-reference-display-body"><Link href="/profile/habitats">Anlagen anzeigen <ChevronRight size={14} /></Link></div></details>

    <section className="profile-reference-habitats"><div className="profile-reference-title"><div><span className="eyebrow">PRIVATE SAMMLUNG</span><h2>MEINE ANLAGEN & WERTE</h2><p>Privat · Wähle direkt deinen Bereich</p></div><Link href="/profile/habitats" aria-label="Alle Anlagen öffnen"><ChevronRight size={22} /></Link></div><div className="profile-habitat-choice-grid">{habitatChoices.map(({ key, label, note, icon: Icon, className }) => <Link key={key} href={`/profile/habitats?kind=${key}`} className={`profile-habitat-card ${className}`}><Icon size={22} /><span><strong>{label}</strong><small>{note}</small></span><ChevronRight size={17} /></Link>)}</div></section>

    <section className="profile-reference-posts glass-panel"><div className="profile-reference-title"><div><span className="eyebrow">MEIN BEREICH</span><h2>EIGENE BEITRÄGE</h2></div><div className="profile-reference-post-actions"><button type="button" className="secondary-action" onClick={() => void posts.refetch()} disabled={posts.isFetching}><RefreshCw size={14} className={posts.isFetching ? "action-spinner" : undefined} />{posts.isFetching ? "AKTUALISIERE …" : "AKTUALISIEREN"}</button><Link className="secondary-action" href="/community?compose=1"><Camera size={14} />POST</Link></div></div>{posts.isLoading ? <p className="form-status">Beiträge werden geladen …</p> : !posts.data?.length ? <p className="reference-list-empty">Noch keine eigenen Beiträge.</p> : <div className="profile-reference-post-list">{posts.data.slice(0, 6).map(post => <article key={post.id}><div><strong>{post.visibility === "public" ? "ÖFFENTLICH" : "PRIVAT"} · {post.realm ?? "ohne Bereich"}</strong><p>{post.content}</p><small>{new Date(post.updatedAt).toLocaleString(locale)}</small></div><Link href="/community"><ChevronRight size={15} /></Link></article>)}</div>}</section>

  </div>;
}
