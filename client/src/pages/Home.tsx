import { LeafCore } from "@/components/LeafCore";
import { StatePanel } from "@/components/StatePanel";
import { WorldCard } from "@/components/WorldCard";
import { useI18n } from "@/i18n";
import { publicPartnerCardPresentation } from "@/lib/partnerPresentation";
import { trpc } from "@/lib/trpc";
import { HOME_SEO_TITLES, HOME_WORLD_IMAGE_ALTS } from "@/lib/seo";
import { WORLD_ASSETS, WORLD_CONFIG } from "@/lib/worlds";
import { ArrowRight, CloudRain, Droplets, Gauge, Leaf, RadioTower, ThermometerSun, type LucideIcon } from "lucide-react";
import { useEffect } from "react";
import { Link } from "wouter";

function atmosphereForHour(hour: number, labels: { morning: string; day: string; evening: string; night: string }) {
  if (hour >= 5 && hour < 11) return labels.morning;
  if (hour >= 11 && hour < 18) return labels.day;
  if (hour >= 18 && hour < 22) return labels.evening;
  return labels.night;
}

export default function Home() {
  const { t, locale } = useI18n();
  const pageTitle = HOME_SEO_TITLES[locale];
  const platform = trpc.platform.availability.useQuery(undefined, { retry: false });
  const community = trpc.community.feed.useQuery({ limit: 1 }, { retry: false });
  const partners = trpc.partners.homepage.useQuery(undefined, { retry: false });
  const atmosphere = atmosphereForHour(new Date().getHours(), {
    morning: t("home.atmosphere.morning"),
    day: t("home.atmosphere.day"),
    evening: t("home.atmosphere.evening"),
    night: t("home.atmosphere.night"),
  });

  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

  const copy = locale === "de"
    ? { welcome: "Dein Raum für lebendige Welten", overview: "Dein Überblick", status: "Aktueller Stand", values: "Werte im Blick", partner: "Ausgewählt & transparent" }
    : { welcome: "Your place for living worlds", overview: "Your overview", status: "Current status", values: "Values at a glance", partner: "Selected & transparent" };

  return (
    <div className="home-stack">
      <section className="home-status-card glass-panel" aria-label={copy.values}>
        <div className="home-status-heading"><span>{copy.values}</span><span className="connection-pill"><i />{t("common.notConnected")}</span></div>
        <div className="sensor-grid">
          <Sensor value={t("common.offline")} label={t("home.sensors.water")} tone="mint" icon={Droplets} />
          <Sensor value={t("common.offline")} label={t("home.sensors.air")} tone="green" icon={ThermometerSun} />
          <Sensor value={t("common.offline")} label={t("home.sensors.ph")} tone="cyan" icon={Gauge} />
          <Sensor value={atmosphere} label={t("home.sensors.deviceTime")} tone="gold" icon={CloudRain} />
        </div>
        <p className="sensor-note">{t("home.sensors.note")}</p>
      </section>

      <section className="home-hero hero-scene" style={{ backgroundImage: `url(${WORLD_ASSETS.botany})` }}>
        <span className="hero-light" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow">{copy.welcome}</p>
          <h1 className="glitch-title" data-text={t("home.hero.title")}>{t("home.hero.title")}</h1>
          <p>{t("home.hero.body")}</p>
          <div className="hero-actions">
            <Link href="/explore" className="primary-action">{t("home.hero.action")}<ArrowRight size={16} /></Link>
            <Link href="/profile" className="hero-text-link">{locale === "de" ? "Mein Bereich" : "My area"}</Link>
          </div>
        </div>
        <aside className="hero-note" aria-label={copy.status}>
          <Leaf size={18} />
          <span><strong>{locale === "de" ? "Privat starten" : "Start privately"}</strong><small>{locale === "de" ? "Du entscheidest, was sichtbar wird." : "You decide what becomes visible."}</small></span>
        </aside>
      </section>

      <section className="home-areas">
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
        <div className="section-heading"><div><span className="eyebrow">{locale === "de" ? "Empfehlungen" : "Recommendations"}</span><h2>{copy.partner}</h2></div><span className="partner-disclosure">{locale === "de" ? "Werbung" : "Advertisement"}</span></div>
        {partners.isLoading ? <p className="partner-empty">{locale === "de" ? "Partnerplatzierungen werden geprüft." : "Partner placements are being verified."}</p> : partners.isError ? <p className="partner-empty">{locale === "de" ? "Partnerplatzierungen sind derzeit nicht verfügbar." : "Partner placements are currently unavailable."}</p> : partners.data?.length ? <div className="partner-home-grid">{partners.data.map(partner => { const card = publicPartnerCardPresentation(partner, locale); return <article className="partner-home-card" key={partner.placementId}><span>{card.disclosureLabel}</span><h3>{card.displayName}</h3><p>{card.partyLabel}</p>{card.destinationUrl ? <a href={card.destinationUrl} target="_blank" rel="sponsored nofollow noopener">{locale === "de" ? "Partnerseite öffnen" : "Open partner page"}<ArrowRight size={14} /></a> : null}{card.products.kind === "products" ? <div className="partner-product-teasers"><small>{locale === "de" ? "Produkte · Werbung" : "Products · advertisement"}</small>{card.products.products.map(product => <a key={product.id} className="partner-product-teaser" href={product.destinationUrl} target="_blank" rel="sponsored nofollow noopener">{product.imageUrl ? <img src={product.imageUrl} alt="" /> : null}<span>{product.title}</span>{product.priceLabel ? <strong>{product.priceLabel}</strong> : null}<ArrowRight size={13} /></a>)}</div> : <p className="partner-product-empty">{card.products.message}</p>}</article>; })}</div> : <p className="partner-empty">{locale === "de" ? "Noch keine aktiv freigegebene Partnerplatzierung." : "No actively approved partner placement yet."}</p>}
      </section>

      <section className="truth-panel glass-panel">
        <RadioTower size={22} />
        <div><span className="eyebrow">{t("home.truth.eyebrow")}</span><h2>{t("home.truth.title")}</h2><p>{t("home.truth.body")}</p></div>
      </section>
    </div>
  );
}

function Sensor({ value, label, tone, icon: Icon }: { value: string; label: string; tone: string; icon: LucideIcon }) {
  return <div className={`sensor sensor-${tone}`}><Icon size={17} strokeWidth={1.7} /><div><strong>{value}</strong><span>{label}</span></div></div>;
}
