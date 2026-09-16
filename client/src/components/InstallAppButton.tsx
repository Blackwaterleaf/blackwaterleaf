import { Download, Share2 } from "lucide-react";
import { useEffect, useState } from "react";

type BeforeInstallPromptChoice = { outcome: "accepted" | "dismissed"; platform: string };
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<BeforeInstallPromptChoice>;
};

function isStandaloneMode() {
  return window.matchMedia("(display-mode: standalone)").matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function isAppleMobileBrowser() {
  return /iPad|iPhone|iPod/.test(window.navigator.userAgent) && !window.matchMedia("(display-mode: standalone)").matches;
}

export function InstallAppButton({ locale }: { locale: "de" | "en" }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [standalone, setStandalone] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    setStandalone(isStandaloneMode());
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setStandalone(true);
      setDeferredPrompt(null);
      setStatus(locale === "de" ? "BlackWaterLeaf ist auf diesem Gerät installiert." : "BlackWaterLeaf is installed on this device.");
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [locale]);

  if (standalone) return null;

  const install = async () => {
    setStatus(null);
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setStatus(choice.outcome === "accepted"
        ? (locale === "de" ? "Installation wird eingerichtet." : "Installation is being set up.")
        : (locale === "de" ? "Installation wurde nicht gestartet." : "Installation was not started."));
      return;
    }
    if (isAppleMobileBrowser()) {
      setStatus(locale === "de" ? "In Safari: Teilen → „Zum Home-Bildschirm“ wählen." : "In Safari: choose Share → Add to Home Screen.");
      return;
    }
    setStatus(locale === "de"
      ? "Dieser Browser bietet die Installation noch nicht an. Öffne BlackWaterLeaf in Chrome, Edge oder Safari."
      : "This browser does not offer installation yet. Open BlackWaterLeaf in Chrome, Edge, or Safari.");
  };

  return <div className="install-app-control">
    <button type="button" className="install-app-button" onClick={() => void install()}>
      {isAppleMobileBrowser() && !deferredPrompt ? <Share2 size={15} /> : <Download size={15} />}
      {locale === "de" ? "APP INSTALLIEREN" : "INSTALL APP"}
    </button>
    {status ? <span className="install-app-status" role="status">{status}</span> : null}
  </div>;
}
