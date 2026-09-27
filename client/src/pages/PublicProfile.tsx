import { ArrowLeft, Ban, Check, ExternalLink, Globe2, Instagram, Loader2, Mail, Music2, UserRound, UserPlus, UserRoundCheck, X, ZoomIn } from "lucide-react";
import { Link, useRoute } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { StatePanel } from "@/components/StatePanel";
import { ObservatoryContextHeader } from "@/components/ObservatoryPrimitives";

export default function PublicProfile() {
  const [, params] = useRoute("/member/:id");
  const id = Number(params?.id);
  const auth = useAuth();
  const profile = trpc.profile.publicById.useQuery({ id }, { enabled: Number.isSafeInteger(id) && id > 0, retry: false });
  const posts = trpc.profile.publicPosts.useQuery({ userId: id, limit: 12 }, { enabled: Number.isSafeInteger(id) && id > 0, retry: false });
  const relationship = trpc.social.relationship.useQuery({ id }, { enabled: Number.isSafeInteger(id) && id > 0 });
  const followers = trpc.social.followers.useQuery({ id }, { enabled: profile.isSuccess, retry: false });
  const following = trpc.social.following.useQuery({ id }, { enabled: profile.isSuccess, retry: false });
  const follow = trpc.social.follow.useMutation({ onSuccess: () => void relationship.refetch() });
  const unfollow = trpc.social.unfollow.useMutation({ onSuccess: () => void relationship.refetch() });
  const block = trpc.social.block.useMutation({ onSuccess: () => void profile.refetch() });
  const unblock = trpc.social.unblock.useMutation({ onSuccess: () => void relationship.refetch() });
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [activeList, setActiveList] = useState<"followers" | "following">("followers");
  if (profile.isLoading) return <div className="observatory-route observatory-route--botany"><StatePanel code="PUBLIC_PROFILE/LOAD" state="loading" title="PROFIL WIRD GELADEN" body="Die öffentlichen Profildaten werden abgerufen …" /></div>;
  if (profile.isError || !profile.data) return <div className="observatory-route observatory-route--botany"><StatePanel code="PUBLIC_PROFILE/EMPTY" state="empty" title="PROFIL NICHT ÖFFENTLICH" body="Dieses Profil ist nicht verfügbar oder wurde privat gestellt." /></div>;
  const item = profile.data;
  const socialAccounts = item.socialAccounts ?? [];
  const isOwn = auth.user?.id && String(auth.user.id) === item.id;
  const isBusy = follow.isPending || unfollow.isPending || block.isPending || unblock.isPending;
  const toggleFollow = () => {
    if (!auth.isAuthenticated || isOwn) return;
    (relationship.data?.isFollowing ? unfollow : follow).mutate({ id });
  };
  return <div className="observatory-route observatory-route--botany public-profile-page">
    <div className="public-profile-toolbar"><Link className="page-back-link" href="/explore"><ArrowLeft size={16} />Zurück zu Entdecken</Link>{auth.isAuthenticated && !isOwn ? <button type="button" className="icon-button" title={relationship.data?.isBlockedByMe ? "Profil entblocken" : "Profil blockieren"} onClick={() => relationship.data?.isBlockedByMe ? unblock.mutate({ id }) : block.mutate({ id })} disabled={block.isPending || unblock.isPending}><Ban size={17} /></button> : null}</div>
    <ObservatoryContextHeader tone="botany" eyebrow="ÖFFENTLICHES PROFIL" title={item.name ?? item.username ?? "BlackWaterLeaf-Nutzer"} subtitle={item.bio ?? "Dieses Profil zeigt ausschließlich ausdrücklich freigegebene Informationen."} icon={UserRound} badge={item.username ? `@${item.username}` : "ÖFFENTLICH"} children={auth.isAuthenticated && !isOwn ? <span className="public-profile-actions"><Link className="secondary-action" href={`/messages?to=${id}`}><Mail size={15} />NACHRICHT</Link><button type="button" className={relationship.data?.isFollowing ? "secondary-action" : "primary-action"} onClick={toggleFollow} disabled={isBusy || relationship.data?.isBlockedByMe}>{isBusy ? <Loader2 size={15} className="action-spinner" /> : relationship.data?.isFollowing ? <UserRoundCheck size={15} /> : <UserPlus size={15} />}{relationship.data?.isBlockedByMe ? "BLOCKIERT" : relationship.data?.isFollowing ? "FOLGEN BEENDEN" : "FOLGEN"}</button></span> : undefined} />
    <section className="public-profile-stats observatory-data-panel"><div><strong>{relationship.data?.followers ?? "—"}</strong><small>FOLLOWER</small></div><div><strong>{relationship.data?.following ?? "—"}</strong><small>FOLGT</small></div><div><strong><Check size={16} /></strong><small>ÖFFENTLICH</small></div></section>
    {socialAccounts.length ? <section className="public-profile-external-links observatory-data-panel" aria-labelledby="public-profile-external-links-title"><div className="observatory-data-panel__heading"><div><span className="eyebrow">EXTERNE PROFILE</span><h2 id="public-profile-external-links-title">VERKNÜPFTE KONTEN</h2></div><span className="observatory-count">{socialAccounts.length}</span></div><div>{socialAccounts.map(account => <a key={account.id} href={account.url} target="_blank" rel="noreferrer noopener"><ExternalSocialIcon platform={account.platform} /><span><strong>{account.label}</strong><small>{account.platform.toUpperCase()}</small></span><ExternalLink size={15} /></a>)}</div></section> : null}
    <section className="public-profile-social-lists observatory-data-panel" aria-labelledby="public-profile-social-lists-title"><div className="observatory-data-panel__heading"><div><span className="eyebrow">COMMUNITY · BEZIEHUNGEN</span><h2 id="public-profile-social-lists-title">FOLLOWER &amp; FOLGT</h2></div><span className="observatory-count">{activeList === "followers" ? relationship.data?.followers ?? "…" : relationship.data?.following ?? "…"}</span></div><div className="public-profile-social-tabs" role="tablist" aria-label="Profilbeziehungen"><button type="button" role="tab" aria-selected={activeList === "followers"} className={activeList === "followers" ? "is-active" : ""} onClick={() => setActiveList("followers")}>FOLLOWER <span>{relationship.data?.followers ?? "—"}</span></button><button type="button" role="tab" aria-selected={activeList === "following"} className={activeList === "following" ? "is-active" : ""} onClick={() => setActiveList("following")}>FOLGT <span>{relationship.data?.following ?? "—"}</span></button></div>{(activeList === "followers" ? followers : following).isLoading ? <p className="observatory-inline-state">LISTE WIRD GELADEN …</p> : (activeList === "followers" ? followers : following).isError ? <p className="observatory-inline-state">DIE LISTE IST GERADE NICHT VERFÜGBAR.</p> : !(activeList === "followers" ? followers.data : following.data)?.length ? <p className="observatory-inline-state">NOCH KEINE ÖFFENTLICHEN KONTEN IN DIESER LISTE.</p> : <div className="public-profile-social-list">{(activeList === "followers" ? followers.data : following.data)?.map(person => <Link key={person.id} href={`/member/${person.id}`} className="public-profile-social-person">{person.avatarUrl ? <img src={person.avatarUrl} alt="" /> : <span>{(person.name ?? person.username ?? "?").slice(0, 1).toUpperCase()}</span>}<strong>{person.name ?? person.username ?? "BlackWaterLeaf-Nutzer"}</strong><small>{person.username ? `@${person.username}` : "Öffentliches Profil"}</small></Link>)}</div>}</section>
    <section className="public-profile-note observatory-data-panel"><span className="eyebrow">DATENSCHUTZ</span><p>Private Anlagen, Care-Daten und unveröffentlichte Beiträge bleiben geschützt.</p></section>
    <section className="public-profile-posts observatory-data-panel"><div className="observatory-data-panel__heading"><span className="eyebrow">FREIGEGEBENE BEITRÄGE</span><span className="observatory-count">{posts.isLoading ? "…" : `${posts.data?.length ?? 0}`}</span></div>{posts.isError ? <StatePanel code="PUBLIC_PROFILE/POSTS_ERROR" state="error" title="BEITRÄGE NICHT VERFÜGBAR" body="Die freigegebenen Beiträge konnten gerade nicht geladen werden." /> : !posts.data?.length ? <StatePanel code="PUBLIC_PROFILE/POSTS_EMPTY" state="empty" title="NOCH KEINE FREIGEGEBENEN BEITRÄGE" body="Dieser Nutzer hat noch keinen öffentlichen Beitrag veröffentlicht." /> : <div className="public-profile-post-list">{posts.data.map(post => <article key={post.id} className="public-profile-post"><span className="system-chip">{post.realm ?? "COMMUNITY"}</span><p>{post.content}</p>{post.media?.length ? <div className="public-profile-media-grid">{post.media.map(media => media.url && media.mimeType.startsWith("image/") ? <button type="button" className="public-profile-media-card" key={media.id} onClick={() => setLightbox(media.url!)}><img src={media.url} alt={post.content.slice(0, 90)} loading="lazy" /><ZoomIn size={16} /></button> : media.url ? <video key={media.id} className="public-profile-media-card" src={media.url} controls playsInline preload="metadata" /> : null)}</div> : null}<small>{new Date(post.createdAt).toLocaleDateString("de-DE")}</small><Link className="page-back-link" href={`/community/post/${post.id}`}>BEITRAG ÖFFNEN <ArrowLeft size={14} className="rotate-180" /></Link></article>)}</div>}{lightbox ? <div className="media-lightbox" role="dialog" aria-modal="true" onClick={() => setLightbox(null)}><button type="button" className="media-lightbox__close" aria-label="Zoom schließen" onClick={() => setLightbox(null)}><X size={18} /></button><img src={lightbox} alt="Vergrößertes Profilmedium" onClick={event => event.stopPropagation()} /></div> : null}</section>
  </div>;
}

function ExternalSocialIcon({ platform }: { platform: string }) {
  if (platform === "instagram") return <Instagram size={18} />;
  if (platform === "tiktok") return <Music2 size={18} />;
  return <Globe2 size={18} />;
}
