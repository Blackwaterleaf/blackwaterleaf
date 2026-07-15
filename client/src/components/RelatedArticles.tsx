/**
 * BlackWaterLeaf – Related Articles Component
 * Premium-Stil: dunkle Oberflächen, grüne Akzente, elegante Rundungen.
 *
 * Zeigt verwandte Artikel am Ende von Wissensartikeln an.
 */

import { useMemo } from 'react';
import { Link } from 'wouter';
import { BookOpen } from 'lucide-react';

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  category: string;
  coverImageUrl?: string;
  author?: string;
  readingMinutes?: number;
}

export interface RelatedArticlesProps {
  currentArticleId: string;
  currentCategory: string;
  articles: Article[];
  loading?: boolean;
  maxResults?: number;
  className?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  aquaristik: 'Aquaristik',
  aquascaping: 'Aquascaping',
  channa: 'Channa',
  blackwater: 'Schwarzwasser',
  houseplants: 'Zimmerpflanzen',
  basics: 'Grundlagen',
};

function calculateRelevanceScore(
  article: Article,
  currentCategory: string,
  currentArticleId: string
): number {
  if (article.id === currentArticleId) return -1;
  let score = 0;
  if (article.category === currentCategory) score += 100;
  if (article.coverImageUrl) score += 10;
  if (article.readingMinutes) score += 5;
  return score;
}

export function RelatedArticles({
  currentArticleId,
  currentCategory,
  articles,
  loading = false,
  maxResults = 4,
  className = '',
}: RelatedArticlesProps) {
  const relatedArticles = useMemo(() => {
    return articles
      .map((article) => ({
        article,
        score: calculateRelevanceScore(article, currentCategory, currentArticleId),
      }))
      .filter(({ score }) => score >= 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(({ article }) => article);
  }, [articles, currentArticleId, currentCategory, maxResults]);

  if (loading) {
    return (
      <div className={`mt-12 pt-8 border-t border-border/40 ${className}`}>
        <h2
          className="text-xl font-display font-semibold mb-6 flex items-center gap-2"
          style={{ color: 'rgba(255,255,255,0.88)' }}
        >
          <BookOpen className="w-5 h-5" style={{ color: '#34D399' }} />
          Verwandte Artikel
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl overflow-hidden"
              style={{
                backgroundColor: '#0D110E',
                border: '1px solid rgba(45,107,63,0.30)',
              }}
            >
              <div
                className="w-full h-40 animate-pulse"
                style={{ backgroundColor: '#111614' }}
              />
              <div className="p-3 space-y-2">
                <div
                  className="h-3 w-3/4 rounded animate-pulse"
                  style={{ backgroundColor: '#111614' }}
                />
                <div
                  className="h-2.5 w-1/2 rounded animate-pulse"
                  style={{ backgroundColor: '#111614' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (relatedArticles.length === 0) {
    return null;
  }

  return (
    <div className={`mt-12 pt-8 border-t border-border/40 ${className}`}>
      <h2
        className="text-xl font-display font-semibold mb-6 flex items-center gap-2"
        style={{ color: 'rgba(255,255,255,0.88)' }}
      >
        <BookOpen className="w-5 h-5" style={{ color: '#34D399' }} />
        Verwandte Artikel
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {relatedArticles.map((article) => (
          <Link
            key={article.id}
            href={`/knowledge/${article.slug}`}
            className="group rounded-xl overflow-hidden transition-all duration-200 block"
            style={{
              backgroundColor: '#0D110E',
              border: '1px solid rgba(45,107,63,0.30)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor =
                'rgba(45,155,110,0.35)';
              (e.currentTarget as HTMLElement).style.backgroundColor =
                '#111614';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor =
                'rgba(45,107,63,0.30)';
              (e.currentTarget as HTMLElement).style.backgroundColor =
                '#0D110E';
            }}
          >
            {article.coverImageUrl ? (
              <div className="w-full h-40 overflow-hidden bg-gradient-to-br from-green-900 to-black">
                <img
                  src={article.coverImageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            ) : (
              <div
                className="w-full h-40 flex items-center justify-center"
                style={{ backgroundColor: '#111614' }}
              >
                <BookOpen
                  className="w-8 h-8"
                  style={{ color: 'rgba(45,107,63,0.35)' }}
                />
              </div>
            )}

            <div className="p-4 space-y-2">
              <span
                className="inline-block text-xs px-2 py-1 rounded-md font-medium"
                style={{
                  backgroundColor: 'rgba(45,155,110,0.15)',
                  color: '#34D399',
                  border: '1px solid rgba(45,155,110,0.25)',
                }}
              >
                {CATEGORY_LABELS[article.category] ?? article.category}
              </span>

              <h3
                className="text-sm font-semibold leading-tight line-clamp-2 transition-colors"
                style={{ color: 'rgba(255,255,255,0.88)' }}
              >
                {article.title}
              </h3>

              {article.excerpt && (
                <p
                  className="text-xs line-clamp-2"
                  style={{ color: 'rgba(255,255,255,0.45)' }}
                >
                  {article.excerpt}
                </p>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-border/20">
                {article.author && (
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.42)' }}>
                    {article.author}
                  </span>
                )}
                {article.readingMinutes && (
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.42)' }}>
                    {article.readingMinutes} Min.
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default RelatedArticles;
