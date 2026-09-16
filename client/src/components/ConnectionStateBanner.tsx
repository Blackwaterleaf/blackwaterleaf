import { useI18n } from "@/i18n";
import { resolveConnectionState } from "@/lib/connectionState";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, CloudOff, DatabaseZap } from "lucide-react";
import { useEffect, useState } from "react";

export function ConnectionStateBanner() {
  const { locale } = useI18n();
  const [online, setOnline] = useState(() => typeof navigator === "undefined" || navigator.onLine);
  const platform = trpc.platform.availability.useQuery(undefined, { retry: false, refetchOnWindowFocus: true });

  useEffect(() => {
    const markOnline = () => setOnline(true);
    const markOffline = () => setOnline(false);
    window.addEventListener("online", markOnline);
    window.addEventListener("offline", markOffline);
    return () => {
      window.removeEventListener("online", markOnline);
      window.removeEventListener("offline", markOffline);
    };
  }, []);

  if (platform.isLoading && online) return null;
  const state = resolveConnectionState({
    online,
    platformError: platform.isError,
    database: platform.data?.database,
  });
  if (state === "ready") return null;

  const content = {
    offline: {
      icon: CloudOff,
      code: "NET/OFFLINE",
      text: locale === "de" ? "Keine Netzwerkverbindung. Schreibende Serverfunktionen sind pausiert." : "No network connection. Server write operations are paused.",
    },
    server_error: {
      icon: AlertTriangle,
      code: "API/UNREACHABLE",
      text: locale === "de" ? "Der BlackWaterLeaf-Server ist derzeit nicht erreichbar." : "The BlackWaterLeaf server is currently unreachable.",
    },
    database_not_connected: {
      icon: DatabaseZap,
      code: "DB/NOT_CONNECTED",
      text: locale === "de" ? "Die Datenbank ist nicht verbunden. Es werden keine Ersatzdaten angezeigt." : "The database is not connected. No substitute data is shown.",
    },
  }[state];
  const Icon = content.icon;

  return <div className={`connection-banner connection-${state}`} role="status"><Icon size={15} /><strong>[{content.code}]</strong><span>{content.text}</span></div>;
}
