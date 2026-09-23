import { useAuth } from "@/_core/hooks/useAuth";
import { ObservatoryContextHeader } from "@/components/ObservatoryPrimitives";
import { StatePanel } from "@/components/StatePanel";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Ban, Check, Flag, Heart, MessageCircle, Pencil, Send, ShieldCheck, Trash2, UserPlus, UserRoundCheck, UsersRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useRoute } from "wouter";

export default function CommunityPostDetail() {
  const [, params] = useRoute("/community/post/:id");
  const postId = Number(params?.id);
  const auth = useAuth();
  const utils = trpc.useUtils();
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const post = trpc.community.byId.useQuery({ postId }, { enabled: auth.isAuthenticated && Number.isSafeInteger(postId) && postId > 0, retry: false });
  const comments = trpc.community.comments.useQuery({ postId }, { enabled: auth.isAuthenticated && post.isSuccess, retry: false });
  const relationship = trpc.social.relationship.useQuery({ id: Number(post.data?.author.id) }, { enabled: auth.isAuthenticated && Boolean(post.data?.author.id), retry: false });
  const follow = trpc.social.follow.useMutation({ onSuccess: () => void relationship.refetch() });
  const unfollow = trpc.social.unfollow.useMutation({ onSuccess: () => void relationship.refetch() });
  const block = trpc.social.block.useMutation({ onSuccess: () => void post.refetch() });
  const unblock = trpc.social.unblock.useMutation({ onSuccess: () => void relationship.refetch() });
  const like = trpc.community.like.useMutation({ onSuccess: () => void post.refetch(), onError: error => setStatus(error.message) });
  const report = trpc.community.report.useMutation({ onSuccess: () => setStatus("Meldung zur Prüfung gespeichert."), onError: error => setStatus(error.message) });
  const addComment = trpc.community.addComment.useMutation({ onSuccess: async () => { setContent(""); setReplyTo(null); setStatus("Kommentar veröffentlicht."); await Promise.all([comments.refetch(), post.refetch(), utils.community.feed.invalidate()]); }, onError: error => setStatus(error.message) });
  const updateComment = trpc.community.updateComment.useMutation({ onSuccess: async () => { setEditingCommentId(null); setEditingCommentText(""); setStatus("Kommentar gespeichert."); await comments.refetch(); }, onError: error => setStatus(error.message) });
  const deleteComment = trpc.community.deleteComment.useMutation({ onSuccess: async () => { setStatus("Kommentar gelöscht."); await Promise.all([comments.refetch(), post.refetch()]); }, onError: error => setStatus(error.message) });

  if (!auth.isAuthenticated) return <div className="observatory-route observatory-route--botany community-detail-page"><StatePanel code="COMMUNITY_DETAIL/AUTH_REQUIRED" state="locked" title="ANMELDUNG ERFORDERLICH" body="Beiträge, Diskussionen und Live-Community-Daten sind nur für angemeldete, aktive Konten sichtbar." action={<button type="button" className="primary-action" onClick={startLogin}>SICHER ANMELDEN</button>} /></div>;
  if (post.isLoading) return <div className="observatory-route observatory-route--botany community-detail-page"><StatePanel code="COMMUNITY_DETAIL/LOAD" state="loading" title="BEITRAG WIRD GELADEN" body="Die Diskussion wird aus dem geschützten Community-Bereich abgerufen." /></div>;
  if (post.isError || !post.data) return <div className="observatory-route observatory-route--botany community-detail-page"><StatePanel code="COMMUNITY_DETAIL/UNAVAILABLE" state="empty" title="BEITRAG NICHT VERFÜGBAR" body="Der Beitrag wurde entfernt, ist nicht veröffentlicht oder das Konto ist in deiner Blockliste." action={<Link href="/community" className="secondary-action">ZUM COMMUNITY-FEED</Link>} /></div>;

  const item = post.data;
  const authorId = Number(item.author.id);
  const isOwn = String(auth.user?.id) === item.author.id;
  const toggleFollow = () => { if (!isOwn) (relationship.data?.isFollowing ? unfollow : follow).mutate({ id: authorId }); };
  const submit = (event: FormEvent) => { event.preventDefault(); const value = content.trim(); if (value) addComment.mutate({ postId, parentId: replyTo, content: value }); };

  return <div className="observatory-route observatory-route--botany community-detail-page">
    <Link href="/community" className="page-back-link"><ArrowLeft size={16} />ZUM COMMUNITY-FEED</Link>
    <ObservatoryContextHeader tone="botany" eyebrow="COMMUNITY · DISKUSSION" title="BEITRAG & AUSTAUSCH." subtitle="Alle Inhalte, Kommentare und Beziehungen werden nur im angemeldeten Community-Bereich verarbeitet." icon={MessageCircle} badge={item.realm ? item.realm.toUpperCase() : "COMMUNITY"} />
    <article className="community-detail-record observatory-data-panel">
      <header className="community-detail-record__author">
        <Link href={`/member/${item.author.id}`} className="community-detail-avatar">{item.author.avatarUrl ? <img src={item.author.avatarUrl} alt="" /> : <UsersRound size={22} />}</Link>
        <div><Link href={`/member/${item.author.id}`}>{item.author.name ?? item.author.username ?? "Verifiziertes Konto"}</Link><small>{new Date(item.createdAt).toLocaleString("de-DE")}</small><span>{item.realm ? item.realm.toUpperCase() : "COMMUNITY"} · ÖFFENTLICH</span></div>
        {!isOwn ? <div className="community-detail-record__actions"><button type="button" className={relationship.data?.isFollowing ? "secondary-action" : "primary-action"} disabled={follow.isPending || unfollow.isPending} onClick={toggleFollow}>{relationship.data?.isFollowing ? <Check size={15} /> : <UserPlus size={15} />}{relationship.data?.isFollowing ? "FOLGST DU" : "FOLGEN"}</button><button type="button" className="icon-button" title={relationship.data?.isBlockedByMe ? "Konto entblocken" : "Konto blockieren"} onClick={() => relationship.data?.isBlockedByMe ? unblock.mutate({ id: authorId }) : block.mutate({ id: authorId })}>{relationship.data?.isBlockedByMe ? <UserRoundCheck size={16} /> : <Ban size={16} />}</button></div> : null}
      </header>
      <p className="community-detail-record__content">{item.content}</p>
      {item.media.map(media => media.mimeType.startsWith("video/") ? <video key={media.id} className="community-detail-record__media" src={media.accessUrl} controls preload="metadata" playsInline aria-label="Community-Video" /> : <img key={media.id} className="community-detail-record__media" src={media.accessUrl} alt="Community-Beitragsbild" loading="lazy" />)}
      <footer className="community-detail-record__metrics"><button type="button" disabled={like.isPending} onClick={() => like.mutate({ postId })}><Heart size={16} />{item.likesCount} GEFÄLLT MIR</button><span><MessageCircle size={16} />{item.commentsCount} KOMMENTARE</span>{!isOwn ? <button type="button" onClick={() => report.mutate({ postId, reason: "other" })}><Flag size={15} />MELDEN</button> : null}</footer>
    </article>
    <section className="community-detail-discussion observatory-data-panel" aria-labelledby="community-discussion-title">
      <div className="observatory-data-panel__heading"><div><span className="eyebrow">MODERIERTE DISKUSSION</span><h2 id="community-discussion-title">KOMMENTARE</h2></div><span className="observatory-count">{comments.data?.length ?? "…"}</span></div>
      <p className="community-detail-discussion__note"><ShieldCheck size={15} /> Kommentare bleiben an deinen Account gebunden. Blockierte Konten sind in dieser Diskussion ausgeblendet.</p>
      {comments.isLoading ? <StatePanel code="DISCUSSION/LOAD" state="loading" title="KOMMENTARE WERDEN GELADEN" body="Der geschützte Diskussionsverlauf wird abgerufen." /> : comments.isError ? <StatePanel code="DISCUSSION/ERROR" state="error" title="DISKUSSION NICHT VERFÜGBAR" body="Bitte versuche es erneut." action={<button type="button" className="secondary-action" onClick={() => void comments.refetch()}>ERNEUT LADEN</button>} /> : !comments.data?.length ? <StatePanel code="DISCUSSION/EMPTY" state="empty" title="NOCH KEINE KOMMENTARE" body="Eröffne die Diskussion mit einem sachlichen Beitrag." /> : <div className="community-detail-thread">{comments.data.map(comment => { const ownComment = String(auth.user?.id) === String(comment.authorId); return <article key={comment.id} className={`community-detail-comment ${comment.parentId ? "is-reply" : ""}`}><div><Link href={`/member/${comment.authorId}`}>{comment.authorName ?? comment.authorUsername ?? "Konto"}</Link><small>{new Date(comment.createdAt).toLocaleString("de-DE")}</small></div>{editingCommentId === comment.id ? <div className="community-detail-comment-edit"><textarea maxLength={2000} value={editingCommentText} onChange={event => setEditingCommentText(event.target.value)} /><button type="button" className="primary-action" disabled={!editingCommentText.trim() || updateComment.isPending} onClick={() => updateComment.mutate({ commentId: comment.id, content: editingCommentText.trim() })}><Check size={15} />SPEICHERN</button><button type="button" className="secondary-action" onClick={() => { setEditingCommentId(null); setEditingCommentText(""); }}>ABBRECHEN</button></div> : <p>{comment.content}</p>}{ownComment ? <div className="community-detail-comment__actions"><button type="button" className="comment-reply" onClick={() => { setEditingCommentId(comment.id); setEditingCommentText(comment.content); }}><Pencil size={14} />BEARBEITEN</button><button type="button" className="comment-reply" disabled={deleteComment.isPending} onClick={() => { if (window.confirm("Diesen eigenen Kommentar wirklich löschen?")) deleteComment.mutate({ commentId: comment.id }); }}><Trash2 size={14} />LÖSCHEN</button></div> : null}{!comment.parentId ? <button type="button" className="comment-reply" onClick={() => setReplyTo(comment.id)}>ANTWORTEN</button> : null}</article>; })}</div>}
      <form className="community-detail-comment-form" onSubmit={submit}>{replyTo ? <div className="community-detail-reply-state"><span>Antwort auf einen Kommentar</span><button type="button" className="comment-reply" onClick={() => setReplyTo(null)}>AUFHEBEN</button></div> : null}<label className="field"><span>Dein Kommentar</span><textarea required maxLength={2000} rows={4} value={content} onChange={event => setContent(event.target.value)} placeholder="Teile eine sachliche Beobachtung oder Frage …" /></label><button type="submit" className="primary-action" disabled={addComment.isPending}><Send size={16} />{addComment.isPending ? "WIRD GESENDET …" : "KOMMENTAR VERÖFFENTLICHEN"}</button></form>
    </section>
    {status ? <p className="form-status" role="status">{status}</p> : null}
  </div>;
}
