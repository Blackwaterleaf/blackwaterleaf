# BlackWaterLeaf – IONOS AI und Kostenkontrolle

**Stand:** 28. September 2026

## Eingebaute Schutzmaßnahmen

- Öffentliche Wissenslisten und Artikelsuche nutzen einen serverseitigen **10-Minuten-TTL-Cache**.
- Die Datenbank verwendet unterstützte Composite-Indizes für veröffentlichte Artikel und Katalogarten.
- Der aktuelle TiDB-kompatible Datenbankdienst unterstützt **keine FULLTEXT-Indizes**; deshalb wurde kein nicht unterstützter FULLTEXT-Plan ausgerollt.
- Nicht wiederholbare LLM-Fehler (z. B. 400/401/403/404) werden nicht erneut gesendet.
- Netzwerkfehler und temporäre Statuscodes werden höchstens **zweimal** wiederholt.
- Der bestehende Nutzer-Tageszähler und die vorhandenen Identifikationslimits bleiben aktiv.

## Optionaler IONOS-Provider

Der LLM-Client kann ohne Codeänderung auf IONOS CLOUD AI Model Hub umgestellt werden. Standardmäßig bleibt der bisherige Forge-Provider aktiv, solange `AI_PROVIDER` nicht auf `ionos` gesetzt wird.

Im WebDev-Projekt müssen diese **Secrets/Variablen** gesetzt werden:

```text
AI_PROVIDER=ionos
IONOS_AI_API_KEY=<IONOS-Authentication-Token>
IONOS_AI_API_URL=https://openai.inference.de-txl.ionos.com
IONOS_AI_MODEL=Qwen/Qwen3.5-9B
```

Der API-Key gehört ausschließlich in geschützte Projekt-Secrets und niemals in Git, den Client-Bundle oder Chat-Nachrichten. Das Modell `Qwen/Qwen3.5-9B` wurde gewählt, weil IONOS es als kleines, schnelles Text-/Bildmodell dokumentiert. Der Client setzt bei IONOS standardmäßig `reasoning_effort=none`, damit keine unnötigen Reasoning-Tokens erzeugt werden. Für schwierige Fälle kann später gezielt ein anderes Modell über `IONOS_AI_MODEL` ausgewählt werden.

### Erstmalige Aktivierung

1. In IONOS AI Model Hub einen Authentication Token anlegen.
2. Den Token als WebDev-Projektsecret `IONOS_AI_API_KEY` hinterlegen.
3. `AI_PROVIDER=ionos` und die oben genannten URL-/Modellwerte setzen.
4. Einen einzelnen Chat- und einen einzelnen Bildtest durchführen.
5. Provider und Modell in den Serverlogs bzw. der Nutzungsübersicht verifizieren; den Token selbst niemals loggen.

Ohne den Authentication Token wird IONOS absichtlich **nicht** aktiviert. Dadurch bleibt die Anwendung funktionsfähig und fällt nicht versehentlich auf einen unkonfigurierten externen Dienst zurück.

## Offene Kontogrenze

Ein echtes Euro-Monatsbudget kann nur über IONOS-Konto-/Billing-Einstellungen oder einen serverseitigen Kostenmonitor mit IONOS-Nutzungsdaten garantiert werden. Der Anwendungsschutz begrenzt Requests und Retries, ersetzt aber keine Anbieter-Abrechnung. Vor öffentlicher Skalierung sollten zusätzlich ein IONOS-Budgetalarm und ein separates Kontingent für bildintensive Bestimmungen eingerichtet werden.

## Offizielle IONOS-Referenzen

- [AI Model Hub Übersicht](https://docs.ionos.com/cloud/ai/ai-model-hub)
- [OpenAI-kompatible Textgenerierung](https://docs.ionos.com/cloud/ai/ai-model-hub/how-tos/text-generation)
- [Qwen3.5-9B Modell-ID und Bildinput](https://docs.ionos.com/cloud/ai/ai-model-hub/models/llms/qwen3-5-9b)
