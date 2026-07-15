import { Seo } from "@/components/Seo";
import { Link } from "wouter";
import { useState } from "react";
import { Search, Clock, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";

const CATEGORIES = [
  { value: "all",         label: "Alle" },
  { value: "channa",      label: "Channa" },
  { value: "blackwater",  label: "Schwarzwasser" },
  { value: "houseplants", label: "Alocasia" },
  { value: "aquaristik",  label: "Aquaristik" },
  { value: "aquascaping", label: "Aquascaping" },
  { value: "basics",      label: "Grundlagen" },
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  aquaristik:  "Aquaristik",
  aquascaping: "Aquascaping",
  channa:      "Channa",
  blackwater:  "Schwarzwasser",
  houseplants: "Alocasia",
  basics:      "Grundlagen",
};

const CAT_FALLBACK: Record<string, string> = {
  channa:      "/manus-storage/channa-tank_aeefb736.webp",
  aquaristik:  "/manus-storage/hero-main_962b134d.png",
  aquascaping: "/manus-storage/hero-main_962b134d.png",
  blackwater:  "/manus-storage/channa-tank_aeefb736.webp",
  houseplants: "/manus-storage/plants-golden_070e92ad.png",
  basics:      "/manus-storage/wissen-pflege_9290790e.png",
};

const GENUS_THUMBNAILS: Record<string, string> = {
  Alocasia: "https://d2xsxph8kpxj0f.cloudfront.net/310519663774770417/TfjmvQ7wVry254EgfLy7em/alocasia-thumb-hg3jyApW9NREHSfRXn3mpm.webp",
  Monstera: "https://d2xsxph8kpxj0f.cloudfront.net/310519663774770417/TfjmvQ7wVry254EgfLy7em/monstera-thumb-neZsVTTJC5fa8y3FgNTuME.webp",
  Philodendron: "https://d2xsxph8kpxj0f.cloudfront.net/310519663774770417/TfjmvQ7wVry254EgfLy7em/philodendron-thumb-HKGFSfUTi6sJpSPYDtjcrj.webp",
};

// Farb-Konstanten
const C = {
  bg: "oklch(0.10 0.008 200)",
  card: "oklch(0.11 0.008 200)",
  cardBorder: "1px solid oklch(0.21 0.008 200)",
  green: "oklch(0.52 0.14 148)",
  greenLight: "oklch(0.65 0.16 148)",
  greenBg: "oklch(0.52 0.14 148 / 0.15)",
  textPrimary: "oklch(0.95 0.005 200)",
  textSecondary: "oklch(0.70 0.005 200)",
  textMuted: "oklch(0.48 0.008 200)",
};

function ArticleCard({ article }: { article: any }) {
  const cover = article.coverImageUrl || CAT_FALLBACK[article.category] || "/manus-storage/wissen-pflege_9290790e.png";

  return (
    <Link href={`/knowledge/${article.slug}`}>
      <article
        className="overflow-hidden rounded-2xl cursor-pointer transition-all duration-200"
        style={{ background: C.card, border: C.cardBorder }}
      >
        {/* Foto-Bereich */}
        <div className="relative overflow-hidden" style={{ height: 200 }}>
          <img
            src={cover}
            alt={article.title}
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.50) saturate(1.1)" }}
            loading="lazy"
          />
          {/* Gradient unten */}
          <div
            className="absolute bottom-0 left-0 right-0 h-20"
            style={{ background: `linear-gradient(to top, ${C.card}, transparent)` }}
          />
          {/* Kategorie-Badge oben links */}
          <div className="absolute top-3 left-3">
            <span
              className="px-2.5 py-1 rounded-lg text-xs font-medium"
              style={{
                background: "oklch(0.08 0.008 200 / 0.85)",
                color: C.greenLight,
                border: "1px solid oklch(0.52 0.14 148 / 0.30)",
              }}
            >
              {CATEGORY_LABELS[article.category] ?? article.category}
            </span>
          </div>
        </div>

        {/* Text-Bereich */}
        <div className="p-4">
          <h3
            className="font-brand text-lg font-bold leading-snug mb-2 line-clamp-2"
            style={{ color: C.textPrimary }}
          >
            {article.title}
          </h3>
          <p className="text-sm leading-relaxed line-clamp-2 mb-3" style={{ color: C.textSecondary }}>
            {article.excerpt}
          </p>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs" style={{ color: C.textMuted }}>
              <Clock className="w-3.5 h-3.5" />
              {article.readingMinutes} Min. Lesezeit
            </span>
            <span className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: C.greenLight }}>
              Lesen <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function Knowledge() {
  const [filter, setFilter] = useState<string>("all");
  const [genusFilter, setGenusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = trpc.knowledge.list.useQuery({
    category: filter !== "all" ? (filter as any) : undefined,
    genus: genusFilter || undefined,
    limit: 50,
  });

  const { data: genera } = trpc.knowledge.genera.useQuery({
    category: filter === "houseplants" ? "houseplants" : undefined,
  });

  const handleCategoryChange = (cat: string) => {
    setFilter(cat);
    setGenusFilter("");
  };

  // Client-seitige Suche
  const filtered = data?.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      a.excerpt?.toLowerCase().includes(q) ||
      (CATEGORY_LABELS[a.category] ?? a.category).toLowerCase().includes(q)
    );
  }) ?? [];

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <Seo
        title="Wissensdatenbank – Aquaristik, Channa & Pflanzen"
        path="/knowledge"
        description="Die BlackwaterLeaf Wissensdatenbank: fundierte Ratgeber zu Aquaristik, Aquascaping, Schwarzwasser-Biotopen, Channa-Arten und Zimmerpflanzen."
      />

      {/* Header */}
      <div className="px-4 pt-4 pb-5">
        <h1
          className="font-brand leading-none mb-2"
          style={{
            fontSize: "clamp(2.4rem, 10vw, 3.5rem)",
            color: C.textPrimary,
            letterSpacing: "0.02em",
            lineHeight: 1.0,
          }}
        >
          WISSENSDATEN<br />BANK
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: C.textSecondary }}>
          Kuratierte Ratgeber zu Aquaristik, Aquascaping, Channa-Haltung, Schwarzwasser-Biotopen und Zimmerpflanzen.
        </p>
      </div>

      {/* Suchfeld */}
      <div className="px-4 pb-4">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: C.textMuted }}
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Im Wissen suchen..."
            className="w-full pl-11 pr-4 py-3.5 rounded-full text-sm outline-none transition-all duration-150"
            style={{
              background: "oklch(0.16 0.008 200)",
              border: "1px solid oklch(0.22 0.008 200)",
              color: C.textPrimary,
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "oklch(0.52 0.14 148 / 0.50)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "oklch(0.22 0.008 200)")}
          />
        </div>
      </div>

      {/* Kategorie-Filter (scrollbare Pills wie in Native App) */}
      <div className="px-4 pb-5">
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          {CATEGORIES.map((cat) => {
            const isActive = filter === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 active:scale-95"
                style={{
                  background: isActive ? "transparent" : "oklch(0.16 0.008 200)",
                  color: isActive ? C.greenLight : C.textSecondary,
                  border: isActive
                    ? `2px solid ${C.greenLight}`
                    : "2px solid oklch(0.22 0.008 200)",
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Genus-Filter (nur bei houseplants) */}
      {filter === "houseplants" && genera && genera.length > 0 && (
        <div className="px-4 pb-5">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setGenusFilter("")}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 active:scale-95"
              style={{
                background: !genusFilter ? C.greenBg : "oklch(0.16 0.008 200)",
                color: !genusFilter ? C.greenLight : C.textSecondary,
                border: !genusFilter ? `1px solid oklch(0.52 0.14 148 / 0.40)` : "1px solid oklch(0.22 0.008 200)",
              }}
            >
              Alle Arten ({data?.length ?? 0})
            </button>
            {genera.map((g) => {
              const thumb = GENUS_THUMBNAILS[g.genus as keyof typeof GENUS_THUMBNAILS];
              return (
                <button
                  key={g.genus}
                  onClick={() => setGenusFilter(g.genus)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-150 active:scale-95"
                  style={{
                    background: genusFilter === g.genus ? C.greenBg : "oklch(0.16 0.008 200)",
                    color: genusFilter === g.genus ? C.greenLight : C.textSecondary,
                    border: genusFilter === g.genus ? `1px solid oklch(0.52 0.14 148 / 0.40)` : "1px solid oklch(0.22 0.008 200)",
                  }}
                >
                  {thumb && (
                    <img src={thumb} alt={g.genus} className="w-5 h-5 rounded object-cover flex-shrink-0" />
                  )}
                  <span>{g.genus} ({g.count})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Artikel-Liste */}
      <div className="px-4 pb-8">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden" style={{ background: C.card }}>
                <Skeleton className="w-full h-48" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div
            className="text-center py-16 rounded-2xl"
            style={{ background: C.card, border: C.cardBorder }}
          >
            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium" style={{ color: C.textPrimary }}>Keine Artikel gefunden</p>
            <p className="text-sm mt-1" style={{ color: C.textMuted }}>Versuche einen anderen Filter oder Suchbegriff</p>
          </div>
        )}
      </div>
    </div>
  );
}
