import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { ArrowLeft, Clock, Eye, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Streamdown } from "streamdown";
import { SeoEnhanced } from "@/components/SeoEnhanced";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedArticles } from "@/components/RelatedArticles";
import { SkeletonArticleDetail } from "@/components/SkeletonLoader";

const CATEGORY_LABELS: Record<string, string> = {
  aquaristik: "Aquaristik",
  aquascaping: "Aquascaping",
  channa: "Channa",
  blackwater: "Schwarzwasser",
  houseplants: "Zimmerpflanzen",
  basics: "Grundlagen",
};

export default function KnowledgeArticle({ slug }: { slug: string }) {
  const { data: article, isLoading } = trpc.knowledge.get.useQuery({ slug });
  const { data: allArticles } = trpc.knowledge.list.useQuery({ limit: 20 });

  const metaDescription = article
    ? (article.excerpt && article.excerpt.trim().length > 0
        ? article.excerpt
        : `${article.title} – Ratgeber & Wissen rund um Aquaristik, Channa, Aquascaping und Pflanzen bei BlackwaterLeaf.`
      ).slice(0, 160)
    : undefined;

  const categoryLabel = article ? (CATEGORY_LABELS[article.category] ?? article.category) : undefined;

  return (
    <div className="container py-6 max-w-3xl mx-auto">
      {article && (
        <SeoEnhanced
          title={article.title}
          description={metaDescription}
          path={`/knowledge/${slug}`}
          type="article"
          image={article.coverImageUrl || undefined}
          author={article.author || "BlackwaterLeaf"}
          breadcrumbs={[
            { label: "Wissensdatenbank", url: "https://blackwaterleaf.com/knowledge" },
            ...(categoryLabel
              ? [{ label: categoryLabel, url: `https://blackwaterleaf.com/knowledge?category=${article.category}` }]
              : []),
            { label: article.title },
          ]}
          article={{
            headline: article.title,
            author: article.author || "BlackwaterLeaf",
            description: metaDescription,
            datePublished: article.createdAt ? new Date(article.createdAt).toISOString() : undefined,
            dateModified: article.updatedAt ? new Date(article.updatedAt).toISOString() : undefined,
          }}
        />
      )}

      <Link href="/knowledge">
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5 press-active">
          <ArrowLeft className="w-4 h-4" /> Zurück zur Wissensdatenbank
        </button>
      </Link>

      {isLoading ? (
        <SkeletonArticleDetail />
      ) : article ? (
        <>
          {/* Breadcrumb Navigation */}
          <Breadcrumb
            items={[
              { label: "Wissensdatenbank", href: "/knowledge" },
              ...(categoryLabel
                ? [{ label: categoryLabel, href: `/knowledge?category=${article.category}` }]
                : []),
              { label: article.title },
            ]}
          />

          <article className="animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/10">
                {categoryLabel}
              </Badge>
            </div>
            <h1 className="text-3xl font-display font-semibold leading-tight">{article.title}</h1>
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground border-b border-border/40 pb-5">
              <span>{article.author}</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {article.readingMinutes} Min. Lesezeit</span>
              <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {article.viewsCount}</span>
            </div>
            {article.coverImageUrl && (
              <div className="mt-6 rounded-xl overflow-hidden">
                <img
                  src={article.coverImageUrl}
                  alt={article.title}
                  className="w-full h-64 object-cover"
                  loading="eager"
                />
              </div>
            )}
            <div className="prose prose-invert prose-sm sm:prose-base max-w-none mt-6 prose-headings:font-display prose-headings:font-semibold prose-a:text-primary prose-strong:text-foreground">
              <Streamdown>{article.content}</Streamdown>
            </div>
          </article>

          {/* Verwandte Artikel */}
          {allArticles && (
            <RelatedArticles
              currentArticleId={String(article.id)}
              currentCategory={article.category}
              articles={allArticles.map((a) => ({
                id: String(a.id),
                slug: a.slug,
                title: a.title,
                excerpt: a.excerpt || undefined,
                category: a.category,
                coverImageUrl: a.coverImageUrl || undefined,
                author: a.author || undefined,
                readingMinutes: a.readingMinutes || undefined,
              }))}
            />
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">Artikel nicht gefunden</p>
          <Link href="/knowledge">
            <button className="text-sm text-primary mt-2 press-active">Zur Übersicht</button>
          </Link>
        </div>
      )}
    </div>
  );
}
