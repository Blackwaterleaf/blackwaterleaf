import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, ScanSearch, Sparkles, RotateCcw, Leaf, Flag, Check, X } from "lucide-react";
import ImageUpload from "./ImageUpload";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

interface IdentifyResult {
  imageUrl: string;
  commonName: string;
  scientificName: string;
  confidence: number;
  category: string;
  summary: string;
  care: string;
  alternatives: string[];
}

const CATEGORY_LABELS: Record<string, string> = {
  aquatic: "Wasserpflanze",
  tropical: "Tropische Pflanze",
  alocasia: "Alocasia",
  monstera: "Monstera",
  philodendron: "Philodendron",
  other: "Sonstige",
};

export default function PlantIdentify() {
  const { isAuthenticated } = useAuth();
  const [preview, setPreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<{ base64: string; mimeType: string } | null>(null);
  const [result, setResult] = useState<IdentifyResult | null>(null);

  const identify = trpc.ai.identify.useMutation({
    onSuccess: (data) => {
      setResult(data as IdentifyResult);
    },
    onError: () => toast.error("Bestimmung fehlgeschlagen. Bitte erneut versuchen."),
  });

  const [correcting, setCorrecting] = useState(false);
  const [correctionText, setCorrectionText] = useState("");
  const correctionMutation = trpc.ai.submitCorrection.useMutation({
    onSuccess: () => {
      toast.success("Danke! Deine Korrektur verbessert künftige Bestimmungen. (+8 XP)");
      setCorrecting(false);
      setCorrectionText("");
    },
    onError: (e) => toast.error(e.message || "Korrektur fehlgeschlagen"),
  });
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

  const handleChange = (base64: string, mimeType: string) => {
    setImageData({ base64, mimeType });
    setPreview(`data:${mimeType};base64,${base64}`);
    setResult(null);
  };

  const reset = () => {
    setPreview(null);
    setImageData(null);
    setResult(null);
  };

  const confidenceColor = (c: number) =>
    c >= 75 ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
      : c >= 45 ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
        : "text-rose-400 border-rose-500/30 bg-rose-500/10";

  if (!isAuthenticated) {
    return (
      <div className="bg-card border border-border/50 rounded-xl p-8 text-center max-w-lg mx-auto">
        <ScanSearch className="w-10 h-10 text-primary mx-auto mb-3" />
        <p className="font-medium mb-1">Pflanzenbestimmung per Foto</p>
        <p className="text-sm text-muted-foreground mb-4">Melde dich an, um Pflanzen und Aquarienbewohner per Foto bestimmen zu lassen.</p>
        <Button asChild className="press-active"><a href={getLoginUrl()}>Anmelden</a></Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <ScanSearch className="w-7 h-7 text-primary" />
        </div>
        <h2 className="font-display font-semibold text-lg">Pflanzenbestimmung per Foto</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Mache ein Foto oder lade eines hoch – die KI bestimmt Pflanze oder Aquarienbewohner.
        </p>
      </div>

      <ImageUpload
        value={preview}
        onChange={handleChange}
        onClear={reset}
        aspectRatio="square"
        placeholder="Pflanze fotografieren"
      />

      {imageData && !result && (
        <Button
          className="w-full press-active"
          disabled={identify.isPending}
          onClick={() => identify.mutate({ imageBase64: imageData.base64, imageMimeType: imageData.mimeType })}
        >
          {identify.isPending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Bestimme...</>
          ) : (
            <><Sparkles className="w-4 h-4 mr-2" /> Jetzt bestimmen</>
          )}
        </Button>
      )}

      {result && (
        <div className="bg-card border border-border/50 rounded-xl p-5 animate-fade-in space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                <Leaf className="w-5 h-5 text-primary" /> {result.commonName}
              </h3>
              <p className="text-sm text-muted-foreground italic">{result.scientificName}</p>
            </div>
            <Badge variant="outline" className={confidenceColor(result.confidence)}>
              {result.confidence}% sicher
            </Badge>
          </div>

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

          <p className="text-xs text-muted-foreground pt-1">
            Hinweis: KI-Bestimmungen sind eine Orientierung und können Fehler enthalten.
          </p>

          {correcting ? (
            <div className="rounded-lg bg-secondary/40 border border-border/40 p-3">
              <p className="text-xs text-muted-foreground mb-1.5">Liegt die KI falsch? Gib die korrekte Bestimmung/Info an:</p>
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
            <button onClick={() => setCorrecting(true)} className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors">
              <Flag className="w-3 h-3" /> Bestimmung korrigieren
            </button>
          )}

          <Button variant="outline" className="w-full press-active" onClick={reset}>
            <RotateCcw className="w-4 h-4 mr-2" /> Neues Foto bestimmen
          </Button>
        </div>
      )}
    </div>
  );
}
