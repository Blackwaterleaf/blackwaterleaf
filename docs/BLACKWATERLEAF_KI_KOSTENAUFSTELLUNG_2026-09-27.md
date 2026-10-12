# BlackWaterLeaf · KI-Kostenaufstellung

**Stand:** 27. September 2026  
**Zweck:** Aktive KI-Pfade, Kostenrisiken und Schutzmaßnahmen für BlackWaterLeaf verständlich bewerten.

## Kurzfazit

Die normale KI-Suche ist derzeit **nicht der teuerste Teil**. Sie sucht zunächst in den veröffentlichten BlackWaterLeaf-Katalogtabellen per SQL und ruft dafür kein Sprachmodell auf. Der größte aktive Kostenhebel ist die **Pflanzenbestimmung mit Bildern**, weil sie `gemini-3.1-pro-preview` mit bis zu drei hochauflösenden Bildern verwendet und anschließend optional eine zweite Pl@ntNet-Prüfung ausführt. Der normale Assistent und die Aquarium-Analyse verwenden `gpt-5-mini` und sind nach öffentlichen Listenpreisen deutlich günstiger.

Die tatsächliche Rechnung kann abweichen, weil BlackWaterLeaf über den internen Forge-Proxy (`BUILT_IN_FORGE_API_URL`) läuft. Im Repository ist kein verbindlicher Forge-Tarif hinterlegt. Die folgenden Zahlen sind deshalb **Planungswerte auf Basis der öffentlich dokumentierten Modellpreise**, nicht die endgültige Anbieterrechnung.

## Aktive und nicht aktive Kostenpfade

| Funktion | Aktiver Pfad | Kostenrelevanz | Aktueller Schutz |
|---|---|---:|---|
| KI-Chat / allgemeine Naturfragen | `gpt-5-mini` | niedrig | 10 abgeschlossene KI-Anfragen pro Nutzer und UTC-Tag; zusätzlich 20 HTTP-Anfragen je 15 Minuten pro Serverinstanz |
| Aquarium-Analyse | `gpt-5-mini` | niedrig bis mittel | fällt unter dasselbe Tageskontingent |
| Pflanzenbestimmung | `gemini-3.1-pro-preview` mit Bildinput | **höchster aktiver KI-Pfad** | fällt unter dasselbe Tageskontingent; maximal drei Bilder pro Anfrage |
| Zweitprüfung der Pflanze | Pl@ntNet, ein Request mit den akzeptierten Ansichten | niedrig bei Free-Plan, danach vertraglich relevant | kein eigener BlackWaterLeaf-Tageszähler; Anbieterlimit gilt |
| KI-Suche im Katalog | SQL-Katalogabgleich plus KI-Antwort | niedrig | Katalog wird vor dem Modellaufruf begrenzt auf maximal sechs Referenzen |
| Sprachtranskription | Helper vorhanden, aber keine aktive tRPC-Route gefunden | aktuell **0 aktive Kosten** | vor Freischaltung separat begrenzen |
| Bildgenerierung | Helper vorhanden, aber keine aktive Nutzung gefunden | aktuell **0 aktive Kosten** | vor Freischaltung separat begrenzen |

## Öffentliche Preisanker

OpenAI veröffentlicht für `gpt-5-mini` derzeit **$0,25 je 1 Mio. Input-Tokens** und **$2,00 je 1 Mio. Output-Tokens** im Standardtarif.[1]

Google veröffentlicht für `gemini-3.1-pro-preview` im Standardtarif **$2,00 je 1 Mio. Input-Tokens** bis 200.000 Prompt-Tokens und **$12,00 je 1 Mio. Output-Tokens** bis 200.000 Prompt-Tokens. Bei diesem Modell zählen auch Thinking-Tokens zum Output.[2]

Pl@ntNet bietet für geringe Nutzung einen kostenlosen Plan mit **500 Identifikationen pro Tag**. Der kommerzielle Pro-Plan ist mit **€1.000 pro Jahr** ausgewiesen; danach gelten volumenabhängige Identifikationspreise. Eine Non-Profit-Nutzung kann nach Prüfung kostenlos möglich sein.[3]

