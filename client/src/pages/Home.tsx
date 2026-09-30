import { ObservatoryContextHeader } from "@/components/ObservatoryPrimitives";
import { StatePanel } from "@/components/StatePanel";
import { useAuth } from "@/_core/hooks/useAuth";
import { useI18n } from "@/i18n";
import { publicPartnerCardPresentation } from "@/lib/partnerPresentation";
import { trpc } from "@/lib/trpc";
import { HOME_SEO_TITLES } from "@/lib/seo";
import { WORLD_ASSETS } from "@/lib/worlds";
import { ArrowRight, Fish, Leaf, Play, RadioTower, Sparkles, Sprout, UsersRound } from "lucide-react";
import { useEffect } from "react";
import { Link } from "wouter";

const portals = [
  { href: "/botanik", label: "Botanik", note: "Wasserpflanzen & Wissen", image: WORLD_ASSETS.botany, icon: Leaf, tone: "botany" },
  { href: "/aquaristik", label: "Aquaristik", note: "Fische & Wirbellose", image: WORLD_ASSETS.aquarium, icon: Fish, tone: "aquarium" },
  { href: "/terraristik", label: "Terraristik", note: "Terrarien & Lebensräume", image: WORLD_ASSETS.terrarium, icon: Sprout, tone: "terrarium" },
] as const;

