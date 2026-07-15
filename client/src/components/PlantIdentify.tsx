import { trpc } from "@/lib/trpc";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Loader2, ScanSearch, Sparkles, RotateCcw, Leaf, Flag, Check, X,
  BookmarkPlus, Plus, BookOpen, ChevronRight, Camera, ShieldCheck, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

interface IdentifyResult {
  imageUrl: string;
  commonName: string;
  scientificName: string;
  genus: string;
  confidence: number;
  confidenceReason: string;
  category: string;
  summary: string;
  care: string;
  alternatives: string[];
  knowledgeLink: string | null;
  // Phase 1: Validierungs-Metadaten
  taxonomyVerified?: boolean;
  blacklistWarning?: string | null;
  blacklistAlternative?: string | null;
  taxonomyNote?: string | null;
  // Phase 2: PlantNet + GBIF
  plantNetVerified?: boolean;
  plantNetMatch?: boolean;
  referenceImages?: string[];
  keyFeatures?: string[];
}

type ImageSlot = {
  base64: string;
  mimeType: string;
  label: "blatt_oben" | "blatt_unten" | "stiel" | "gesamt" | "sonstig";
  preview: string;
};

const SLOT_LABELS: { label: ImageSlot["label"]; name: string; hint: string }[] = [
  { label: "gesamt", name: "Gesamtansicht", hint: "Ganze Pflanze" },
  { label: "blatt_oben", name: "Blattoberseite", hint: "Obere Blattfläche" },
  { label: "blatt_unten", name: "Blattunterseite", hint: "Untere Blattfläche" },
  { label: "stiel", name: "Blattstiel", hint: "Stiel & Basis" },
];

const ANALYSIS_STEPS = [
  "Bilder werden geladen ...",
  "Analysiere Blattstruktur ...",
  "Erkenne Farb- und Texturmuster ...",
  "Vergleiche mit Botanik-Datenbank ...",
  "Prüfe Aquaristik-Bestände ...",
  "Bestimme Art und Gattung ...",
  "Erstelle Pflegehinweis ...",
];

const CATEGORY_LABELS: Record<string, string> = {
  aquatic: "Wasserpflanze",
  tropical: "Tropische Pflanze",
  alocasia: "Alocasia",
  monstera: "Monstera",
  philodendron: "Philodendron",
  channa: "Channa",
  other: "Sonstige",
};

const confidenceColor = (c: number) =>
  c >= 75
    ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
    : c >= 45
    ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
    : "text-rose-400 border-rose-500/30 bg-rose-500/10";

// Compress image to max 900px, 80% quality
const compressImage = (base64: string, mimeType: string): Promise<{ base64: string; mimeType: string }> =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const MAX = 900;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
        else { width = Math.round((width * MAX) / height); height = MAX; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
      resolve({ base64: dataUrl.split(",")[1], mimeType: "image/jpeg" });
    };
    img.onerror = () => resolve({ base64, mimeType });
    img.src = `data:${mimeType};base64,${base64}`;
  });

