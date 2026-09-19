import { useAuth } from "@/_core/hooks/useAuth";
import { LiveSensorStrip } from "@/components/LiveSensorStrip";
import { ReferenceActionGrid, ReferenceEmptyState, ReferenceHero } from "@/components/ReferenceOverlay";
import { StatePanel } from "@/components/StatePanel";
import { startLogin } from "@/const";
import { useI18n } from "@/i18n";
import { readImageAsBase64 } from "@/lib/files";
import { REFERENCE_ASSETS, WORLD_ASSETS } from "@/lib/worlds";
import { trpc } from "@/lib/trpc";
import { Camera, Eye, Heart, MessageCircle, Send, Share2, UsersRound } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";

const COMMUNITY_POLICY_VERSION = "community-2026-09-16-v1";

export default function Community() {
  const auth = useAuth();
  const { locale, t } = useI18n();
  const utils = trpc.useUtils();
  const feed = trpc.community.feed.useQuery({ limit: 20 }, { retry: false });
  const consents = trpc.profile.consents.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const createDraft = trpc.community.createDraft.useMutation();
  const uploadDraftImage = trpc.community.uploadDraftImage.useMutation();
  const publishPost = trpc.community.publish.useMutation();
  const likePost = trpc.community.like.useMutation();
  const setConsent = trpc.profile.setConsent.useMutation();
  const [content, setContent] = useState("");
  const [realm, setRealm] = useState<"botany" | "aquarium" | "terrarium" | "none">("none");
  const [image, setImage] = useState<File | null>(null);
  const [allowMedia, setAllowMedia] = useState(false);
  const [publishNow, setPublishNow] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(() => typeof window !== "undefined" && window.location.search.includes("compose=1"));
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
    } catch (error) { setStatus(error instanceof Error ? error.message : "community_save_failed"); }
  };
  const like = async (postId: string) => {
    if (!auth.isAuthenticated) { startLogin(); return; }
    setStatus(null);
    try {
      await likePost.mutateAsync({ postId: Number(postId) });
      await utils.community.feed.invalidate();
    } catch (error) {
      setStatus(error instanceof Error && error.message ? error.message : locale === "de" ? "Der Like konnte nicht gespeichert werden." : "The like could not be saved.");
    }
  };

  return (
    <div className="reference-page reference-page--botany">
      <LiveSensorStrip compact />
      <ReferenceHero tone="botany" image={REFERENCE_ASSETS.botany} eyebrow="GEMEINSAM WACHSEN" title={t("community.title")} subtitle={locale === "de" ? "Echte Naturmomente von echten Konten." : "Real nature moments from real accounts."} icon={UsersRound} badge="BLACKWATERLEAF" />
      <ReferenceActionGrid tone="botany" heading="COMMUNITY" actions={[
        { title: "Beobachten", note: "Moment sicher festhalten", icon: Eye, image: WORLD_ASSETS.botany, href: "/flow/foto" },
        { title: "Teilen", note: auth.isAuthenticated ? "Editor öffnen" : "Anmeldung erforderlich", icon: Share2, image: WORLD_ASSETS.terrarium, onActivate: auth.isAuthenticated ? () => setComposeOpen(true) : startLogin },
      ]} />
      {feed.isLoading ? <StatePanel code="FEED/CONNECT" state="loading" title={t("common.loading")} body={t("home.truth.body")} /> : feed.isError ? <StatePanel code="FEED/ERROR" state="error" title={t("common.error")} body={locale === "de" ? "Der Feed konnte nicht geladen werden. Es werden keine Ersatzbeiträge angezeigt." : "The feed could not be loaded. No replacement posts are shown."} /> : !feed.data?.length ? <ReferenceEmptyState tone="botany" code="FEED / EMPTY" title={t("community.emptyTitle")} body={t("community.emptyBody")} action={!auth.isAuthenticated ? <button type="button" className="primary-action" onClick={startLogin}>{t("common.signIn")}</button> : <button type="button" className="primary-action" onClick={() => setComposeOpen(true)}><Send size={16} />{locale === "de" ? "BEITRAG ERSTELLEN" : "CREATE POST"}</button>} /> : <div className="community-feed">{feed.data.map(post => <article key={post.id} className="community-post glass-panel"><div className="post-author">{post.author.avatarUrl ? <img src={post.author.avatarUrl} alt="" /> : <span>{(post.author.name ?? post.author.username ?? "?").slice(0, 1).toUpperCase()}</span>}<div><strong>{post.author.name ?? post.author.username ?? (locale === "de" ? "Verifiziertes Konto" : "Verified account")}</strong><small>{new Date(post.createdAt).toLocaleString(locale)}</small></div></div><p>{post.content}</p>{post.media.map(media => <img key={media.id} className="post-media" src={media.accessUrl} alt="" />)}<div className="post-metrics"><button type="button" onClick={() => void like(post.id)} disabled={likePost.isPending}><Heart size={15} /> {post.likesCount}</button><span><MessageCircle size={15} /> {post.commentsCount}</span></div></article>)}</div>}
      {auth.isAuthenticated && composeOpen ? <form className="community-compose glass-panel reference-after-actions" onSubmit={submitPost}><div className="form-heading"><div><span className="eyebrow">[PRIVATE_DRAFT]</span><h2>{locale === "de" ? "NATURMOMENT ERFASSEN" : "CAPTURE A NATURE MOMENT"}</h2></div><button type="button" className="secondary-action" onClick={() => setComposeOpen(false)}>SCHLIESSEN</button></div><label className="field"><span>{locale === "de" ? "Dein echter Naturmoment" : "Your real nature moment"}</span><textarea required minLength={1} maxLength={10000} rows={5} value={content} onChange={event => setContent(event.target.value)} /></label><div className="form-grid"><label className="field"><span>{locale === "de" ? "Bereich – optional" : "Realm – optional"}</span><select value={realm} onChange={event => setRealm(event.target.value as typeof realm)}><option value="none">—</option><option value="botany">Botanik</option><option value="aquarium">Aquaristik</option><option value="terrarium">Terraristik</option></select></label><label className="file-field"><Camera size={17} /><span>{image ? image.name : locale === "de" ? "Bild optional auswählen" : "Choose optional image"}</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => setImage(event.target.files?.[0] ?? null)} /></label></div>{image && !consentMap.get("media_processing") ? <label className="consent-toggle"><span>{locale === "de" ? "Ich erlaube die sichere Verarbeitung dieses Bildes." : "I allow secure processing of this image."}</span><input type="checkbox" checked={allowMedia} onChange={event => setAllowMedia(event.target.checked)} /></label> : null}<label className="consent-toggle publish-toggle"><span>{locale === "de" ? "Diesen Entwurf ausdrücklich öffentlich veröffentlichen" : "Explicitly publish this draft"}</span><input type="checkbox" checked={publishNow} onChange={event => setPublishNow(event.target.checked)} /></label><button className="primary-action" type="submit" disabled={createDraft.isPending || publishPost.isPending || uploadDraftImage.isPending}><Send size={16} />{createDraft.isPending ? t("common.loading") : locale === "de" ? "SICHER SPEICHERN" : "SAVE SECURELY"}</button>{status ? <p className="form-status" role="status">{status}</p> : null}</form> : status ? <p className="form-status" role="status">{status}</p> : null}
    </div>
  );
}
