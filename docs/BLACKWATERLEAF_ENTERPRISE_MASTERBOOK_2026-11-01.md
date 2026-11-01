

---

## 14. Nachtrag 1. November 2026 · IONOS-KI- und Manus-Unabhängigkeitsaudit

Die KI-Providerprüfung wurde am 1. November 2026 erneut durchgeführt. Der Quellcode erzwingt für LLM-Aufrufe den IONOS-OpenAI-kompatiblen Endpoint `https://openai.inference.de-txl.ionos.com` mit `Qwen/Qwen3.5-9B`; ein Manus-LLM-Fallback ist im Produktionspfad nicht aktiv. Der IONOS Model Hub antwortete auf `/v1/models` erfolgreich und ein echter Minimal-Chat antwortete mit HTTP 200. Die Prüfung wurde ohne Ausgabe von Zugangsdaten durchgeführt.

Dabei wurde ein Runtime-Konfigurationsfehler identifiziert: Der einzelne Wert `IONOS_AI_API_KEY` war ungültig, während die geschützte vierteilige Key-Aufteilung erfolgreich war. `env.ts` bevorzugt deshalb die vier Key-Parts; die IONOS-Produktionsvorlage verwendet nun ausschließlich `IONOS_AI_API_KEY_PART_1` bis `_PART_4`. Der Token bleibt ausschließlich in geschützter Runtime-Konfiguration.

Für den vollständig selbst gehosteten Produktionsmodus wurde der Medienpfad gehärtet: Bei `BWL_SELF_HOSTED_AUTH_ONLY=true` darf Storage nicht auf Manus-Forge zurückfallen. Lokaler Storage über `BWL_STORAGE_ROOT` ist die einzige gültige Medienquelle; fehlt er, wird Readiness als nicht bereit gemeldet. `/readyz` verlangt zusätzlich konfigurierte IONOS-KI, ohne bei jedem Healthcheck ein kostenpflichtiges Modell aufzurufen.

Der öffentliche IONOS-Stand zum Prüfzeitpunkt war noch nicht aktualisiert: `/healthz` und `/readyz` meldeten den Release `ionos-auth-20261101-r2`; `platform.availability` zeigte `aiAssistant=disabled_by_policy` und `mediaStorage=not_connected`. Der direkte SSH-Versuch mit dem vorhandenen Deploy-Schlüssel war für `root`, `ubuntu` und `bwl` nicht autorisiert. Daher wird kein erfolgreicher Produktions-Cutover behauptet. Für die Aktivierung müssen die vier geschützten IONOS-Key-Parts, `AI_PROVIDER=ionos`, Modell/Endpoint und der aktuelle Quellstand auf dem VPS hinterlegt und der Compose-Stack neu gebaut werden.
