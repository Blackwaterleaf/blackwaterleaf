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

  const handleFile = async (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Datei zu groß (max. ${maxSizeMB} MB)`);
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Nur Bilddateien erlaubt");
      return;
    }
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
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
      reader.onload = (e) => {
        const result = e.target?.result as string;
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
