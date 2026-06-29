import { Helmet } from "react-helmet-async";

const SITE_URL = "https://blackwaterleaf.com";
const SITE_NAME = "BlackwaterLeaf";
const DEFAULT_IMAGE =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663777393348/6rZjy2rqpfJHZLWDaNJkik/splash-screen-DfCobq5hNV5TTFwzho64mj.png";
const DEFAULT_DESCRIPTION =
  "Die deutschsprachige Community-Plattform für Aquaristik, Aquascaping, Schwarzwasser-Biotope, Channa-Haltung und Zimmerpflanzen. Dokumentieren, lernen, austauschen – mit KI-Unterstützung.";

export interface SeoProps {
  /** Page-specific title. Will be suffixed with the brand name unless `fullTitle` is set. */
  title?: string;
  /** Use the title verbatim without appending the brand suffix. */
  fullTitle?: boolean;
  description?: string;
  /** Path beginning with "/" (e.g. "/knowledge/channa-andrao-artprofil"). */
  path?: string;
  image?: string;
  /** Open Graph type, defaults to "website". Use "article" for content pages. */
  type?: "website" | "article";
  /** Set to true to discourage indexing (e.g. private pages). */
  noindex?: boolean;
  /** Optional JSON-LD structured data object. */
  jsonLd?: Record<string, unknown>;
}

/**
 * Per-page SEO meta tags via react-helmet-async.
 * Sets title, description, canonical, Open Graph, Twitter Card and optional JSON-LD.
 */
export function Seo({
  title,
  fullTitle = false,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  image = DEFAULT_IMAGE,
  type = "website",
  noindex = false,
  jsonLd,
}: SeoProps) {
  const resolvedTitle = title
    ? fullTitle
      ? title
      : `${title} | ${SITE_NAME}`
    : `${SITE_NAME} – Aquaristik & Pflanzen`;

  const canonical = `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  return (
    <Helmet prioritizeSeoTags>
      <title>{resolvedTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta
        name="robots"
        content={
          noindex
            ? "noindex, nofollow"
            : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        }
      />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="de_DE" />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}

export default Seo;
