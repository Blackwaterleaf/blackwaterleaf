import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { ArrowLeft, Clock, Eye, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Streamdown } from "streamdown";

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

  return (
    <div className="container py-6 max-w-3xl mx-auto">
      <Link href="/knowledge">
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5 press-active">
          <ArrowLeft className="w-4 h-4" /> Zurück zur Wissensdatenbank
        </button>
      </Link>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : article ? (
        <article className="animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/10">
              {CATEGORY_LABELS[article.category] ?? article.category}
            </Badge>
          </div>
          <h1 className="text-3xl font-display font-semibold leading-tight">{article.title}</h1>
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground border-b border-border/40 pb-5">
            <span>{article.author}</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {article.readingMinutes} Min. Lesezeit</span>
            <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {article.viewsCount}</span>
          </div>
          <div className="prose prose-invert prose-sm sm:prose-base max-w-none mt-6 prose-headings:font-display prose-headings:font-semibold prose-a:text-primary prose-strong:text-foreground">
            <Streamdown>{article.content}</Streamdown>
          </div>
        </article>
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
