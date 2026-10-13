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
- [ ] Network Security Group optional ergänzen; UFW, Systemd und HTTP sind eingerichtet
- [x] Studio-Infrastruktur als Node-Dienst auf IONOS ausrollen; Produktivfreigabe bleibt bis zur Auth-Abnahme gesperrt
- [ ] Domain/API-Subdomain von Webhosting auf `31.70.65.6` umschalten und TLS ausstellen
- [ ] Produktions-Auth implementieren und per Login-Smoke-Test verifizieren; aktuell meldet der Dienst fehlendes `OAUTH_SERVER_URL`
- [x] Runtime-Secret-Reload im Testprozess ohne lokalen Token-Override verifiziert
- [x] Schreibgeschützter IONOS-Preflight gegen den ausgewählten Server bestätigt
- [x] Neuen Resend-Sending-Key mit minimaler Sending-Berechtigung sicher hinterlegen
- [ ] Resend-Liveversand mit bestätigter Domain und Testmail verifizieren
- [ ] Isolierten Worker mit Ressourcenlimits, Egress-Allowlist und Kill-Switch abnehmen
- [ ] Echten Video-Provider mit Provider-Quote und aktivem Render-Worker integrieren
- [ ] Zahlungsanbieter und Rechnungslogik nach rechtlicher Prüfung integrieren

## Sicherheitsgrenze

Keine automatische Zahlung, kein automatischer externer Versand und keine Codeausführung werden ohne explizite Konfiguration und Freigabegates aktiviert.
