import { LeafCore } from "@/components/LeafCore";
import { LiveSensorStrip } from "@/components/LiveSensorStrip";
import { StatePanel } from "@/components/StatePanel";
import { WorldCard } from "@/components/WorldCard";
import { useI18n } from "@/i18n";
import { publicPartnerCardPresentation } from "@/lib/partnerPresentation";
import { trpc } from "@/lib/trpc";
import { HOME_SEO_TITLES, HOME_WORLD_IMAGE_ALTS } from "@/lib/seo";
import { WORLD_ASSETS, WORLD_CONFIG } from "@/lib/worlds";
import type { WeatherEffect } from "@shared/current-weather";
import {
  ArrowRight,
  Film,
  Leaf,
  Play,
  RadioTower,
  Sparkles,
  UsersRound,
  Volume2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import introShortVideo from "@/assets/intro/blackwaterleaf-intro-32s.mp4";
import introLongVideo from "@/assets/intro/blackwaterleaf-intro-75s.mp4";
import introPosterImage from "@/assets/intro/blackwaterleaf-intro-poster.jpg";

export default function Home() {
  const { t, locale } = useI18n();
  const pageTitle = HOME_SEO_TITLES[locale];
  const platform = trpc.platform.availability.useQuery(undefined, {
    retry: false,
  });
  const community = trpc.community.feed.useQuery(
    { limit: 1 },
    { retry: false }
  );
  const partners = trpc.partners.homepage.useQuery(undefined, { retry: false });
  const [weatherEffect, setWeatherEffect] = useState<WeatherEffect>("none");
  const [longVideoOpen, setLongVideoOpen] = useState(false);
  const shortVideoRef = useRef<HTMLVideoElement>(null);
  const applyWeatherEffect = useCallback((effect: WeatherEffect) => {
    setWeatherEffect(current => (current === effect ? current : effect));
  }, []);
  const playShortVideoWithSound = useCallback(() => {
    const video = shortVideoRef.current;
    if (!video) return;
    video.muted = false;
    video.volume = 1;
    void video.play();
  }, []);

  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

  const copy =
    locale === "de"
      ? {
          welcome: "Dein Raum für lebendige Welten",
          overview: "Dein Überblick",
          status: "Aktueller Stand",
          values: "Werte im Blick",
          partner: "Ausgewählt & transparent",
        }
      : {
          welcome: "Your place for living worlds",
          overview: "Your overview",
          status: "Current status",
          values: "Values at a glance",
          partner: "Selected & transparent",
        };

  return (
    <div className={`home-stack weather-effect--${weatherEffect}`}>
      <div className="weather-atmosphere" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
      <LiveSensorStrip compact onWeatherEffectChange={applyWeatherEffect} />

      <section
        className="home-hero hero-scene"
        style={{ backgroundImage: `url(${WORLD_ASSETS.botany})` }}
      >
        <span className="hero-light" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow">{copy.welcome}</p>
          <h1 className="glitch-title" data-text={t("home.hero.title")}>
            {t("home.hero.title")}
          </h1>
          <p>{t("home.hero.body")}</p>
          <div className="hero-actions">
            <Link href="/explore" className="primary-action">
              {t("home.hero.action")}
              <ArrowRight size={16} />
            </Link>
            <Link href="/profile" className="hero-text-link">
              {locale === "de" ? "Mein Bereich" : "My area"}
            </Link>
          </div>
        </div>
        <aside className="hero-note" aria-label={copy.status}>
          <Leaf size={18} />
          <span>
            <strong>
              {locale === "de" ? "Privat starten" : "Start privately"}
            </strong>
            <small>
              {locale === "de"
                ? "Du entscheidest, was sichtbar wird."
                : "You decide what becomes visible."}
            </small>
          </span>
        </aside>
      </section>

      <section
        className="home-intro-film glass-panel"
        aria-labelledby="home-intro-title"
      >
        <div className="home-intro-film__copy">
          <span className="eyebrow">
            {locale === "de"
              ? "BLACKWATERLEAF VORSTELLUNG · 32 SEK."
              : "BLACKWATERLEAF INTRO · 32 SEC."}
          </span>
          <h2 id="home-intro-title">
            {locale === "de"
              ? "Natur wird lebendig, sobald du genauer hinsiehst."
              : "Nature comes alive when you look closer."}
          </h2>
          <p>
            {locale === "de"
              ? "Entdecke das Observatorium für Botanik, Aquaristik und Terraristik: Eigene Momente erfassen, mit Quellen vertiefen, geschützt starten und bewusst in der Community teilen."
              : "Discover the observatory for botany, aquatics and terrariums: Capture your moments, deepen them with sources, start privately and share intentionally."}
          </p>
          <div className="home-intro-film__actions">
            <button
              type="button"
              className="primary-action"
              onClick={playShortVideoWithSound}
            >
              <Volume2 size={15} />
              {locale === "de"
                ? "Kurzvideo mit Ton starten"
                : "Play short video with sound"}
            </button>
            <button
              type="button"
              className="secondary-action"
              onClick={() => setLongVideoOpen(true)}
            >
              <Film size={15} />
              {locale === "de"
                ? "Ganze App erklären (75 Sek.)"
                : "Full App Walkthrough (75s)"}
            </button>
            <Link href="/community" className="secondary-action">
              <Play size={15} />
              {locale === "de" ? "Community ansehen" : "Explore community"}
            </Link>
            <Link href="/register" className="hero-text-link">
              <UsersRound size={15} />
              {locale === "de" ? "Mitglied werden" : "Become a member"}
            </Link>
          </div>
        </div>
        <div className="home-intro-film__media">
          <video
            ref={shortVideoRef}
            className="home-intro-film__video"
            src={introShortVideo}
            poster={introPosterImage}
            playsInline
            controls
            preload="metadata"
            aria-label={
              locale === "de"
                ? "BlackWaterLeaf Kurz-Vorstellungsvideo"
                : "BlackWaterLeaf short introduction video"
            }
          >
            <track
              kind="captions"
              src="/intro-short.de.vtt"
              srcLang="de"
              label="Deutsch"
              default
            />
            Dein Browser unterstützt dieses Videoformat nicht.
          </video>
          <span className="home-intro-film__badge">
            <Sparkles size={13} />
            {locale === "de"
              ? "APP-VERLAUF · WISSEN · TRANSPARENZ"
              : "APP JOURNEY · KNOWLEDGE · TRANSPARENCY"}
          </span>
        </div>
      </section>

      {longVideoOpen ? (
        <div
          className="video-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={
            locale === "de"
              ? "Vollständiges Vorstellungsvideo"
              : "Full introduction video"
          }
        >
          <div className="video-modal-window glass-panel">
            <header className="video-modal-header">
              <div>
                <span className="eyebrow">
                  {locale === "de"
                    ? "VOLLSTÄNDIGER VERLAUF · 75 SEKUNDEN"
                    : "FULL APP TOUR · 75 SECONDS"}
                </span>
                <h3>
                  {locale === "de"
                    ? "Die ganze BlackWaterLeaf-App erklärt"
                    : "The whole BlackWaterLeaf experience"}
                </h3>
              </div>
              <button
                type="button"
                className="video-modal-close"
                onClick={() => setLongVideoOpen(false)}
                aria-label={locale === "de" ? "Video schließen" : "Close video"}
              >
                <X size={20} />
              </button>
            </header>
            <div className="video-modal-player-container">
              <video
                className="video-modal-player"
                src={introLongVideo}
                poster={introPosterImage}
                autoPlay
                playsInline
                controls
                preload="auto"
                aria-label={
                  locale === "de"
                    ? "BlackWaterLeaf Langfassung des Vorstellungsvideos"
                    : "BlackWaterLeaf full walkthrough video"
                }
              >
                <track
                  kind="captions"
                  src="/intro-long.de.vtt"
                  srcLang="de"
                  label="Deutsch"
                  default
                />
                Dein Browser unterstützt dieses Videoformat nicht.
              </video>
            </div>
            <footer className="video-modal-footer">
              <p>
                {locale === "de"
                  ? "Erklärt: Botanik, Aquaristik, Terraristik, Erfassen & Zuordnen, Wissen mit Quellen, geschützter Start, bewusste Community, optionale Smart-Werte, transparente Partner und geplante Team-Zugänge."
                  : "Covers botany, aquatics, terrariums, capture & cataloging, knowledge with sources, private-by-default, community, optional sensors, transparent partners and planned organization access."}
              </p>
            </footer>
          </div>
        </div>
      ) : null}

      <section
        className="home-promise-grid"
        aria-label={
          locale === "de"
            ? "Was BlackWaterLeaf bietet"
            : "What BlackWaterLeaf offers"
        }
      >
        <article className="home-promise-card">
          <span>01</span>
          <h3>{locale === "de" ? "Erkennen" : "Identify"}</h3>
          <p>
            {locale === "de"
              ? "Pflanzen, Lebensräume und Naturmomente schneller einordnen."
              : "Understand plants, habitats and nature moments faster."}
          </p>
        </article>
        <article className="home-promise-card">
          <span>02</span>
          <h3>{locale === "de" ? "Verstehen" : "Understand"}</h3>
          <p>
            {locale === "de"
              ? "Wissen, Pflege und Beobachtung an einem Ort verbinden."
              : "Connect knowledge, care and observation in one place."}
          </p>
        </article>
        <article className="home-promise-card">
          <span>03</span>
          <h3>{locale === "de" ? "Dazugehören" : "Belong"}</h3>
          <p>
            {locale === "de"
              ? "Mitglied werden, Momente teilen und die Community mitgestalten."
              : "Join, share moments and shape the community."}
          </p>
        </article>
      </section>

      <section className="home-areas">
        <div className="section-heading section-heading--airy">
          <div>
            <span className="eyebrow">{copy.overview}</span>
            <h2>{t("home.worlds.title")}</h2>
          </div>
          <Link href="/explore" className="section-link">
            {locale === "de" ? "Alle Bereiche" : "All areas"}
            <ArrowRight size={15} />
          </Link>
        </div>
        <div className="world-rail world-rail--home">
          {WORLD_CONFIG.map(world => (
            <WorldCard
              key={world.number}
              {...world}
              title={t(world.titleKey)}
              subtitle={t(world.subtitleKey)}
              tone={world.realm}
              imageAlt={HOME_WORLD_IMAGE_ALTS[locale][world.realm]}
            />
          ))}
        </div>
      </section>

      <section
        className="home-capture-zone"
        aria-label={locale === "de" ? "Schnellaktionen" : "Quick actions"}
      >
        <p>{locale === "de" ? "Dein Moment" : "Your moment"}</p>
        <LeafCore />
      </section>

      <section className="home-moment">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{t("home.feed.eyebrow")}</span>
            <h2>{t("home.feed.title")}</h2>
          </div>
          <span className="connection-pill">
            <i />
            {platform.data?.community === "available"
              ? "BEREIT"
              : t("common.notConnected")}
          </span>
        </div>
        {community.isLoading ? (
          <StatePanel
            code="FEED/CONNECT"
            state="loading"
            title={t("common.loading")}
            body={t("home.truth.body")}
          />
        ) : community.isError ? (
          <StatePanel
            code="FEED/ERROR"
            state="error"
            title={t("common.error")}
            body={t("home.feed.emptyBody")}
          />
        ) : community.data?.[0] ? (
          <article className="featured-moment glass-panel">
            <div className="moment-copy">
              <span className="eyebrow">
                {locale === "de" ? "Echter Naturmoment" : "Real nature moment"}
              </span>
              <h3>
                {community.data[0].author.name ??
                  community.data[0].author.username ??
                  "BlackWaterLeaf"}
              </h3>
              <p>{community.data[0].content}</p>
            </div>
            {community.data[0].media[0] ? (
              <img src={community.data[0].media[0].accessUrl} alt="" />
            ) : null}
          </article>
        ) : (
          <section
            className="empty-moment"
            style={{ backgroundImage: `url(${WORLD_ASSETS.botany})` }}
          >
            <div>
              <span className="eyebrow">{t("home.feed.pending")}</span>
              <h3>{t("home.feed.emptyTitle")}</h3>
              <p>{t("home.feed.emptyBody")}</p>
            </div>
          </section>
        )}
      </section>

      <section className="partner-home-section glass-panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              {locale === "de" ? "Empfehlungen" : "Recommendations"}
            </span>
            <h2>{copy.partner}</h2>
          </div>
          <Link className="partner-marketplace-link" href="/marketplace">
            {locale === "de" ? "MARKTPLATZ" : "MARKETPLACE"}
            <ArrowRight size={14} />
          </Link>
        </div>
        {partners.isLoading ? (
          <p className="partner-empty">
            {locale === "de"
              ? "Partnerplatzierungen werden geprüft."
              : "Partner placements are being verified."}
          </p>
        ) : partners.isError ? (
          <p className="partner-empty">
            {locale === "de"
              ? "Partnerplatzierungen sind derzeit nicht verfügbar."
              : "Partner placements are currently unavailable."}
          </p>
        ) : partners.data?.length ? (
          <div className="partner-home-grid">
            {partners.data.map(partner => {
              const card = publicPartnerCardPresentation(partner, locale);
              return (
                <article
                  className="partner-home-card"
                  key={partner.placementId}
                >
                  <span>{card.disclosureLabel}</span>
                  <h3>{card.displayName}</h3>
                  <p>{card.partyLabel}</p>
                  {card.destinationUrl ? (
                    <a
                      href={card.destinationUrl}
                      target="_blank"
                      rel="sponsored nofollow noopener"
                    >
                      {locale === "de"
                        ? "Partnerseite öffnen"
                        : "Open partner page"}
                      <ArrowRight size={14} />
                    </a>
                  ) : null}
                  {card.products.kind === "products" ? (
                    <div className="partner-product-teasers">
                      <small>
                        {locale === "de"
                          ? "Produkte · Werbung"
                          : "Products · advertisement"}
                      </small>
                      {card.products.products.map(product => (
                        <a
                          key={product.id}
                          className="partner-product-teaser"
                          href={product.destinationUrl}
                          target="_blank"
                          rel="sponsored nofollow noopener"
                        >
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt="" />
                          ) : null}
                          <span>{product.title}</span>
                          {product.priceLabel ? (
                            <strong>{product.priceLabel}</strong>
                          ) : null}
                          <ArrowRight size={13} />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="partner-product-empty">
                      {card.products.message}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <p className="partner-empty">
            {locale === "de"
              ? "Noch keine aktiv freigegebene Partnerplatzierung."
              : "No actively approved partner placement yet."}
          </p>
        )}
      </section>

      <section className="truth-panel glass-panel">
        <RadioTower size={22} />
        <div>
          <span className="eyebrow">{t("home.truth.eyebrow")}</span>
          <h2>{t("home.truth.title")}</h2>
          <p>{t("home.truth.body")}</p>
        </div>
      </section>
    </div>
  );
}
