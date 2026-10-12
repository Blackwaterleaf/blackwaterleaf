import { ObservatoryContextHeader, ObservatoryStateSurface } from "@/components/ObservatoryPrimitives";
import { StatePanel } from "@/components/StatePanel";
import { useI18n } from "@/i18n";
import { REFERENCE_ASSETS } from "@/lib/worlds";
import { trpc } from "@/lib/trpc";
import { BookOpen, ExternalLink } from "lucide-react";

export default function Knowledge() {
  const { locale, t } = useI18n();
  const articles = trpc.knowledge.listPublished.useQuery({ locale, limit: 20 }, { retry: false });

  return (
    <div className="observatory-route observatory-route--botany knowledge-page">
      <ObservatoryContextHeader
        tone="botany"
        image={REFERENCE_ASSETS.botany}
        eyebrow={t("knowledge.eyebrow")}
        title={t("knowledge.title")}
        subtitle={locale === "de" ? "Veröffentlichte Quellen und nachvollziehbare Evidenz." : "Published sources and traceable evidence."}
        icon={BookOpen}
        badge="QUELLENBASIERT"
      />
      {articles.isLoading ? <StatePanel code="KNOWLEDGE/CONNECT" state="loading" title={t("common.loading")} body={t("home.truth.body")} /> : null}
      {articles.isError ? <StatePanel code="KNOWLEDGE/ERROR" state="error" title={t("common.error")} body={locale === "de" ? "Veröffentlichte Quellenbeiträge konnten nicht geladen werden. Es werden keine Ersatzartikel angezeigt." : "Published source-backed entries could not be loaded. No replacement articles are shown."} /> : null}
      {!articles.isLoading && !articles.isError && !articles.data?.length ? <ObservatoryStateSurface tone="botany" code="WISSEN / EMPTY" title={locale === "de" ? "NOCH KEINE VERÖFFENTLICHTEN EINTRÄGE" : "NO PUBLISHED ENTRIES YET"} body={locale === "de" ? "Quellenbelegte Naturwissen-Beiträge erscheinen hier." : "Source-backed nature knowledge entries will appear here."} /> : null}
      {!articles.isLoading && !articles.isError && articles.data?.length ? <section className="observatory-data-panel knowledge-evidence-panel" aria-label="Veröffentlichte Wissenseinträge">
        <div className="observatory-data-panel__heading"><span className="eyebrow">VERÖFFENTLICHTE EVIDENZ</span><span className="observatory-count">{articles.data.length}</span></div>
        <div className="knowledge-evidence-list">{articles.data.map(article => <article key={article.id} className="knowledge-evidence-row">
          <span className="evidence-chip">{article.evidenceState}</span>
          <div><h2>{article.title}</h2><p>{article.excerpt}</p><div className="source-list">{article.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label}<ExternalLink size={12} /></a>)}</div></div>
        </article>)}</div>
      </section> : null}
    </div>
  );
}
