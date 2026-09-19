import { useAuth } from "@/_core/hooks/useAuth";
import { ReferenceEmptyState, ReferenceHero } from "@/components/ReferenceOverlay";
import { StatePanel } from "@/components/StatePanel";
import { startLogin } from "@/const";
import { useI18n } from "@/i18n";
import { imageErrorMessage, readImageAsBase64 } from "@/lib/files";
import { REFERENCE_ASSETS, WORLD_ASSETS } from "@/lib/worlds";
import { trpc } from "@/lib/trpc";
import { Camera, Heart, MessageCircle, Pencil, Save as SaveIcon, Send, Trash2, UsersRound } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";

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
  media: Array<{ id: string; accessUrl: string }>;
};

function CommunityPostCard({ post, isOwner, locale, onLike, onEdit, onDelete }: { post: CommunityPostCardData; isOwner: boolean; locale: string; onLike: () => void; onEdit: () => void; onDelete: () => void }) {
  const auth = useAuth();
  const utils = trpc.useUtils();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const comments = trpc.community.comments.useQuery({ postId: Number(post.id) }, { enabled: commentsOpen, retry: false });
  const addComment = trpc.community.addComment.useMutation({ onSuccess: async () => { setCommentText(""); setReplyTo(null); await Promise.all([utils.community.comments.invalidate({ postId: Number(post.id) }), utils.community.feed.invalidate()]); } });

  const submitComment = async (event: FormEvent) => {
    event.preventDefault();
    if (!auth.isAuthenticated) { startLogin(); return; }
    const value = commentText.trim();
    if (!value) return;
    await addComment.mutateAsync({ postId: Number(post.id), parentId: replyTo, content: value });
  };

  return <article className="community-post glass-panel">
    <div className="post-author">{post.author.avatarUrl ? <img src={post.author.avatarUrl} alt="" /> : <span>{(post.author.name ?? post.author.username ?? "?").slice(0, 1).toUpperCase()}</span>}<div><strong>{post.author.name ?? post.author.username ?? (locale === "de" ? "Verifiziertes Konto" : "Verified account")}</strong><small>{new Date(post.createdAt).toLocaleString(locale)}</small></div>{isOwner ? <div className="community-post-owner-actions" aria-label="Eigene Beitragsaktionen"><button type="button" className="icon-button" title="Beitrag bearbeiten" aria-label="Beitrag bearbeiten" onClick={onEdit}><Pencil size={17} /></button><button type="button" className="icon-button icon-button--danger" title="Beitrag löschen" aria-label="Beitrag löschen" onClick={onDelete}><Trash2 size={17} /></button></div> : null}</div>
    <p>{post.content}</p>{post.media.map(media => <img key={media.id} className="post-media" src={media.accessUrl} alt="" />)}
    <div className="post-metrics"><button type="button" onClick={onLike}><Heart size={15} /> {post.likesCount}</button><button type="button" onClick={() => setCommentsOpen(value => !value)}><MessageCircle size={15} /> {post.commentsCount}</button><button type="button" onClick={() => navigator.clipboard?.writeText(window.location.origin + `/community?post=${post.id}`)}><SaveIcon size={15} /> MERKEN</button></div>
    {commentsOpen ? <section className="community-comments" aria-label="Kommentare"><div className="community-comments__heading"><strong>Kommentare</strong><span>{comments.isLoading ? "Laden…" : comments.data?.length ?? 0}</span></div>{comments.isError ? <p className="form-status">Kommentare konnten nicht geladen werden.</p> : null}{comments.data?.map(comment => <div key={comment.id} className={`community-comment ${comment.parentId ? "is-reply" : ""}`}><div><strong>{comment.authorName ?? comment.authorUsername ?? "Konto"}</strong><small>{new Date(comment.createdAt).toLocaleString(locale)}</small></div><p>{comment.content}</p>{!comment.parentId ? <button type="button" className="comment-reply" onClick={() => setReplyTo(comment.id)}>ANTWORTEN</button> : null}</div>)}<form className="community-comment-form" onSubmit={submitComment}>{replyTo ? <button type="button" className="comment-reply" onClick={() => setReplyTo(null)}>ANTWORT AUFHEBEN</button> : null}<textarea required maxLength={2000} rows={2} value={commentText} onChange={event => setCommentText(event.target.value)} placeholder={auth.isAuthenticated ? "Kommentar schreiben…" : "Zum Kommentieren anmelden"} /><button type="submit" className="primary-action" disabled={addComment.isPending}><Send size={15} />{addComment.isPending ? "WIRD GESENDET…" : "KOMMENTIEREN"}</button></form></section> : null}
  </article>;
}

