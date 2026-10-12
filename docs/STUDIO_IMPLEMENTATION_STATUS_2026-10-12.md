# BlackWaterLeaf Studio – Implementierungsstatus 2026-10-12

## Eingebaut

- Serverseitige Studio-Preispläne: Free, Creator, Studio und Enterprise.
- Deterministisches Credit-Modell für Video-Richtwerte.
- Persistenter, workspace-isolierter Nutzungsledger für Video-, LLM-, Worker- und Storage-Einheiten.
- Persistente Video-Jobs mit Status `awaiting_approval` und Provider-Gate.
- Video-Kostenkalkulator für Dauer, Qualität, Sprecher und Musik.
- Geschützte tRPC-Routen `pricing` und `videoEstimate`.
- Resend-Gateway mit sicherem Konfigurationsstatus und Versandvertrag.
- Runtime-Readiness-Anzeige für Resend, IONOS und isolierte Sandbox.
- Rollenbeschränkter, schreibgeschützter IONOS-Preflight für den Adminbereich; keine Mutationen.
- Separater Status für die serverseitig verfügbare Manus-Built-in-KI und den optionalen Kimi-Provider.
- Kosten & Video als eigener Studio-Navigationsbereich.
- Stabiler Resend-Konfigurationstest ohne externe Live-Abhängigkeit.

## Validierung

- `pnpm check`: bestanden
- `pnpm test`: 11 Testdateien / 25 Tests bestanden
- `pnpm build`: bestanden

## Bewusst noch blockiert

- Resend-Liveversand: der aktuell hinterlegte Key wurde zuvor mit HTTP 401 abgelehnt und muss ersetzt werden.
- IONOS-Runtime: Datacenter-ID und Execution-Server-ID sind bekannt; der lokal validierte Token erreichte die IONOS-API erfolgreich. Der aktuell injizierte Sandbox-Runtimewert ist jedoch maskiert/ungültig und wurde deshalb nicht als „bereit“ akzeptiert. Ein Runtime-Secret-Reload ohne Override bleibt offen.
- Isolierte Sandbox: bleibt bis zur geprüften IONOS-Worker-, Firewall-, Ressourcen- und Kill-Switch-Abnahme deaktiviert.
- Video-Produktion: der Kalkulator ist aktiv; ein konkreter Video-Provider muss separat mit Quote, Limits und Kostenkontrolle verbunden werden.
- Abrechnung: die Preislogik ist ein Produkt-Richtwert, keine Zahlungs- oder Rechnungsintegration.

## Sicherheitsentscheidung

Keine automatische Abbuchung, kein automatischer externer Versand und keine Codeausführung wurden durch diese Änderung aktiviert. Nicht konfigurierte Integrationen bleiben deny-by-default blockiert.
