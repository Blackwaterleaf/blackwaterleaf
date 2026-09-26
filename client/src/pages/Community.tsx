import { useAuth } from "@/_core/hooks/useAuth";
import { ObservatoryContextHeader } from "@/components/ObservatoryPrimitives";
import { StatePanel } from "@/components/StatePanel";
import { startLogin } from "@/const";
import { useI18n } from "@/i18n";
import { imageErrorMessage, readImageAsBase64, readVideoAsBase64 } from "@/lib/files";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Ban, Camera, Flag, Heart, MessageCircle, Pencil, RefreshCw, Save as SaveIcon, Send, ShieldCheck, Trash2, UsersRound, Video } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link } from "wouter";

const COMMUNITY_POLICY_VERSION = "community-2026-09-16-v1";

type CommunityPostCardData = {
  id: string;
  content: string;
  realm: "botany" | "aquarium" | "terrarium" | null;
  visibility: "public" | "private" | "unlisted";
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  author: { id: string; name: string | null; username: string | null; avatarUrl: string | null };
  media: Array<{ id: string; accessUrl: string; mimeType: string; kind: string }>;
};

function CommunityPostCard({ post, isOwner, locale, onLike, onEdit, onDelete, onReport, onBlock }: { post: CommunityPostCardData; isOwner: boolean; locale: string; onLike: () => void; onEdit: () => void; onDelete: () => void; onReport: () => void; onBlock: () => void }) {
  const auth = useAuth();
  const utils = trpc.useUtils();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");
  const [commentStatus, setCommentStatus] = useState<string | null>(null);
  const [mediaRatios, setMediaRatios] = useState<Record<string, number>>({});
  const comments = trpc.community.comments.useQuery({ postId: Number(post.id) }, { enabled: commentsOpen, retry: false });
  const refreshComments = async () => { await Promise.all([utils.community.comments.invalidate({ postId: Number(post.id) }), utils.community.feed.invalidate()]); };
  const addComment = trpc.community.addComment.useMutation({ onSuccess: async () => { setCommentText(""); setReplyTo(null); setCommentStatus("Kommentar veröffentlicht."); await refreshComments(); }, onError: error => setCommentStatus(error.message) });
  const updateComment = trpc.community.updateComment.useMutation({ onSuccess: async () => { setEditingCommentId(null); setEditingCommentContent(""); setCommentStatus("Kommentar aktualisiert."); await refreshComments(); }, onError: error => setCommentStatus(error.message) });
  const deleteComment = trpc.community.deleteComment.useMutation({ onSuccess: async () => { setCommentStatus("Kommentar gelöscht."); await refreshComments(); }, onError: error => setCommentStatus(error.message) });

  const submitComment = async (event: FormEvent) => {
    event.preventDefault();
    if (!auth.isAuthenticated) { startLogin(); return; }
    const value = commentText.trim();
    if (!value) return;
    setCommentStatus(null);
    await addComment.mutateAsync({ postId: Number(post.id), parentId: replyTo, content: value });
  };

  const saveComment = (commentId: number) => {
    const content = editingCommentContent.trim();
    if (!content || updateComment.isPending) return;
    setCommentStatus(null);
    updateComment.mutate({ commentId, content });
  };

  return <article className="community-post observatory-panel">
    <div className="post-author">{post.author.avatarUrl ? <img src={post.author.avatarUrl} alt="" /> : <span>{(post.author.name ?? post.author.username ?? "?").slice(0, 1).toUpperCase()}</span>}<div><strong>{post.author.name ?? post.author.username ?? (locale === "de" ? "Verifiziertes Konto" : "Verified account")}</strong><small>{new Date(post.createdAt).toLocaleString(locale)}</small><span className="observatory-post-meta">{post.realm ? post.realm.toUpperCase() : "COMMUNITY"} · {post.visibility === "public" ? "ÖFFENTLICH" : post.visibility === "unlisted" ? "UNGELISTET" : "PRIVAT"}</span></div>{isOwner ? <div className="community-post-owner-actions" aria-label="Eigene Beitragsaktionen"><button type="button" className="icon-button" title="Beitrag bearbeiten" aria-label="Beitrag bearbeiten" onClick={onEdit}><Pencil size={17} /></button><button type="button" className="icon-button icon-button--danger" title="Beitrag löschen" aria-label="Beitrag löschen" onClick={onDelete}><Trash2 size={17} /></button></div> : null}</div>
    <p>{post.content}</p>{post.media.map(media => media.mimeType.startsWith("video/") ? <video key={media.id} className="post-media" style={mediaRatios[media.id] ? { aspectRatio: mediaRatios[media.id] } : undefined} src={media.accessUrl} controls preload="metadata" playsInline aria-label="Community-Video" onLoadedMetadata={event => { const element = event.currentTarget; if (element.videoWidth && element.videoHeight) setMediaRatios(current => ({ ...current, [media.id]: element.videoWidth / element.videoHeight })); }} /> : <img key={media.id} className="post-media" style={mediaRatios[media.id] ? { aspectRatio: mediaRatios[media.id] } : undefined} src={media.accessUrl} alt="Community-Beitragsbild" loading="lazy" onLoad={event => { const element = event.currentTarget; if (element.naturalWidth && element.naturalHeight) setMediaRatios(current => ({ ...current, [media.id]: element.naturalWidth / element.naturalHeight })); }} />)}
    <div className="post-metrics"><button type="button" onClick={onLike}><Heart size={15} /> {post.likesCount}</button><Link className="community-post-discussion-link" href={`/community/post/${post.id}`}><MessageCircle size={15} /> {post.commentsCount} DISKUSSION <ArrowRight size={14} /></Link><button type="button" onClick={() => { void navigator.clipboard?.writeText(window.location.origin + `/community/post/${post.id}`).then(() => setCommentStatus("Beitragslink kopiert.")).catch(() => setCommentStatus("Beitragslink konnte nicht kopiert werden.")); }}><SaveIcon size={15} /> LINK KOPIEREN</button>{!isOwner ? <><button type="button" title="Beitrag melden" aria-label="Beitrag melden" onClick={onReport}><Flag size={15} /> MELDEN</button><button type="button" title="Konto blockieren" aria-label="Konto blockieren" onClick={onBlock}><Ban size={15} /> BLOCKIEREN</button></> : null}</div>
    {commentsOpen ? <section className="community-comments" aria-label="Kommentare"><div className="community-comments__heading"><strong>Kommentare</strong><span>{comments.isLoading ? "Laden…" : comments.data?.length ?? 0}</span></div>{comments.isError ? <p className="form-status" role="alert">Kommentare konnten nicht geladen werden.</p> : null}{comments.data?.map(comment => { const ownsComment = Boolean(auth.user?.id && String(auth.user.id) === String(comment.authorId)); const editing = editingCommentId === comment.id; return <div key={comment.id} className={`community-comment ${comment.parentId ? "is-reply" : ""}`}><div><strong>{comment.authorName ?? comment.authorUsername ?? "Konto"}</strong><small>{new Date(comment.createdAt).toLocaleString(locale)}</small></div>{editing ? <><textarea aria-label="Kommentar bearbeiten" maxLength={2000} rows={2} value={editingCommentContent} onChange={event => setEditingCommentContent(event.target.value)} /><div className="community-comment-actions"><button type="button" className="comment-reply" disabled={updateComment.isPending} onClick={() => saveComment(comment.id)}>{updateComment.isPending ? "SPEICHERT …" : "SPEICHERN"}</button><button type="button" className="comment-reply" onClick={() => { setEditingCommentId(null); setEditingCommentContent(""); }}>ABBRECHEN</button></div></> : <p>{comment.content}</p>}{!comment.parentId ? <button type="button" className="comment-reply" onClick={() => setReplyTo(comment.id)}>ANTWORTEN</button> : null}{ownsComment && !editing ? <div className="community-comment-actions"><button type="button" className="icon-button" title="Kommentar bearbeiten" aria-label="Kommentar bearbeiten" onClick={() => { setEditingCommentId(comment.id); setEditingCommentContent(comment.content); }}><Pencil size={14} /></button><button type="button" className="icon-button icon-button--danger" title="Kommentar löschen" aria-label="Kommentar löschen" disabled={deleteComment.isPending} onClick={() => { if (window.confirm("Diesen eigenen Kommentar wirklich löschen?")) deleteComment.mutate({ commentId: comment.id }); }}><Trash2 size={14} /></button></div> : null}</div>; })}{commentStatus ? <p className="form-status" role="status">{commentStatus}</p> : null}<form className="community-comment-form" onSubmit={submitComment}>{replyTo ? <button type="button" className="comment-reply" onClick={() => setReplyTo(null)}>ANTWORT AUFHEBEN</button> : null}<textarea required maxLength={2000} rows={2} value={commentText} onChange={event => setCommentText(event.target.value)} placeholder={auth.isAuthenticated ? "Kommentar schreiben…" : "Zum Kommentieren anmelden"} /><button type="submit" className="primary-action" disabled={addComment.isPending}><Send size={15} />{addComment.isPending ? "WIRD GESENDET…" : "KOMMENTIEREN"}</button></form></section> : null}
  </article>;
}

