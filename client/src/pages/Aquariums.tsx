import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { Droplets, Plus } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const TYPE_LABELS: Record<string, string> = {
  freshwater: "Süßwasser", saltwater: "Salzwasser", blackwater: "Schwarzwasser",
  planted: "Pflanzenaquarium", biotope: "Biotop", other: "Sonstiges",
};

export default function Aquariums() {
  const { isAuthenticated } = useAuth();
  const { data: aquariums, isLoading } = trpc.aquariums.myList.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-semibold">Meine Aquarien</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {aquariums?.length ?? 0} Aquarien dokumentiert
          </p>
        </div>
        {isAuthenticated && (
          <Button asChild size="sm" className="press-active">
            <Link href="/aquariums/new">
              <Plus className="w-4 h-4 mr-1.5" />
              Aquarium hinzufügen
            </Link>
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card border border-border/50 rounded-xl overflow-hidden">
              <Skeleton className="aspect-video w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : aquariums?.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-4">
            <Droplets className="w-8 h-8 text-cyan-400" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">Noch keine Aquarien</h3>
          <p className="text-sm mb-6">Dokumentiere dein erstes Aquarium mit Wasserwerten und Fotos.</p>
          <Button asChild className="press-active">
            <Link href="/aquariums/new">
              <Plus className="w-4 h-4 mr-1.5" />
              Erstes Aquarium anlegen
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {aquariums?.map((aq, i) => (
            <Link key={aq.id} href={`/aquariums/${aq.id}`}>
              <article
                className={cn(
                  "bg-card border border-border/50 rounded-xl overflow-hidden cursor-pointer hover-card animate-fade-in",
                  `stagger-${Math.min(i + 1, 5)}`
                )}
              >
                <div className="aspect-video bg-secondary relative overflow-hidden">
                  {aq.coverImageUrl ? (
                    <img src={aq.coverImageUrl} alt={aq.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Droplets className="w-10 h-10 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <Badge variant="outline" className={cn("text-xs border backdrop-blur-sm", `badge-${aq.type}`)}>
                      {TYPE_LABELS[aq.type] ?? aq.type}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm">{aq.name}</h3>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    {aq.volumeLiters && <span>{aq.volumeLiters} L</span>}
                    {aq.temperatureCelsius && <span>{aq.temperatureCelsius}°C</span>}
                    {aq.phValue && <span>pH {aq.phValue}</span>}
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
