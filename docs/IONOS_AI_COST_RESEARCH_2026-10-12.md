# IONOS AI Model Hub: Kosten- und Architekturgrundlage

**Datum:** 12. Oktober 2026  
**Zweck:** Grundlage für eine kosteneffiziente, schnelle und überprüfbar lernende BlackWaterLeaf-KI.

## Verbindliche Befunde

1. **Abrechnung und Wiederholungen.** IONOS rechnet LLM-Eingabe- und Ausgabetokens je Request ab. Wiederholungen werden jeweils erneut abgerechnet; wiederholte oder gecachte Eingaben erhalten derzeit keinen Preisnachlass. Das macht fehlertolerante, aber begrenzte Retry- und Eskalationspfade zwingend. [1]
2. **Gewähltes Modell.** `Qwen/Qwen3.5-9B` ist ein kompaktes multimodales Modell mit Bild- und Texteingabe. Bei deaktiviertem Thinking-Modus (`reasoning_effort: "none"`) sinken Latenz und unnötige Ausgabe-/Reasoning-Tokens. BlackWaterLeaf setzt dies bereits zentral. [2]
3. **Aktuelle LLM-Preise.** Für `Qwen3.5-9B` nennt die IONOS-Preisliste 0,11 USD je einer Million Eingabetokens und 0,17 USD je einer Million Ausgabetokens (Nettopreise). Output ist pro Token teurer; kurze strukturierte Antworten und keine unnötige zweite Modellanfrage sind daher besonders wirksam. [3]
4. **Datenabruf.** `BAAI/bge-m3` steht im IONOS AI Model Hub für mehrsprachige Einbettungen zur Verfügung und eignet sich als spätere, kontrollierte Erweiterung für semantische Suche. Für exakte Artnamen bleibt ein indizierter, deterministischer Katalogabgleich schneller und günstiger als jede KI- oder Embedding-Anfrage. [4]
5. **Transparenz.** IONOS stellt im DCD Cost & Usage eine modell- und einheitsbezogene Übersicht bereit; die Billing API kann aktuelle und tagesbezogene Nutzungsdaten liefern. [1]

## Umsetzungsprinzipien für BlackWaterLeaf

- **Kein unkontrolliertes Modelltraining:** Nutzerkorrekturen werden erst nach Staff-Freigabe als Qualitätsbeitrag gezählt. Die Basisgewichte des Modells werden nicht verändert.
- **Daten zuerst:** Exakte, wissenschaftlich freigegebene Katalogtreffer liefern eine direkte, quellengebundene Antwort ohne Modellaufruf.
- **KI nur bei Mehrwert:** Bildbestimmung und offene, fachliche Fragen bleiben beim IONOS-Modell; schwache Ergebnisse fordern zunächst bessere Einzelbilder statt einer teuren Wiederholung.
- **Wahrheitsgetreues Ledger:** Tatsächlich gemeldete Tokens werden pro Modellaufruf korrekt summiert; keine doppelte Erfassung bei einem einzigen Aufruf.
- **Achievements als überprüfbare Beiträge:** Punkte und Meilensteine honorieren bestätigte Korrekturen und Katalogbeiträge, nicht bloß KI-Nutzung.

## Implementierter Kennzahlenvertrag (BlackWaterLeaf)

Ab der Migration `0061_spooky_centennial` speichert jede erfolgreiche IONOS-Anfrage, sofern IONOS Tokenwerte zurückgibt:

| Kennzahl | Herkunft | Verwendung |
|---|---|---|
| Eingabe- und Ausgabetokens | IONOS-Antwort `usage` | Verbrauchstransparenz je Aufruf |
| Geschätzte Eingabe-, Ausgabe- und Gesamtkosten (USD) | Tokenwerte × IONOS-Preisliste vom 12.10.2026 | Durchschnitt pro Anfrage, Tarifkalkulation |
| Tarifversion | Serverkonstante | Nachvollziehbarkeit bei Preisänderungen |
| Kostenfreie Katalog-Schnellantworten | lokaler, exakter Fachkatalogtreffer | Separater Nullkosten-Zähler; keine KI-Anfrage |

**Wichtig:** Frühere Ledgerzeilen ohne von IONOS gemeldete Tokenwerte werden bewusst nicht rückwirkend bepreist. Sie bleiben aus Kostenmittelwerten heraus, damit Preisentscheidungen nicht auf erfundenen Daten beruhen.

Die Betreiberansicht zeigt Gesamtkosten, gemessene KI-Aufrufe, den Durchschnitt pro gemessener KI-Anfrage, Input-/Output-Token und die Zahl der kostenfreien Katalog-Schnellantworten. Erst nach ausreichend echten Messwerten kann daraus ein belastbarer Nutzerpreis, ein Paketpreis oder eine kostenlose Quote abgeleitet werden.

## Quellen

[1]: https://docs.ionos.com/cloud/ai/ai-model-hub/faqs "IONOS AI Model Hub FAQ: Cost & Usage"
[2]: https://docs.ionos.com/cloud/ai/ai-model-hub/models/llms/qwen3-5-9b "IONOS AI Model Hub: Qwen3.5 9B"
[3]: https://docs.ionos.com/cloud/support/general-information/price-list/ionos-cloud-inc "IONOS CLOUD Inc. Price List"
[4]: https://docs.ionos.com/cloud/ai/ai-model-hub/models/embedding-models/bge-m3 "IONOS AI Model Hub: BGE M3"
