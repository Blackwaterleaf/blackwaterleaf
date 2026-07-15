/**
 * BlackWaterLeaf – Skeleton Loading Components
 * Premium-Stil: dunkle Oberflächen, grüne Akzente, elegante Rundungen.
 * Optimiert für Cards, Listen und andere Inhaltstypen.
 * 
 * Verwendung:
 * <SkeletonCard />
 * <SkeletonArticleList count={3} />
 * <SkeletonSearchResults count={8} />
 */

import React from 'react';

/**
 * Basis-Skeleton-Komponente mit Pulsanimation
 */
function SkeletonBase({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-lg animate-pulse ${className}`}
      style={{
        backgroundColor: 'oklch(0.14 0.008 200)',
      }}
    />
  );
}

/**
 * Skeleton für eine einzelne Card (z.B. Pflanze, Aquarium)
 * Zeigt ein Bild, Titel und Metadaten an.
 */
export function SkeletonCard({ aspectRatio = 'square' }: { aspectRatio?: 'square' | 'video' }) {
  const aspectClass = aspectRatio === 'video' ? 'aspect-video' : 'aspect-square';

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: 'oklch(0.12 0.008 200)',
        border: '1px solid oklch(0.20 0.008 200)',
      }}
    >
      {/* Image Placeholder */}
      <div className={`w-full ${aspectClass} overflow-hidden`}>
        <SkeletonBase className="w-full h-full" />
      </div>

      {/* Content Placeholder */}
      <div className="p-3 space-y-2">
        <SkeletonBase className="h-3 w-3/4" />
        <SkeletonBase className="h-2.5 w-1/2" />
      </div>
    </div>
  );
}

/**
 * Skeleton für ein Artikel-Listenelement
 * Zeigt Avatar, Titel, Beschreibung und Metadaten an.
 */
export function SkeletonArticleItem() {
  return (
    <div
      className="rounded-2xl p-4 space-y-3"
      style={{
        backgroundColor: 'oklch(0.12 0.008 200)',
        border: '1px solid oklch(0.20 0.008 200)',
      }}
    >
      {/* Header mit Avatar */}
      <div className="flex items-center gap-3">
        <SkeletonBase className="w-10 h-10 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <SkeletonBase className="h-3 w-2/3" />
          <SkeletonBase className="h-2.5 w-1/2" />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <SkeletonBase className="h-3 w-full" />
        <SkeletonBase className="h-3 w-5/6" />
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 pt-2">
        <SkeletonBase className="h-2 w-16" />
        <SkeletonBase className="h-2 w-20" />
      </div>
    </div>
  );
}

/**
 * Skeleton für eine Artikel-Detailseite
 * Zeigt Titel, Metadaten und Inhaltsplatzhalter an.
 */
export function SkeletonArticleDetail() {
  return (
    <div className="space-y-6">
      {/* Category Badge */}
      <SkeletonBase className="h-6 w-24" />

      {/* Title */}
      <div className="space-y-2">
        <SkeletonBase className="h-8 w-full" />
        <SkeletonBase className="h-6 w-4/5" />
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-4 py-4 border-b border-border/40">
        <SkeletonBase className="h-4 w-24" />
        <SkeletonBase className="h-4 w-32" />
        <SkeletonBase className="h-4 w-20" />
      </div>

      {/* Cover Image */}
      <SkeletonBase className="w-full h-64 rounded-lg" />

      {/* Content Lines */}
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonBase
            key={i}
            className={`h-3 ${i === 3 || i === 7 ? 'w-4/5' : 'w-full'}`}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton für Suchergebnisse (Grid-Layout)
 * Zeigt mehrere Card-Platzhalter in einem Grid an.
 */
export function SkeletonSearchResults({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton für eine Artikel-Liste
 * Zeigt mehrere Artikel-Listenelement-Platzhalter an.
 */
export function SkeletonArticleList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonArticleItem key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton für verwandte Artikel (Horizontal-Scroll oder Grid)
 * Zeigt mehrere kleine Card-Platzhalter an.
 */
export function SkeletonRelatedArticles({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} aspectRatio="square" />
      ))}
    </div>
  );
}

/**
 * Skeleton für Suchfeld und Filter
 * Zeigt einen Suchfeld-Platzhalter mit Filter-Buttons an.
 */
export function SkeletonSearchBar() {
  return (
    <div className="space-y-4">
      {/* Search Input */}
      <SkeletonBase className="w-full h-10 rounded-xl" />

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBase key={i} className="h-8 w-20 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default {
  SkeletonCard,
  SkeletonArticleItem,
  SkeletonArticleDetail,
  SkeletonSearchResults,
  SkeletonArticleList,
  SkeletonRelatedArticles,
  SkeletonSearchBar,
};