export default function Community() {
  const auth = useAuth();
  const { locale, t } = useI18n();
  const utils = trpc.useUtils();
  const feed = trpc.community.feed.useQuery({ limit: 20 }, { retry: false });
  const myPosts = trpc.community.myPosts.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const consents = trpc.profile.consents.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const createDraft = trpc.community.createDraft.useMutation();
  const uploadDraftImage = trpc.community.uploadDraftImage.useMutation();
  const publishPost = trpc.community.publish.useMutation();
  const updatePost = trpc.community.updateMine.useMutation();
  const deletePost = trpc.community.deleteMine.useMutation();
  const likePost = trpc.community.like.useMutation();
  const setConsent = trpc.profile.setConsent.useMutation();
  const [content, setContent] = useState("");
  const [realm, setRealm] = useState<"botany" | "aquarium" | "terrarium" | "none">("none");
  const [image, setImage] = useState<File | null>(null);
  const [allowMedia, setAllowMedia] = useState(false);
  const [publishNow, setPublishNow] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(() => typeof window !== "undefined" && window.location.search.includes("compose=1"));
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editVisibility, setEditVisibility] = useState<"private" | "public">("private");
  const [editRealm, setEditRealm] = useState<"botany" | "aquarium" | "terrarium" | "none">("none");
  const [feedRealm, setFeedRealm] = useState<"all" | "botany" | "aquarium" | "terrarium">("all");
  const consentMap = useMemo(() => new Map(consents.data?.map(item => [item.purpose, item.granted]) ?? []), [consents.data]);

  const submitPost = async (event: FormEvent) => {
    event.preventDefault(); setStatus(null);
    try {
      if (image && !consentMap.get("media_processing") && !allowMedia) throw new Error("media_processing_consent_required");
      if (publishNow && !consentMap.get("community_publishing")) await setConsent.mutateAsync({ purpose: "community_publishing", granted: true, policyVersion: COMMUNITY_POLICY_VERSION });
      if (image && !consentMap.get("media_processing") && allowMedia) await setConsent.mutateAsync({ purpose: "media_processing", granted: true, policyVersion: COMMUNITY_POLICY_VERSION });
      const draft = await createDraft.mutateAsync({ content: content.trim(), realm: realm === "none" ? null : realm });
      const postId = Number(draft.id);
      if (image) await uploadDraftImage.mutateAsync({ postId, ...await readImageAsBase64(image) });
      if (publishNow) await publishPost.mutateAsync({ postId });
      setContent(""); setRealm("none"); setImage(null); setAllowMedia(false); setPublishNow(false); setComposeOpen(false);
      await Promise.all([utils.community.feed.invalidate(), utils.community.myPosts.invalidate(), utils.profile.consents.invalidate()]);
      setStatus(publishNow ? locale === "de" ? "Beitrag öffentlich veröffentlicht." : "Post published publicly." : locale === "de" ? "Privater Entwurf gespeichert." : "Private draft saved.");
    } catch (error) { setStatus(imageErrorMessage(error, locale)); }
  };
  const like = async (postId: string) => { if (!auth.isAuthenticated) { startLogin(); return; } await likePost.mutateAsync({ postId: Number(postId) }); await utils.community.feed.invalidate(); };
  const beginEdit = (post: { id: number; content: string; visibility: string; realm: string | null }) => { setEditingPostId(post.id); setEditContent(post.content); setEditVisibility(post.visibility === "public" ? "public" : "private"); setEditRealm(post.realm === "botany" || post.realm === "aquarium" || post.realm === "terrarium" ? post.realm : "none"); };
  const saveEdit = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingPostId) return;
    try {
      await updatePost.mutateAsync({ postId: editingPostId, content: editContent, visibility: editVisibility, realm: editRealm === "none" ? null : editRealm });
      setEditingPostId(null);
      setStatus(locale === "de" ? "Beitrag aktualisiert." : "Post updated.");
      await Promise.all([utils.community.feed.invalidate(), utils.community.myPosts.invalidate()]);
    } catch (error) { setStatus(imageErrorMessage(error, locale)); }
  };

  return (
    <div className="reference-page reference-page--botany reference-page--community">
      <ReferenceHero tone="botany" image={REFERENCE_ASSETS.botany} eyebrow="GEMEINSAM WACHSEN" title={t("community.title")} subtitle={locale === "de" ? "Echte Naturmomente von echten Konten." : "Real nature moments from real accounts."} icon={UsersRound} badge="BLACKWATERLEAF" />
      <div className="community-feed-filters" aria-label="Community-Bereiche">{[["all", "Feed"], ["botany", "Botanik"], ["aquarium", "Aquaristik"], ["terrarium", "Terraristik"]].map(([value, label]) => <button key={value} type="button" className={feedRealm === value ? "is-selected" : ""} onClick={() => setFeedRealm(value as typeof feedRealm)}>{label}</button>)}<button type="button" className="community-feed-compose" onClick={() => auth.isAuthenticated ? setComposeOpen(true) : startLogin}><Send size={14} />Beitrag erstellen</button></div>
      {feed.isLoading ? <StatePanel code="FEED/CONNECT" state="loading" title={t("common.loading")} body={t("home.truth.body")} /> : feed.isError ? <StatePanel code="FEED/ERROR" state="error" title={t("common.error")} body={locale === "de" ? "Der Feed konnte nicht geladen werden. Es werden keine Ersatzbeiträge angezeigt." : "The feed could not be loaded. No replacement posts are shown."} /> : !feed.data?.length ? <ReferenceEmptyState tone="botany" code="FEED / EMPTY" title={t("community.emptyTitle")} body={t("community.emptyBody")} action={!auth.isAuthenticated ? <button type="button" className="primary-action" onClick={startLogin}>{t("common.signIn")}</button> : <button type="button" className="primary-action" onClick={() => setComposeOpen(true)}><Send size={16} />{locale === "de" ? "BEITRAG ERSTELLEN" : "CREATE POST"}</button>} /> : <div className="community-feed">{feed.data.filter(post => feedRealm === "all" || post.realm === feedRealm).map(post => {
          const isOwner = Boolean(auth.user?.id && String(auth.user.id) === String(post.author.id));
          return <CommunityPostCard key={post.id} post={post} isOwner={isOwner} locale={locale} onLike={() => void like(post.id)} onEdit={() => beginEdit({ id: Number(post.id), content: post.content, visibility: post.visibility, realm: post.realm })} onDelete={() => { if (window.confirm("Diesen eigenen Beitrag wirklich löschen?")) void deletePost.mutateAsync({ postId: Number(post.id) }).then(() => Promise.all([utils.community.feed.invalidate(), utils.community.myPosts.invalidate()])); }} />;
        })}</div>}
      {auth.isAuthenticated && myPosts.data?.length ? <section className="community-own-posts glass-panel"><div className="form-heading"><div><span className="eyebrow">[PRIVATE / PUBLIC]</span><h2>{locale === "de" ? "MEINE BEITRÄGE" : "MY POSTS"}</h2></div></div>{myPosts.data.map(post => editingPostId === post.id ? <form key={post.id} className="community-edit" onSubmit={saveEdit}><textarea required minLength={1} maxLength={10000} rows={4} value={editContent} onChange={event => setEditContent(event.target.value)} /><div className="form-grid"><label className="field"><span>Bereich</span><select value={editRealm} onChange={event => setEditRealm(event.target.value as typeof editRealm)}><option value="none">—</option><option value="botany">Botanik</option><option value="aquarium">Aquaristik</option><option value="terrarium">Terraristik</option></select></label><label className="field"><span>Sichtbarkeit</span><select value={editVisibility} onChange={event => setEditVisibility(event.target.value as typeof editVisibility)}><option value="private">Privat</option><option value="public">Öffentlich</option></select></label></div><div className="account-actions"><button type="submit" className="primary-action" disabled={updatePost.isPending}><SaveIcon />{updatePost.isPending ? t("common.loading") : "ÄNDERUNG SPEICHERN"}</button><button type="button" className="secondary-action" onClick={() => setEditingPostId(null)}>ABBRECHEN</button></div></form> : <article className="community-own-post"><div><strong>{post.visibility === "public" ? "ÖFFENTLICH" : "PRIVAT"} · {post.realm ?? "ohne Bereich"}</strong><p>{post.content}</p><small>{new Date(post.updatedAt).toLocaleString(locale)}</small></div><button type="button" className="secondary-action" onClick={() => beginEdit(post)}><Pencil size={15} />BEARBEITEN</button><button type="button" className="danger-action" disabled={deletePost.isPending} onClick={() => { if (window.confirm("Diesen eigenen Beitrag wirklich löschen?")) void deletePost.mutateAsync({ postId: post.id }).then(() => Promise.all([utils.community.feed.invalidate(), utils.community.myPosts.invalidate()])); }}><Trash2 size={15} />LÖSCHEN</button></article>)}</section> : null}
      {auth.isAuthenticated && composeOpen ? <form id="community-compose" className="community-compose glass-panel reference-after-actions" onSubmit={submitPost}><div className="form-heading"><div><span className="eyebrow">[PRIVATE_DRAFT]</span><h2>{locale === "de" ? "NATURMOMENT ERFASSEN" : "CAPTURE A NATURE MOMENT"}</h2></div><button type="button" className="secondary-action" onClick={() => setComposeOpen(false)}>SCHLIESSEN</button></div><label className="field"><span>{locale === "de" ? "Dein echter Naturmoment" : "Your real nature moment"}</span><textarea required minLength={1} maxLength={10000} rows={5} value={content} onChange={event => setContent(event.target.value)} /></label><div className="form-grid"><label className="field"><span>{locale === "de" ? "Bereich – optional" : "Realm – optional"}</span><select value={realm} onChange={event => setRealm(event.target.value as typeof realm)}><option value="none">—</option><option value="botany">Botanik</option><option value="aquarium">Aquaristik</option><option value="terrarium">Terraristik</option></select></label><label className="file-field"><Camera size={17} /><span>{image ? image.name : locale === "de" ? "Bild optional auswählen" : "Choose optional image"}</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => setImage(event.target.files?.[0] ?? null)} /></label></div>{image && !consentMap.get("media_processing") ? <label className="consent-toggle"><span>{locale === "de" ? "Ich erlaube die sichere Verarbeitung dieses Bildes." : "I allow secure processing of this image."}</span><input type="checkbox" checked={allowMedia} onChange={event => setAllowMedia(event.target.checked)} /></label> : null}<label className="consent-toggle publish-toggle"><span>{locale === "de" ? "Diesen Entwurf ausdrücklich öffentlich veröffentlichen" : "Explicitly publish this draft"}</span><input type="checkbox" checked={publishNow} onChange={event => setPublishNow(event.target.checked)} /></label><button className="primary-action" type="submit" disabled={createDraft.isPending || publishPost.isPending || uploadDraftImage.isPending}><Send size={16} />{createDraft.isPending ? t("common.loading") : locale === "de" ? "SICHER SPEICHERN" : "SAVE SECURELY"}</button>{status ? <p className="form-status" role="status">{status}</p> : null}</form> : status ? <p className="form-status" role="status">{status}</p> : null}
    </div>
  );
}