export default function Home() {
  const auth = useAuth();
  const { t, locale } = useI18n();
  const pageTitle = HOME_SEO_TITLES[locale] ?? HOME_SEO_TITLES.en!;
  const platform = trpc.platform.availability.useQuery(undefined, { retry: false });
  const community = trpc.community.publicPreview.useQuery({ limit: 3 }, { retry: false, staleTime: 60_000 });
  const partners = trpc.partners.homepage.useQuery(undefined, { retry: false });

  useEffect(() => { document.title = pageTitle; }, [pageTitle]);

  return <div className="observatory-route observatory-route--botany home-observatory-page">
    <ObservatoryContextHeader
      tone="botany"
      image={WORLD_ASSETS.botany}
      eyebrow={locale === "de" ? "DAS AQUATISCHE OBSERVATORIUM" : "THE AQUATIC OBSERVATORY"}
      title={locale === "de" ? "GEWÄSSER. ARTEN. SCHUTZ." : "WATERS. SPECIES. PROTECTION."}
      subtitle={locale === "de" ? "BlackWaterLeaf verbindet Menschen, Daten und Orte, um lebendige Süßwasserwelten zu verstehen und zu schützen." : "BlackWaterLeaf connects people, data and places to understand and protect living freshwater worlds."}
      icon={RadioTower}
      badge="PORTAL"
      children={<><Link href="/explore" className="primary-action">{t("home.hero.action")}<ArrowRight size={15} /></Link><Link href="/profile" className="secondary-action">{locale === "de" ? "MEIN BEREICH" : "MY AREA"}</Link></>}
    />

    <section className="home-portal-strip" aria-label={locale === "de" ? "BlackWaterLeaf Portale" : "BlackWaterLeaf portals"}>
      {portals.map(({ href, label, note, image, icon: Icon, tone }) => <Link key={href} className={`home-portal-row home-portal-row--${tone}`} href={href} style={{ backgroundImage: `url(${image})` }}><span className="home-portal-row__shade" /><span className="home-portal-row__icon"><Icon size={17} /></span><span><strong>{label}</strong><small>{note}</small></span><ArrowRight size={16} /></Link>)}
    </section>

    <section className="home-intro-film glass-panel" aria-labelledby="home-intro-title">
      <div className="home-intro-film__copy">
        <span className="eyebrow">{locale === "de" ? "BLACKWATERLEAF IN 8 SEKUNDEN" : "BLACKWATERLEAF IN 8 SECONDS"}</span>
        <h2 id="home-intro-title">{locale === "de" ? "Natur wird lebendig, sobald du genauer hinsiehst." : "Nature comes alive when you look closer."}</h2>
        <p>{locale === "de" ? "BlackWaterLeaf verbindet Botanik, Aquaristik und Terraristik mit Wissen, Beobachtung und einer Community, die echte Naturmomente teilt." : "BlackWaterLeaf connects botany, aquatics and terrariums with knowledge, observation and a community sharing real nature moments."}</p>
        <div className="home-intro-film__actions">
          <Link href="/community" className="primary-action"><Play size={15} />{locale === "de" ? "Feed entdecken" : "Explore the feed"}</Link>
          <Link href="/register" className="hero-text-link"><UsersRound size={15} />{locale === "de" ? "Mitglied werden" : "Become a member"}</Link>
        </div>
      </div>
      <div className="home-intro-film__media">
        <video className="home-intro-film__video" src="/manus-storage/blackwaterleaf-intro_194052e3.mp4" poster={WORLD_ASSETS.botany} autoPlay muted loop playsInline controls preload="metadata" aria-label={locale === "de" ? "BlackWaterLeaf Einführungsvideo" : "BlackWaterLeaf introduction video"} />
        <span className="home-intro-film__badge"><Sparkles size={13} />{locale === "de" ? "EINBLICKE · WISSEN · COMMUNITY" : "INSIGHT · KNOWLEDGE · COMMUNITY"}</span>
      </div>
    </section>

    <section className="home-promise-grid" aria-label={locale === "de" ? "Was BlackWaterLeaf bietet" : "What BlackWaterLeaf offers"}>
      <article className="home-promise-card"><span>01</span><h3>{locale === "de" ? "Erkennen" : "Identify"}</h3><p>{locale === "de" ? "Pflanzen, Lebensräume und Naturmomente schneller einordnen." : "Understand plants, habitats and nature moments faster."}</p></article>
      <article className="home-promise-card"><span>02</span><h3>{locale === "de" ? "Verstehen" : "Understand"}</h3><p>{locale === "de" ? "Wissen, Pflege und Beobachtung an einem Ort verbinden." : "Connect knowledge, care and observation in one place."}</p></article>
      <article className="home-promise-card"><span>03</span><h3>{locale === "de" ? "Dazugehören" : "Belong"}</h3><p>{locale === "de" ? "Mitglied werden, Momente teilen und die Community mitgestalten." : "Join, share moments and shape the community."}</p></article>
    </section>

    <section className="home-observatory-grid">
      <article className="observatory-data-panel home-observation-callout"><span className="eyebrow">KARTE &amp; LISTE</span><h2>{locale === "de" ? "BEOBACHTEN. EINORDNEN. TEILEN." : "OBSERVE. CLASSIFY. SHARE."}</h2><p>{locale === "de" ? "Katalog, Community, KI-Bestimmung und Quellen bleiben verbunden. Private Anlagen und exakte Orte bleiben geschützt." : "Catalog, community, AI support and sources stay connected. Private habitats and exact locations remain protected."}</p><div><Link href="/explore#map" className="primary-action">KARTE &amp; LISTE<ArrowRight size={15} /></Link><Link href="/search" className="secondary-action">KATALOG</Link></div></article>
      <article className="observatory-data-panel home-community-preview"><div className="observatory-data-panel__heading"><span className="eyebrow">COMMUNITY · AKTUELL</span><span className={`observatory-status observatory-status--${community.isSuccess && !community.isFetching ? "ready" : community.isLoading || community.isFetching ? "loading" : "error"}`}><i />{community.isSuccess && !community.isFetching ? "LIVE-VORSCHAU" : community.isLoading || community.isFetching ? "SYNC …" : "NICHT VERFÜGBAR"}</span></div><strong>{locale === "de" ? "Echte Naturmomente aus der Community" : "Real nature moments from the community"}</strong><p>{locale === "de" ? "Sieh dir öffentliche Beiträge an und entdecke, was andere gerade beobachten, pflegen und teilen." : "See public posts and discover what others are observing, caring for, and sharing."}</p>{community.isLoading ? <div className="home-feed-preview__skeleton" aria-label="Feed wird geladen" /> : community.isError ? <p className="observatory-inline-state">{locale === "de" ? "Die Vorschau ist gerade nicht erreichbar." : "The preview is currently unavailable."}</p> : community.data?.length ? <div className="home-feed-preview">{community.data.map(post => <Link key={post.id} href={`/community?post=${post.id}`} className="home-feed-preview__item">{post.media[0]?.accessUrl ? <img src={post.media[0].accessUrl} alt="" loading="lazy" /> : <span className="home-feed-preview__fallback"><Leaf size={19} /></span>}<span><strong>{post.author.displayName}</strong><small>{post.content}</small><em>{post.realm === "aquarium" ? "Aquaristik" : post.realm === "botany" ? "Botanik" : "Terraristik"} · {post.likesCount} Likes</em></span><ArrowRight size={15} /></Link>)}</div> : <p className="observatory-inline-state">{locale === "de" ? "Noch kein öffentlicher Beitrag verfügbar." : "No public post is available yet."}</p>}<div className="home-community-preview__actions"><Link href="/community" className="primary-action">FEED ENTDECKEN<ArrowRight size={14} /></Link>{!auth.isAuthenticated ? <Link href="/login" className="secondary-action">MITMACHEN</Link> : null}</div></article>
    </section>

    <section className="home-partner-panel observatory-data-panel"><div className="observatory-data-panel__heading"><span className="eyebrow">PARTNER · TRANSPARENT GETRENNT</span><Link className="section-link" href="/marketplace">MARKTPLATZ<ArrowRight size={14} /></Link></div>{partners.isLoading ? <p className="observatory-inline-state">{locale === "de" ? "Partnerplatzierungen werden geprüft." : "Partner placements are being verified."}</p> : partners.isError ? <p className="observatory-inline-state">{locale === "de" ? "Partnerplatzierungen sind derzeit nicht verfügbar." : "Partner placements are unavailable."}</p> : partners.data?.length ? <div className="home-partner-list">{partners.data.slice(0, 2).map(partner => { const card = publicPartnerCardPresentation(partner, locale); return <article key={partner.placementId}><span>{card.disclosureLabel}</span><strong>{card.displayName}</strong><small>{card.partyLabel}</small>{card.destinationUrl ? <a href={card.destinationUrl} target="_blank" rel="sponsored nofollow noopener">{locale === "de" ? "Partnerseite öffnen" : "Open partner page"}<ArrowRight size={13} /></a> : null}</article>; })}</div> : <p className="observatory-inline-state">{locale === "de" ? "Noch keine aktiv freigegebene Partnerplatzierung." : "No active approved partner placement."}</p>}</section>
  </div>;
}
