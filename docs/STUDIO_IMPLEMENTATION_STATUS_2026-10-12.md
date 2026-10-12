# BlackWaterLeaf Studio – Implementierungsstatus 2026-10-12

## Eingebaut

- Serverseitige Studio-Preispläne: Free, Creator, Studio und Enterprise.
- Deterministisches Credit-Modell für Video-Richtwerte.
- Video-Kostenkalkulator für Dauer, Qualität, Sprecher und Musik.
- Geschützte tRPC-Routen `pricing` und `videoEstimate`.
- Resend-Gateway mit sicherem Konfigurationsstatus und Versandvertrag.
- Readiness-Anzeige für Resend, IONOS und isolierte Sandbox.
- Kosten & Video als eigener Studio-Navigationsbereich.
- Stabiler Resend-Konfigurationstest ohne externe Live-Abhängigkeit.

## Validierung

- `pnpm check`: bestanden
- `pnpm test`: 9 Testdateien / 21 Tests bestanden
- `pnpm build`: bestanden

## Bewusst noch blockiert

- Resend-Liveversand: der aktuell hinterlegte Key wurde zuvor mit HTTP 401 abgelehnt und muss ersetzt werden.
- IONOS-Execution: Token, Datacenter-ID und Execution-Server-ID fehlen in der Studio-Runtime.
- Isolierte Sandbox: bleibt bis zur geprüften IONOS-Worker-, Firewall-, Ressourcen- und Kill-Switch-Abnahme deaktiviert.
- Video-Produktion: der Kalkulator ist aktiv; ein konkreter Video-Provider muss separat mit Quote, Limits und Kostenkontrolle verbunden werden.
- Abrechnung: die Preislogik ist ein Produkt-Richtwert, keine Zahlungs- oder Rechnungsintegration.

## Sicherheitsentscheidung

Keine automatische Abbuchung, kein automatischer externer Versand und keine Codeausführung wurden durch diese Änderung aktiviert. Nicht konfigurierte Integrationen bleiben deny-by-default blockiert.
