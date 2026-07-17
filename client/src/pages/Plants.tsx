import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Seo } from "@/components/Seo";
import { Leaf, Plus, Droplets, Sun, Thermometer, Lock } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { startLogin } from "@/const";
import { motion } from "framer-motion";

const CATEGORY_LABELS: Record<string, string> = {
  aquatic:      "Wasserpflanze",
  tropical:     "Tropisch",
  alocasia:     "Alocasia",
  monstera:     "Monstera",
  philodendron: "Philodendron",
  other:        "Sonstiges",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner:     "Einsteiger",
  intermediate: "Fortgeschritten",
  expert:       "Experte",
};

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner:     "#34D399",
  intermediate: "#D4AF37",
  expert:       "rgba(240,80,80,0.90)",
};

function PlantCard({ plant, index = 0 }: { plant: any; index?: number }) {
  return (
    <Link href={`/plants/${plant.id}`}>
      <motion.article
        className="overflow-hidden rounded-2xl cursor-pointer group anim-glass-reflex"
        style={{
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: index * 0.06, ease: [0.23, 1, 0.32, 1] }}
        whileHover={{ y: -3, borderColor: "rgba(45,155,110,0.45)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Cover image */}
        <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
          {plant.coverImageUrl ? (
            <img
              src={plant.coverImageUrl}
              alt={plant.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: "#0D110E" }}
            >
              <Leaf className="w-12 h-12" style={{ color: "rgba(45,107,63,0.60)" }} />
            </div>
          )}
          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span
              className="px-2 py-0.5 rounded-lg text-xs font-medium backdrop-blur-sm"
              style={{
                background: "rgba(7,10,8,0.80)",
                color: "#34D399",
                border: "1px solid rgba(45,155,110,0.25)",
              }}
            >
              {CATEGORY_LABELS[plant.category] ?? plant.category}
            </span>
          </div>
          {/* Gradient overlay */}
          <div
            className="absolute bottom-0 left-0 right-0 h-12"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }}
          />
        </div>

        {/* Info */}
        <div className="p-4">
          <h3
            className="font-semibold text-sm leading-tight truncate"
            style={{ color: "#FFFFFF" }}
          >
            {plant.name}
          </h3>
          {plant.scientificName && (
            <p
              className="text-xs italic truncate mt-0.5"
              style={{ color: "rgba(255,255,255,0.52)" }}
            >
              {plant.scientificName}
            </p>
          )}
          {/* Care indicators */}
          <div className="flex items-center gap-3 mt-3 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
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
              <span
                className="flex items-center gap-1 ml-auto"
                style={{ color: DIFFICULTY_COLOR[plant.difficulty] ?? "#34D399" }}
              >
                <Thermometer className="w-3 h-3" />
                {DIFFICULTY_LABELS[plant.difficulty]}
              </span>
            )}
          </div>
        </div>
      </motion.article>
    </Link>
  );
}

export default function Plants() {
  const { isAuthenticated } = useAuth();
  const { data: plants, isLoading } = trpc.plants.myList.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-24 lg:pb-8">
      <Seo
        title="Botanik – Sammlung & Pflege dokumentieren"
        path="/plants"
        description="Dokumentiere deine Zimmerpflanzen und Wasserpflanzen mit Pflegeparametern, Foto-Timeline und KI-Unterstützung. Entdecke seltene Pflanzen in der BlackwaterLeaf Community."
      />

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1
            className="font-brand text-4xl leading-none mb-1"
            style={{ color: "#FFFFFF", letterSpacing: "0.04em" }}
          >
            MEINE PFLANZEN
          </h1>
          <h2 className="text-sm" style={{ color: "rgba(255,255,255,0.50)", fontWeight: 400 }}>
            {isAuthenticated ? `${plants?.length ?? 0} Pflanzen in deiner Sammlung` : "Melde dich an, um deine Sammlung zu verwalten"}
          </h2>
        </div>
        {isAuthenticated && (
          <Link href="/plants/new">
            <span className="btn-primary cursor-pointer flex-shrink-0">
              <Plus className="w-4 h-4" /> Hinzufügen
            </span>
          </Link>
        )}
      </div>

      {/* ── Not logged in ── */}
      {!isAuthenticated && (
        <div className="text-center py-24">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(45,155,110,0.10)", border: "1px solid rgba(45,155,110,0.20)" }}
          >
            <Lock className="w-9 h-9" style={{ color: "#2D9B6E" }} />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: "rgba(255,255,255,0.85)" }}>
            Anmeldung erforderlich
          </h3>
          <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.50)" }}>
            Melde dich an, um deine Pflanzensammlung zu verwalten.
          </p>
          <button onClick={() => startLogin()} className="btn-primary">
            Jetzt anmelden
          </button>
        </div>
      )}

      {/* ── Loading ── */}
      {isAuthenticated && isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden"
              style={{ background: "#0D110E", border: "1px solid #161C19" }}
            >
              <Skeleton className="w-full rounded-none" style={{ aspectRatio: "4/3", height: "auto" }} />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {isAuthenticated && !isLoading && plants?.length === 0 && (
        <div className="text-center py-24">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(45,155,110,0.10)", border: "1px solid rgba(45,155,110,0.20)" }}
          >
            <Leaf className="w-9 h-9" style={{ color: "#2D9B6E" }} />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: "rgba(255,255,255,0.85)" }}>
            Noch keine Pflanzen
          </h3>
          <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.50)" }}>
            Füge deine erste Pflanze hinzu und beginne mit der Dokumentation.
          </p>
          <Link href="/plants/new">
            <span className="btn-primary cursor-pointer">
              <Plus className="w-4 h-4" /> Erste Pflanze hinzufügen
            </span>
          </Link>
        </div>
      )}

      {/* ── Plant grid ── */}
      {isAuthenticated && !isLoading && plants && plants.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {plants.map((plant, idx) => (
            <PlantCard key={plant.id} plant={plant} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
}
