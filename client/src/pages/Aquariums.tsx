import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Seo } from "@/components/Seo";
import { Droplets, Lock, Plus } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import LivingSensorRail from "@/components/LivingSensorRail";
import { startLogin } from "@/const";

const TYPE_LABELS: Record<string, string> = {
  freshwater: "Süßwasser", saltwater: "Salzwasser", blackwater: "Schwarzwasser",
  planted: "Pflanzenaquarium", biotope: "Biotop", other: "Sonstiges",
};

const TYPE_COLOR: Record<string, string> = {
  blackwater: "#28D8FF",
  planted:    "#28D8FF",
  freshwater: "#28D8FF",
  saltwater:  "#75E7FF",
  biotope:    "#D4AF37",
  other:      "rgba(255,255,255,0.50)",
};

const card = {
  background: "linear-gradient(145deg, rgba(3,28,38,0.76), rgba(2,13,17,0.87))",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(40,216,255,0.26)",
  boxShadow: "inset 0 1px 0 rgba(212,250,255,0.13), 0 12px 32px rgba(0,0,0,0.27), 0 0 22px rgba(40,216,255,0.07)",
};

export default function Aquariums() {
  const { isAuthenticated } = useAuth();
  const { data: aquariums, isLoading } = trpc.aquariums.myList.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  return (
    <div className="bwl-production-page bwl-production-page-aquarium max-w-5xl mx-auto px-4 py-5 pb-24 lg:pb-8">
      <Seo
        title="Aquarien – Becken & Wasserwerte dokumentieren"
        path="/aquariums"
        description="Verwalte deine Aquarien mit Wasserwerten, Ereignisprotokoll und Foto-Timeline. Von Schwarzwasser-Biotop bis Aquascape – dokumentiert in der BlackwaterLeaf Community."
      />

      <LivingSensorRail />

      <section className="bwl-production-hero" aria-labelledby="aquarium-hero-title">
        <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663783480419/WzGGUGFNZmLSWrMr.jpg" alt="Bepflanzte Unterwasserwelt eines Schwarzwasser-Aquariums" />
        <div className="bwl-production-hero-copy">
          <span>AQUARISTIK</span>
          <h1 id="aquarium-hero-title">AQUA<strong>RISTIK</strong></h1>
          <p>Dein Becken, deine Wasserwerte, deine Unterwasserwelt.</p>
        </div>
      </section>

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
            <button className="btn-primary bwl-aquarium-action flex items-center gap-2">
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
      ) : !isAuthenticated ? (
        <div className="text-center py-20 rounded-2xl bwl-aquarium-glass" style={card}>
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(40,216,255,0.10)", border: "1px solid rgba(40,216,255,0.30)" }}
          >
            <Lock className="w-8 h-8" style={{ color: "#28D8FF" }} />
          </div>
          <h3 className="font-semibold mb-1" style={{ color: "rgba(255,255,255,0.88)" }}>
            Anmeldung erforderlich
          </h3>
          <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.50)" }}>
            Melde dich an, um deine echten Becken, Wasserwerte und Fotos zu verwalten.
          </p>
          <button className="btn-primary bwl-aquarium-action inline-flex items-center gap-2" onClick={() => startLogin()}>
            Sicher anmelden
          </button>
        </div>
      ) : aquariums?.length === 0 ? (
        <div className="text-center py-20 rounded-2xl bwl-aquarium-glass" style={card}>
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(40,216,255,0.10)", border: "1px solid rgba(40,216,255,0.30)" }}
          >
            <Droplets className="w-8 h-8" style={{ color: "#28D8FF" }} />
          </div>
          <h3 className="font-semibold mb-1" style={{ color: "rgba(255,255,255,0.88)" }}>
            Noch keine Aquarien
          </h3>
          <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.50)" }}>
            Dokumentiere dein erstes Aquarium mit Wasserwerten und Fotos.
          </p>
          <Link href="/aquariums/new">
            <button className="btn-primary bwl-aquarium-action inline-flex items-center gap-2">
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
                <motion.article
                  className="rounded-2xl overflow-hidden cursor-pointer anim-glass-reflex"
                  style={card}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: (aquariums?.indexOf(aq) ?? 0) * 0.07, ease: [0.23, 1, 0.32, 1] }}
                  whileHover={{ y: -3, borderColor: "rgba(40,216,255,0.55)", boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 22px rgba(40,216,255,0.16)" }}
                  whileTap={{ scale: 0.98 }}
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
                </motion.article>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
