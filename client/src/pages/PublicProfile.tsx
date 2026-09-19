import { ArrowLeft, Ban, Check, Loader2, UserRound, UserPlus, UserRoundCheck } from "lucide-react";
import { Link, useRoute } from "wouter";
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
  const follow = trpc.social.follow.useMutation({ onSuccess: () => void relationship.refetch() });
  const unfollow = trpc.social.unfollow.useMutation({ onSuccess: () => void relationship.refetch() });
  const block = trpc.social.block.useMutation({ onSuccess: () => void profile.refetch() });
  if (profile.isLoading) return <div className="observatory-route observatory-route--botany"><StatePanel code="PUBLIC_PROFILE/LOAD" state="loading" title="PROFIL WIRD GELADEN" body="Die öffentlichen Profildaten werden abgerufen …" /></div>;
  if (profile.isError || !profile.data) return <div className="observatory-route observatory-route--botany"><StatePanel code="PUBLIC_PROFILE/EMPTY" state="empty" title="PROFIL NICHT ÖFFENTLICH" body="Dieses Profil ist nicht verfügbar oder wurde privat gestellt." /></div>;
  const item = profile.data;
  const isOwn = auth.user?.id && String(auth.user.id) === item.id;
  const isBusy = follow.isPending || unfollow.isPending;
  const toggleFollow = () => {
    if (!auth.isAuthenticated || isOwn) return;
    (relationship.data?.isFollowing ? unfollow : follow).mutate({ id });
  };
  return <div className="observatory-route observatory-route--botany public-profile-page">
    <div className="public-profile-toolbar"><Link className="page-back-link" href="/explore"><ArrowLeft size={16} />Zurück zu Entdecken</Link>{auth.isAuthenticated && !isOwn ? <button type="button" className="icon-button" title="Profil blockieren" onClick={() => block.mutate({ id })} disabled={block.isPending}><Ban size={17} /></button> : null}</div>
    <ObservatoryContextHeader tone="botany" eyebrow="ÖFFENTLICHES PROFIL" title={item.name ?? item.username ?? "BlackWaterLeaf-Nutzer"} subtitle={item.bio ?? "Dieses Profil zeigt ausschließlich ausdrücklich freigegebene Informationen."} icon={UserRound} badge={item.username ? `@${item.username}` : "ÖFFENTLICH"} children={auth.isAuthenticated && !isOwn ? <button type="button" className={relationship.data?.isFollowing ? "secondary-action" : "primary-action"} onClick={toggleFollow} disabled={isBusy}>{isBusy ? <Loader2 size={15} className="action-spinner" /> : relationship.data?.isFollowing ? <UserRoundCheck size={15} /> : <UserPlus size={15} />}{relationship.data?.isFollowing ? "FOLGEN BEENDEN" : "FOLGEN"}</button> : undefined} />
    <section className="public-profile-stats observatory-data-panel"><div><strong>{relationship.data?.followers ?? "—"}</strong><small>FOLLOWER</small></div><div><strong>{relationship.data?.following ?? "—"}</strong><small>FOLGT</small></div><div><strong><Check size={16} /></strong><small>ÖFFENTLICH</small></div></section>
    <section className="public-profile-note observatory-data-panel"><span className="eyebrow">DATENSCHUTZ</span><p>Private Anlagen, Care-Daten und unveröffentlichte Beiträge bleiben geschützt.</p></section>
    <section className="public-profile-posts observatory-data-panel"><div className="observatory-data-panel__heading"><span className="eyebrow">FREIGEGEBENE BEITRÄGE</span><span className="observatory-count">{posts.isLoading ? "…" : `${posts.data?.length ?? 0}`}</span></div>{posts.isError ? <StatePanel code="PUBLIC_PROFILE/POSTS_ERROR" state="error" title="BEITRÄGE NICHT VERFÜGBAR" body="Die freigegebenen Beiträge konnten gerade nicht geladen werden." /> : !posts.data?.length ? <StatePanel code="PUBLIC_PROFILE/POSTS_EMPTY" state="empty" title="NOCH KEINE FREIGEGEBENEN BEITRÄGE" body="Dieser Nutzer hat noch keinen öffentlichen Beitrag veröffentlicht." /> : <div className="public-profile-post-list">{posts.data.map(post => <article key={post.id} className="public-profile-post"><span className="system-chip">{post.realm ?? "COMMUNITY"}</span><p>{post.content}</p><small>{new Date(post.createdAt).toLocaleDateString("de-DE")}</small><Link className="page-back-link" href={`/community?post=${post.id}`}>BEITRAG ÖFFNEN <ArrowLeft size={14} className="rotate-180" /></Link></article>)}</div>}</section>
  </div>;
}
