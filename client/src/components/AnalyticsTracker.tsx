import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect, useRef, useState } from "react";

const CONSENT_KEY = "bwl-analytics-consent-v1";
const SESSION_KEY = "bwl-analytics-session-v1";

function getSessionKey() {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const created = `${crypto.randomUUID()}-${Date.now().toString(36)}`;
    sessionStorage.setItem(SESSION_KEY, created);
    return created;
  } catch {
    return null;
  }
}

export function AnalyticsTracker() {
  const [location] = useLocation();
  const record = trpc.analytics.record.useMutation();
  const startedAt = useRef(Date.now());
  const previousPath = useRef<string | null>(null);
  const [consent, setConsent] = useState<"granted" | "denied" | null>(() => {
    try {
      const value = localStorage.getItem(CONSENT_KEY);
      return value === "granted" || value === "denied" ? value : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (consent !== "granted") return;
    const key = getSessionKey();
    if (!key) return;
    const durationSeconds = Math.max(0, Math.round((Date.now() - startedAt.current) / 1000));
    if (previousPath.current) {
      void record.mutateAsync({ sessionKey: key, eventType: "page_view_end", path: previousPath.current, durationSeconds }).catch(() => undefined);
    }
    if (!previousPath.current) {
      void record.mutateAsync({ sessionKey: key, eventType: "session_start", path: location, durationSeconds: 0 }).catch(() => undefined);
    }
    void record.mutateAsync({ sessionKey: key, eventType: "page_view", path: location, durationSeconds: 0 }).catch(() => undefined);
    previousPath.current = location;
    startedAt.current = Date.now();
  }, [consent, location]);

  if (consent !== null) return null;
  return (
    <aside className="analytics-consent" role="dialog" aria-label="Datenschutz für Reichweitenmessung">
      <strong>Reichweite datensparsam messen?</strong>
      <p>Du kannst uns helfen, Seitenaufrufe, Länder und Aufenthaltsdauer anonym zu verstehen. Es werden keine IP-Adressen, Namen oder Seiteninhalte gespeichert.</p>
      <div className="analytics-consent__actions">
        <button type="button" className="primary-action" onClick={() => { localStorage.setItem(CONSENT_KEY, "granted"); setConsent("granted"); }}>ERLAUBEN</button>
        <button type="button" className="secondary-action" onClick={() => { localStorage.setItem(CONSENT_KEY, "denied"); setConsent("denied"); }}>ABLEHNEN</button>
      </div>
    </aside>
  );
}
