# BlackWaterLeaf Studio – Implementierungsstatus 2026-10-15

## Produktiv umgesetzt

- Unabhängiger IONOS-Betrieb mit Ubuntu 24.04, MariaDB, Node-Dienst, Nginx, UFW, SSH-Healthcheck und Let's-Encrypt-TLS.
- `blackwaterleaf-studio.com` und `www` zeigen auf den Cloud-Server; HTTPS und HTTP→HTTPS-Redirect sind extern geprüft.
- Lokale Magic-Link-Anmeldung mit gehashten Einmal-Tokens, Sessions und Resend-Versand ist aktiv.
- Persistente Agenten-Queue mit Leasing, Retry-/Dead-Letter-Zuständen, Checkpoints und Kill-Switch.
- App Builder MVP mit Projektprofilen, Code-Workspace, Preview-/Staging-Gates und Approval-Workflow.
- Evidence-Pack-, Audit- und Nutzungsledger-Grundlagen.
- Sicherheits- und Readiness-Anzeigen für IONOS, Resend, Sandbox, Manus-Built-in-KI, Kimi und Runway.
- Preispläne und Credit-Limits transparent in Free, Creator, Studio und Enterprise gestaffelt.
- Runway-Adapter, Kostenroute und Credential-Smoke-Test integriert; Runway ist aktuell bewusst deaktiviert.

## Aktuelle Tarifstruktur

| Plan | Preis | Credits | Projekte | Nutzer | Aktive Runs |
|---|---:|---:|---:|---:|---:|
| Free | 0 € | 20 | 1 | 1 | 1 |
| Creator | 9,90 €/Monat | 400 | 3 | 1 | 3 |
| Studio | 24,90 €/Monat | 1.500 | 10 | 3 | 8 |
| Enterprise | 79,00 €/Monat | 6.000 | 50 | 10 | 20 |

Die Preise sind derzeit **Produkt-Richtwerte**. Zahlungsanbieter, automatische Abbuchungen und Rechnungen bleiben deaktiviert.

## Validierung

- `pnpm check`: bestanden
- `pnpm test`: bestanden, inklusive Pricing-, IONOS-, Auth-, Resend-, Worker- und Runway-Tests
- `pnpm build`: bestanden
- IONOS-API- und Gateway-Preflight: HTTP 200
- Öffentliche Root- und www-HTTPS-Prüfung: HTTP 200
- Runway-Credential-Smoke-Test: authentifiziert; keine Generierung gestartet

## Bewusst deaktiviert

- **Sandbox-Codeausführung:** deny-by-default, weil die rootlose Netzwerkisolation des aktuellen IONOS-Kernels nicht ausreichend abgenommen ist.
- **Videogenerierung:** Runway-Key ist hinterlegt und validiert, aber `RUNWAY_ENABLED=false`; der freigegebene Render scheiterte vor dem Start an fehlenden Runway-Credits. Es wurde kein Output gespeichert.
- **Zahlungen:** keine Abbuchung und keine Rechnungsstellung ohne spätere rechtliche und kaufmännische Freigabe.

## Sicherheitsentscheidung

Nicht konfigurierte oder ausdrücklich deaktivierte Integrationen dürfen keine kostenpflichtigen Jobs, Codeausführung oder automatischen Abbuchungen auslösen. Der erste Video-Render bleibt ein separater späterer Auftrag.
