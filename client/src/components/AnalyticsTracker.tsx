import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect, useRef } from "react";

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

/**
 * Automatic, aggregate-only reach measurement. No IP address, name, user agent,
 * page content, account id, or persistent cross-session identifier is stored.
 */
export function AnalyticsTracker() {
  const [location] = useLocation();
  const record = trpc.analytics.record.useMutation();
  const startedAt = useRef(Date.now());
  const previousPath = useRef<string | null>(null);

  useEffect(() => {
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
  }, [location]);

  return null;
}
