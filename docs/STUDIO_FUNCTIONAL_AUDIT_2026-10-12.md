# BlackWaterLeaf Studio – Funktions- und Kostenprüfung

**Prüfdatum:** 12. Oktober 2026

## Ergebnis

Das Studio ist aktuell eine funktionsfähige **Control Plane** für Workspaces, Aufgaben, Freigaben, Audit, Evidence-Packs, Projektprofile und Code-Drafts. Es ist noch keine vollständige Manus-ähnliche App-Building-Plattform, weil die isolierte Execution Plane, der echte App-Build-/Test-Runner, Deployment und eine belastbare Abrechnung fehlen.

## Technischer Prüfstand

- TypeScript-Check: erfolgreich.
- Produktionsbuild: erfolgreich.
- 18 von 19 Tests erfolgreich.
- Ein Resend-Integrationstest schlägt mit HTTP 401 fehl.
- Preview-HTML ist erreichbar und trägt den Titel `BlackWaterLeaf Studio`.
- Build-Warnung: ein JavaScript-Bundle liegt über 500 kB. Das ist kein Funktionsfehler, sollte aber später per Code-Splitting optimiert werden.

## KI-Anbindung

### Built-in-Manus-KI

Die serverseitige Verbindung ist aktiv und erreichbar:

- Built-in-Forge-URL und Server-Key sind vorhanden.
- Der Modellkatalog antwortet mit 10 Modellen.
- Ein echter serverseitiger `invokeLLM`-Aufruf war erfolgreich und lieferte eine gültige Providerantwort.
- Der Agent-Runner nutzt standardmäßig den Built-in-Provider.

### Kimi

Kimi ist **nicht** verbunden:

- `KIMI_API_KEY` fehlt.
- `KIMI_ENABLED` ist nicht aktiviert.
- Das ist sicher und kein Fehler, solange Manus/Built-in der gewünschte Provider bleibt.

### IONOS

IONOS ist im Code vorbereitet, aber aus dem Studio heraus noch nicht betriebsbereit:

- `IONOS_ENABLED` ist vorhanden.
- API-Token, Datacenter-ID und Execution-Server-ID fehlen in der Studio-Umgebung.
- Deshalb kann das Studio den Cloud-Server nicht zuverlässig abfragen, provisionieren oder deployen.
- Die offenen Betriebsaufgaben sind öffentliche Server-IP, SSH-Preflight, Admin-Setup, TLS, Deployment und API-Subdomain.

## Resend und E-Mail

Die DNS-Seite ist korrekt eingerichtet und öffentlich auflösbar:

- DKIM: `resend._domainkey`
- MX: `send → feedback-smtp.ap-northeast-1.amazonses.com`
- SPF: `send → v=spf1 include:amazonses.com ~all`

Der hinterlegte Resend-Key wird vom API-Test jedoch mit **401 Unauthorized** abgelehnt. Damit sind Konto-Bestätigungs- und Lösch-E-Mails aus dem Studio derzeit **nicht verlässlich funktionsfähig**. Der Key muss im Resend-Dashboard geprüft, gegebenenfalls widerrufen und serverseitig durch einen gültigen Sending-Key ersetzt werden.

## Preise und Video-Kosten

### Sind Preise im Studio hinterlegt?

Nein. Das Projekt enthält derzeit:

- ein Projektbudget-Feld (`budgetCents`),
- Sicherheits- und Laufzeitbudgets als Konzept,
- IONOS-Kostenreferenzen in der Dokumentation.

Es gibt noch keine:

- Tarifmodelle für Studio-Nutzer,
- Credits oder Verbrauchszähler,
- LLM-Tokenkosten pro Auftrag,
- Worker-Minutenabrechnung,
- Storage-/Traffic-Abrechnung,
- Zahlungsanbieter- oder Rechnungslogik,
- Kostenanzeige im Dashboard.

### Was kostet ein Video?

