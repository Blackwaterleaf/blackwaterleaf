/**
 * BlackWaterLeaf – Enhanced SEO Component
 * Erweiterte SEO-Funktionalität mit mehreren JSON-LD Schemata und erweiterten Metadaten.
 *
 * Features:
 * - Mehrere JSON-LD Objekte (z.B. Article + BreadcrumbList)
 * - Erweiterte strukturierte Daten (FAQPage, HowTo, etc.)
 * - Flexible Canonical-URL-Handhabung
 * - Verbesserte Open Graph und Twitter Card Tags
 * - Vollständige Suchmaschinen-Optimierung
 */

import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://blackwaterleaf.com';
const SITE_NAME = 'BlackwaterLeaf';
const DEFAULT_IMAGE =
  'https://d2xsxph8kpxj0f.cloudfront.net/310519663777393348/6rZjy2rqpfJHZLWDaNJkik/splash-screen-DfCobq5hNV5TTFwzho64mj.png';
const DEFAULT_DESCRIPTION =
  'Die deutschsprachige Community-Plattform für Aquaristik, Aquascaping, Schwarzwasser-Biotope, Channa-Haltung und Zimmerpflanzen. Dokumentieren, lernen, austauschen – mit KI-Unterstützung.';

export interface BreadcrumbItem {
  label: string;
  url?: string;
}

export interface ArticleMetadata {
  headline: string;
  author?: string | { name: string; url?: string };
  datePublished?: string;
  dateModified?: string;
  description?: string;
  wordCount?: number;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface HowToStep {
  name: string;
  description: string;
  image?: string;
}

export interface SeoEnhancedProps {
  /** Page-specific title. Will be suffixed with the brand name unless `fullTitle` is set. */
  title?: string;
  /** Use the title verbatim without appending the brand suffix. */
  fullTitle?: boolean;
  /** Meta description */
  description?: string;
  /** Path beginning with "/" (e.g. "/knowledge/channa-andrao-artprofil") */
  path?: string;
  /** Image URL for OG and Twitter */
  image?: string;
  /** Open Graph type, defaults to "website". Use "article" for content pages. */
  type?: 'website' | 'article';
  /** Set to true to discourage indexing (e.g. private pages). */
  noindex?: boolean;
  /** Breadcrumb navigation items for structured data */
  breadcrumbs?: BreadcrumbItem[];
  /** Article-specific metadata */
  article?: ArticleMetadata;
  /** FAQ items for FAQ schema */
  faqItems?: FAQItem[];
  /** How-to steps for HowTo schema */
  howToSteps?: HowToStep[];
  /** Custom canonical URL (overrides default) */
  canonicalUrl?: string;
  /** Additional keywords for SEO */
  keywords?: string[];
  /** Author name or organization */
  author?: string;
  /** Language code (default: de-DE) */
  language?: string;
}

function createBreadcrumbSchema(breadcrumbs: BreadcrumbItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.url ? { item: item.url } : {}),
    })),
  };
}

function createArticleSchema(
  title: string,
  metadata: ArticleMetadata,
  canonicalUrl: string,
  image?: string
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: metadata.headline || title,
    description: metadata.description,
    inLanguage: 'de-DE',
    image: image,
    author: metadata.author
      ? typeof metadata.author === 'string'
        ? { '@type': 'Person', name: metadata.author }
        : { '@type': 'Person', name: metadata.author.name, url: metadata.author.url }
      : { '@type': 'Organization', name: SITE_NAME },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: 'https://blackwaterleaf.com/manus-storage/bl-icon-512_f807c8a5.png',
      },
    },
    mainEntityOfPage: canonicalUrl,
    ...(metadata.datePublished ? { datePublished: metadata.datePublished } : {}),
    ...(metadata.dateModified ? { dateModified: metadata.dateModified } : {}),
    ...(metadata.wordCount ? { wordCount: metadata.wordCount } : {}),
  };
}

function createFAQSchema(faqItems: FAQItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

function createHowToSchema(
  title: string,
  steps: HowToStep[],
  image?: string
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: title,
    ...(image ? { image } : {}),
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.description,
      ...(step.image ? { image: step.image } : {}),
    })),
  };
}

export function SeoEnhanced({
  title,
  fullTitle = false,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  image = DEFAULT_IMAGE,
  type = 'website',
  noindex = false,
  breadcrumbs,
  article,
  faqItems,
  howToSteps,
  canonicalUrl,
  keywords = [],
  author,
  language = 'de-DE',
}: SeoEnhancedProps) {
  const resolvedTitle = title
    ? fullTitle
      ? title
      : `${title} | ${SITE_NAME}`
    : `${SITE_NAME} – Aquaristik & Pflanzen`;

  const canonical =
    canonicalUrl || `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  const jsonLdSchemas: Record<string, unknown>[] = [];

  if (breadcrumbs && breadcrumbs.length > 0) {
    jsonLdSchemas.push(createBreadcrumbSchema(breadcrumbs));
  }

  if (type === 'article' && article) {
    jsonLdSchemas.push(createArticleSchema(resolvedTitle, article, canonical, image));
  }

  if (faqItems && faqItems.length > 0) {
    jsonLdSchemas.push(createFAQSchema(faqItems));
  }

  if (howToSteps && howToSteps.length > 0) {
    jsonLdSchemas.push(createHowToSchema(title || 'Anleitung', howToSteps, image));
  }

  return (
    <Helmet prioritizeSeoTags>
      <title>{resolvedTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta
        name="robots"
        content={
          noindex
            ? 'noindex, nofollow'
            : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        }
      />
      <html lang={language.split('-')[0]} />
      <meta name="language" content={language} />
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      {author && <meta name="author" content={author} />}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={language.replace('-', '_')} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content={resolvedTitle} />
      {type === 'article' && article && (
        <>
          {article.datePublished && (
            <meta property="article:published_time" content={article.datePublished} />
          )}
          {article.dateModified && (
            <meta property="article:modified_time" content={article.dateModified} />
          )}
          {author && <meta property="article:author" content={author} />}
        </>
      )}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={resolvedTitle} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black" />
      {jsonLdSchemas.map((schema, index) => (
        <script key={`json-ld-${index}`} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}

export default SeoEnhanced;
