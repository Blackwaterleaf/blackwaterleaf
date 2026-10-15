# BlackWaterLeaf Studio – unabhängiger Betrieb

- [x] IONOS Cloud Server-Konfiguration und Provisionierung gestartet
- [x] Ubuntu-24.04-/Basic-Cube-S-Zielprofil festgelegt
- [x] Sicherheits-Skill für SSH, Bootstrap, Deploy, Rollback und Admin-Aktionen initialisiert
- [x] Secrets aus Skill- und Projektdateien ausgeschlossen
- [x] IONOS Webhosting Plus und Domain blackwaterleaf-studio.com verifiziert
- [x] Domain ist aktuell mit dem IONOS-Webspace verbunden
- [x] Webhosting-/Cloud-Server-Trennung dokumentiert
- [x] Admin-Konsole mit Status- und Sicherheits-Gates eingebaut
- [x] Resend-Gateway und sichere Konfigurationsanzeige eingebaut
- [x] Manus-Built-in-KI-Readiness separat sichtbar
- [x] Preispläne, Credit-Richtwerte und Nutzungsledger eingebaut
- [x] Video-Kostenkalkulator und persistente Video-Jobs mit Approval-Gate eingebaut
- [x] Runtime-Readiness für IONOS, Resend und Sandbox sichtbar
- [x] IONOS-Datacenter-ID und Execution-Server-ID ermittelt
- [x] Direkter IONOS-API-Test mit dem lokal validierten Token erfolgreich
- [x] Typecheck, 25 Tests und Produktionsbuild mit explizit validiertem Test-Token bestanden
- [x] Leeres Rootvolume ersetzt: Ubuntu 24.04 auf 120-GB-ESSENTIAL-Volume gebootet
- [x] SSH-Banner, SSH-Key-Zugang und root-owned SSH-Healthcheck erfolgreich geprüft
- [x] Nicht-root-Admin `bwladmin` mit sudo und schlüsselbasierter Anmeldung eingerichtet
- [x] UFW für IPv4/IPv6 mit ausschließlich 22/80/443 aktiviert
- [x] Lokale MariaDB, Drizzle-Migrationen (25 Tabellen) und root-only Runtime-Konfiguration eingerichtet
- [x] Node-Produktionsdienst, Nginx-Reverse-Proxy und öffentlicher HTTP-Smoke-Test erfolgreich
- [x] IONOS-API-Gateway auf dem unabhängigen Server mit HTTP 200 verifiziert
- [x] Resend-Key und Absender root-only auf IONOS hinterlegt; Resend-No-Send-Check bestätigt autorisierten Key (HTTP 422 wegen leerem Payload)

## Noch erforderlich für echten Produktivbetrieb

- [x] Eine öffentliche IPv4-Adresse im IONOS-VDC reserviert (Ressourcenzähler jetzt 1/5; IPv6-DHCP ist vorhanden)
- [x] Öffentliche IPv4 `31.70.65.6` dem Server zugeordnet; TCP-Erreichbarkeit von 22, 80 und 443 geprüft
- [x] SSH-Preflight mit dem neuen Server ausführen
- [x] IONOS-Ingress-Firewall erfolgreich provisioniert (VDC-Version 6): genau drei eindeutige Regeln SSH 22, HTTP 80 und HTTPS 443; keine FTP-/VNC-Regeln
- [x] Neuer 365-Tage-IONOS-Token direkt gegen Datacenter und Execution-Server mit HTTP 200 validiert
- [x] Neuer Token als primäre Runtime-Quelle unter `IONOS_API_TOKEN_CANDIDATE` hinterlegt; API- und Gateway-Tests bestanden
- [x] Keine zusätzliche Network Security Group erforderlich; UFW, IONOS-Ingress-Firewall und Systemd sind aktiv
- [x] Studio-Infrastruktur als Node-Dienst auf IONOS ausrollen und nach Auth-Abnahme produktiv freigeben
- [x] `blackwaterleaf-studio.com` und `www` auf `31.70.65.6` umgeschaltet; öffentliche Cloudflare-DNS-Prüfung bestätigt beide A-Records
- [x] Let's-Encrypt-TLS für Root und www ausgestellt; HTTPS, HTTP→HTTPS-Redirect und Studioantwort extern geprüft
- [x] Unabhängige lokale Magic-Link-Authentifizierung mit gehashten Einmal-Tokens und Sessions aktiviert; kompletter E2E-Smoke-Test: HTTP 302 plus `studio_session`-Cookie
- [x] Manus-OAuth im Local-Auth-Modus sauber deaktiviert; keine `OAUTH_SERVER_URL`-Fehlermeldung mehr im Dienststart
- [x] Runtime-Secret-Reload im Testprozess ohne lokalen Token-Override verifiziert
- [x] Schreibgeschützter IONOS-Preflight gegen den ausgewählten Server bestätigt
- [x] Neuen Resend-Sending-Key mit minimaler Sending-Berechtigung sicher hinterlegen
- [x] Resend-Domain und DKIM final verifiziert; Live-Versand sowie `auth.requestMagicLink` mit HTTP 200 getestet
- [x] Isolierten Worker als Release-Gate bewertet und bewusst gesperrt: Bubblewrap installiert, rootloser Netzwerk-Preflight abgelehnt, keine fremde Codeausführung freigeschaltet
- [x] Runway-Provider-Adapter, Kostenroute und Admin-Status integriert; Key validiert, aber Runway für den aktuellen Betrieb wieder deaktiviert
- [x] Videogenerierung bewusst zurückgestellt: kein kostenpflichtiger Render und keine Providerkosten ohne späteren separaten Startauftrag
- [x] Zahlungs-/Rechnungs-Gate bewertet und bewusst gesperrt: keine Abbuchung, kein Anbieter und keine Rechnung ohne rechtliche und kaufmännische Freigabe
- [x] Web- und Web+Native-Starter-Templates mit README, Entry-Datei und Security-Notizen integriert
- [x] Workspace-Tarifstatus sowie serverseitige Limits für Projekte und aktive Agent-Runs integriert
- [x] Migration `0010_lumpy_siren.sql` in der Studio-Datenbank angewendet
- [ ] Migration `0010_lumpy_siren.sql` und der aktuelle Builder-Build noch auf IONOS deployen; letzter SSH-Versuch wurde vom Server geschlossen

## Sicherheitsgrenze

Keine automatische Zahlung, kein automatischer externer Versand und keine Codeausführung werden ohne explizite Konfiguration und Freigabegates aktiviert.

Die Begründungen und Voraussetzungen stehen in `docs/RELEASE_GATES_2026-10-14.md`.
