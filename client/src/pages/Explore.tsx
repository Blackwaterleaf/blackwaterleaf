import { WorldCard } from "@/components/WorldCard";
import { useI18n } from "@/i18n";
import { WORLD_CONFIG } from "@/lib/worlds";
import { BookOpenText } from "lucide-react";
import { Link } from "wouter";

export default function Explore() {
  const { t } = useI18n();
  return (
    <div className="page-stack">
      <section className="page-hero bracket-panel">
        <p className="eyebrow">[{t("explore.eyebrow")}]</p>
        <h1 className="glitch-title" data-text={t("explore.title")}>{t("explore.title")}</h1>
        <p>{t("explore.body")}</p>
      </section>
      <section>
        <div className="section-heading">
          <div><span className="eyebrow">[WORLD_INDEX]</span><h2>{t("home.worlds.title")}</h2></div>
          <span className="system-chip">04 REALMS</span>
        </div>
        <div className="world-grid">
          {WORLD_CONFIG.map(world => <WorldCard key={world.number} {...world} title={t(world.titleKey)} subtitle={t(world.subtitleKey)} tone={world.realm} />)}
        </div>
      </section>
      <Link href="/knowledge" className="knowledge-link glass-panel">
        <BookOpenText size={24} />
        <span><small>{t("knowledge.eyebrow")}</small><strong>{t("knowledge.title")}</strong></span>
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
