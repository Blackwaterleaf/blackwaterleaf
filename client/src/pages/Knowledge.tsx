import { Seo } from "@/components/Seo";
import { Link } from "wouter";
import { useState } from "react";
import { BookOpen, Clock, Eye, Star, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";

const CATEGORIES = [
  { value: "all",        label: "Alle" },
  { value: "aquaristik", label: "Aquaristik" },
  { value: "aquascaping",label: "Aquascaping" },
  { value: "channa",     label: "Channa" },
  { value: "blackwater", label: "Schwarzwasser" },
  { value: "houseplants",label: "Alocasia" },
  { value: "basics",     label: "Grundlagen" },
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

function ArticleCard({ article, featured = false }: { article: any; featured?: boolean }) {
  const cover = article.coverImageUrl || CAT_FALLBACK[article.category] || "/manus-storage/wissen-pflege_9290790e.png";

  if (featured) {
    return (
      <Link href={`/knowledge/${article.slug}`}>
        <article
          className="relative overflow-hidden rounded-2xl cursor-pointer group transition-all duration-300"
          style={{
            background: "oklch(0.12 0.008 200)",
            border: "1px solid oklch(0.20 0.008 200)",
            minHeight: "360px",
          }}
        >
          <div className="absolute inset-0">
            <img
              src={cover}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              style={{ filter: "brightness(0.40) saturate(1.1)" }}
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, oklch(0.08 0.008 200) 0%, oklch(0.08 0.008 200 / 0.6) 50%, transparent 100%)" }}
            />
          </div>

          <div className="relative z-10 flex flex-col justify-end h-full p-6 pt-24">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="px-2.5 py-1 rounded-lg text-xs font-medium"
                style={{ background: "oklch(0.52 0.14 148 / 0.20)", color: "oklch(0.65 0.16 148)", border: "1px solid oklch(0.52 0.14 148 / 0.30)" }}
              >
                {CATEGORY_LABELS[article.category] ?? article.category}
              </span>
              {article.isFeatured && (
                <span
                  className="px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1"
                  style={{ background: "oklch(0.72 0.14 78 / 0.15)", color: "oklch(0.78 0.14 78)", border: "1px solid oklch(0.72 0.14 78 / 0.25)" }}
                >
                  <Star className="w-3 h-3 fill-current" /> Empfohlen
                </span>
              )}
            </div>
            <h2
              className="font-display text-2xl font-bold leading-tight mb-2"
              style={{ color: "oklch(0.95 0.005 200)" }}
            >
              {article.title}
            </h2>
            <p className="text-sm leading-relaxed line-clamp-3 mb-4" style={{ color: "oklch(0.75 0.008 200)" }}>
              {article.excerpt}
            </p>
            <div className="flex items-center gap-4 text-xs" style={{ color: "oklch(0.55 0.008 200)" }}>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.readingMinutes} Min.</span>
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {article.viewsCount}</span>
              <span className="ml-auto flex items-center gap-1 text-green-400"><ChevronRight className="w-4 h-4" /></span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/knowledge/${article.slug}`}>
      <article
        className="overflow-hidden rounded-2xl cursor-pointer group transition-all duration-200"
        style={{
          background: "oklch(0.12 0.008 200)",
          border: "1px solid oklch(0.20 0.008 200)",
        }}
      >
        <div className="relative overflow-hidden" style={{ height: "180px" }}>
          <img
            src={cover}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            style={{ filter: "brightness(0.55) saturate(1.1)" }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-16"
            style={{ background: "linear-gradient(to top, oklch(0.12 0.008 200), transparent)" }}
          />
          <div className="absolute top-3 left-3">
            <span
              className="px-2 py-0.5 rounded-lg text-xs font-medium"
              style={{ background: "oklch(0.08 0.008 200 / 0.85)", color: "oklch(0.65 0.16 148)", border: "1px solid oklch(0.52 0.14 148 / 0.25)" }}
            >
              {CATEGORY_LABELS[article.category] ?? article.category}
            </span>
          </div>
        </div>

        <div className="p-4">
          <h3
            className="font-display text-base font-semibold leading-snug mb-1.5 line-clamp-2"
            style={{ color: "oklch(0.92 0.005 200)" }}
          >
            {article.title}
          </h3>
          <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: "oklch(0.55 0.008 200)" }}>
            {article.excerpt}
          </p>
          <div className="flex items-center gap-3 text-xs" style={{ color: "oklch(0.42 0.008 200)" }}>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.readingMinutes} Min.</span>
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {article.viewsCount}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function Knowledge() {
  const [filter, setFilter] = useState<string>("all");
  const [genusFilter, setGenusFilter] = useState<string>("");

  const { data, isLoading } = trpc.knowledge.list.useQuery({
    category: filter !== "all" ? (filter as any) : undefined,
    genus: genusFilter || undefined,
    limit: 50,
  });

  const { data: genera } = trpc.knowledge.genera.useQuery({
    category: filter === "houseplants" ? "houseplants" : undefined,
  });

  const featured = data?.filter(a => a.isFeatured) ?? [];
  const regular  = data?.filter(a => !a.isFeatured) ?? [];

  const handleCategoryChange = (cat: string) => {
    setFilter(cat);
    setGenusFilter("");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 lg:pb-8">
      <Seo
        title="Wissensdatenbank – Aquaristik, Channa & Pflanzen"
        path="/knowledge"
        description="Die BlackwaterLeaf Wissensdatenbank: fundierte Ratgeber zu Aquaristik, Aquascaping, Schwarzwasser-Biotopen, Channa-Arten und Zimmerpflanzen – auf Deutsch, von der Community."
      />

      <div className="mb-8">
        <h1
          className="font-brand text-4xl leading-none mb-1"
          style={{ color: "oklch(0.95 0.005 200)", letterSpacing: "0.04em" }}
        >
          WISSENSDATENBANK
        </h1>
        <p className="text-sm" style={{ color: "oklch(0.50 0.008 200)" }}>
          Kuratierte Ratgeber zu Aquaristik, Aquascaping, Channa-Haltung, Schwarzwasser-Biotopen und Zimmerpflanzen.
        </p>
      </div>

      <div className="flex gap-1.5 mb-8 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
        {CATEGORIES.map((cat) => {
          const isActive = filter === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => handleCategoryChange(cat.value)}
              className="flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-150 active:scale-95"
              style={{
                background: isActive ? "oklch(0.52 0.14 148 / 0.15)" : "oklch(0.14 0.008 200)",
                color: isActive ? "oklch(0.65 0.16 148)" : "oklch(0.50 0.008 200)",
                border: isActive ? "1px solid oklch(0.52 0.14 148 / 0.30)" : "1px solid oklch(0.20 0.008 200)",
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {filter === "houseplants" && genera && genera.length > 0 && (
        <div className="mb-8">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setGenusFilter("")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 active:scale-95"
              style={{
                background: !genusFilter ? "oklch(0.52 0.14 148 / 0.20)" : "oklch(0.14 0.008 200)",
                color: !genusFilter ? "oklch(0.65 0.16 148)" : "oklch(0.50 0.008 200)",
                border: !genusFilter ? "1px solid oklch(0.52 0.14 148 / 0.30)" : "1px solid oklch(0.20 0.008 200)",
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
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 active:scale-95"
                  style={{
                    background: genusFilter === g.genus ? "oklch(0.52 0.14 148 / 0.20)" : "oklch(0.14 0.008 200)",
                    color: genusFilter === g.genus ? "oklch(0.65 0.16 148)" : "oklch(0.50 0.008 200)",
                    border: genusFilter === g.genus ? "1px solid oklch(0.52 0.14 148 / 0.30)" : "1px solid oklch(0.20 0.008 200)",
                  }}
                >
                  {thumb && (
                    <img
                      src={thumb}
                      alt={g.genus}
                      className="w-6 h-6 rounded object-cover flex-shrink-0"
                    />
                  )}
                  <span>{g.genus} ({g.count})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {featured.length > 0 && (
        <div className="mb-12">
          <h2
            className="font-display text-lg font-semibold mb-4"
            style={{ color: "oklch(0.92 0.005 200)" }}
          >
            Empfohlene Artikel
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {featured.map((article) => (
              <ArticleCard key={article.id} article={article} featured={true} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2
          className="font-display text-lg font-semibold mb-4"
          style={{ color: "oklch(0.92 0.005 200)" }}
        >
          Alle Artikel
        </h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden" style={{ background: "oklch(0.12 0.008 200)" }}>
                <Skeleton className="w-full h-48" />
              </div>
            ))}
          </div>
        ) : regular.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {regular.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div
            className="text-center py-12 rounded-2xl"
            style={{ background: "oklch(0.12 0.008 200)", border: "1px solid oklch(0.20 0.008 200)" }}
          >
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p style={{ color: "oklch(0.50 0.008 200)" }}>
              Keine Artikel gefunden. Versuche einen anderen Filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
