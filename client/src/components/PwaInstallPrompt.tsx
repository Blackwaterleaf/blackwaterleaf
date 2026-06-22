import { useState, useEffect } from "react";
import { Download, X, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    // iOS detection
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIos(ios);

    // Check if user dismissed before
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) return;

    // Android/Chrome: listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS: show manual install hint after 3s
    if (ios && !standalone) {
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => {
        window.removeEventListener("beforeinstallprompt", handler);
        clearTimeout(timer);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowBanner(false);
        setDeferredPrompt(null);
      }
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-install-dismissed", "1");
  };

  if (isStandalone || !showBanner) return null;

  return (
    <div className="fixed bottom-20 left-3 right-3 z-50 lg:hidden animate-slide-up">
      <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-xl shadow-black/40 flex items-start gap-3">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Leaf className="w-5 h-5 text-primary" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground leading-tight">BlackwaterLeaf installieren</p>
          {isIos ? (
            <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
              Tippe auf <span className="text-primary font-medium">Teilen</span> → <span className="text-primary font-medium">Zum Home-Bildschirm</span>
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
              Als App installieren – offline verfügbar
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {!isIos && deferredPrompt && (
            <Button
              size="sm"
              className="h-8 text-xs px-3 press-active"
              onClick={handleInstall}
            >
              <Download className="w-3 h-3 mr-1" />
              Installieren
            </Button>
          )}
          <button
            onClick={handleDismiss}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