export default function PlantIdentify() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // Multi-image slots
  const [slots, setSlots] = useState<(ImageSlot | null)[]>([null, null, null, null]);
  const [result, setResult] = useState<IdentifyResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [correcting, setCorrecting] = useState(false);
  const [correctionText, setCorrectionText] = useState("");
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null]);

  const createPlantMutation = trpc.plants.create.useMutation({
    onSuccess: (data) => {
      toast.success("Pflanze gespeichert! Du wirst weitergeleitet ...");
      setIsSaving(false);
      setTimeout(() => navigate(`/plants/${data.id}`), 800);
    },
    onError: (e) => { toast.error(e.message || "Fehler beim Speichern"); setIsSaving(false); },
  });

  const identify = trpc.ai.identify.useMutation({
    onSuccess: (data) => {
      setResult(data as IdentifyResult);
    },
    onError: (e) => {
      toast.error(`Bestimmung fehlgeschlagen: ${e.message || "Unbekannter Fehler"}`);
    },
  });

  const correctionMutation = trpc.ai.submitCorrection.useMutation({
    onSuccess: () => {
      toast.success("Danke! Deine Korrektur verbessert künftige Bestimmungen. (+8 XP)");
      setCorrecting(false);
      setCorrectionText("");
    },
    onError: (e) => toast.error(e.message || "Korrektur fehlgeschlagen"),
  });

  // Cycle through analysis steps while pending
  useEffect(() => {
    if (!identify.isPending) { setStepIndex(0); return; }
    const id = setInterval(() => setStepIndex((i) => (i + 1) % ANALYSIS_STEPS.length), 900);
    return () => clearInterval(id);
  }, [identify.isPending]);

  const handleFileChange = async (slotIdx: number, file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const raw = (e.target?.result as string).split(",")[1];
      const compressed = await compressImage(raw, file.type);
      const preview = `data:${compressed.mimeType};base64,${compressed.base64}`;
      setSlots((prev) => {
        const next = [...prev];
        next[slotIdx] = {
          base64: compressed.base64,
          mimeType: compressed.mimeType,
          label: SLOT_LABELS[slotIdx].label,
          preview,
        };
        return next;
      });
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const removeSlot = (slotIdx: number) => {
    setSlots((prev) => { const next = [...prev]; next[slotIdx] = null; return next; });
    setResult(null);
  };

  const filledSlots = slots.filter(Boolean) as ImageSlot[];

  const runIdentify = () => {
    if (filledSlots.length === 0) { toast.error("Bitte mindestens 1 Foto hochladen"); return; }
    identify.mutate({
      images: filledSlots.map((s) => ({ base64: s.base64, mimeType: s.mimeType, label: s.label })),
    });
  };

  const savePlant = () => {
    if (!result) return;
    setIsSaving(true);
    const firstSlot = filledSlots[0];
    createPlantMutation.mutate({
      name: result.commonName,
      scientificName: result.scientificName || undefined,
      category: (result.category as any) || "other",
      description: [result.summary, result.care].filter(Boolean).join("\n\n") || undefined,
      coverImageBase64: firstSlot?.base64 || undefined,
      coverImageMimeType: firstSlot?.mimeType || undefined,
    });
  };

  const sendCorrection = () => {
    if (!result) return;
    if (correctionText.trim().length < 3) { toast.error("Bitte gib die korrekte Bestimmung ein"); return; }
    correctionMutation.mutate({
      kind: "identify",
      topic: result.commonName,
      originalAnswer: `${result.commonName} (${result.scientificName})`,
      correctedText: correctionText.trim(),
    });
  };

  const reset = () => {
    setSlots([null, null, null, null]);
    setResult(null);
    setCorrecting(false);
    setCorrectionText("");
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-card border border-border/50 rounded-xl p-8 text-center max-w-lg mx-auto">
        <ScanSearch className="w-10 h-10 text-primary mx-auto mb-3" />
        <p className="font-medium mb-1">Artbestimmung per Foto</p>
        <p className="text-sm text-muted-foreground mb-4">
          Melde dich an, um Arten und Aquarienbewohner per Foto bestimmen zu lassen.
        </p>
        <Button asChild className="press-active"><a href={getLoginUrl()}>Anmelden</a></Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Header */}
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <ScanSearch className="w-7 h-7 text-primary" />
        </div>
        <h2 className="font-display font-semibold text-lg">Artbestimmung per Foto</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Lade bis zu 4 Fotos hoch – mehr Winkel bedeuten eine präzisere KI-Bestimmung.
        </p>
      </div>

      {/* Multi-image slots (2×2 grid) */}
      <div className="grid grid-cols-2 gap-3">
        {SLOT_LABELS.map((slot, idx) => {
          const filled = slots[idx];
          return (
            <div key={slot.label} className="relative">
              <input
                ref={(el) => { fileInputRefs.current[idx] = el; }}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileChange(idx, file);
                  e.target.value = "";
                }}
              />
              {filled ? (
                <div
                  className="relative rounded-xl overflow-hidden aspect-square"
                  style={{ border: idx === 0 ? "2px solid #2D9B6E" : "1px solid rgba(45,155,110,0.30)" }}
                >
                  <img src={filled.preview} alt={slot.name} className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                    <p className="text-[10px] text-white/80 truncate">{slot.name}</p>
                  </div>
                  {/* Pflicht-Badge */}
                  {idx === 0 && (
                    <div className="absolute top-1.5 left-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold" style={{ background: "#2D9B6E", color: "#070A08" }}>PFLICHT</div>
                  )}
                  <button
                    onClick={() => removeSlot(idx)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRefs.current[idx]?.click()}
                  className="w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-1.5 transition-colors"
                  style={{
                    background: "#0D110E",
                    border: idx === 0
                      ? "2px solid #2D9B6E"
                      : "2px dashed rgba(255,255,255,0.15)",
                  }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: idx === 0 ? "rgba(45,155,110,0.20)" : "rgba(45,155,110,0.08)" }}>
                    {idx === 0 ? <Camera className="w-4 h-4" style={{ color: "#2D9B6E" }} /> : <Plus className="w-4 h-4" style={{ color: "rgba(45,155,110,0.50)" }} />}
                  </div>
                  <p className="text-[11px] font-medium" style={{ color: idx === 0 ? "rgba(255,255,255,0.80)" : "rgba(255,255,255,0.55)" }}>{slot.name}</p>
                  <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {idx === 0 ? "Pflicht" : slot.hint}
                  </p>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Tip */}
      <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.45)" }}>
        Tipp: Blattoberseite + Unterseite = deutlich bessere Bestimmungsgenauigkeit
      </p>

      {/* Identify button or loading */}
      {filledSlots.length > 0 && !result && (
        <>
          {identify.isPending ? (
            <div className="rounded-xl border border-primary/20 bg-card overflow-hidden">
              {/* Scan animation over first image */}
              <div className="relative">
                <img
                  src={filledSlots[0].preview}
                  alt="Analysiere"
                  className="w-full aspect-square object-cover opacity-60"
                />
                <div
                  className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
                  style={{ animation: "scanLine 1.4s ease-in-out infinite", top: 0 }}
                />
                <div className="absolute inset-4 border-2 border-primary/40 rounded-lg">
                  <div className="absolute -top-0.5 -left-0.5 w-5 h-5 border-t-2 border-l-2 border-primary rounded-tl" />
                  <div className="absolute -top-0.5 -right-0.5 w-5 h-5 border-t-2 border-r-2 border-primary rounded-tr" />
                  <div className="absolute -bottom-0.5 -left-0.5 w-5 h-5 border-b-2 border-l-2 border-primary rounded-bl" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 border-b-2 border-r-2 border-primary rounded-br" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-black/60 border border-primary/40 flex items-center justify-center backdrop-blur-sm">
                    <ScanSearch className="w-7 h-7 text-primary animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
                  <p key={stepIndex} className="text-sm font-medium text-primary" style={{ animation: "fadeInUp 0.35s ease-out" }}>
                    {ANALYSIS_STEPS[stepIndex]}
                  </p>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full"
                    style={{ width: `${Math.round(((stepIndex + 1) / ANALYSIS_STEPS.length) * 100)}%`, transition: "width 0.8s ease-out" }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  KI analysiert {filledSlots.length} Foto{filledSlots.length > 1 ? "s" : ""} – bitte warten ...
                </p>
              </div>
            </div>
          ) : (
            <Button className="w-full press-active" onClick={runIdentify}>
              <Sparkles className="w-4 h-4 mr-2" />
              {filledSlots.length > 1 ? `${filledSlots.length} Fotos bestimmen` : "Jetzt bestimmen"}
            </Button>
          )}
        </>
      )}

      {/* Foto-Profi Hinweis wenn alle 4 Slots gefüllt */}
      {filledSlots.length === 4 && !result && !identify.isPending && (
        <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: "rgba(212,175,55,0.10)", border: "1px solid rgba(212,175,55,0.30)" }}>
          <span style={{ fontSize: 18 }}>🏆</span>
          <div>
            <p className="text-xs font-bold" style={{ color: "#D4AF37" }}>Foto-Profi-Modus aktiv!</p>
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.60)" }}>4 Perspektiven = maximale Bestimmungsgenauigkeit (+9 Bonus)</p>
          </div>
        </div>
      )}

      {/* Result card */}
      {result && (
        <div
          className="rounded-xl p-5 animate-fade-in space-y-3"
          style={{
            background: "rgba(13,17,14,0.95)",
            backdropFilter: "blur(12px)",
            border: result.confidence >= 80
              ? "1.5px solid rgba(212,175,55,0.60)"
              : result.confidence >= 60
              ? "1.5px solid rgba(45,155,110,0.50)"
              : "1px solid rgba(255,255,255,0.12)",
            boxShadow: result.confidence >= 80
              ? "0 0 24px rgba(212,175,55,0.12)"
              : result.confidence >= 60
              ? "0 0 20px rgba(45,155,110,0.10)"
              : "none",
          }}
        >
          {/* Name + confidence */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                <Leaf className="w-5 h-5 text-primary" /> {result.commonName}
              </h3>
              <p className="text-sm text-muted-foreground italic">{result.scientificName}</p>
              {result.genus && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Gattung: <span className="font-medium text-foreground">{result.genus}</span>
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant="outline" className={confidenceColor(result.confidence)}>
                {result.confidence}% sicher
              </Badge>
              {result.taxonomyVerified && (
                <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-400 bg-emerald-500/10 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verifiziert
                </Badge>
              )}
            </div>
          </div>

          {/* Blacklist-Warnung */}
          {result.blacklistWarning && (
            <div className="rounded-lg p-3 flex items-start gap-2" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.30)" }}>
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#f87171" }} />
              <div>
                <p className="text-xs font-medium" style={{ color: "#f87171" }}>Bekannte KI-Halluzination erkannt</p>
                <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>{result.blacklistWarning}</p>
              </div>
            </div>
          )}

          {/* Confidence reason (C4) */}
          {result.confidenceReason && (
            <p className="text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-2">
              {result.confidenceReason}
            </p>
          )}

          {/* Category badge */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 text-xs">
              {CATEGORY_LABELS[result.category] ?? result.category}
            </Badge>
          </div>

          {result.summary && <p className="text-sm leading-relaxed">{result.summary}</p>}

          {result.care && (
            <div className="rounded-lg bg-secondary/50 border border-border/40 p-3">
              <p className="text-xs font-medium text-primary mb-1">Pflegehinweis</p>
              <p className="text-sm text-muted-foreground">{result.care}</p>
            </div>
          )}

          {/* Alternatives */}
          {result.alternatives.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Mögliche Alternativen</p>
              <div className="flex flex-wrap gap-1.5">
                {result.alternatives.map((alt, i) => (
                  <Badge key={i} variant="outline" className="text-xs border-border/50">{alt}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* C3: Taxonomie-Link / Knowledge-Link */}
          {result.knowledgeLink && (
            <a
              href={result.knowledgeLink}
              className="flex items-center gap-2 rounded-lg p-3 transition-colors"
              style={{ background: "rgba(45,155,110,0.10)", border: "1px solid rgba(45,155,110,0.25)" }}
            >
              <BookOpen className="w-4 h-4 shrink-0" style={{ color: "#34D399" }} />
              <span className="text-sm flex-1" style={{ color: "rgba(255,255,255,0.75)" }}>
                Wissensartikel zu <strong>{result.genus || result.commonName}</strong> lesen
              </span>
              <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "rgba(255,255,255,0.50)" }} />
            </a>
          )}

          <p className="text-xs text-muted-foreground pt-1">
            Hinweis: KI-Bestimmungen sind eine Orientierung und können Fehler enthalten.
          </p>

          {/* Correction */}
          {correcting ? (
            <div className="rounded-lg bg-secondary/40 border border-border/40 p-3">
              <p className="text-xs text-muted-foreground mb-1.5">Liegt die KI falsch? Gib die korrekte Bestimmung an:</p>
              <Textarea
                value={correctionText}
                onChange={(e) => setCorrectionText(e.target.value)}
                placeholder="z.B. Das ist Bucephalandra, keine Anubias ..."
                className="min-h-[60px] resize-none text-sm bg-background/60 border-border/50"
              />
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline" onClick={() => { setCorrecting(false); setCorrectionText(""); }}>
                  <X className="w-3.5 h-3.5 mr-1" /> Abbrechen
                </Button>
                <Button size="sm" disabled={correctionMutation.isPending} onClick={sendCorrection} className="press-active">
                  <Check className="w-3.5 h-3.5 mr-1" /> Korrektur senden
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setCorrecting(true)}
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
            >
              <Flag className="w-3 h-3" /> Bestimmung korrigieren
            </button>
          )}

          {/* Save as plant */}
          <Button
            className="w-full press-active btn-glow"
            disabled={isSaving || createPlantMutation.isPending}
            onClick={savePlant}
            style={{
              background: "linear-gradient(135deg, #34D399, #2D9B6E)",
              color: "#070A08",
              fontWeight: 600,
            }}
          >
            {isSaving || createPlantMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <BookmarkPlus className="w-4 h-4 mr-2" />
            )}
            Als Pflanze speichern
          </Button>

          <Button variant="outline" className="w-full press-active" onClick={reset}>
            <RotateCcw className="w-4 h-4 mr-2" /> Neues Foto bestimmen
          </Button>
        </div>
      )}
    </div>
  );
}
