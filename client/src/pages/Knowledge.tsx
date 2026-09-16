import { LiveSensorStrip } from "@/components/LiveSensorStrip";
import { ReferenceActionGrid, ReferenceEmptyState, ReferenceHero } from "@/components/ReferenceOverlay";
import { StatePanel } from "@/components/StatePanel";
import { useI18n } from "@/i18n";
import { REFERENCE_ASSETS, WORLD_ASSETS } from "@/lib/worlds";
import { trpc } from "@/lib/trpc";
import { BookOpen, ExternalLink, Leaf, LibraryBig } from "lucide-react";

export default function Knowledge() {
  const { locale, t } = useI18n();
  const articles = trpc.knowledge.listPublished.useQuery({ locale, limit: 20 }, { retry: false });
  return (
    <div className="reference-page reference-page--botany">
      <LiveSensorStrip compact />
      <ReferenceHero tone="botany" image={REFERENCE_ASSETS.botany} eyebrow={t("knowledge.eyebrow")} title={t("knowledge.title")} subtitle={locale === "de" ? "Fakten vor Vermutungen." : "Facts before assumptions."} icon={BookOpen} />
      {articles.isLoading ? <StatePanel code="KNOWLEDGE/CONNECT" state="loading" title={t("common.loading")} body={t("home.truth.body")} /> : articles.isError ? <StatePanel code="KNOWLEDGE/ERROR" state="error" title={t("common.error")} body={locale === "de" ? "Veröffentlichte Quellenbeiträge konnten nicht geladen werden. Es werden keine Ersatzartikel angezeigt." : "Published source-backed entries could not be loaded. No replacement articles are shown."} /> : !articles.data?.length ? <ReferenceEmptyState tone="botany" code="WISSEN / EMPTY" title={locale === "de" ? "NOCH KEINE VERÖFFENTLICHTEN EINTRÄGE" : "NO PUBLISHED ENTRIES YET"} body={locale === "de" ? "Quellenbelegte Naturwissen-Beiträge erscheinen hier." : "Source-backed nature knowledge entries will appear here."} /> : <div className="knowledge-grid">{articles.data.map(article => <article key={article.id} className="knowledge-card glass-panel"><span className="evidence-chip">{article.evidenceState}</span><h2>{article.title}</h2><p>{article.excerpt}</p><div className="source-list">{article.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label}<ExternalLink size={12} /></a>)}</div></article>)}</div>}
      <ReferenceActionGrid tone="botany" heading="WISSEN" actions={[
        { title: "Quellen", note: "Veröffentlichte Nachweise erscheinen oben", icon: LibraryBig, image: REFERENCE_ASSETS.botany, unavailable: true },
        { title: "Naturwissen", note: "Neue Beiträge erscheinen oben", icon: Leaf, image: WORLD_ASSETS.terrarium, unavailable: true },
      ]} />
    </div>
  );
}
