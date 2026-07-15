import { Link } from "wouter";
import { useState } from "react";
import { Search, Clock, ChevronRight, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { SeoEnhanced } from "@/components/SeoEnhanced";

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

// ─── Premium Design Tokens (identisch mit Discover.tsx) ─────────
const C = {
  bg:          "#070A08",
  card:        "rgba(13, 17, 14, 0.90)",
  cardSolid:   "#0D110E",
  glassBorder: "rgba(45, 107, 63, 0.30)",
  smaragd:     "#2D9B6E",
  mint:        "#34D399",
  gold:        "#D4AF37",
  white:       "#FFFFFF",
  white70:     "rgba(255,255,255,0.70)",
  white50:     "rgba(255,255,255,0.50)",
  slate:       "#94A3B8",
};

function ArticleCard({ article }: { article: any }) {
  const cover = article.coverImageUrl || CAT_FALLBACK[article.category] || "/manus-storage/wissen-pflege_9290790e.png";

  return (
    <Link href={`/knowledge/${article.slug}`}>
      <article
        className="overflow-hidden rounded-2xl cursor-pointer transition-all duration-200 active:scale-[0.98]"
        style={{
          background: C.card,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: `1px solid ${C.glassBorder}`,
          boxShadow: "0 4px 24px rgba(0,0,0,0.50)",
        }}
      >
        {/* Foto-Bereich */}
        <div className="relative overflow-hidden" style={{ height: 200 }}>
          <img
            src={cover}
            alt={article.title}
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.55) saturate(1.15)" }}
            loading="lazy"
          />
          {/* Gradient unten */}
          <div
            className="absolute bottom-0 left-0 right-0 h-24"
            style={{ background: `linear-gradient(to top, ${C.cardSolid}, transparent)` }}
          />
          {/* Kategorie-Badge oben links */}
          <div className="absolute top-3 left-3">
            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{
                background: "rgba(7,10,8,0.80)",
                color: C.mint,
                border: `1px solid rgba(52,211,153,0.30)`,
                backdropFilter: "blur(8px)",
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
            style={{ color: C.white, letterSpacing: "0.02em" }}
          >
            {article.title}
          </h3>
          <p className="text-sm leading-relaxed line-clamp-2 mb-3" style={{ color: C.white70 }}>
            {article.excerpt}
          </p>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs" style={{ color: C.white50 }}>
              <Clock className="w-3.5 h-3.5" />
              {article.readingMinutes} Min. Lesezeit
            </span>
            <span className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: C.smaragd }}>
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
      <SeoEnhanced
        title="Wissensdatenbank – Aquaristik, Channa & Botanik"
        path="/knowledge"
        description="Die BlackwaterLeaf Wissensdatenbank: fundierte Ratgeber zu Aquaristik, Aquascaping, Schwarzwasser-Biotopen, Channa-Arten und Zimmerpflanzen."
        keywords={["Aquaristik", "Channa", "Aquascaping", "Schwarzwasser", "Botanik"]}
      />

      {/* ── PREMIUM HERO HEADER ─────────────────────────────── */}
      <div
        className="relative overflow-hidden px-4 pt-6 pb-8"
        style={{
          background: "linear-gradient(160deg, rgba(13,25,18,1) 0%, rgba(7,10,8,1) 100%)",
        }}
      >
        {/* Hintergrund-Glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 70% 80% at 85% 20%, rgba(45,155,110,0.18) 0%, transparent 60%), radial-gradient(ellipse 40% 50% at 15% 90%, rgba(212,175,55,0.08) 0%, transparent 55%)",
          }}
        />
        {/* Trennlinie unten */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.30), transparent)" }}
        />

        <div className="flex items-center gap-2 mb-3 relative">
          <BookOpen className="w-4 h-4" style={{ color: C.gold }} />
          <p
            className="text-xs font-bold uppercase"
            style={{ color: C.gold, letterSpacing: "0.18em" }}
          >
            WISSEN
          </p>
        </div>
        <h1
          className="font-brand leading-none mb-3 relative"
          style={{
            fontSize: "clamp(2.4rem, 10vw, 3.5rem)",
            color: C.white,
            letterSpacing: "0.02em",
            lineHeight: 1.0,
          }}
        >
          WISSENS<br />DATENBANK
        </h1>
        <p className="text-sm leading-relaxed relative" style={{ color: C.white70, maxWidth: 380 }}>
          Kuratierte Ratgeber zu Aquaristik, Aquascaping, Channa-Haltung, Schwarzwasser-Biotopen und Zimmerpflanzen.
        </p>
      </div>

      {/* ── SUCHFELD ────────────────────────────────────────────── */}
      <div className="px-4 pb-4">
        <div
          className="relative rounded-full overflow-hidden"
          style={{
            background: "rgba(13,17,14,0.90)",
            border: `1px solid ${C.glassBorder}`,
            backdropFilter: "blur(12px)",
          }}
        >
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: C.white50 }}
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Im Wissen suchen..."
            className="w-full pl-11 pr-4 py-3.5 text-sm outline-none bg-transparent"
            style={{ color: C.white }}
            onFocus={(e) => {
              (e.currentTarget.parentElement as HTMLElement).style.borderColor = `rgba(45,155,110,0.60)`;
              (e.currentTarget.parentElement as HTMLElement).style.boxShadow = `0 0 16px rgba(45,155,110,0.15)`;
            }}
            onBlur={(e) => {
              (e.currentTarget.parentElement as HTMLElement).style.borderColor = C.glassBorder;
              (e.currentTarget.parentElement as HTMLElement).style.boxShadow = "none";
            }}
          />
        </div>
      </div>

      {/* ── KATEGORIE-FILTER (scrollbare Pills) ─────────────────── */}
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
                  background: isActive ? C.smaragd : "rgba(13,17,14,0.85)",
                  color: isActive ? C.white : C.white70,
                  border: isActive
                    ? `1px solid ${C.smaragd}`
                    : `1px solid ${C.glassBorder}`,
                  backdropFilter: "blur(8px)",
                  boxShadow: isActive ? `0 0 12px rgba(45,155,110,0.30)` : "none",
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── GENUS-FILTER (nur bei houseplants) ──────────────────── */}
      {filter === "houseplants" && genera && genera.length > 0 && (
        <div className="px-4 pb-5">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setGenusFilter("")}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 active:scale-95"
              style={{
                background: !genusFilter ? "rgba(45,155,110,0.20)" : "rgba(13,17,14,0.85)",
                color: !genusFilter ? C.mint : C.white70,
                border: !genusFilter ? `1px solid rgba(52,211,153,0.40)` : `1px solid ${C.glassBorder}`,
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
                    background: genusFilter === g.genus ? "rgba(45,155,110,0.20)" : "rgba(13,17,14,0.85)",
                    color: genusFilter === g.genus ? C.mint : C.white70,
                    border: genusFilter === g.genus ? `1px solid rgba(52,211,153,0.40)` : `1px solid ${C.glassBorder}`,
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

      {/* ── ARTIKEL-LISTE ────────────────────────────────────────── */}
      <div className="px-4 pb-8">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden"
                style={{ background: C.card, border: `1px solid ${C.glassBorder}` }}
              >
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
            style={{
              background: C.card,
              border: `1px solid ${C.glassBorder}`,
              backdropFilter: "blur(12px)",
            }}
          >
            <BookOpen className="w-10 h-10 mx-auto mb-3" style={{ color: C.white50 }} />
            <p className="font-semibold" style={{ color: C.white }}>Keine Artikel gefunden</p>
            <p className="text-sm mt-1" style={{ color: C.white50 }}>Versuche einen anderen Filter oder Suchbegriff</p>
          </div>
        )}
      </div>
    </div>
  );
}
