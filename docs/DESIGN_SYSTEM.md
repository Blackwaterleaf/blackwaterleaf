# BlackWaterLeaf Studio – Designbuch

## Visuelle Leitidee

Das Studio ist ein fokussierter, dunkler Enterprise-Arbeitsraum für kontrollierte Agentenarbeit. Die Oberfläche nutzt eine **deep-forest** Grundfläche mit mintfarbenen Vertrauens-/Erfolgsakzenten und warmen Amber-Hinweisen für blockierte oder wartende Zustände.

## Typografie

- **UI und Fließtext:** `DM Sans`
- **Display-/Hero-Überschriften:** `Space Grotesk`
- Kleine Statuslabels verwenden erhöhtes Letter-Spacing und eine gedämpfte grüne Farbe.

## Layout

- Desktop: persistente linke Sidebar, transluzente Topbar, großzügiger Inhaltsbereich.
- Hauptseite: asymmetrisches Hero-Grid, Signalkarte, drei Kennzahlen und zweispaltiger Aktivitätsbereich.
- Mobile: Sidebar als Drawer, einspaltige Karten, kompakte Abstände.
- Breakpoints: `900px` für Navigation/Grid, `600px` für mobile Tabellen- und Typografieanpassungen.

## Farb- und UI-Regeln

- Hintergrund: `#07100f`
- Karten: `#101c1a`
- Primärakzent: `#9cebc6`
- Sekundär-/Statusfarben: gedämpftes Blau, Violett und Amber
- Karten mit feinen, transparenten Rahmen statt harter Schatten
- Interaktionen kurz und reversibel animieren; reduzierte Bewegung respektieren
- Fokuszustände und Tastaturbedienung sichtbar halten

## Schutzregel für globale Styles

`client/src/index.css` ist die zentrale globale Styleschicht. Vor Änderungen muss geprüft werden, dass die Basisregeln, Layoutklassen, responsiven Media Queries und feature-spezifischen Erweiterungen gemeinsam erhalten bleiben. Erweiterungen werden angehängt oder gezielt gepatcht; die Datei darf nicht durch einen Teilblock ersetzt werden.
