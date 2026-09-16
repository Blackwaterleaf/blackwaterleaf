# BlackwaterLeaf: Produktions-Overlay-Ergänzung

**Stand:** 16. September 2026  
**Branch:** `design/reference-overlay-layout`  
**Grundlage:** `BlackwaterLeaf-Design-Handoff.zip`, die Zielgrafiken in `docs/design/screens/` und die übergebene Screenshot-Komposition.

## Ergebnis

Die in der Compliance-Prüfung noch offenen visuellen Kernpunkte wurden auf dem Übergabe-Branch umgesetzt. Die Gestaltung verwendet nun in den produktiven Routen dieselbe Bildsprache wie die Zielgrafiken: fast schwarzes Waldgrün, echte Regenwald- und Unterwasserfotografie, konturierte Glasflächen, dezente Lichtreflexe und eine viergliedrige, schwebende Mobile-Navigation. Die bestehenden Datenzugriffe, Formulare, Authentifizierung und Routen bleiben erhalten.

| Bereich | Umsetzung | Nachweis |
| --- | --- | --- |
| **Botanik** | Hero mit Blattmotiv und Neongrün; Sammlung bleibt datengesteuert und der Zugang bleibt ehrlich an die Anmeldung gebunden. | `/plants`, `/flow/botanik` |
| **Aquaristik** | Hero mit lokal versioniertem Unterwasserbild, Neonblau, Offline-Sensorleiste und datengesteuerter Beckenübersicht. | `/aquariums`, `/flow/aquaristik` |
| **Terraristik** | Die Wahlkarte führt zur vollständigen gelbgrünen Terraristik-Zielseite. | `/flow/terraristik` |
| **KI-Assistent** | Die Wahlkarte führt zur lila Zielseite mit den vier vorhandenen KI-Einstiegen. | `/flow/ki-assistent` |
| **Live, Foto und Beitrag** | Die drei bestehenden Zielseiten bleiben über das Sieben-Aktionen-Rad erreichbar; der Live-Status gibt weiterhin transparent „Noch nicht verbunden“ aus. | `/flow/live`, `/flow/foto`, `/flow/beitrag` |
| **Community** | Eigener Hero, Auswahlkarten und ein vollständiger Leerzustand. Ohne reale Beiträge erscheinen keine simulierten Personen, Kennzahlen oder Interaktionen. | `/feed` |
| **Navigation** | Die untere Navigation entspricht dem Screenshot mit vier Bereichen: Home, Entdecken, Community und Profil. | Alle `AppLayout`-Routen |
| **Bildbereitstellung** | Fünf geprüfte Bereichsbilder werden versioniert aus `client/public/design/` ausgeliefert. Damit sind die neuen Heroes nicht von temporären `/manus-storage/`-Pfaden abhängig. | `/design/*.jpg` |

## Verbindliche Farbzuordnung

| Bereich | Hexwert | Anwendung |
| --- | --- | --- |
| Botanik | `#C7F35B` | Hero-Betonung, Auswahlkarte, Navigation |
| Aquaristik und Live | `#28D8FF` | Hero-Rahmen, Aktionen und Wasserwelt |
| Terraristik | `#E1D661` | Terraristik-Zielseite und Auswahlkarte |
| KI-Assistent | `#C36BFF` | KI-Zielseite und Auswahlkarte |

## Tests

Der Vite-Produktionsbuild ist erfolgreich. `git diff --check` ist fehlerfrei. Die zehn relevanten Einstiegs- und Zielrouten sowie alle fünf neuen, lokal ausgelieferten Bilddateien lieferten in der lokalen Vorschau HTTP `200`. Die Browserprüfung bestätigte außerdem die Botanik-, Aquaristik-, KI-, Live- und Community-Zustände, einschließlich des ehrlichen Community-Leerzustands.

## Übergabe und Veröffentlichung

Die Umsetzung ist im GitHub-Pull-Request auf dem genannten Branch enthalten. Die aktuell öffentliche Website `blackwaterleaf.com` stammt nach der Routen- und Bundle-Prüfung aus einer anderen ausgelieferten Codebasis als dieser GitHub-Branch; sie wird durch einen Git-Push allein nicht unmittelbar verändert. Für die Veröffentlichung muss der Hosting- bzw. Deployment-Workflow diese Branch-Änderungen als Buildquelle übernehmen. Die gestalterische und technische Übergabe ist dafür vollständig versioniert.
