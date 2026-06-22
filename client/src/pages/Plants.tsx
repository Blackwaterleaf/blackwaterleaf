import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { Leaf, Plus, Droplets, Sun, Thermometer } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORY_LABELS: Record<string, string> = {
  aquatic: "Wasserpflanze",
  tropical: "Tropisch",
  alocasia: "Alocasia",
  monstera: "Monstera",
  philodendron: "Philodendron",
  other: "Sonstiges",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: "Einsteiger",
  intermediate: "Fortgeschritten",
  expert: "Experte",
};

export default function Plants() {
  const { isAuthenticated } = useAuth();
  const { data: plants, isLoading } = trpc.plants.myList.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-semibold">Meine Pflanzen</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {plants?.length ?? 0} Pflanzen in deiner Sammlung
          </p>
        </div>
        {isAuthenticated && (
          <Button asChild size="sm" className="press-active">
            <Link href="/plants/new">
              <Plus className="w-4 h-4 mr-1.5" />
              Pflanze hinzufügen
            </Link>
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card border border-border/50 rounded-xl overflow-hidden">
              <Skeleton className="aspect-[4/3] w-full" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : plants?.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">Noch keine Pflanzen</h3>
          <p className="text-sm mb-6">Füge deine erste Pflanze hinzu und beginne mit der Dokumentation.</p>
          <Button asChild className="press-active">
            <Link href="/plants/new">
              <Plus className="w-4 h-4 mr-1.5" />
              Erste Pflanze hinzufügen
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {plants?.map((plant, i) => (
            <Link key={plant.id} href={`/plants/${plant.id}`}>
              <article
                className={cn(
                  "bg-card border border-border/50 rounded-xl overflow-hidden cursor-pointer hover-card animate-fade-in",
                  `stagger-${Math.min(i + 1, 5)}`
                )}
              >
                <div className="aspect-[4/3] bg-secondary relative overflow-hidden">
                  {plant.coverImageUrl ? (
                    <img
                      src={plant.coverImageUrl}
                      alt={plant.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Leaf className="w-10 h-10 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <Badge
                      variant="outline"
                      className={cn("text-xs border backdrop-blur-sm", `badge-${plant.category}`)}
                    >
                      {CATEGORY_LABELS[plant.category] ?? plant.category}
                    </Badge>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm truncate">{plant.name}</h3>
                  {plant.scientificName && (
                    <p className="text-xs text-muted-foreground italic truncate mt-0.5">{plant.scientificName}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    {plant.lightRequirement && (
                      <span className="flex items-center gap-1">
                        <Sun className="w-3 h-3" />
                        {plant.lightRequirement === "low" ? "Wenig" : plant.lightRequirement === "medium" ? "Mittel" : "Viel"}
                      </span>
                    )}
                    {plant.humidity && (
                      <span className="flex items-center gap-1">
                        <Droplets className="w-3 h-3" />
                        {plant.humidity === "low" ? "Trocken" : plant.humidity === "medium" ? "Mittel" : "Feucht"}
                      </span>
                    )}
                    {plant.difficulty && (
                      <span className="flex items-center gap-1">
                        <Thermometer className="w-3 h-3" />
                        {DIFFICULTY_LABELS[plant.difficulty]}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
