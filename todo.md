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
- [x] Preispläne und Credit-Richtwerte eingebaut
- [x] Video-Kostenkalkulator eingebaut
- [x] Runtime-Readiness für IONOS, Resend und Sandbox sichtbar
- [x] Typecheck, 21 Tests und Produktionsbuild bestanden

## Noch erforderlich für echten Produktivbetrieb

- [ ] Öffentliche Cloud-Server-IP ermitteln bzw. öffentliche IPv4/Internet-Anbindung freigeben
- [ ] SSH-Preflight mit dem neuen Server ausführen
- [ ] Nicht-root-Admin, UFW, Systemd und TLS einrichten
- [ ] Studio als unabhängigen Node-Dienst auf IONOS deployen
- [ ] API-Subdomain auf den Cloud Server zeigen lassen
- [ ] IONOS-API-Token, Datacenter-ID und Execution-Server-ID sicher hinterlegen
- [ ] Gültigen Resend-Sending-Key hinterlegen und Liveversand testen
- [ ] Isolierten Worker mit Ressourcenlimits, Egress-Allowlist und Kill-Switch abnehmen
- [ ] Echten Video-Provider mit Provider-Quote, Nutzungsledger und Budgetstop integrieren
- [ ] Zahlungsanbieter und Rechnungslogik nach rechtlicher Prüfung integrieren

## Sicherheitsgrenze

Keine automatische Zahlung, kein automatischer externer Versand und keine Codeausführung werden ohne explizite Konfiguration und Freigabegates aktiviert.
