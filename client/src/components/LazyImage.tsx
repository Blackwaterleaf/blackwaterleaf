import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  skeletonClassName?: string;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  aspectRatio?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * LazyImage – Bild mit Skeleton-Placeholder und Fade-In Animation.
 * Nutzt IntersectionObserver für echtes Lazy Loading.
 * Zeigt Skeleton solange das Bild lädt, dann Fade-In.
 */
export function LazyImage({
  src,
  alt,
  className,
  skeletonClassName,
  objectFit = "cover",
  aspectRatio,
  onLoad,
  onError,
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    setLoaded(true);
    onError?.();
  };

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden", skeletonClassName)}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Skeleton Placeholder */}
      {!loaded && (
        <div
          className="absolute inset-0 animate-pulse"
          style={{ background: "oklch(0.13 0.010 155)" }}
        />
      )}

      {/* Fehler-Fallback */}
      {error && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: "oklch(0.11 0.010 155)" }}
        >
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.75rem" }}>
            Bild nicht verfügbar
          </span>
        </div>
      )}

      {/* Eigentliches Bild – nur laden wenn in Sicht */}
      {inView && !error && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={cn(
            "transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0",
            className
          )}
          style={{ objectFit }}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
}