Im Studio ist derzeit **keine Video-Generierungsfunktion und kein Video-Kostenrechner implementiert**. Deshalb gibt es aktuell keinen verlässlichen Studio-Preis pro Video.

Für ein späteres Video-Feature müssen mindestens Modell, Auflösung, Dauer, Szenenanzahl, Renderzeit, Voiceover, Musik, Speicher und Hosting als Kostenpositionen erfasst werden. Ohne ausgewählten Videoanbieter darf kein Preis im Produkt behauptet werden.

## Bereits funktionsfähig beziehungsweise vorbereitet

- Manus-OAuth und Workspace-Grundlage.
- Rollen und geschützte tRPC-Routen.
- Aufgaben, Statusmodell und persistente Queue.
- Leasing, Retry-/Dead-Letter-Grundlagen und Kill-Switch.
- Agent-Preflight und Safety-Gates.
- Freigaben und Audit-Ereignisse.
- Evidence-Pack-Grundlage.
- Projektprofile Web oder Web + Native.
- Strukturierter Projektbrief und initialer Plan.
- Workspace-isolierte Projektdateien und Draft-Patches.
- Preview-/Staging-Freigabegates.
- Artefakt-Uploads mit Hashes und Größenlimit.
- Android-Approval-Grundlage mit Push-Konzept.
- Admin-Konsole und IONOS-Readiness-Anzeige.

## Wichtigste fehlende Funktionen

### P0 – unabdingbar für ein echtes App-Builder-Produkt

1. Isolierter Worker pro Auftrag: MicroVM oder mindestens nachgewiesen isolierte VM.
2. Echter Code-Executor für Installation, Linting, Typecheck, Tests und Build.
3. Egress-Proxy und Netzwerk-Allowlist.
4. Task-gebundener Secret-Broker mit Rotation und Redaction.
5. Test-and-Repair-Schleife mit begrenzten Reparaturversuchen.
6. Echte Preview-URLs mit isolierten Umgebungen und synthetischen Daten.
7. Git-Branch-/Diff-/Export-Workflow.
8. Deployment nach Staging und Produktion mit Healthcheck und Rollback.
9. Backup/Restore und Datenbank-Migrationsprüfung.
10. Kostenlimits und ein sichtbarer Kosten- bzw. Credit-Zähler.

### P1 – wichtig für Enterprise

- SSO/SCIM und feinere Rollen.
- Strukturierte Logs, Metriken, Traces und Alarmierung.
- SBOM, Dependency- und Malware-Scans.
- Datenaufbewahrung, Export und Disaster-Recovery-Drills.
- Browser-E2E-Tests mit Screenshots und reproduzierbaren Receipts.
- Native Expo/React-Native-Builds mit signiertem AAB/TestFlight-Handoff.
- Resend-Kontofluss nach erfolgreicher API-Key-Korrektur.

### Nicht notwendig für den ersten sicheren Release

- 100-Agenten-Swarm.
- Eigener Hypervisor.
- Vollständige Desktop-/Browser-Automatisierung.
- Automatische App-Store-Veröffentlichung.
- Eigener LLM-Betrieb.
- Globales Multi-Region-Active/Active.

## Priorisierte nächsten Schritte

1. Resend-Key korrigieren und E-Mail-Integration erneut testen.
2. IONOS-API-Token, Datacenter-ID und Execution-Server-ID sicher hinterlegen.
3. Öffentliche Server-IP und SSH-Preflight abschließen.
4. Einen minimalen isolierten Worker mit deny-by-default Netzwerk und Ressourcenlimits bereitstellen.
5. Build-/Test-Runner mit Kill-Switch und Cleanup implementieren.
6. Kostenmodell für Manus-KI, Worker-Minuten, Storage und Videoanbieter als separate Ledger-Tabelle ergänzen.
7. Erst danach Video-Generierung und native App-Builds als echte Produktfunktionen freischalten.
