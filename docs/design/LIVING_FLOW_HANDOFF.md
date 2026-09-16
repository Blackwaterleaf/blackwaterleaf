# BlackwaterLeaf: Sieben Bereichsseiten

Die Route `/flow/:flow` enthält sieben eigenständige Zielseiten: `botanik`, `aquaristik`, `terraristik`, `ki-assistent`, `live`, `foto` und `beitrag`. Die erste Prüfung bestätigte die Botanikroute, vier Auswahlkarten und vier Bottom-Navigationseinträge. Bei der Prüfung fiel auf, dass die bestehende globale Sensorleistenregel die neue Grid-Darstellung überschreibt; diese Regel wird vor Abschluss gezielt korrigiert.

Nach der Korrektur rendert die Sensorleiste horizontal im selben Glaskarten-Stil wie die Vorlage. Die mobile Botanikseite wurde visuell geprüft: dunkles organisches Grundlayout, leuchtende Bereichsfarbe, Bild-Hero, vier große Auswahlflächen, Bereichswechsel und fixe Bottom Navigation sind vorhanden.

Die visuelle Prüfung der KI- und Foto-Routen bestätigte die Farbübergabe: KI in Neonlila, die Fotoaufnahme im botanisch-grünen Glasmotiv. Die KI-Seite besitzt vier direkte Einstiege für Chat, Bestimmung, Aquaristik und Wissen. Die Fotoseite verfügt über ein echtes Datei-/Kamera-Auswahlfeld sowie vier nachgelagerte Zielaktionen.

## Routenvertrag

| Auswahl im Blatt-Rad | Zielroute | Seite | Primäre, bestehende Funktionswege |
| --- | --- | --- | --- |
| Pflanze hinzufügen | `/flow/botanik` | Botanik | `/plants`, `/plants/new`, `/ai?context=plant`, `/knowledge` |
| Fisch hinzufügen | `/flow/aquaristik` | Aquaristik | `/aquariums`, `/aquariums/new`, `/ai?context=aquarium` |
| Terrarium hinzufügen | `/flow/terraristik` | Terraristik | Foto, Entdecken, Wissen und KI; kein falsches Terrarium-Datenmodell wird vorgetäuscht. |
| KI fragen | `/flow/ki-assistent` | KI-Assistent | `/ai`, Bildbestimmung, Aquarium-Kontext und Wissen |
| Video | `/flow/live` | Live-Bereich | Kamera, echte Wasserwerte-Route, Benachrichtigungen und Entdecken. Live-Daten bleiben ausdrücklich offline, bis eine reale Datenquelle verbunden ist. |
| Foto | `/flow/foto` | Fotoaufnahme | System-Datei-/Kameraauswahl und Verteilung zu Pflanze, Aquarium, KI oder Beitrag |
| Beitrag | `/flow/beitrag` | Beitrag | echter Feed-Editor, Foto, Video und Community |

## Gestaltungsvertrag

Alle sieben Seiten liegen in `client/src/pages/LivingFlow.tsx`, sind als `/flow/:flow` in `client/src/App.tsx` registriert und beziehen ihre Styles aus `client/src/styles/living-flow.css`. Der visuelle Grundaufbau entspricht der gelieferten mobilen Vorlage: schlanke Markenleiste, vierteilige Sensorleiste, bildgestützter Bereichs-Hero, dunkle halbtransparente Glaskarten, funktionale Auswahlflächen und eine schwebende Bottom Navigation. Die Akzentwerte sind verbindlich: Botanik `#C7F35B`, Aquaristik `#28D8FF`, Terraristik `#E1D661` und KI `#C36BFF`.

Die sieben Rad-Links stehen in `client/src/components/QuickActionWheel.tsx`; hier wurde bewusst keine zusätzliche Icon-Sammlung erzeugt. Für eine spätere vollständige Datenmodellierung der Terraristik wäre ein separates, migrationsgestütztes Terrarium-Modell erforderlich. Bis dahin führt die Seite ausschließlich zu vorhandenen Funktionen und gibt keine Speicherung vor, die nicht existiert.

Die Live-Route wurde ebenfalls visuell geprüft. Sie zeigt bewusst den Status „Noch nicht verbunden“ statt vorgetäuschter Sensordaten, führt aber zu Kamera, Wasserwerten, Benachrichtigungen und Community. Das starke Neonblau ist auf Icon, Statusmodul und Auswahlflächen konsistent umgesetzt.