## Beispielrechnung pro Anfrage

Die Bildkosten hängen stark von Bildabmessungen und Modell-Tokenisierung ab. Deshalb ist bei Pflanzenbildern nur eine Bandbreite seriös.

| Beispiel | angenommener Input | angenommener Output | Planungswert je Anfrage |
|---|---:|---:|---:|
| Chat, kurz | 1.500 Tokens | 500 Tokens | ca. **$0,0014** |
| Chat, lang mit Verlauf/Katalogkontext | 3.000 Tokens | 700 Tokens | ca. **$0,0022** |
| Aquarium-Analyse | 2.200 Tokens | 600 Tokens | ca. **$0,0018** |
| Pflanzenbestimmung, kompakter Bildinput | 2.000 Tokens | 700 Tokens | ca. **$0,0124** |
| Pflanzenbestimmung, großer Mehrbildinput | 10.000 Tokens | 700 Tokens | ca. **$0,0284** |

Die Pflanzenwerte enthalten nur den Gemini-Anteil. Pl@ntNet ist im kostenlosen Kontingent mit **€0** anzusetzen; im bezahlten Plan kommen mindestens die dort ausgewiesene Jahresgebühr und anschließend volumenabhängige Kosten hinzu.

## Monatliche Szenarien

Die folgenden Szenarien zeigen ausschließlich Modell- und Pl@ntNet-Kosten. Hosting, Datenbank, Storage, E-Mail, Monitoring, CDN und App-Store-Kosten sind nicht enthalten.

| Nutzung pro Monat | Modellszenario | Grober variabler KI-Wert |
|---|---|---:|
| 300 Chats | 1.500 Input / 500 Output je Chat | ca. **$0,41** |
| 300 Chats | 3.000 Input / 700 Output je Chat | ca. **$0,65** |
| 300 Pflanzenbestimmungen | kompakter Bildinput | ca. **$3,72** |
| 300 Pflanzenbestimmungen | großer Mehrbildinput | ca. **$8,52** |
| 1.000 Pflanzenbestimmungen | großer Mehrbildinput | ca. **$28,40** |

Das aktuelle Limit von zehn abgeschlossenen KI-Anfragen pro Nutzer und Tag schützt vor unbegrenzter Nutzung. Es ist aber **kein globales Monatsbudget**. Bei 100 aktiven Nutzern mit jeweils zehn teuren Pflanzenbestimmungen an 30 Tagen wären bis zu 30.000 Bestimmungen pro Monat technisch möglich. Der Modellwert läge in der oberen Beispielannahme bei ungefähr **$852**, bevor Forge-Aufschläge und übrige Infrastruktur berücksichtigt werden.

## Wichtigste Kostenrisiken im aktuellen Code

### 1. Pflanzenbestimmung nutzt das teure Pro-Modell

`plantIdentify` verwendet `gemini-3.1-pro-preview`, übergibt die Bilddaten mit `detail: "high"` und erlaubt bis zu drei Bilder. Das ist fachlich leistungsfähig, aber der teuerste aktive Workflow.

### 2. Wiederholungen können Kosten vervielfachen

Der zentrale LLM-Client wiederholt nicht erfolgreiche HTTP- und Netzwerkaufrufe inzwischen höchstens zweimal und nur bei sicheren temporären Fehlern. Dadurch kann ein einzelner Nutzeraufruf höchstens drei Upstream-Versuche auslösen. Ob ein fehlgeschlagener Versuch berechnet wird, hängt vom Proxy und Provider ab; eine Idempotenzstrategie bleibt für kostenkritische Bildanfragen sinnvoll.

### 3. Der Tageszähler zählt nur abgeschlossene Anfragen

Die Datenbankreservierung wird vor dem Modellaufruf angelegt. `hasAssistantCallsToday` zählt jedoch nur Einträge mit `completionChars > 0`. Ein Fehler wird daher nicht als abgeschlossene Tagesnutzung gezählt. Das ist nutzerfreundlich, kann aber bei wiederholten Fehlern mehr Upstream-Versuche erlauben. Für Bilder sollte zusätzlich ein kleines Fehler- und Versuchslimit pro Nutzer gelten.

