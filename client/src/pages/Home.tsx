import { LeafCore } from "@/components/LeafCore";
import { StatePanel } from "@/components/StatePanel";
import { WorldCard } from "@/components/WorldCard";
import { useI18n } from "@/i18n";
import { trpc } from "@/lib/trpc";
import { WORLD_ASSETS, WORLD_CONFIG } from "@/lib/worlds";
import { ArrowRight, RadioTower } from "lucide-react";
import { Link } from "wouter";

function atmosphereForHour(hour: number, labels: { morning: string; day: string; evening: string; night: string }) {
  if (hour >= 5 && hour < 11) return labels.morning;
  if (hour >= 11 && hour < 18) return labels.day;
  if (hour >= 18 && hour < 22) return labels.evening;
  return labels.night;
}

export default function Home() {
  const { t, locale } = useI18n();
  const platform = trpc.platform.availability.useQuery(undefined, { retry: false });
  const community = trpc.community.feed.useQuery({ limit: 1 }, { retry: false });
  const partners = trpc.partners.homepage.useQuery(undefined, { retry: false });
  const atmosphere = atmosphereForHour(new Date().getHours(), {
    morning: t("home.atmosphere.morning"),
    day: t("home.atmosphere.day"),
    evening: t("home.atmosphere.evening"),
    night: t("home.atmosphere.night"),
  });

  return (
    <div className="home-stack">
      <section className="sensor-panel glass-panel">
        <div className="sensor-heading"><span>[{t("home.sensors.title")}]</span><span className="connection-pill"><i />{t("common.notConnected")}</span></div>
        <div className="sensor-grid">
          <Sensor value={t("common.offline")} label={t("home.sensors.water")} tone="mint" />
          <Sensor value={t("common.offline")} label={t("home.sensors.air")} tone="green" />
          <Sensor value={t("common.offline")} label={t("home.sensors.ph")} tone="cyan" />
          <Sensor value={atmosphere} label={t("home.sensors.deviceTime")} tone="gold" />
        </div>
        <p className="sensor-note">{t("home.sensors.note")}</p>
      </section>

      <section className="hero-scene" style={{ backgroundImage: `url(${WORLD_ASSETS.botany})` }}>
        <span className="hero-light" aria-hidden="true" />
        <span className="glass-reflection" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow">[{t("home.hero.eyebrow")}]</p>
          <h1 className="glitch-title" data-text={t("home.hero.title")}>{t("home.hero.title")}</h1>
          <p>{t("home.hero.body")}</p>
          <Link href="/explore" className="primary-action">{t("home.hero.action")}<ArrowRight size={16} /></Link>
        </div>
      </section>

      <section className="partner-home-section glass-panel">
        <div className="section-heading"><div><span className="eyebrow">[PARTNERPLATZIERUNGEN]</span><h2>{locale === "de" ? "Empfohlen & gekennzeichnet" : "Recommended & disclosed"}</h2></div><span className="system-chip">{locale === "de" ? "WERBUNG" : "ADVERTISEMENT"}</span></div>
        {partners.isLoading ? <p className="partner-empty">{locale === "de" ? "Partnerplatzierungen werden geprüft." : "Partner placements are being verified."}</p> : partners.isError ? <p className="partner-empty">{locale === "de" ? "Partnerplatzierungen sind derzeit nicht verfügbar." : "Partner placements are currently unavailable."}</p> : partners.data?.length ? <div className="partner-home-grid">{partners.data.map(partner => <article className="partner-home-card" key={partner.placementId}><span>{partner.disclosureLabel}</span><h3>{partner.displayName}</h3><p>{partner.partyType === "company" ? (locale === "de" ? "Unternehmenspartner" : "Business partner") : (locale === "de" ? "Persönliche Empfehlung" : "Personal recommendation")}</p>{partner.destinationUrl ? <a href={partner.destinationUrl} target="_blank" rel="sponsored nofollow noopener">{locale === "de" ? "Partnerseite öffnen" : "Open partner page"}<ArrowRight size={14} /></a> : null}</article>)}</div> : <p className="partner-empty">{locale === "de" ? "Noch keine aktiv freigegebene Partnerplatzierung." : "No actively approved partner placement yet."}</p>}
      </section>

      <section>
        <div className="section-heading">
          <div><span className="eyebrow">[{t("home.feed.eyebrow")}]</span><h2>{t("home.feed.title")}</h2></div>
          <span className="connection-pill"><i />{platform.data?.community === "available" ? "API READY" : t("common.notConnected")}</span>
        </div>
        {community.isLoading ? (
          <StatePanel code="FEED/CONNECT" state="loading" title={t("common.loading")} body={t("home.truth.body")} />
        ) : community.isError ? (
          <StatePanel code="FEED/ERROR" state="error" title={t("common.error")} body={t("home.feed.emptyBody")} />
        ) : community.data?.[0] ? (
          <article className="featured-moment glass-panel">
            <div className="moment-copy"><span className="eyebrow">[REAL_POST]</span><h3>{community.data[0].author.name ?? community.data[0].author.username ?? "BlackWaterLeaf"}</h3><p>{community.data[0].content}</p></div>
            {community.data[0].media[0] ? <img src={community.data[0].media[0].accessUrl} alt="" /> : null}
          </article>
        ) : (
          <section className="empty-moment" style={{ backgroundImage: `url(${WORLD_ASSETS.botany})` }}>
            <div><span className="eyebrow">[{t("home.feed.pending")}]</span><h3>{t("home.feed.emptyTitle")}</h3><p>{t("home.feed.emptyBody")}</p></div>
          </section>
        )}
      </section>

      <section>
        <div className="section-heading"><div><span className="eyebrow">[REALM_MATRIX]</span><h2>{t("home.worlds.title")}</h2></div><span className="system-chip">{t("home.worlds.meta")}</span></div>
        <div className="world-rail">
          {WORLD_CONFIG.map(world => <WorldCard key={world.number} {...world} title={t(world.titleKey)} subtitle={t(world.subtitleKey)} tone={world.realm} />)}
        </div>
      </section>

      <section className="truth-panel glass-panel">
        <RadioTower size={22} />
        <div><span className="eyebrow">[{t("home.truth.eyebrow")}]</span><h2>{t("home.truth.title")}</h2><p>{t("home.truth.body")}</p></div>
      </section>
      <LeafCore />
    </div>
  );
}

function Sensor({ value, label, tone }: { value: string; label: string; tone: string }) {
  return <div className={`sensor sensor-${tone}`}><strong>{value}</strong><span>{label}</span></div>;
}
