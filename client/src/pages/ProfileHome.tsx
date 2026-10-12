import { ObservatoryStateSurface } from "@/components/ObservatoryPrimitives";
import { StatePanel } from "@/components/StatePanel";
import { useAuth } from "@/_core/hooks/useAuth";
import { useI18n } from "@/i18n";
import { trpc } from "@/lib/trpc";
import { Camera, ChevronRight, Fish, Gift, Leaf, Link2, LogIn, Mail, Settings, Trophy, UserRound, Box } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

const habitatChoices = [
  { key: "plant", label: "Botanik", note: "Pflanzen-Anlagen", icon: Leaf, className: "profile-habitat-card--plant" },
  { key: "aquarium", label: "Aquaristik", note: "Aquarien & Wasserwerte", icon: Fish, className: "profile-habitat-card--aquarium" },
  { key: "terrarium", label: "Terraristik", note: "Terrarien & Pflege", icon: Box, className: "profile-habitat-card--terrarium" },
] as const;

export default function ProfileHome() {
  const auth = useAuth();
  const { locale, t } = useI18n();
  const profile = trpc.profile.me.useQuery(undefined, { enabled: auth.isAuthenticated, retry: false });
  const ownUserId = Number(auth.user?.id);
  const publicPosts = trpc.profile.publicPosts.useQuery({ userId: ownUserId, limit: 12 }, { enabled: auth.isAuthenticated && Number.isSafeInteger(ownUserId) && ownUserId > 0, retry: false });
  const experience = trpc.gamification.summary.useQuery(undefined, { enabled: auth.isAuthenticated });
  const habitats = trpc.habitats.mine.useQuery(undefined, { enabled: auth.isAuthenticated });
  const promoStatus = trpc.promoCodes.status.useQuery(undefined, { enabled: auth.isAuthenticated });
  const redemptions = trpc.promoCodes.myRedemptions.useQuery(undefined, { enabled: auth.isAuthenticated });
  const utils = trpc.useUtils();
  const redeem = trpc.promoCodes.redeem.useMutation({ onSuccess: () => { void promoStatus.refetch(); void redemptions.refetch(); void utils.billing.me.invalidate(); void utils.gamification.summary.invalidate(); } });
  const [promoCode, setPromoCode] = useState("");
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  if (auth.loading) return <div className="observatory-route observatory-route--botany"><StatePanel code="PROFILE/AUTH_LOAD" state="loading" title={t("common.loading")} body="Dein geschützter Profilbereich wird geprüft …" /></div>;
  if (!auth.isAuthenticated) return <div className="observatory-route observatory-route--botany profile-auth-landing"><ObservatoryStateSurface tone="botany" code="PROFILE/AUTH" title="DEIN BEREICH WARTET AUF DICH" body="Melde dich sicher an, um dein Profil, eigene Beiträge und private Anlagen zu sehen." action={<Link className="primary-action" href="/login"><LogIn size={16} />SICHER ANMELDEN</Link>} /></div>;
  if (profile.isLoading) return <div className="observatory-route observatory-route--botany"><StatePanel code="PROFILE/LOAD" state="loading" title={t("common.loading")} body="Profil wird geladen …" /></div>;
  if (profile.isError || !profile.data) return <div className="observatory-route observatory-route--botany"><StatePanel code="PROFILE/ERROR" state="error" title={t("common.error")} body="Profil konnte nicht geladen werden." /></div>;

  const habitatCount = habitats.isError ? "—" : habitats.data?.length ?? 0;
  const name = profile.data.name ?? profile.data.username ?? "Name nicht hinterlegt";
  const xp = experience.isError ? "—" : experience.data?.status === "ready" ? experience.data.totalXp : "…";
  const level = experience.isError ? "—" : experience.data?.status === "ready" ? experience.data.level : "…";
  const links = Object.entries(profile.data.socialLinks).filter(([, value]) => Boolean(value)) as Array<[string, string]>;

  return <div className="observatory-route observatory-route--botany profile-observatory-page profile-creator-page">
    <section className="profile-creator-card observatory-data-panel">
      <div className="profile-creator-card__top">
        <div className="profile-creator-avatar">{profile.data.avatarUrl ? <img src={profile.data.avatarUrl} alt={`${name} Profilbild`} /> : <UserRound size={38} />}</div>
        <div className="profile-creator-identity"><span className="eyebrow">BLACKWATERLEAF · PROFIL</span><h1>{name}</h1><p className="profile-creator-handle">{profile.data.username ? `@${profile.data.username}` : "Persönliches Fachprofil"}</p></div>
        <Link className="secondary-action profile-creator-manage" href="/profile/manage"><Settings size={15} />VERWALTEN</Link>
      </div>
      <p className="profile-creator-bio">{profile.data.bio ?? "Dein Fachprofil für Pflanzen, Aquaristik und verantwortungsvolle Beobachtungen."}</p>
      <div className="profile-creator-contact">{profile.data.email ? <a href={`mailto:${profile.data.email}`}><Mail size={14} />{profile.data.email}</a> : null}{links.map(([label, value]) => <a key={label} href={value} target="_blank" rel="noreferrer"><Link2 size={14} />{label}</a>)}</div>
      <div className="profile-creator-stats"><Link href="/ranking"><Trophy size={16} /><strong>{xp}</strong><small>XP</small></Link><Link href="/ranking"><strong>{level}</strong><small>LEVEL</small></Link><Link href="/profile/habitats"><strong>{habitatCount}</strong><small>ANLAGEN</small></Link></div>
    </section>
    <section className="profile-promo-card observatory-data-panel" aria-labelledby="profile-promo-title"><div className="observatory-data-panel__heading"><div><span className="eyebrow">BLACKWATERLEAF · VORTEILSCODE</span><h2 id="profile-promo-title"><Gift size={17} />PREMIUM AKTIVIEREN</h2></div><span className="system-chip">{promoStatus.data?.active ? "PRO AKTIV" : "CODE EINLÖSEN"}</span></div><p>{promoStatus.data?.active && promoStatus.data.expiresAt ? `Pro ist bis ${new Date(promoStatus.data.expiresAt).toLocaleDateString(locale === "de" ? "de-DE" : "en-US")} aktiv.` : "Hast du einen BlackWaterLeaf-Code? Aktiviere damit Pro-Zeit und einen möglichen Punktebonus."}</p><form className="profile-promo-form" onSubmit={event => { event.preventDefault(); setPromoMessage(null); void redeem.mutateAsync({ code: promoCode }).then(result => { setPromoCode(""); setPromoMessage(`Code eingelöst: ${result.premiumDays} Tage Pro${result.bonusPoints ? ` und +${result.bonusPoints} XP` : ""}.`); }).catch(error => setPromoMessage(error instanceof Error ? error.message : "Code konnte nicht eingelöst werden.")); }}><input aria-label="BlackWaterLeaf Vorteilscode" placeholder="BWL-XXXX-XXXX-XXXX" value={promoCode} onChange={event => setPromoCode(event.target.value.toUpperCase())} maxLength={24} autoComplete="off" required /><button className="primary-action" type="submit" disabled={redeem.isPending}>{redeem.isPending ? "WIRD GEPRÜFT …" : "CODE EINLÖSEN"}</button></form>{promoMessage ? <p className="form-status" role="status">{promoMessage}</p> : null}{redemptions.data?.length ? <div className="profile-promo-history"><span className="eyebrow">EINLÖSUNGEN</span>{redemptions.data.slice(0, 3).map(item => <small key={item.id}>{item.label} · {item.premiumDays} Tage Pro{item.bonusPoints ? ` · +${item.bonusPoints} XP` : ""}</small>)}</div> : null}</section>
    {habitats.isError || experience.isError ? <StatePanel code="PROFILE/PARTIAL_ERROR" state="error" title="TEILDATEN NICHT VERFÜGBAR" body="Anlagen oder Fortschritt konnten nicht vollständig geladen werden." action={<button type="button" className="secondary-action" onClick={() => { void habitats.refetch(); void experience.refetch(); }}>ERNEUT VERSUCHEN</button>} /> : null}
    <section className="profile-observatory-habitats observatory-data-panel"><div className="observatory-data-panel__heading"><span className="eyebrow">PRIVATE SAMMLUNG</span><Link className="section-link" href="/profile/habitats">ALLE ANLAGEN<ChevronRight size={14} /></Link></div><div className="profile-habitat-choice-grid">{habitatChoices.map(({ key, label, note, icon: Icon, className }) => <Link key={key} href={`/profile/habitats?kind=${key}`} className={`profile-habitat-card ${className}`}><Icon size={20} /><span><strong>{label}</strong><small>{note}</small></span><ChevronRight size={16} /></Link>)}</div></section>
    {/* Public profile media intentionally replaces the old compact publicPosts.data.slice(0, 4) excerpt; private drafts never enter this grid. */}
    <section className="profile-observatory-posts observatory-data-panel"><div className="observatory-data-panel__heading"><span className="eyebrow">BEITRÄGE & BILDER · FREIGEGEBENE BEITRÄGE</span><Link className="secondary-action" href="/community?compose=1"><Camera size={14} />POST</Link></div>{publicPosts.isLoading ? <p className="observatory-inline-state">Beiträge werden geladen …</p> : publicPosts.isError ? <p className="observatory-inline-state">Beiträge sind derzeit nicht erreichbar.</p> : publicPosts.data?.length ? <div className="profile-creator-post-grid">{publicPosts.data.slice(0, 9).map(post => { const media = post.media?.find(item => item.url); return <Link key={post.id} href={`/community?post=${post.id}`} className="profile-creator-post-tile">{media?.url && media.mimeType.startsWith("image/") ? <img src={media.url} alt={post.content.slice(0, 90)} /> : <span className="profile-creator-post-tile__fallback"><Camera size={22} /><b>{post.content.slice(0, 80)}</b></span>}<span>{post.realm?.toUpperCase() ?? "COMMUNITY"}</span></Link>; })}</div> : <p className="observatory-inline-state">Noch keine öffentlichen Beiträge freigegeben.</p>}</section>
    <Link className="profile-creator-manage profile-creator-manage--bottom" href="/profile/manage"><Settings size={16} />ALLE EINSTELLUNGEN & WERKZEUGE<ChevronRight size={16} /></Link>
  </div>;
}
