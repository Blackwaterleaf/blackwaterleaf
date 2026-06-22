import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { useState } from "react";
import { BookOpen, Clock, Star, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = [
  { value: "all", label: "Alle" },
  { value: "aquaristik", label: "Aquaristik" },
  { value: "aquascaping", label: "Aquascaping" },
  { value: "channa", label: "Channa" },
  { value: "blackwater", label: "Schwarzwasser" },
  { value: "houseplants", label: "Zimmerpflanzen" },
  { value: "basics", label: "Grundlagen" },
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  aquaristik: "Aquaristik",
  aquascaping: "Aquascaping",
  channa: "Channa",
  blackwater: "Schwarzwasser",
  houseplants: "Zimmerpflanzen",
  basics: "Grundlagen",
};

export default function Knowledge() {
  const [filter, setFilter] = useState<string>("all");
  const { data, isLoading } = trpc.knowledge.list.useQuery({
    category: filter !== "all" ? (filter as any) : undefined,
    limit: 50,
  });

  return (
    <div className="container py-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-semibold flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          Wissensdatenbank
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kuratierte Ratgeber zu Aquaristik, Aquascaping, Channa-Haltung, Schwarzwasser-Biotopen und Zimmerpflanzen.
        </p>
      </div>

      <div className="flex gap-1 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setFilter(cat.value)}
            className={cn(
              "flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 press-active",
              filter === cat.value
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card border border-border/50 rounded-xl p-5 space-y-3">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          ))
        ) : data && data.length > 0 ? (
          data.map((article) => (
            <Link key={article.id} href={`/knowledge/${article.slug}`}>
              <article className="bg-card border border-border/50 rounded-xl p-5 hover-card cursor-pointer animate-fade-in">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/10">
                    {CATEGORY_LABELS[article.category] ?? article.category}
                  </Badge>
                  {article.isFeatured && (
                    <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-400 bg-amber-500/10">
                      <Star className="w-3 h-3 mr-1 fill-current" /> Empfohlen
                    </Badge>
                  )}
                </div>
                <h2 className="text-lg font-display font-semibold leading-snug">{article.title}</h2>
                <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{article.excerpt}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {article.readingMinutes} Min.</span>
                  <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {article.viewsCount}</span>
                  <span className="ml-auto">{article.author}</span>
                </div>
              </article>
            </Link>
          ))
        ) : (
          <div className="text-center py-16">
            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium">Noch keine Artikel</p>
            <p className="text-sm text-muted-foreground">In dieser Kategorie sind noch keine Beiträge verfügbar.</p>
          </div>
        )}
      </div>
    </div>
  );
}
