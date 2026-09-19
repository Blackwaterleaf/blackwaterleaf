import { LeafCore } from "@/components/LeafCore";
import { InstallAppButton } from "@/components/InstallAppButton";
import { StatePanel } from "@/components/StatePanel";
import { WorldCard } from "@/components/WorldCard";
import { useI18n } from "@/i18n";
import { publicPartnerCardPresentation } from "@/lib/partnerPresentation";
import { trpc } from "@/lib/trpc";
import { HOME_SEO_TITLES, HOME_WORLD_IMAGE_ALTS } from "@/lib/seo";
import { WORLD_ASSETS, WORLD_CONFIG } from "@/lib/worlds";
import { ArrowRight, RadioTower } from "lucide-react";
import { useEffect } from "react";
import { Link } from "wouter";

export default function Home() {
  const { t, locale } = useI18n();
  const pageTitle = HOME_SEO_TITLES[locale];
  const platform = trpc.platform.availability.useQuery(undefined, { retry: false });
  const community = trpc.community.feed.useQuery({ limit: 1 }, { retry: false });
  const partners = trpc.partners.homepage.useQuery(undefined, { retry: false });

  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

  const copy = locale === "de"
    ? { welcome: "Das aquatische Observatorium", overview: "Portale", status: "Aktueller Stand", values: "Werte im Blick", partner: "Ausgewählt & transparent" }
    : { welcome: "The aquatic observatory", overview: "Portals", status: "Current status", values: "Values at a glance", partner: "Selected & transparent" };

  return (
    <div className="home-stack">
      <section className="home-hero hero-scene" style={{ backgroundImage: `url(${WORLD_ASSETS.botany})` }}>
        <span className="hero-light" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow">{copy.welcome}</p>
          <h1 className="glitch-title" data-text={locale === "de" ? "GEWÄSSER. ARTEN. SCHUTZ." : "WATERS. SPECIES. PROTECTION."}>{locale === "de" ? "GEWÄSSER. ARTEN. SCHUTZ." : "WATERS. SPECIES. PROTECTION."}</h1>
          <p>{locale === "de" ? "BlackWaterLeaf verbindet Menschen, Daten und Orte, um lebendige Süßwasserwelten zu verstehen und zu schützen." : "BlackWaterLeaf connects people, data and places to understand and protect living freshwater worlds."}</p>
          <div className="hero-actions">
            <Link href="/explore" className="primary-action">{t("home.hero.action")}<ArrowRight size={16} /></Link>
            <Link href="/profile" className="hero-text-link">{locale === "de" ? "Mein Bereich" : "My area"}</Link>
            <InstallAppButton locale={locale} />
          </div>
        </div>
      </section>

      <section className="home-areas">
        <section className="portal-quick-grid" aria-label={locale === "de" ? "BlackWaterLeaf Portale" : "BlackWaterLeaf portals"}>
          <Link className="portal-quick-card" href="/botanik" style={{ backgroundImage: `url(${WORLD_ASSETS.botany})` }}><span><strong>Botanik</strong><small>{locale === "de" ? "Wasserpflanzen & Wissen" : "Aquatic plants & knowledge"}</small></span></Link>
          <Link className="portal-quick-card" href="/aquaristik" style={{ backgroundImage: `url(${WORLD_ASSETS.aquarium})` }}><span><strong>Aquaristik</strong><small>{locale === "de" ? "Fische & Wirbellose" : "Fish & invertebrates"}</small></span></Link>
          <Link className="portal-quick-card" href="/terraristik" style={{ backgroundImage: `url(${WORLD_ASSETS.terrarium})` }}><span><strong>Terraristik</strong><small>{locale === "de" ? "Reptilien & Amphibien" : "Reptiles & amphibians"}</small></span></Link>
        </section>
        <section className="observatory-panel glass-panel">
          <span className="eyebrow">{locale === "de" ? "Karte & Liste · synchronisiert" : "Map & list · synchronized"}</span>
          <h2>{locale === "de" ? "Beobachten. Einordnen. Teilen." : "Observe. Classify. Share."}</h2>
          <p>{locale === "de" ? "Katalog, Community, KI-Bestimmung und Quellen bleiben in einem klaren Portal verbunden. Private Anlagen und exakte Standorte bleiben geschützt." : "Catalog, community, AI identification and sources stay connected in one clear portal. Private habitats and exact locations remain protected."}</p>
          <div className="hero-actions"><Link href="/search" className="primary-action">{locale === "de" ? "Katalog öffnen" : "Open catalog"}<ArrowRight size={16} /></Link><Link href="/community" className="secondary-action">Community</Link><Link href="/marketplace" className="secondary-action">Marktplatz</Link></div>
        </section>
        <div className="section-heading section-heading--airy">
          <div><span className="eyebrow">{copy.overview}</span><h2>{t("home.worlds.title")}</h2></div>
          <Link href="/explore" className="section-link">{locale === "de" ? "Alle Bereiche" : "All areas"}<ArrowRight size={15} /></Link>
        </div>
        <div className="world-rail world-rail--home">
          {WORLD_CONFIG.map(world => <WorldCard key={world.number} {...world} title={t(world.titleKey)} subtitle={t(world.subtitleKey)} tone={world.realm} imageAlt={HOME_WORLD_IMAGE_ALTS[locale][world.realm]} />)}
        </div>
      </section>

      <section className="home-capture-zone" aria-label={locale === "de" ? "Schnellaktionen" : "Quick actions"}>
        <p>{locale === "de" ? "Dein Moment" : "Your moment"}</p>
        <LeafCore />
      </section>

      <section className="home-moment">
        <div className="section-heading"><div><span className="eyebrow">{t("home.feed.eyebrow")}</span><h2>{t("home.feed.title")}</h2></div><span className="connection-pill"><i />{platform.data?.community === "available" ? "BEREIT" : t("common.notConnected")}</span></div>
        {community.isLoading ? (
          <StatePanel code="FEED/CONNECT" state="loading" title={t("common.loading")} body={t("home.truth.body")} />
        ) : community.isError ? (
          <StatePanel code="FEED/ERROR" state="error" title={t("common.error")} body={t("home.feed.emptyBody")} />
        ) : community.data?.[0] ? (
          <article className="featured-moment glass-panel">
            <div className="moment-copy"><span className="eyebrow">{locale === "de" ? "Echter Naturmoment" : "Real nature moment"}</span><h3>{community.data[0].author.name ?? community.data[0].author.username ?? "BlackWaterLeaf"}</h3><p>{community.data[0].content}</p></div>
            {community.data[0].media[0] ? <img src={community.data[0].media[0].accessUrl} alt="" /> : null}
          </article>
        ) : (
          <section className="empty-moment" style={{ backgroundImage: `url(${WORLD_ASSETS.botany})` }}>
            <div><span className="eyebrow">{t("home.feed.pending")}</span><h3>{t("home.feed.emptyTitle")}</h3><p>{t("home.feed.emptyBody")}</p></div>
          </section>
        )}
      </section>

      <section className="partner-home-section glass-panel">
        <div className="section-heading"><div><span className="eyebrow">{locale === "de" ? "Empfehlungen" : "Recommendations"}</span><h2>{copy.partner}</h2></div><Link className="partner-marketplace-link" href="/marketplace">{locale === "de" ? "MARKTPLATZ" : "MARKETPLACE"}<ArrowRight size={14} /></Link></div>
        {partners.isLoading ? <p className="partner-empty">{locale === "de" ? "Partnerplatzierungen werden geprüft." : "Partner placements are being verified."}</p> : partners.isError ? <p className="partner-empty">{locale === "de" ? "Partnerplatzierungen sind derzeit nicht verfügbar." : "Partner placements are currently unavailable."}</p> : partners.data?.length ? <div className="partner-home-grid">{partners.data.slice(0, 2).map(partner => { const card = publicPartnerCardPresentation(partner, locale); return <article className="partner-home-card" key={partner.placementId}><span>{card.disclosureLabel}</span><h3>{card.displayName}</h3><p>{card.partyLabel}</p>{card.destinationUrl ? <a href={card.destinationUrl} target="_blank" rel="sponsored nofollow noopener">{locale === "de" ? "Partnerseite öffnen" : "Open partner page"}<ArrowRight size={14} /></a> : null}{card.products.kind === "products" ? <div className="partner-product-teasers"><small>{locale === "de" ? "Produkte · Werbung" : "Products · advertisement"}</small>{card.products.products.slice(0, 2).map(product => <a key={product.id} className="partner-product-teaser" href={product.destinationUrl} target="_blank" rel="sponsored nofollow noopener">{product.imageUrl ? <img src={product.imageUrl} alt="" /> : null}<span>{product.title}</span>{product.priceLabel ? <strong>{product.priceLabel}</strong> : null}<ArrowRight size={13} /></a>)}</div> : <p className="partner-product-empty">{card.products.message}</p>}</article>; })}</div> : <p className="partner-empty">{locale === "de" ? "Noch keine aktiv freigegebene Partnerplatzierung." : "No actively approved partner placement yet."}</p>}
      </section>

      <section className="truth-panel glass-panel">
        <RadioTower size={22} />
        <div><span className="eyebrow">{t("home.truth.eyebrow")}</span><h2>{t("home.truth.title")}</h2><p>{t("home.truth.body")}</p></div>
      </section>
    </div>
  );
}
