import { LiveSensorStrip } from "@/components/LiveSensorStrip";
import { ReferenceHero } from "@/components/ReferenceOverlay";
import { WorldCard } from "@/components/WorldCard";
import { useI18n } from "@/i18n";
import { REFERENCE_ASSETS, WORLD_CONFIG } from "@/lib/worlds";
import { HOME_WORLD_IMAGE_ALTS } from "@/lib/seo";
import { BookOpenText, Leaf } from "lucide-react";
import { Link } from "wouter";

export default function Explore() {
  const { t, locale } = useI18n();
  return (
    <div className="reference-page reference-page--botany">
      <LiveSensorStrip compact />
      <ReferenceHero tone="botany" image={REFERENCE_ASSETS.botany} eyebrow="WORLD INDEX" title={t("explore.title")} subtitle={locale === "de" ? "Vier lebendige Naturwelten." : "Four living nature worlds."} icon={Leaf} />
      <section aria-label={t("home.worlds.title")}>
        <div className="reference-actions__heading"><span>DEINE WELTEN</span><i aria-hidden="true" /></div>
        <div className="world-grid">
          {WORLD_CONFIG.map(world => <WorldCard key={world.number} {...world} title={t(world.titleKey)} subtitle={t(world.subtitleKey)} tone={world.realm} imageAlt={HOME_WORLD_IMAGE_ALTS[locale][world.realm]} />)}
        </div>
      </section>
      <Link href="/knowledge" className="reference-divider"><Leaf size={16} /><span>WISSEN &amp; EVIDENZ</span><BookOpenText size={16} /></Link>
    </div>
  );
}
