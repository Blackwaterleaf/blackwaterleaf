import { cn } from "@/lib/utils";
import { Camera, Loader2, X, Smartphone } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import CameraCapture from "./CameraCapture";

interface ImageUploadProps {
  value?: string | null;
  onChange: (base64: string, mimeType: string) => void;
  onClear?: () => void;
  className?: string;
  aspectRatio?: "square" | "landscape" | "portrait";
  placeholder?: string;
  maxSizeMB?: number;
  enableCamera?: boolean;
}

export default function ImageUpload({
  value,
  onChange,
  onClear,
  className,
  aspectRatio = "landscape",
  placeholder = "Foto hochladen",
  maxSizeMB = 5,
  enableCamera = true,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const aspectClass = {
    square: "aspect-square",
    landscape: "aspect-video",
    portrait: "aspect-[3/4]",
  }[aspectRatio];

  // Analyse Bildqualität: prüft Auflösung, Helligkeit und Unschärfe (Kantenkontrast)
  const analyzeImageQuality = (dataUrl: string): Promise<{ ok: boolean; warning?: string; error?: string }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // 1) Mindestauflösung prüfen
        if (img.width < 200 || img.height < 200) {
          resolve({ ok: false, error: `Bild zu klein (${img.width}×${img.height}px). Mindestens 200×200px nötig.` });
          return;
        }
        // Auf kleine Analysefläche herunterskalieren (Performance)
        const S = 64;
        const canvas = document.createElement("canvas");
        canvas.width = S; canvas.height = S;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve({ ok: true }); return; }
        ctx.drawImage(img, 0, 0, S, S);
        const { data } = ctx.getImageData(0, 0, S, S);
        // Graustufen + Helligkeit
        const gray: number[] = [];
        let sum = 0;
        for (let i = 0; i < data.length; i += 4) {
          const g = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          gray.push(g);
          sum += g;
        }
        const avg = sum / gray.length;
        // 2) Zu dunkel / zu hell
        if (avg < 30) {
          resolve({ ok: false, error: "Bild ist zu dunkel. Bitte mit mehr Licht erneut fotografieren." });
          return;
        }
        if (avg > 235) {
          resolve({ ok: false, error: "Bild ist überbelichtet. Bitte direktes Gegenlicht vermeiden." });
          return;
        }
        // 3) Unschärfe via Laplace-Varianz (Kantenkontrast)
        let lapSum = 0, lapSqSum = 0, n = 0;
        for (let y = 1; y < S - 1; y++) {
          for (let x = 1; x < S - 1; x++) {
            const idx = y * S + x;
            const lap = 4 * gray[idx] - gray[idx - 1] - gray[idx + 1] - gray[idx - S] - gray[idx + S];
            lapSum += lap; lapSqSum += lap * lap; n++;
          }
        }
        const lapMean = lapSum / n;
        const lapVar = lapSqSum / n - lapMean * lapMean;
        if (lapVar < 40) {
          resolve({ ok: true, warning: "Das Bild wirkt unscharf – die Bestimmung ist evtl. ungenau. Für beste Ergebnisse erneut scharf fotografieren." });
          return;
        }
        resolve({ ok: true });
      };
      img.onerror = () => resolve({ ok: false, error: "Bild konnte nicht gelesen werden. Datei evtl. beschädigt." });
      img.src = dataUrl;
    });
  };

  const handleFile = async (file: File) => {
    // Format-Whitelist (vermeidet HEIC/TIFF die der Browser nicht rendert)
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Datei zu groß (max. ${maxSizeMB} MB). Bitte ein kleineres Bild wählen.`);
      return;
    }
    if (file.size < 1024) {
      toast.error("Datei ist beschädigt oder leer.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Nur Bilddateien erlaubt (JPG, PNG, WebP).");
      return;
    }
    if (!allowed.includes(file.type)) {
      toast.error("Dieses Bildformat wird nicht unterstützt. Bitte JPG, PNG oder WebP verwenden.");
      return;
    }
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onerror = () => { toast.error("Fehler beim Laden des Bildes"); setLoading(false); };
      reader.onload = async (e) => {
        const result = e.target?.result as string;
        const quality = await analyzeImageQuality(result);
        if (!quality.ok) {
          toast.error(quality.error || "Bildqualität unzureichend");
          setLoading(false);
          return;
        }
        if (quality.warning) toast.warning(quality.warning);
        const base64 = result.split(",")[1];
        onChange(base64, file.type);
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Fehler beim Laden des Bildes");
      setLoading(false);
    }
  };

  const handleCameraCapture = async (blob: Blob) => {
    setShowCamera(false);
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onerror = () => { toast.error("Fehler beim Verarbeiten des Fotos"); setLoading(false); };
      reader.onload = async (e) => {
        const result = e.target?.result as string;
        const quality = await analyzeImageQuality(result);
        if (!quality.ok) {
          toast.error(quality.error || "Foto unzureichend – bitte erneut aufnehmen");
          setLoading(false);
          return;
        }
        if (quality.warning) toast.warning(quality.warning);
        const base64 = result.split(",")[1];
        onChange(base64, "image/jpeg");
        setLoading(false);
      };
      reader.readAsDataURL(blob);
    } catch {
      toast.error("Fehler beim Verarbeiten des Fotos");
      setLoading(false);
    }
  };

  // Show camera interface
  if (showCamera && enableCamera) {
    return (
      <div className={cn("space-y-3", className)}>
        <CameraCapture
          onCapture={handleCameraCapture}
          onCancel={() => setShowCamera(false)}
          facingMode="environment"
        />
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "relative rounded-xl overflow-hidden border border-border/50 bg-secondary cursor-pointer group",
          aspectClass
        )}
        onClick={() => !loading && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />

        {value ? (
          <>
            <img src={value} alt="Upload" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
            {onClear && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Camera className="w-6 h-6" />
                <span className="text-xs font-medium">{placeholder}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Camera button (only if no image selected and camera available) */}
      {!value && enableCamera && (
        <button
          type="button"
          onClick={() => setShowCamera(true)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/15 text-primary text-sm font-medium transition-colors press-active"
        >
          <Smartphone className="w-4 h-4" />
          Mit Kamera fotografieren
        </button>
      )}
    </div>
  );
}
