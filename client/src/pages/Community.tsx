import { useAuth } from "@/_core/hooks/useAuth";
import { ObservatoryContextHeader } from "@/components/ObservatoryPrimitives";
import { StatePanel } from "@/components/StatePanel";
import { startLogin } from "@/const";
import { useI18n } from "@/i18n";
import { estimateImageBytes, imageErrorMessage, readImageAsBase64, readVideoAsBase64 } from "@/lib/files";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Camera, Flag, Heart, Loader2, MessageCircle, Pencil, RefreshCw, Save as SaveIcon, Send, ShieldCheck, Trash2, UserPlus, UserRoundCheck, UsersRound, Video, X, ZoomIn, ZoomOut } from "lucide-react";
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

type CommunityUploadProgress = {
  percent: number;
  label: string;
  detail: string;
  phase: "draft" | "processing" | "transfer" | "publishing" | "complete";
};

function CommunityUploadProgressCard({ progress, locale }: { progress: CommunityUploadProgress; locale: string }) {
  const stages = locale === "de"
    ? [["draft", "Entwurf"], ["processing", "Bild aufbereiten"], ["transfer", "Sicher übertragen"], ["publishing", "Veröffentlichen"]] as const
    : [["draft", "Draft"], ["processing", "Prepare image"], ["transfer", "Secure transfer"], ["publishing", "Publish"]] as const;
  const activeStage = stages.findIndex(([phase]) => phase === progress.phase);
  return <section className={`upload-progress upload-progress--${progress.phase}`} role="status" aria-live="polite" aria-label={locale === "de" ? "Fortschritt des Bilduploads" : "Image upload progress"}>
    <div className="upload-progress__heading"><Loader2 size={18} className="action-spinner" aria-hidden="true" /><div><strong>{progress.label}</strong><small>{progress.detail}</small></div><b>{progress.percent}%</b></div>
    <div className="upload-progress__track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.percent} aria-valuetext={`${progress.label}: ${progress.percent}%`}><span style={{ width: `${progress.percent}%` }} /></div>
    <ol className="upload-progress__steps">{stages.map(([phase, label], index) => <li key={phase} className={index < activeStage || progress.phase === "complete" ? "is-complete" : index === activeStage ? "is-active" : ""}>{index < activeStage || progress.phase === "complete" ? <ShieldCheck size={13} /> : <i />}{label}</li>)}</ol>
  </section>;
}

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
  const [zoomedImage, setZoomedImage] = useState<{ url: string; alt: string } | null>(null);
  const [zoom, setZoom] = useState(1);
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
    <div className="post-author"><Link href={`/member/${post.author.id}`} className="post-author-profile">{post.author.avatarUrl ? <img src={post.author.avatarUrl} alt="" /> : <span>{(post.author.name ?? post.author.username ?? "?").slice(0, 1).toUpperCase()}</span>}<div><strong>{post.author.name ?? post.author.username ?? (locale === "de" ? "Verifiziertes Konto" : "Verified account")}</strong><small>{new Date(post.createdAt).toLocaleString(locale)}</small><span className="observatory-post-meta">{post.realm ? post.realm.toUpperCase() : "COMMUNITY"} · {post.visibility === "public" ? "ÖFFENTLICH" : post.visibility === "unlisted" ? "UNGELISTET" : "PRIVAT"}</span></div></Link>{isOwner ? <div className="community-post-owner-actions" aria-label="Eigene Beitragsaktionen"><button type="button" className="icon-button" title="Beitrag bearbeiten" aria-label="Beitrag bearbeiten" onClick={onEdit}><Pencil size={17} /></button><button type="button" className="icon-button icon-button--danger" title="Beitrag löschen" aria-label="Beitrag löschen" onClick={onDelete}><Trash2 size={17} /></button></div> : null}</div>
    <Link href={`/community/post/${post.id}`} className="community-post-content-link"><p>{post.content}</p></Link><div className="community-media-stack">{post.media.map(media => media.mimeType.startsWith("video/") ? <video key={media.id} className="post-media" style={mediaRatios[media.id] ? { aspectRatio: mediaRatios[media.id] } : undefined} src={media.accessUrl} controls preload="metadata" playsInline aria-label={locale === "de" ? "Community-Video" : "Community video"} onLoadedMetadata={event => { const element = event.currentTarget; if (element.videoWidth && element.videoHeight) setMediaRatios(current => ({ ...current, [media.id]: element.videoWidth / element.videoHeight })); }} /> : <button key={media.id} type="button" className="community-image-button" aria-label={locale === "de" ? "Bild vergrößern" : "Open image zoom"} onClick={() => { setZoom(1); setZoomedImage({ url: media.accessUrl, alt: locale === "de" ? "Community-Beitragsbild" : "Community post image" }); }}><img className="post-media" style={mediaRatios[media.id] ? { aspectRatio: mediaRatios[media.id] } : undefined} src={media.accessUrl} alt={locale === "de" ? "Community-Beitragsbild" : "Community post image"} loading="lazy" onLoad={event => { const element = event.currentTarget; if (element.naturalWidth && element.naturalHeight) setMediaRatios(current => ({ ...current, [media.id]: element.naturalWidth / element.naturalHeight })); }} /><ZoomIn size={16} aria-hidden="true" /></button>)}</div>{post.media.length > 1 ? <div className="media-scroll-hint" aria-hidden="true"><span />{locale === "de" ? "WEITERE MEDIEN · WISCHEN / SCROLLEN" : "MORE MEDIA · SWIPE / SCROLL"}<span /></div> : null}{zoomedImage ? <div className="media-lightbox" role="dialog" aria-modal="true" aria-label={zoomedImage.alt} onClick={() => setZoomedImage(null)}><button type="button" className="media-lightbox__close" aria-label={locale === "de" ? "Zoom schließen" : "Close zoom"} onClick={() => setZoomedImage(null)}><X size={18} /></button><div className="media-lightbox__tools" onClick={event => event.stopPropagation()}><button type="button" onClick={() => setZoom(value => Math.max(1, value - .25))} aria-label="Verkleinern"><ZoomOut size={17} /></button><strong>{Math.round(zoom * 100)}%</strong><button type="button" onClick={() => setZoom(value => Math.min(3, value + .25))} aria-label="Vergrößern"><ZoomIn size={17} /></button></div><img src={zoomedImage.url} alt={zoomedImage.alt} style={{ transform: `scale(${zoom})` }} onClick={event => event.stopPropagation()} /></div> : null}
    <div className="post-metrics"><button type="button" onClick={onLike}><Heart size={15} /> {post.likesCount}</button><Link className="community-post-discussion-link" href={`/community/post/${post.id}`}><MessageCircle size={15} /> {post.commentsCount} DISKUSSION <ArrowRight size={14} /></Link><button type="button" onClick={() => { void navigator.clipboard?.writeText(window.location.origin + `/community/post/${post.id}`).then(() => setCommentStatus("Beitragslink kopiert.")).catch(() => setCommentStatus("Beitragslink konnte nicht kopiert werden.")); }}><SaveIcon size={15} /> LINK KOPIEREN</button>{!isOwner ? <><button type="button" title="Beitrag melden" aria-label="Beitrag melden" onClick={onReport}><Flag size={15} /> MELDEN</button></> : null}</div>
    {commentsOpen ? <section className="community-comments" aria-label="Kommentare"><div className="community-comments__heading"><strong>Kommentare</strong><span>{comments.isLoading ? "Laden…" : comments.data?.length ?? 0}</span></div>{comments.isError ? <p className="form-status" role="alert">Kommentare konnten nicht geladen werden.</p> : null}{comments.data?.map(comment => { const ownsComment = Boolean(auth.user?.id && String(auth.user.id) === String(comment.authorId)); const editing = editingCommentId === comment.id; return <div key={comment.id} className={`community-comment ${comment.parentId ? "is-reply" : ""}`}><div><strong>{comment.authorName ?? comment.authorUsername ?? "Konto"}</strong><small>{new Date(comment.createdAt).toLocaleString(locale)}</small></div>{editing ? <><textarea aria-label="Kommentar bearbeiten" maxLength={2000} rows={2} value={editingCommentContent} onChange={event => setEditingCommentContent(event.target.value)} /><div className="community-comment-actions"><button type="button" className="comment-reply" disabled={updateComment.isPending} onClick={() => saveComment(comment.id)}>{updateComment.isPending ? "SPEICHERT …" : "SPEICHERN"}</button><button type="button" className="comment-reply" onClick={() => { setEditingCommentId(null); setEditingCommentContent(""); }}>ABBRECHEN</button></div></> : <p>{comment.content}</p>}{!comment.parentId ? <button type="button" className="comment-reply" onClick={() => setReplyTo(comment.id)}>ANTWORTEN</button> : null}{ownsComment && !editing ? <div className="community-comment-actions"><button type="button" className="icon-button" title="Kommentar bearbeiten" aria-label="Kommentar bearbeiten" onClick={() => { setEditingCommentId(comment.id); setEditingCommentContent(comment.content); }}><Pencil size={14} /></button><button type="button" className="icon-button icon-button--danger" title="Kommentar löschen" aria-label="Kommentar löschen" disabled={deleteComment.isPending} onClick={() => { if (window.confirm("Diesen eigenen Kommentar wirklich löschen?")) deleteComment.mutate({ commentId: comment.id }); }}><Trash2 size={14} /></button></div> : null}</div>; })}{commentStatus ? <p className="form-status" role="status">{commentStatus}</p> : null}<form className="community-comment-form" onSubmit={submitComment}>{replyTo ? <button type="button" className="comment-reply" onClick={() => setReplyTo(null)}>ANTWORT AUFHEBEN</button> : null}<textarea required maxLength={2000} rows={2} value={commentText} onChange={event => setCommentText(event.target.value)} placeholder={auth.isAuthenticated ? "Kommentar schreiben…" : "Zum Kommentieren anmelden"} /><button type="submit" className="primary-action" disabled={addComment.isPending}><Send size={15} />{addComment.isPending ? "WIRD GESENDET…" : "KOMMENTIEREN"}</button></form></section> : null}
  </article>;
}

