import { StatePanel } from "@/components/StatePanel";
import { useI18n } from "@/i18n";
import { trpc } from "@/lib/trpc";
import { ExternalLink } from "lucide-react";

export default function Knowledge() {
  const { locale, t } = useI18n();
  const articles = trpc.knowledge.listPublished.useQuery({ locale, limit: 20 }, { retry: false });
  return (
    <div className="page-stack">
      <section className="page-hero bracket-panel">
        <p className="eyebrow">[{t("knowledge.eyebrow")}]</p>
        <h1 className="glitch-title" data-text={t("knowledge.title")}>{t("knowledge.title")}</h1>
      </section>
      {articles.isLoading ? <StatePanel code="KNOWLEDGE/CONNECT" state="loading" title={t("common.loading")} body={t("home.truth.body")} /> :
        articles.isError ? <StatePanel code="KNOWLEDGE/ERROR" state="error" title={t("common.error")} body={t("knowledge.empty")} /> :
        !articles.data?.length ? <StatePanel code="KNOWLEDGE/EMPTY" title={t("knowledge.empty")} body={t("home.truth.body")} /> :
        <div className="knowledge-grid">{articles.data.map(article => <article key={article.id} className="knowledge-card glass-panel"><span className="evidence-chip">{article.evidenceState}</span><h2>{article.title}</h2><p>{article.excerpt}</p><div className="source-list">{article.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label}<ExternalLink size={12} /></a>)}</div></article>)}</div>}
    </div>
  );
}
