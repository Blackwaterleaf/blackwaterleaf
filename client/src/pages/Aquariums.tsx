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
  blackwater: "#2D9B6E",
  planted:    "#2D9B6E",
  freshwater: "rgba(100,160,240,0.90)",
  saltwater:  "rgba(100,180,220,0.90)",
  biotope:    "#D4AF37",
  other:      "rgba(255,255,255,0.50)",
};

const card = {
  background: "#0D110E",
  border: "1px solid rgba(45,107,63,0.30)",
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
            style={{ color: "#FFFFFF", letterSpacing: "0.04em" }}
          >
            MEINE AQUARIEN
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.50)" }}>
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
            style={{ background: "rgba(100,160,240,0.10)", border: "1px solid rgba(100,160,240,0.20)" }}
          >
            <Droplets className="w-8 h-8" style={{ color: "rgba(100,160,240,0.90)" }} />
          </div>
          <h3 className="font-semibold mb-1" style={{ color: "rgba(255,255,255,0.88)" }}>
            Noch keine Aquarien
          </h3>
          <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.50)" }}>
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
                    (e.currentTarget as HTMLElement).style.border = "1px solid rgba(45,155,110,0.35)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.border = "1px solid rgba(45,107,63,0.30)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                >
                  {/* Cover image */}
                  <div className="aspect-video relative overflow-hidden" style={{ background: "#070A08" }}>
                    {aq.coverImageUrl ? (
                      <img src={aq.coverImageUrl} alt={aq.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Droplets className="w-10 h-10" style={{ color: "rgba(45,107,63,0.35)" }} />
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
                    <h3 className="font-semibold text-sm mb-2" style={{ color: "rgba(255,255,255,0.90)" }}>
                      {aq.name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
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
