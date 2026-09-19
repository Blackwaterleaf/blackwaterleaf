import { ObservatoryContextHeader } from "@/components/ObservatoryPrimitives";
import { StatePanel } from "@/components/StatePanel";
import { useAuth } from "@/_core/hooks/useAuth";
import { useI18n } from "@/i18n";
import { publicPartnerCardPresentation } from "@/lib/partnerPresentation";
import { trpc } from "@/lib/trpc";
import { HOME_SEO_TITLES } from "@/lib/seo";
import { WORLD_ASSETS } from "@/lib/worlds";
import { ArrowRight, Fish, Leaf, RadioTower, Sprout } from "lucide-react";
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
  const pageTitle = HOME_SEO_TITLES[locale];
  const platform = trpc.platform.availability.useQuery(undefined, { retry: false });
  const community = trpc.community.feed.useQuery({ limit: 1 }, { enabled: auth.isAuthenticated, retry: false });
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

    <section className="home-observatory-grid">
      <article className="observatory-data-panel home-observation-callout"><span className="eyebrow">KARTE &amp; LISTE</span><h2>{locale === "de" ? "BEOBACHTEN. EINORDNEN. TEILEN." : "OBSERVE. CLASSIFY. SHARE."}</h2><p>{locale === "de" ? "Katalog, Community, KI-Bestimmung und Quellen bleiben verbunden. Private Anlagen und exakte Orte bleiben geschützt." : "Catalog, community, AI support and sources stay connected. Private habitats and exact locations remain protected."}</p><div><Link href="/explore#map" className="primary-action">KARTE &amp; LISTE<ArrowRight size={15} /></Link><Link href="/search" className="secondary-action">KATALOG</Link></div></article>
      <article className="observatory-data-panel home-community-preview"><div className="observatory-data-panel__heading"><span className="eyebrow">COMMUNITY · AKTUELL</span><span className={`observatory-status observatory-status--${!auth.isAuthenticated ? "loading" : community.isSuccess && !community.isFetching && platform.data?.community === "available" ? "ready" : community.isLoading || community.isFetching ? "loading" : "error"}`}><i />{!auth.isAuthenticated ? "GESCHÜTZT" : community.isSuccess && !community.isFetching && platform.data?.community === "available" ? "BEREIT" : community.isLoading || community.isFetching ? "SYNC …" : "NICHT VERFÜGBAR"}</span></div>{!auth.isAuthenticated ? <><strong>{locale === "de" ? "Community für Mitglieder" : "Community for members"}</strong><p>{locale === "de" ? "Beiträge, Diskussionen und Live-Sessions werden erst nach einer sicheren Anmeldung geladen." : "Posts, discussions, and live sessions load only after secure sign-in."}</p><Link href="/login" className="section-link">SICHER ANMELDEN<ArrowRight size={14} /></Link></> : community.isLoading ? <p className="observatory-inline-state">{t("common.loading")}</p> : community.isError ? <p className="observatory-inline-state">{locale === "de" ? "Der Community-Feed ist derzeit nicht erreichbar." : "The community feed is currently unavailable."}</p> : community.data?.[0] ? <><strong>{community.data[0].author.name ?? community.data[0].author.username ?? "Community"}</strong><p>{community.data[0].content}</p><Link href="/community" className="section-link">COMMUNITY ÖFFNEN<ArrowRight size={14} /></Link></> : <p className="observatory-inline-state">{locale === "de" ? "Noch kein öffentlicher Beitrag verfügbar." : "No public post is available yet."}</p>}</article>
    </section>

    <section className="home-partner-panel observatory-data-panel"><div className="observatory-data-panel__heading"><span className="eyebrow">PARTNER · TRANSPARENT GETRENNT</span><Link className="section-link" href="/marketplace">MARKTPLATZ<ArrowRight size={14} /></Link></div>{partners.isLoading ? <p className="observatory-inline-state">{locale === "de" ? "Partnerplatzierungen werden geprüft." : "Partner placements are being verified."}</p> : partners.isError ? <p className="observatory-inline-state">{locale === "de" ? "Partnerplatzierungen sind derzeit nicht verfügbar." : "Partner placements are unavailable."}</p> : partners.data?.length ? <div className="home-partner-list">{partners.data.slice(0, 2).map(partner => { const card = publicPartnerCardPresentation(partner, locale); return <article key={partner.placementId}><span>{card.disclosureLabel}</span><strong>{card.displayName}</strong><small>{card.partyLabel}</small>{card.destinationUrl ? <a href={card.destinationUrl} target="_blank" rel="sponsored nofollow noopener">{locale === "de" ? "Partnerseite öffnen" : "Open partner page"}<ArrowRight size={13} /></a> : null}</article>; })}</div> : <p className="observatory-inline-state">{locale === "de" ? "Noch keine aktiv freigegebene Partnerplatzierung." : "No active approved partner placement."}</p>}</section>
  </div>;
}
