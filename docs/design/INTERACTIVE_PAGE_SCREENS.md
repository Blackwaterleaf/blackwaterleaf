# BlackwaterLeaf: Grafische Zielseiten

> **Zweck:** Diese sieben Grafiken sind die verbindlichen visuellen Zielbilder für die Seiten, die sich **nach einem Tipp auf eine Auswahl** öffnen. Sie sind keine erneuten Startseiten: Jede Grafik zeigt ihren eigenen Hero, ihre vier Hauptaktionen und ihre eigene Akzentfarbe.

Die Komposition folgt dem bestätigten KI-Screen: Markenleiste, Sensorleiste, großer visueller Bereichs-Hero, vier bildbasierte Funktionskarten und die schwebende Bottom Navigation. Für eine Umsetzung in Web und App werden die vorhandenen Seitenfunktionen und Routen beibehalten; nur deren visuelle Darstellung wird entlang dieser Bildreferenzen angeglichen.

| Auswahl / Seite | Zielroute | Akzent | Grafik |
| --- | --- | --- | --- |
| **Botanik** | `/flow/botanik` → Pflanzenfunktion | Neon-Grün `#C7F35B` | [Botanik-Screen](screens/01-botanik.jpg) |
| **Aquaristik** | `/flow/aquaristik` → Aquarienfunktion | Neon-Blau `#28D8FF` | [Aquaristik-Screen](screens/02-aquaristik.jpg) |
| **Terraristik** | `/flow/terraristik` | Gelbgrün `#E1D661` | [Terraristik-Screen](screens/03-terraristik.jpg) |
| **KI-Assistent** | `/flow/ki-assistent` → `/ai` | Neon-Lila `#C36BFF` | [KI-Screen](screens/04-ki-assistent.jpg) |
| **Live-Bereich** | `/flow/live` | Neon-Blau `#28D8FF` | [Live-Screen](screens/05-live-bereich.jpg) |
| **Foto** | `/flow/foto` | Neon-Grün `#C7F35B` | [Foto-Screen](screens/06-foto.jpg) |
| **Beitrag** | `/flow/beitrag` → `/feed` | Blatt-Grün `#C7F35B` | [Beitrags-Screen](screens/07-beitrag.jpg) |

## 1. Botanik – Seite nach dem Tippen

![Grafische Zielseite Botanik](screens/01-botanik.jpg)

Die **Botanikseite** bündelt Sammlung, Anlage, KI-Bestimmung und Pflegewissen. Der große nasse Alocasia-Hero und die vier Themenkarten machen sofort deutlich, dass dies ein eigener Pflanzenbereich ist – nicht der Community-Feed.

## 2. Aquaristik – Seite nach dem Tippen

![Grafische Zielseite Aquaristik](screens/02-aquaristik.jpg)

Die **Aquaristikseite** erhält den eigenen Unterwasserraum mit Kardinalsalmlern, Pflanzen, Beckenübersicht, Anlage, Wasserwerten und KI-Einstieg. Alle leuchtenden Konturen und Funktionsicons sind konsequent starkes Neonblau.

## 3. Terraristik – Seite nach dem Tippen

![Grafische Zielseite Terraristik](screens/03-terraristik.jpg)

Die **Terraristikseite** übernimmt dieselbe Struktur, aber mit einem eigenständigen feuchten Regenwaldmotiv, Frosch-/Mooswelt und gelbgrüner Akzentfarbe. Sie ist somit visuell kein bloßes Duplikat der Pflanzenseite.

## 4. KI-Assistent – Seite nach dem Tippen

![Grafische Zielseite KI-Assistent](screens/04-ki-assistent.jpg)

Die **KI-Seite** ist die bestätigte Stilreferenz: violette KI-Motive im botanischen Umfeld, mit klaren Einstiegen für Chat, Bestimmung, Aquariumfragen und Wissen.

## 5. Live-Bereich – Seite nach dem Tippen

![Grafische Zielseite Live-Bereich](screens/05-live-bereich.jpg)

Die **Live-Seite** zeigt ihre eigene Live-Verbindungsfläche direkt zwischen Hero und den vier Aktionen. Der Status „Noch nicht verbunden“ darf so lange gezeigt werden, bis die reale Sensor- oder Kameraanbindung implementiert ist.

## 6. Foto – Seite nach dem Tippen

![Grafische Zielseite Foto](screens/06-foto.jpg)

Die **Fotoseite** ist eine klare Aufnahme-Entscheidung: Der große Button zur Kamera-/Dateiauswahl steht vor den vier Zielwegen – Pflanzenfoto, Aquariumfoto, KI-Bestimmung oder Community-Feed.

## 7. Beitrag – Seite nach dem Tippen

![Grafische Zielseite Beitrag](screens/07-beitrag.jpg)

Die **Beitragsseite** führt in den Feed-Editor. Ihr eigener Hero, Composer-Vorschau und die vier nachgelagerten Optionen verhindern, dass der Beitragsweg wie ein generischer Dialog wirkt.

## Umsetzungsregel

Beim Implementieren zählt der **Bildaufbau**: Die obere Marken- und Sensorzone bleibt konstant; Bildwelt, Neonfarbe, Titel, Hero und vier Funktionskarten wechseln pro Bereich. Keine neue Icon-Sammlung und keine austauschbaren, textlastigen Dashboard-Karten erzeugen. Jede Karte muss zu einer vorhandenen Funktion oder zu einer ausdrücklich als zukünftige Funktion markierten Seite führen.
