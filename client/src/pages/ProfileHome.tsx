import { useAuth } from "@/_core/hooks/useAuth";
import { StatePanel } from "@/components/StatePanel";
import { useI18n } from "@/i18n";
import { trpc } from "@/lib/trpc";
import { Camera, MoreVertical, Pencil, Settings, Trophy, UserRound } from "lucide-react";
import { Link } from "wouter";

export default function ProfileHome() {
  const auth = useAuth();
  const { locale, t } = useI18n();
  const profile = trpc.profile.me.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const posts = trpc.community.myPosts.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const experience = trpc.gamification.summary.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });

  if (!auth.isAuthenticated) return <div className="reference-page profile-page-only"><StatePanel code="PROFILE/AUTH" state="locked" title="ANMELDUNG ERFORDERLICH" body="Melde dich an, um dein Profil und deine eigenen Beiträge zu sehen." /></div>;
  if (profile.isLoading) return <div className="reference-page profile-page-only"><StatePanel code="PROFILE/LOAD" state="loading" title={t("common.loading")} body="Profil wird geladen …" /></div>;
  if (profile.isError || !profile.data) return <div className="reference-page profile-page-only"><StatePanel code="PROFILE/ERROR" state="error" title={t("common.error")} body="Profil konnte nicht geladen werden." /></div>;

  return <div className="reference-page reference-page--botany profile-page-only profile-home">
    <section className="profile-card glass-panel profile-home__identity">
      <div className="profile-identity"><div className="profile-avatar">{profile.data.avatarUrl ? <img src={profile.data.avatarUrl} alt="" /> : <UserRound size={30} />}</div><div><h1>{profile.data.name ?? profile.data.username ?? "BlackWaterLeaf"}</h1><p>@{profile.data.username ?? "blackwaterleaf"}</p><p className="profile-home__bio">{profile.data.bio || "Deine Naturwelt auf BlackWaterLeaf."}</p></div><Link className="icon-button" href="/profile/settings" aria-label="Profileinstellungen"><MoreVertical size={18} /></Link></div>
      <div className="profile-home__stats"><span><Trophy size={14} /> {experience.data?.status === "ready" ? experience.data.totalXp : "…"} XP</span><span>{posts.data?.length ?? 0} Beiträge</span></div>
    </section>
    <nav className="profile-home__tabs" aria-label="Profilbereiche"><Link className="is-active" href="/profile">EIGENE BEITRÄGE</Link><Link href="/profile/settings#habitats">MEINE ANLAGEN</Link><Link href="/profile/settings#progress">PUNKTE</Link></nav>
    <section className="profile-home__posts">
      <div className="form-heading"><div><span className="eyebrow">[MEIN BEREICH]</span><h2>EIGENE BEITRÄGE</h2></div><Link className="secondary-action" href="/community?compose=1"><Camera size={15} />POST ERSTELLEN</Link></div>
      {posts.isLoading ? <p className="form-status">Beiträge werden geladen …</p> : !posts.data?.length ? <p className="reference-list-empty">Noch keine eigenen Beiträge. Erstelle deinen ersten Naturmoment.</p> : <div className="profile-post-list">{posts.data.map(post => <article className="community-own-post glass-panel" key={post.id}><div><strong>{post.visibility === "public" ? "ÖFFENTLICH" : "PRIVAT"} · {post.realm ?? "ohne Bereich"}</strong><p>{post.content}</p><small>{new Date(post.updatedAt).toLocaleString(locale)}</small></div><Link className="secondary-action" href="/community"><Pencil size={14} />BEARBEITEN</Link></article>)}</div>}
    </section>
    <Link className="profile-settings-entry glass-panel" href="/profile/settings"><Settings size={17} /><span><strong>PROFIL & EINSTELLUNGEN</strong><small>Privat, Anlagen, Punkte, Datenschutz, Sprache und Werkzeuge</small></span><MoreVertical size={16} /></Link>
  </div>;
}

export function ProfileSettingsRoute() { return <Profile />; }
import Profile from "./Profile";
export function ProfilePostsRoute() { return <ProfileHome />; }