export default function Community() {
  const auth = useAuth();
  const { locale, t } = useI18n();
  const utils = trpc.useUtils();
  const feed = trpc.community.feed.useQuery({ limit: 20 }, { enabled: auth.isAuthenticated, retry: false });
  const adminProfile = trpc.social.adminProfile.useQuery(undefined, { retry: false });
  const consents = trpc.profile.consents.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const createDraft = trpc.community.createDraft.useMutation();
  const uploadDraftImage = trpc.community.uploadDraftImage.useMutation();
  const uploadDraftVideo = trpc.community.uploadDraftVideo.useMutation();
  const publishPost = trpc.community.publish.useMutation();
  const broadcast = trpc.admin.broadcast.useMutation();
  const updatePost = trpc.community.updateMine.useMutation();
  const deletePost = trpc.community.deleteMine.useMutation();
  const likePost = trpc.community.like.useMutation();
  const reportPost = trpc.community.report.useMutation();
  const blockUser = trpc.community.blockUser.useMutation();
  const followAdmin = trpc.social.follow.useMutation({ onSuccess: () => void adminProfile.refetch() });
  const unfollowAdmin = trpc.social.unfollow.useMutation({ onSuccess: () => void adminProfile.refetch() });
  const setConsent = trpc.profile.setConsent.useMutation();
  const [content, setContent] = useState("");
  const [realm, setRealm] = useState<"botany" | "aquarium" | "terrarium" | "none">("none");
  const [image, setImage] = useState<File | null>(null);
  const [imageAspect, setImageAspect] = useState<"original" | "9:16" | "4:5" | "1:1" | "16:9">("original");
  const [imageQuality, setImageQuality] = useState(92);
  const [estimatedImageBytes, setEstimatedImageBytes] = useState<number | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [allowMedia, setAllowMedia] = useState(false);
  const [publishNow, setPublishNow] = useState(false);
  const [adminAllFeeds, setAdminAllFeeds] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<CommunityUploadProgress | null>(null);
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
  const isAdmin = auth.user?.role === "admin";
  // Text-only admin notices use the dedicated broadcast endpoint. Admin media
  // posts use the normal upload pipeline, but are published publicly to every
  // feed after the upload instead of becoming private drafts.
  const isBroadcast = isAdmin && !image && !video;
  const adminPublicPost = isAdmin && (adminAllFeeds || realm !== "none");
  const selectedAdminTarget = adminAllFeeds || (isBroadcast && realm === "none") ? "all" : realm;
  const targetLabel = adminAllFeeds ? "alle Feeds" : realm === "botany" ? "Botanik-Feed" : realm === "aquarium" ? "Aquaristik-Feed" : realm === "terrarium" ? "Terraristik-Feed" : "einen gewählten Fachfeed";

  useEffect(() => {
    if (!image) { setEstimatedImageBytes(null); return; }
    let active = true;
    void estimateImageBytes(image, { aspectRatio: imageAspect, quality: imageQuality / 100 }).then(bytes => { if (active) setEstimatedImageBytes(bytes); }).catch(() => { if (active) setEstimatedImageBytes(null); });
    return () => { active = false; };
  }, [image, imageAspect, imageQuality]);

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

  const pulseTransferProgress = (start: number, ceiling = 86) => {
    let percent = start;
    const handle = window.setInterval(() => {
      percent = Math.min(ceiling, percent + (percent < 76 ? 2 : 1));
      setUploadProgress(current => current?.phase === "transfer" ? { ...current, percent } : current);
    }, 700);
    return () => window.clearInterval(handle);
  };

  const submitPost = async (event: FormEvent) => {
    event.preventDefault(); setStatus(null);
    let stopTransferPulse: (() => void) | null = null;
    try {
      if (isAdmin && (image || video) && !adminAllFeeds && realm === "none") { setStatus("Bitte zuerst einen Fachfeed oder ALLE FEEDS · ADMIN auswählen."); return; }
      if (isBroadcast) {
        await broadcast.mutateAsync({ content: content.trim(), realm: realm === "none" ? null : realm });
        setContent(""); setRealm("none"); setComposeOpen(false);
        setStatus(realm === "none" ? "Admin-Information an alle Feeds gesendet." : `Admin-Information an den ${realm === "botany" ? "Botanik" : realm === "aquarium" ? "Aquaristik" : "Terraristik"}-Feed gesendet.`);
        await utils.community.feed.invalidate();
        return;
      }
      if ((image || video) && !consentMap.get("media_processing") && !allowMedia) throw new Error("media_processing_consent_required");
      if ((publishNow || adminPublicPost) && !consentMap.get("community_publishing")) await setConsent.mutateAsync({ purpose: "community_publishing", granted: true, policyVersion: COMMUNITY_POLICY_VERSION });
      if ((image || video) && !consentMap.get("media_processing") && allowMedia) await setConsent.mutateAsync({ purpose: "media_processing", granted: true, policyVersion: COMMUNITY_POLICY_VERSION });
      const isLargeImage = Boolean(image && image.size >= 5 * 1024 * 1024);
      setUploadProgress({ percent: 8, phase: "draft", label: "ENTWURF WIRD VORBEREITET", detail: image || video ? "Sichere Upload-Reihenfolge wird angelegt." : "Beitrag wird sicher gespeichert." });
      const draft = await createDraft.mutateAsync({ content: content.trim(), realm: adminAllFeeds ? null : realm === "none" ? null : realm });
      const postId = Number(draft.id);
      let imageXpAwarded = 0;
      if (image) {
        setUploadProgress({ percent: 28, phase: "processing", label: "BILD WIRD FÜR DEN UPLOAD AUFBEREITET", detail: isLargeImage ? "Großes Bild erkannt – Qualität und Format werden jetzt sicher optimiert." : "Format und Qualität werden für den sicheren Transport geprüft." });
        const preparedImage = await readImageAsBase64(image, { aspectRatio: imageAspect, quality: imageQuality / 100 });
        setUploadProgress({ percent: 62, phase: "transfer", label: "BILD WIRD SICHER HOCHGELADEN", detail: isLargeImage ? "Große Bilder können je nach Verbindung etwas länger übertragen werden. Bitte diese Seite geöffnet lassen." : "Verschlüsselte Übertragung an den geschützten Medienserver läuft." });
        stopTransferPulse = pulseTransferProgress(62);
        const uploadedImage = await uploadDraftImage.mutateAsync({ postId, ...preparedImage });
        stopTransferPulse(); stopTransferPulse = null;
        imageXpAwarded = uploadedImage.xpAwarded;
      }
      if (video) {
        setUploadProgress({ percent: 62, phase: "transfer", label: "VIDEO WIRD SICHER HOCHGELADEN", detail: "Verschlüsselte Übertragung an den geschützten Medienserver läuft." });
        stopTransferPulse = pulseTransferProgress(62);
        await uploadDraftVideo.mutateAsync({ postId, ...await readVideoAsBase64(video) });
        stopTransferPulse(); stopTransferPulse = null;
      }
      if (publishNow || adminPublicPost) { setUploadProgress({ percent: 90, phase: "publishing", label: "BEITRAG WIRD VERÖFFENTLICHT", detail: "Sichtbarkeit und gewählter Ziel-Feed werden abschließend gesetzt." }); await publishPost.mutateAsync({ postId }); }
      setUploadProgress({ percent: 100, phase: "complete", label: "UPLOAD ABGESCHLOSSEN", detail: "Bild und Beitrag wurden sicher gespeichert." });
      setContent(""); setRealm("none"); setAdminAllFeeds(false); setUploadProgress(null); setImage(null); setImageAspect("original"); setImageQuality(92); setEstimatedImageBytes(null); setVideo(null); setAllowMedia(false); setPublishNow(false); setComposeOpen(false);
      await Promise.all([utils.community.feed.invalidate(), utils.profile.consents.invalidate()]);
      setStatus(publishNow || adminPublicPost ? locale === "de" ? `${adminPublicPost ? `Admin-Beitrag an ${targetLabel} gesendet` : "Beitrag öffentlich veröffentlicht"}${imageXpAwarded ? ` · +${imageXpAwarded} XP für dein Naturbild` : ""}.` : `${adminPublicPost ? `Admin post sent to ${targetLabel}` : "Post published publicly"}${imageXpAwarded ? ` · +${imageXpAwarded} XP for your nature image` : ""}.` : locale === "de" ? `Privater Entwurf sicher hochgeladen${imageXpAwarded ? ` · +${imageXpAwarded} XP für dein Naturbild` : ""}.` : `Private draft uploaded securely${imageXpAwarded ? ` · +${imageXpAwarded} XP for your nature image` : ""}.`);
    } catch (error) { stopTransferPulse?.(); setUploadProgress(null); setStatus(imageErrorMessage(error, locale)); }
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
        subtitle={locale === "de" ? "Feed · Pflege · Fachfragen" : "Feed · Care · Expert questions"}
        icon={UsersRound}
        badge="MODERIERT"
        children={<><Link href="/live" className="secondary-action"><UsersRound size={15} />LIVE-HUB</Link>{adminProfile.data ? <button type="button" className={adminProfile.data.isFollowing ? "secondary-action community-subscribe-button is-following" : "primary-action community-subscribe-button"} disabled={followAdmin.isPending || unfollowAdmin.isPending} onClick={() => { if (!auth.isAuthenticated) { startLogin(); return; } (adminProfile.data?.isFollowing ? unfollowAdmin : followAdmin).mutate({ id: Number(adminProfile.data?.id) }); }}>{followAdmin.isPending || unfollowAdmin.isPending ? <Loader2 size={15} className="action-spinner" /> : adminProfile.data.isFollowing ? <UserRoundCheck size={15} /> : <UserPlus size={15} />}{adminProfile.data.isFollowing ? "ABONNIERT" : "BLACKWATERLEAF ABONNIEREN"}<small>{adminProfile.data.followers} Follower</small></button> : null}<button type="button" className="secondary-action community-refresh" disabled={feed.isFetching} onClick={() => void feed.refetch()}><RefreshCw size={15} />{feed.isFetching ? "AKTUALISIERT …" : "AKTUALISIEREN"}</button><button type="button" className="primary-action" onClick={openComposer}><Send size={15} />BEITRAG ERSTELLEN</button></>}
      />
      <section className="community-feed-command observatory-data-panel" aria-label="Community Feed steuern">
        <div className="community-feed-command__heading"><div><span className="eyebrow">ÖFFENTLICHER FEED</span><h2>{activeFilterLabel.toUpperCase()}</h2><p>{locale === "de" ? "Aktive · veröffentlichte Beiträge" : "Active · published posts"}</p></div><span className={`community-feed-command__state ${feed.isFetching ? "is-refreshing" : feed.isError ? "is-error" : ""}`}><ShieldCheck size={15} />{feed.isFetching ? "WIRD AKTUALISIERT" : feed.isError ? "NICHT VERFÜGBAR" : "QUELLENBASIERT"}</span></div>
        <div className="community-feed-filters" aria-label="Community-Bereiche">{[["all", "Feed"], ["botany", "Botanik"], ["aquarium", "Aquaristik"], ["terrarium", "Terraristik"]].map(([value, label]) => <button key={value} type="button" className={feedRealm === value ? "is-selected" : ""} aria-pressed={feedRealm === value} onClick={() => setFeedRealm(value as typeof feedRealm)}>{label}</button>)}</div>
      </section>
      {feed.isLoading ? <StatePanel code="FEED/CONNECT" state="loading" title={t("common.loading")} body={t("home.truth.body")} /> : feed.isError ? <StatePanel code="FEED/ERROR" state="error" title={t("common.error")} body={locale === "de" ? "Der Feed konnte nicht geladen werden. Es werden keine Ersatzbeiträge angezeigt." : "The feed could not be loaded. No replacement posts are shown."} action={<button type="button" className="secondary-action" onClick={() => void feed.refetch()}>ERNEUT VERSUCHEN</button>} /> : !visiblePosts.length ? <section className="observatory-community-empty"><span className="eyebrow">FEED / EMPTY</span><h2>{feed.data?.length ? "Keine Beiträge in diesem Bereich" : t("community.emptyTitle")}</h2><p>{feed.data?.length ? "Wähle einen anderen Bereich oder erstelle deinen ersten passenden Beitrag." : t("community.emptyBody")}</p>{!auth.isAuthenticated ? <button type="button" className="primary-action" onClick={startLogin}>{t("common.signIn")}</button> : <button type="button" className="primary-action" onClick={openComposer}><Send size={16} />{locale === "de" ? "BEITRAG ERSTELLEN" : "CREATE POST"}</button>}</section> : <div className="community-feed">{visiblePosts.map(post => {
          const isOwner = Boolean(auth.user?.id && String(auth.user.id) === String(post.author.id));
          return <CommunityPostCard key={post.id} post={post} isOwner={isOwner} locale={locale} onLike={() => void like(post.id)} onReport={() => { if (window.confirm("Diesen Beitrag zur Prüfung melden?")) void reportPost.mutateAsync({ postId: Number(post.id), reason: "other" }).then(() => setStatus("Meldung zur Prüfung gespeichert.")).catch(error => setStatus(imageErrorMessage(error, locale))); }} onBlock={() => { if (window.confirm("Dieses Konto aus deinem Feed ausblenden?")) void blockUser.mutateAsync({ userId: Number(post.author.id) }).then(() => utils.community.feed.invalidate()).catch(error => setStatus(imageErrorMessage(error, locale))); }} onEdit={() => beginEdit({ id: Number(post.id), content: post.content, visibility: post.visibility, realm: post.realm })} onDelete={() => { if (window.confirm("Diesen eigenen Beitrag wirklich löschen?")) void deletePost.mutateAsync({ postId: Number(post.id) }).then(() => Promise.all([utils.community.feed.invalidate()])).catch(error => setStatus(imageErrorMessage(error, locale))); }} />;
        })}</div>}
      {editingPostId ? <form className="community-edit community-edit--focused" onSubmit={saveEdit}><div className="form-heading"><div><span className="eyebrow">BEITRAG BEARBEITEN</span><h2>ÄNDERUNG SPEICHERN</h2></div><button type="button" className="secondary-action" onClick={() => setEditingPostId(null)}>ABBRECHEN</button></div><textarea required minLength={1} maxLength={10000} rows={4} value={editContent} onChange={event => setEditContent(event.target.value)} /><div className="form-grid"><label className="field"><span>Bereich</span><select value={editRealm} onChange={event => setEditRealm(event.target.value as typeof editRealm)}><option value="none">Alle Bereiche</option><option value="botany">Botanik</option><option value="aquarium">Aquaristik</option><option value="terrarium">Terraristik</option></select></label><label className="field"><span>Sichtbarkeit</span><select value={editVisibility} onChange={event => setEditVisibility(event.target.value as typeof editVisibility)}><option value="private">Privat</option><option value="public">Öffentlich</option></select></label></div><button type="submit" className="primary-action" disabled={updatePost.isPending}><SaveIcon />{updatePost.isPending ? t("common.loading") : "ÄNDERUNG SPEICHERN"}</button></form> : null}
      {auth.isAuthenticated && composeOpen ? <form ref={composeRef} id="community-compose" className="community-compose observatory-form-panel" onSubmit={submitPost}><div className="form-heading"><div><span className="eyebrow">{isBroadcast ? "[ADMIN_FEED_BROADCAST]" : "[PRIVATE_DRAFT]"}</span><h2>{isBroadcast ? "FEED-INFORMATION SENDEN" : locale === "de" ? "NATURMOMENT ERFASSEN" : "CAPTURE A NATURE MOMENT"}</h2></div><button type="button" className="secondary-action" onClick={() => setComposeOpen(false)}>SCHLIESSEN</button></div><label className="field"><span>{isBroadcast ? "Information für den Feed" : locale === "de" ? "Dein echter Naturmoment" : "Your real nature moment"}</span><textarea required minLength={1} maxLength={10000} rows={5} value={content} onChange={event => setContent(event.target.value)} /></label><div className="form-grid"><label className="field community-upload-target"><span>{isAdmin ? "Upload-Ziel" : locale === "de" ? "Bereich – optional" : "Realm – optional"}</span><select value={isAdmin ? selectedAdminTarget : realm} onChange={event => { const value = event.target.value; if (value === "all") { setAdminAllFeeds(true); setRealm("none"); } else { setAdminAllFeeds(false); setRealm(value as typeof realm); } }}>{isAdmin ? <option value="none">Fachfeed auswählen …</option> : <option value="none">Alle Bereiche</option>}<option value="botany">Nur Botanik-Feed</option><option value="aquarium">Nur Aquaristik-Feed</option><option value="terrarium">Nur Terraristik-Feed</option>{isAdmin ? <option value="all">ALLE FEEDS · ADMIN</option> : null}</select>{isAdmin ? <small className="community-upload-target__hint">{adminAllFeeds ? "Admin-Veröffentlichung an alle Feeds." : realm === "none" ? "Bei Medien muss ein Fachfeed oder ALLE FEEDS gewählt werden." : `Nur ${targetLabel}.`}</small> : null}</label><><label className="file-field"><Camera size={17} /><span>{image ? image.name : locale === "de" ? "Bild optional auswählen" : "Choose optional image"}</span><input type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" onChange={event => { setImage(event.target.files?.[0] ?? null); setImageAspect("original"); setImageQuality(92); setVideo(null); }} /></label><label className="file-field"><Video size={17} /><span>{video ? video.name : locale === "de" ? "Video optional auswählen" : "Choose optional video"}</span><input type="file" accept="video/mp4,video/webm,.mp4,.webm" onChange={event => { setVideo(event.target.files?.[0] ?? null); setImage(null); }} /></label></></div>{image ? <><div className="media-aspect-editor" aria-label="Bildformat wählen"><span className="upload-hint">FORMAT / KACHEL</span>{(["original", "9:16", "4:5", "1:1", "16:9"] as const).map(aspect => <button type="button" key={aspect} className={imageAspect === aspect ? "media-aspect-option is-active" : "media-aspect-option"} onClick={() => setImageAspect(aspect)}>{aspect === "original" ? "Original" : aspect}</button>)}</div><label className="media-quality-control"><span>QUALITÄT <strong>{imageQuality}%</strong></span><input type="range" min="50" max="100" step="1" value={imageQuality} onChange={event => setImageQuality(Number(event.target.value))} aria-label="Bildqualität" /><small>{estimatedImageBytes === null ? "Größe wird berechnet …" : `Voraussichtlich ${Math.max(1, estimatedImageBytes / 1024 / 1024).toFixed(2)} MB · Original ${Math.max(1, image.size / 1024 / 1024).toFixed(2)} MB`}</small></label></> : null}{(image || video) && !consentMap.get("media_processing") ? <label className="consent-toggle"><span>{locale === "de" ? "Ich erlaube die sichere Verarbeitung dieses Mediums." : "I allow secure processing of this media."}</span><input type="checkbox" checked={allowMedia} onChange={event => setAllowMedia(event.target.checked)} /></label> : null}{!isBroadcast && !isAdmin ? <label className="consent-toggle publish-toggle"><span>{locale === "de" ? "Diesen Entwurf ausdrücklich öffentlich veröffentlichen" : "Explicitly publish this draft"}</span><input type="checkbox" checked={publishNow} onChange={event => setPublishNow(event.target.checked)} /></label> : null}{isAdmin && !isBroadcast ? <p className="form-status" role="status">ADMIN: Dieser Beitrag wird nach dem sicheren Upload automatisch öffentlich an {adminAllFeeds ? "alle Feeds" : realm === "none" ? "den ausgewählten Fachfeed" : targetLabel} veröffentlicht.</p> : null}{uploadProgress ? <CommunityUploadProgressCard progress={uploadProgress} locale={locale} /> : null}<button className="primary-action" type="submit" disabled={broadcast.isPending || createDraft.isPending || publishPost.isPending || uploadDraftImage.isPending || uploadDraftVideo.isPending || (isAdmin && !isBroadcast && !adminAllFeeds && realm === "none")}><Send size={16} />{broadcast.isPending ? "WIRD GESENDET …" : isBroadcast ? "FEED-INFORMATION SENDEN" : isAdmin ? adminAllFeeds ? "AN ALLE FEEDS SENDEN" : "AN GEWÄHLTEN FEED SENDEN" : createDraft.isPending ? t("common.loading") : locale === "de" ? "SICHER HOCHLADEN" : "UPLOAD SECURELY"}</button>{status ? <p className="form-status" role="status">{status}</p> : null}</form> : status ? <p className="form-status" role="status">{status}</p> : null}
    </div>
  );
}