### 4. Die KI-Suche selbst ist nicht das Hauptproblem

Der Katalogabgleich begrenzt die gefundenen Pflanzen- und Aquariumreferenzen auf maximal sechs Datensätze. Das reduziert den Prompt. Die SQL-Suche kostet kein Modellbudget; der anschließende Chat-Aufruf verursacht nur den günstigen `gpt-5-mini`-Anteil.

## Professionelle Empfehlung für einen sicheren Betrieb

**Sofort:** Pflanzenbestimmung auf zwei Stufen umstellen. Zuerst eine günstige Vorprüfung mit komprimiertem Bild und kleinem Vision-Modell. Nur bei ausreichender Bildqualität oder unklaren Kandidaten das Pro-Modell verwenden. Pl@ntNet sollte als unabhängige Zweitprüfung möglichst im kostenlosen 500er-Tageskontingent bleiben.

**Vor dem öffentlichen Wachstum:** Ein globales tägliches Budget einführen. Zusätzlich zu den zehn Nutzeranfragen sollte BlackWaterLeaf beispielsweise ein serverweites Tagesbudget für Modellkosten und ein separates Kontingent für Bildbestimmungen führen. Wird das Budget erreicht, bleibt Katalogsuche und Community verfügbar, während nur die teure Bild-KI pausiert.

**Für Pro:** Nicht „unbegrenzte KI“ versprechen. Sinnvoller sind feste monatliche Bestimmungspakete, zum Beispiel 20 Bildbestimmungen im Pro-Tarif. Chats können großzügiger, aber ebenfalls fair-use-begrenzt werden. So bleibt der Deckungsbeitrag kalkulierbar.

**Für Transparenz:** `assistant_usage` sollte neben Tokenzahlen auch `providerRequestCount`, `estimatedCostUsd`, `imageCount`, `inputBytes`, `failureReason` und `retryCount` speichern. Die vorhandenen Tokenfelder reichen für eine spätere Rechnungsschätzung, aber noch nicht für eine belastbare Kostenkontrolle je Workflow.

## Nachtrag · 28. September 2026

Die empfohlenen Infrastrukturmaßnahmen für den günstigen Betrieb sind teilweise umgesetzt: öffentliche Wissensabfragen werden zehn Minuten pro Prozessinstanz gecacht, veröffentlichte Artikel- und Taxonomiefilter besitzen zusätzliche Datenbankindizes, und der LLM-Client wiederholt nur noch temporäre Fehler maximal zweimal. Zusätzlich ist ein optionaler IONOS CLOUD AI Model Hub-Provider vorbereitet. Er wird erst nach expliziter Konfiguration von `AI_PROVIDER=ionos` und eines geschützten `IONOS_AI_API_KEY` aktiv. Der standardmäßige Provider bleibt bis dahin unverändert.

Ein Anbieter-Budget in Euro ist weiterhin über die IONOS-Billing-/Budgetoberfläche zu setzen; Request-Limits im Code sind kein Ersatz für ein Vertragsbudget.

## Schlussbewertung

Bei normaler Nutzung drohen die KI-Modellkosten nicht automatisch die Serverkosten zu sprengen. Das Risiko entsteht bei **vielen Nutzern mit wiederholten Mehrbild-Pflanzenbestimmungen**, beim teuren Pro-Modell und bei Retries. Die richtige Priorität lautet daher: **Bildbestimmung budgetieren, Modellstufen einführen, globale Kostenlimits ergänzen und erst danach weitere KI-Funktionen wie Sprache oder Bildgenerierung freischalten.**

## References

[1]: https://developers.openai.com/api/docs/pricing "OpenAI API Pricing"
[2]: https://ai.google.dev/gemini-api/docs/pricing "Gemini API Pricing"
[3]: https://my.plantnet.org/pricing "Pl@ntNet API Pricing and Plans"
