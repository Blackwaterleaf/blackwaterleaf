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

## Noch erforderlich für echten Produktivbetrieb

- [ ] Öffentliche IPv4-Adresse im IONOS-VDC zuweisen (aktuell 0/5 IPs; IPv6-DHCP ist vorhanden)
- [ ] SSH-Preflight mit dem neuen Server ausführen
- [ ] Firewall/Security-Group aktivieren; danach Nicht-root-Admin, UFW, Systemd und TLS einrichten
- [ ] Studio als unabhängigen Node-Dienst auf IONOS deployen
- [ ] API-Subdomain auf den Cloud Server zeigen lassen
- [ ] Runtime-Secret-Reload ohne Maskierungs-Override verifizieren
- [ ] Schreibgeschützten IONOS-Preflight aus der laufenden Studio-Runtime bestätigen
- [ ] Gültigen Resend-Sending-Key hinterlegen und Liveversand testen
- [ ] Isolierten Worker mit Ressourcenlimits, Egress-Allowlist und Kill-Switch abnehmen
- [ ] Echten Video-Provider mit Provider-Quote und aktivem Render-Worker integrieren
- [ ] Zahlungsanbieter und Rechnungslogik nach rechtlicher Prüfung integrieren

## Sicherheitsgrenze

Keine automatische Zahlung, kein automatischer externer Versand und keine Codeausführung werden ohne explizite Konfiguration und Freigabegates aktiviert.
