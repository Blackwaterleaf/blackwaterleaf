import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Seo } from "@/components/Seo";
import { Droplets, Plus } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

const TYPE_LABELS: Record<string, string> = {
  freshwater: "Süßwasser", saltwater: "Salzwasser", blackwater: "Schwarzwasser",
  planted: "Pflanzenaquarium", biotope: "Biotop", other: "Sonstiges",
};

const TYPE_COLOR: Record<string, string> = {
  blackwater: "oklch(0.52 0.14 148)",
  planted:    "oklch(0.60 0.16 148)",
  freshwater: "oklch(0.55 0.14 220)",
  saltwater:  "oklch(0.60 0.14 200)",
  biotope:    "oklch(0.65 0.14 78)",
  other:      "oklch(0.50 0.008 200)",
};

const card = {
  background: "oklch(0.12 0.008 200)",
  border: "1px solid oklch(0.20 0.008 200)",
};

export default function Aquariums() {
  const { isAuthenticated } = useAuth();
  const { data: aquariums, isLoading } = trpc.aquariums.myList.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-24 lg:pb-8">
      <Seo
        title="Aquarien – Becken & Wasserwerte dokumentieren"
        path="/aquariums"
        description="Verwalte deine Aquarien mit Wasserwerten, Ereignisprotokoll und Foto-Timeline. Von Schwarzwasser-Biotop bis Aquascape – dokumentiert in der BlackwaterLeaf Community."
      />

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1
            className="font-brand text-4xl leading-none mb-1"
            style={{ color: "oklch(0.95 0.005 200)", letterSpacing: "0.04em" }}
          >
            MEINE AQUARIEN
          </h1>
          <p className="text-sm" style={{ color: "oklch(0.50 0.008 200)" }}>
            {aquariums?.length ?? 0} Aquarien dokumentiert
          </p>
        </div>
        {isAuthenticated && (
          <Link href="/aquariums/new">
            <button className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Aquarium hinzufügen</span>
              <span className="sm:hidden">Neu</span>
            </button>
          </Link>
        )}
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden" style={card}>
              <Skeleton className="aspect-video w-full rounded-none" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : aquariums?.length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={card}>
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "oklch(0.52 0.14 220 / 0.10)", border: "1px solid oklch(0.52 0.14 220 / 0.20)" }}
          >
            <Droplets className="w-8 h-8" style={{ color: "oklch(0.65 0.14 220)" }} />
          </div>
          <h3 className="font-semibold mb-1" style={{ color: "oklch(0.88 0.005 200)" }}>
            Noch keine Aquarien
          </h3>
          <p className="text-sm mb-6" style={{ color: "oklch(0.50 0.008 200)" }}>
            Dokumentiere dein erstes Aquarium mit Wasserwerten und Fotos.
          </p>
          <Link href="/aquariums/new">
            <button className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Erstes Aquarium anlegen
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {aquariums?.map((aq) => {
            const typeColor = TYPE_COLOR[aq.type] ?? TYPE_COLOR.other;
            return (
              <Link key={aq.id} href={`/aquariums/${aq.id}`}>
                <article
                  className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-200"
                  style={card}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.border = "1px solid oklch(0.52 0.14 148 / 0.35)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.border = "1px solid oklch(0.20 0.008 200)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                >
                  {/* Cover image */}
                  <div className="aspect-video relative overflow-hidden" style={{ background: "oklch(0.10 0.008 200)" }}>
                    {aq.coverImageUrl ? (
                      <img src={aq.coverImageUrl} alt={aq.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Droplets className="w-10 h-10" style={{ color: "oklch(0.28 0.008 200)" }} />
                      </div>
                    )}
                    {/* Type badge */}
                    <div className="absolute top-2 left-2">
                      <span
                        className="text-xs font-medium px-2.5 py-1 rounded-lg backdrop-blur-sm"
                        style={{
                          background: `${typeColor.replace(")", " / 0.15)")}`,
                          color: typeColor,
                          border: `1px solid ${typeColor.replace(")", " / 0.30)")}`,
                        }}
                      >
                        {TYPE_LABELS[aq.type] ?? aq.type}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-sm mb-2" style={{ color: "oklch(0.90 0.005 200)" }}>
                      {aq.name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs" style={{ color: "oklch(0.48 0.008 200)" }}>
                      {aq.volumeLiters && <span>{aq.volumeLiters} L</span>}
                      {aq.temperatureCelsius && <span>{aq.temperatureCelsius}°C</span>}
                      {aq.phValue && <span>pH {aq.phValue}</span>}
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