export default function Community() {
  const auth = useAuth();
  const { locale, t } = useI18n();
  const utils = trpc.useUtils();
  const feed = trpc.community.feed.useQuery({ limit: 20 }, { enabled: auth.isAuthenticated, retry: false });
  const consents = trpc.profile.consents.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const createDraft = trpc.community.createDraft.useMutation();
  const uploadDraftImage = trpc.community.uploadDraftImage.useMutation();
  const uploadDraftVideo = trpc.community.uploadDraftVideo.useMutation();
  const publishPost = trpc.community.publish.useMutation();
  const updatePost = trpc.community.updateMine.useMutation();
  const deletePost = trpc.community.deleteMine.useMutation();
  const likePost = trpc.community.like.useMutation();
  const reportPost = trpc.community.report.useMutation();
  const blockUser = trpc.community.blockUser.useMutation();
  const setConsent = trpc.profile.setConsent.useMutation();
  const [content, setContent] = useState("");
  const [realm, setRealm] = useState<"botany" | "aquarium" | "terrarium" | "none">("none");
  const [image, setImage] = useState<File | null>(null);
  const [imageAspect, setImageAspect] = useState<"original" | "9:16" | "4:5" | "1:1" | "16:9">("original");
  const [video, setVideo] = useState<File | null>(null);
  const [allowMedia, setAllowMedia] = useState(false);
  const [publishNow, setPublishNow] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(() => typeof window !== "undefined" && window.location.search.includes("compose=1"));
  const composeRef = useRef<HTMLFormElement | null>(null);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editVisibility, setEditVisibility] = useState<"private" | "public">("private");
  const [editRealm, setEditRealm] = useState<"botany" | "aquarium" | "terrarium" | "none">("none");
  const [feedRealm, setFeedRealm] = useState<"all" | "botany" | "aquarium" | "terrarium">("all");
  const consentMap = useMemo(() => new Map(consents.data?.map(item => [item.purpose, item.granted]) ?? []), [consents.data]);
  const visiblePosts = feed.data?.filter(post => feedRealm === "all" || post.realm === feedRealm) ?? [];
  const activeFilterLabel = feedRealm === "all" ? "Alle Bereiche" : feedRealm === "botany" ? "Botanik" : feedRealm === "aquarium" ? "Aquaristik" : "Terraristik";

  useEffect(() => {
    if (!composeOpen) return;
    const frame = window.requestAnimationFrame(() => composeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    return () => window.cancelAnimationFrame(frame);
  }, [composeOpen]);

  if (!auth.isAuthenticated) return <div className="observatory-route observatory-route--botany observatory-community-page"><StatePanel code="COMMUNITY/AUTH_REQUIRED" state="locked" title="COMMUNITY IST GESCHÜTZT" body="Der Feed, einzelne Beiträge, Kommentare und Live-Diskussionen sind nur für angemeldete, aktive Konten sichtbar." action={<button type="button" className="primary-action" onClick={startLogin}>SICHER ANMELDEN</button>} /></div>;

  const openComposer = () => {
    if (!auth.isAuthenticated) { startLogin(); return; }
    setComposeOpen(true);
  };

  const submitPost = async (event: FormEvent) => {
    event.preventDefault(); setStatus(null);
    try {
      if ((image || video) && !consentMap.get("media_processing") && !allowMedia) throw new Error("media_processing_consent_required");
      if (publishNow && !consentMap.get("community_publishing")) await setConsent.mutateAsync({ purpose: "community_publishing", granted: true, policyVersion: COMMUNITY_POLICY_VERSION });
      if ((image || video) && !consentMap.get("media_processing") && allowMedia) await setConsent.mutateAsync({ purpose: "media_processing", granted: true, policyVersion: COMMUNITY_POLICY_VERSION });
      const draft = await createDraft.mutateAsync({ content: content.trim(), realm: realm === "none" ? null : realm });
      const postId = Number(draft.id);
      if (image) await uploadDraftImage.mutateAsync({ postId, ...await readImageAsBase64(image, { aspectRatio: imageAspect }) });
      if (video) await uploadDraftVideo.mutateAsync({ postId, ...await readVideoAsBase64(video) });
      if (publishNow) await publishPost.mutateAsync({ postId });
      setContent(""); setRealm("none"); setImage(null); setImageAspect("original"); setVideo(null); setAllowMedia(false); setPublishNow(false); setComposeOpen(false);
      await Promise.all([utils.community.feed.invalidate(), utils.profile.consents.invalidate()]);
      setStatus(publishNow ? locale === "de" ? "Beitrag öffentlich veröffentlicht." : "Post published publicly." : locale === "de" ? "Privater Entwurf gespeichert." : "Private draft saved.");
    } catch (error) { setStatus(imageErrorMessage(error, locale)); }
  };
  const like = async (postId: string) => { if (!auth.isAuthenticated) { startLogin(); return; } try { await likePost.mutateAsync({ postId: Number(postId) }); await utils.community.feed.invalidate(); } catch (error) { setStatus(imageErrorMessage(error, locale)); } };
  const beginEdit = (post: { id: number; content: string; visibility: string; realm: string | null }) => { setEditingPostId(post.id); setEditContent(post.content); setEditVisibility(post.visibility === "public" ? "public" : "private"); setEditRealm(post.realm === "botany" || post.realm === "aquarium" || post.realm === "terrarium" ? post.realm : "none"); };
  const saveEdit = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingPostId) return;
    try {
      await updatePost.mutateAsync({ postId: editingPostId, content: editContent, visibility: editVisibility, realm: editRealm === "none" ? null : editRealm });
      setEditingPostId(null);
      setStatus(locale === "de" ? "Beitrag aktualisiert." : "Post updated.");
      await Promise.all([utils.community.feed.invalidate()]);
    } catch (error) { setStatus(imageErrorMessage(error, locale)); }
  };

  return (
    <div className="observatory-route observatory-route--botany observatory-community-page">
      <ObservatoryContextHeader
        tone="botany"
        eyebrow="COMMUNITY · ÖFFENTLICHER FACHFEED"
        title={locale === "de" ? "ECHTE NATURMOMENTE." : "REAL NATURE MOMENTS."}
        subtitle={locale === "de" ? "Veröffentlichte Beobachtungen, Pflegeerfahrungen und fachliche Fragen von aktiven Konten." : "Published observations, care experiences and expert questions from active accounts."}
        icon={UsersRound}
        badge="MODERIERT"
        children={<><Link href="/live" className="secondary-action"><UsersRound size={15} />LIVE-HUB</Link><button type="button" className="secondary-action community-refresh" disabled={feed.isFetching} onClick={() => void feed.refetch()}><RefreshCw size={15} />{feed.isFetching ? "AKTUALISIERT …" : "AKTUALISIEREN"}</button><button type="button" className="primary-action" onClick={openComposer}><Send size={15} />BEITRAG ERSTELLEN</button></>}
      />
      <section className="community-feed-command observatory-data-panel" aria-label="Community Feed steuern">
        <div className="community-feed-command__heading"><div><span className="eyebrow">ÖFFENTLICHER FEED</span><h2>{activeFilterLabel.toUpperCase()}</h2><p>{locale === "de" ? "Nur veröffentlichte Beiträge aktiver Konten. Private Entwürfe und blockierte Konten bleiben ausgeschlossen." : "Only published posts from active accounts. Private drafts and blocked accounts are excluded."}</p></div><span className={`community-feed-command__state ${feed.isFetching ? "is-refreshing" : feed.isError ? "is-error" : ""}`}><ShieldCheck size={15} />{feed.isFetching ? "WIRD AKTUALISIERT" : feed.isError ? "NICHT VERFÜGBAR" : "QUELLENBASIERT"}</span></div>
        <div className="community-feed-filters" aria-label="Community-Bereiche">{[["all", "Feed"], ["botany", "Botanik"], ["aquarium", "Aquaristik"], ["terrarium", "Terraristik"]].map(([value, label]) => <button key={value} type="button" className={feedRealm === value ? "is-selected" : ""} aria-pressed={feedRealm === value} onClick={() => setFeedRealm(value as typeof feedRealm)}>{label}</button>)}</div>
      </section>
      {feed.isLoading ? <StatePanel code="FEED/CONNECT" state="loading" title={t("common.loading")} body={t("home.truth.body")} /> : feed.isError ? <StatePanel code="FEED/ERROR" state="error" title={t("common.error")} body={locale === "de" ? "Der Feed konnte nicht geladen werden. Es werden keine Ersatzbeiträge angezeigt." : "The feed could not be loaded. No replacement posts are shown."} action={<button type="button" className="secondary-action" onClick={() => void feed.refetch()}>ERNEUT VERSUCHEN</button>} /> : !visiblePosts.length ? <section className="observatory-community-empty"><span className="eyebrow">FEED / EMPTY</span><h2>{feed.data?.length ? "Keine Beiträge in diesem Bereich" : t("community.emptyTitle")}</h2><p>{feed.data?.length ? "Wähle einen anderen Bereich oder erstelle deinen ersten passenden Beitrag." : t("community.emptyBody")}</p>{!auth.isAuthenticated ? <button type="button" className="primary-action" onClick={startLogin}>{t("common.signIn")}</button> : <button type="button" className="primary-action" onClick={openComposer}><Send size={16} />{locale === "de" ? "BEITRAG ERSTELLEN" : "CREATE POST"}</button>}</section> : <div className="community-feed">{visiblePosts.map(post => {
          const isOwner = Boolean(auth.user?.id && String(auth.user.id) === String(post.author.id));
          return <CommunityPostCard key={post.id} post={post} isOwner={isOwner} locale={locale} onLike={() => void like(post.id)} onReport={() => { if (window.confirm("Diesen Beitrag zur Prüfung melden?")) void reportPost.mutateAsync({ postId: Number(post.id), reason: "other" }).then(() => setStatus("Meldung zur Prüfung gespeichert.")).catch(error => setStatus(imageErrorMessage(error, locale))); }} onBlock={() => { if (window.confirm("Dieses Konto aus deinem Feed ausblenden?")) void blockUser.mutateAsync({ userId: Number(post.author.id) }).then(() => utils.community.feed.invalidate()).catch(error => setStatus(imageErrorMessage(error, locale))); }} onEdit={() => beginEdit({ id: Number(post.id), content: post.content, visibility: post.visibility, realm: post.realm })} onDelete={() => { if (window.confirm("Diesen eigenen Beitrag wirklich löschen?")) void deletePost.mutateAsync({ postId: Number(post.id) }).then(() => Promise.all([utils.community.feed.invalidate()])).catch(error => setStatus(imageErrorMessage(error, locale))); }} />;
        })}</div>}
      {editingPostId ? <form className="community-edit community-edit--focused" onSubmit={saveEdit}><div className="form-heading"><div><span className="eyebrow">BEITRAG BEARBEITEN</span><h2>ÄNDERUNG SPEICHERN</h2></div><button type="button" className="secondary-action" onClick={() => setEditingPostId(null)}>ABBRECHEN</button></div><textarea required minLength={1} maxLength={10000} rows={4} value={editContent} onChange={event => setEditContent(event.target.value)} /><div className="form-grid"><label className="field"><span>Bereich</span><select value={editRealm} onChange={event => setEditRealm(event.target.value as typeof editRealm)}><option value="none">—</option><option value="botany">Botanik</option><option value="aquarium">Aquaristik</option><option value="terrarium">Terraristik</option></select></label><label className="field"><span>Sichtbarkeit</span><select value={editVisibility} onChange={event => setEditVisibility(event.target.value as typeof editVisibility)}><option value="private">Privat</option><option value="public">Öffentlich</option></select></label></div><button type="submit" className="primary-action" disabled={updatePost.isPending}><SaveIcon />{updatePost.isPending ? t("common.loading") : "ÄNDERUNG SPEICHERN"}</button></form> : null}
      {auth.isAuthenticated && composeOpen ? <form ref={composeRef} id="community-compose" className="community-compose observatory-form-panel" onSubmit={submitPost}><div className="form-heading"><div><span className="eyebrow">[PRIVATE_DRAFT]</span><h2>{locale === "de" ? "NATURMOMENT ERFASSEN" : "CAPTURE A NATURE MOMENT"}</h2></div><button type="button" className="secondary-action" onClick={() => setComposeOpen(false)}>SCHLIESSEN</button></div><label className="field"><span>{locale === "de" ? "Dein echter Naturmoment" : "Your real nature moment"}</span><textarea required minLength={1} maxLength={10000} rows={5} value={content} onChange={event => setContent(event.target.value)} /></label><div className="form-grid"><label className="field"><span>{locale === "de" ? "Bereich – optional" : "Realm – optional"}</span><select value={realm} onChange={event => setRealm(event.target.value as typeof realm)}><option value="none">—</option><option value="botany">Botanik</option><option value="aquarium">Aquaristik</option><option value="terrarium">Terraristik</option></select></label><label className="file-field"><Camera size={17} /><span>{image ? image.name : locale === "de" ? "Bild optional auswählen" : "Choose optional image"}</span><input type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" onChange={event => { setImage(event.target.files?.[0] ?? null); setImageAspect("original"); setVideo(null); }} /></label><label className="file-field"><Video size={17} /><span>{video ? video.name : locale === "de" ? "Video optional auswählen" : "Choose optional video"}</span><input type="file" accept="video/mp4,video/webm,.mp4,.webm" onChange={event => { setVideo(event.target.files?.[0] ?? null); setImage(null); }} /></label></div>{image ? <><p className="upload-hint">{locale === "de" ? "JPG, PNG oder WebP bis 24 MB. Vor dem Upload wird das Bild verlustarm vorbereitet." : "JPG, PNG, or WebP up to 24 MB. The image is prepared at high quality before upload."}</p><div className="media-aspect-editor" aria-label="Bildformat wählen"><span className="upload-hint">FORMAT / KACHEL</span>{(["original", "9:16", "4:5", "1:1", "16:9"] as const).map(aspect => <button type="button" key={aspect} className={imageAspect === aspect ? "media-aspect-option is-active" : "media-aspect-option"} onClick={() => setImageAspect(aspect)}>{aspect === "original" ? "Original" : aspect}</button>)}</div></> : video ? <p className="upload-hint">{locale === "de" ? "MP4 oder WebM bis 16 MB. Das Video wird nicht automatisch veröffentlicht." : "MP4 or WebM up to 16 MB. The video is not published automatically."}</p> : null}{(image || video) && !consentMap.get("media_processing") ? <label className="consent-toggle"><span>{locale === "de" ? "Ich erlaube die sichere Verarbeitung dieses Mediums." : "I allow secure processing of this media."}</span><input type="checkbox" checked={allowMedia} onChange={event => setAllowMedia(event.target.checked)} /></label> : null}<label className="consent-toggle publish-toggle"><span>{locale === "de" ? "Diesen Entwurf ausdrücklich öffentlich veröffentlichen" : "Explicitly publish this draft"}</span><input type="checkbox" checked={publishNow} onChange={event => setPublishNow(event.target.checked)} /></label><button className="primary-action" type="submit" disabled={createDraft.isPending || publishPost.isPending || uploadDraftImage.isPending || uploadDraftVideo.isPending}><Send size={16} />{createDraft.isPending ? t("common.loading") : locale === "de" ? "SICHER SPEICHERN" : "SAVE SECURELY"}</button>{status ? <p className="form-status" role="status">{status}</p> : null}</form> : status ? <p className="form-status" role="status">{status}</p> : null}
    </div>
  );
}
