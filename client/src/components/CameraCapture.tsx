import { useEffect, useRef, useState } from "react";
import { Camera, RotateCcw, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CameraCaptureProps {
  onCapture: (blob: Blob) => void;
  onCancel: () => void;
  facingMode?: "user" | "environment";
}

export default function CameraCapture({
  onCapture,
  onCancel,
  facingMode = "environment",
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFrontCamera, setIsFrontCamera] = useState(facingMode === "user");

  // Initialize camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Request camera permission
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: isFrontCamera ? "user" : "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setIsReady(true);
            setIsLoading(false);
          };
        }
      } catch (err) {
        const errorMsg =
          err instanceof DOMException
            ? err.name === "NotAllowedError"
              ? "Kamera-Zugriff verweigert. Bitte erlaube Kamerazugriff in den Einstellungen."
              : err.name === "NotFoundError"
              ? "Keine Kamera gefunden."
              : err.message
            : "Fehler beim Zugriff auf die Kamera";

        setError(errorMsg);
        setIsLoading(false);
        toast.error(errorMsg);
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isFrontCamera]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const context = canvasRef.current.getContext("2d");
    if (!context) return;

    // Set canvas dimensions to match video
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;

    // Draw video frame to canvas
    context.drawImage(videoRef.current, 0, 0);

    // Get image data
    const imageData = canvasRef.current.toDataURL("image/jpeg", 0.95);
    setCapturedImage(imageData);
  };

  const handleConfirm = async () => {
    if (!capturedImage) return;

    try {
      // Convert data URL to Blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      onCapture(blob);
      toast.success("Foto aufgenommen!");
    } catch (err) {
      toast.error("Fehler beim Verarbeiten des Fotos");
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleToggleCamera = () => {
    setIsFrontCamera(!isFrontCamera);
  };

  if (error) {
    return (
      <div className="w-full bg-card border border-border/50 rounded-2xl p-8 flex flex-col items-center justify-center gap-4">
        <Camera className="w-12 h-12 text-muted-foreground" />
        <div className="text-center">
          <p className="font-semibold text-foreground mb-1">Kamera nicht verfügbar</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
        <Button variant="outline" onClick={onCancel}>
          Abbrechen
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full bg-card border border-border/50 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 aspect-video">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Kamera wird initialisiert...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {/* Camera Preview or Captured Image */}
      <div className="relative w-full bg-black rounded-2xl overflow-hidden aspect-video">
        {capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full h-full object-cover"
          />
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
            />
            {/* Safe area indicator for notch/dynamic island */}
            <div className="absolute inset-0 pointer-events-none border-2 border-primary/20" />
          </>
        )}

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Loading overlay */}
        {!isReady && !capturedImage && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {capturedImage ? (
          // Confirm/Retake buttons
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetake}
              className="flex-1 press-active"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Erneut versuchen
            </Button>
            <Button
              size="sm"
              onClick={handleConfirm}
              className="flex-1 press-active"
            >
              <Check className="w-4 h-4 mr-2" />
              Bestätigen
            </Button>
          </>
        ) : (
          // Capture/Cancel buttons
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="flex-1 press-active"
            >
              <X className="w-4 h-4 mr-2" />
              Abbrechen
            </Button>

            {/* Camera toggle button */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleToggleCamera}
              className="press-active"
              title={
                isFrontCamera
                  ? "Zur Rückkamera wechseln"
                  : "Zur Frontkamera wechseln"
              }
            >
              <RotateCcw className="w-4 h-4" />
            </Button>

            {/* Capture button */}
            <Button
              size="sm"
              onClick={handleCapture}
              disabled={!isReady}
              className="flex-1 press-active"
            >
              <Camera className="w-4 h-4 mr-2" />
              Foto aufnehmen
            </Button>
          </>
        )}
      </div>

      {/* Info text */}
      <p className="text-xs text-muted-foreground text-center">
        {capturedImage
          ? "Überprüfe das Foto. Klicke auf 'Bestätigen' zum Hochladen."
          : "Positioniere deine Pflanze im Bildausschnitt"}
      </p>
    </div>
  );
}
