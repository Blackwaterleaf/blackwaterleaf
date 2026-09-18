# BlackWaterLeaf – SEO-Prüfung der Startseite

**Prüfdatum:** 16. September 2026
**Prüfumfang:** Meta-Keywords, dynamischer Seitentitel und Weltbild-Alt-Texte auf `/`.

| Vorgabe | Implementierung | Laufzeitprüfung | Ergebnis |
|---|---|---|---|
| Meta-Keywords | `Botanik, Aquaristik, Terraristik, Pflanzenpflege, Naturbeobachtung` | 5 fokussierte Keywords | bestanden |
| Keywordgrenze | Mindestens 3, höchstens 8 | 5 | bestanden |
| Seitentitel | `BlackWaterLeaf – Botanik, Aquaristik & Terraristik` | `document.title`, 50 Zeichen | bestanden |
| Titelgrenze | Mindestens 30, höchstens 60 Zeichen | 50 Zeichen | bestanden |
| Bilder | Vier Weltkartenbilder | Vier eindeutige, nichtleere Alt-Texte | bestanden |

Der Seitentitel wird auf der Startseite über `document.title` gesetzt. Der initiale HTML-Titel besitzt denselben deutschen Wert für Crawler und für den kurzen Zeitraum vor der React-Hydration. Englisch erhält einen gleichwertigen Laufzeittitel innerhalb derselben Grenze.

| Weltkarte | Deutscher Alt-Text |
|---|---|
| Botanik | Regenwaldpflanzen und Wasserfall für die Botanik-Welt |
| Aquaristik | Bepflanztes Süßwasseraquarium für die Aquaristik-Welt |
| Terraristik | Moosbedecktes Terrarium für die Terraristik-Welt |
| KI-Assistent | Regenwaldmotiv für den BlackWaterLeaf KI-Assistenten |

Die Prüfung bestand aus einem Vitest-Vertrag, einer TypeScript-Prüfung, einem Produktionsbuild und einer Browser-Laufzeitabfrage. Alle 57 Tests bestanden.
