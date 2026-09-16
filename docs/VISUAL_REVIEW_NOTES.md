# BlackWaterLeaf – Visuelle Stagingprüfung

## Desktop-Prüfung vom 16. September 2026

Die erste Mehrseitenaufnahme war vollständig leer. Die Browserkonsole wies eindeutig auf eine von der Content-Security-Policy blockierte React-/Vite-Entwicklungspreamble hin. Die CSP wurde ausschließlich für `NODE_ENV !== production` um Inline-Preamble und HMR-WebSockets erweitert; die Produktionsrichtlinie bleibt ohne `unsafe-inline`.

Nach dem Neustart rendert die Startseite bei 1440 × 1000 Pixeln vollständig. Bestätigt sind der tiefschwarze Naturraum, dezente Scanlines, weiße Displaytypografie mit Cyan-/Magenta-Aberration, Monospace-Systemcodes, Glasflächen, intensive Naturbilder, vier farblich unterscheidbare Welten, ehrliche Offline-Sensorwerte, der reale Community-Leerzustand und die fünfteilige Hauptnavigation.

Die Desktop-Komposition verwendet eine asymmetrische Hero-/Moment-Anordnung und anschließend vier Weltkarten. Der zentrale Blattkern bleibt als eigenständige Interaktion erhalten; seine feste Position wird in Vollseitenaufnahmen absichtlich ausgeblendet und muss zusätzlich in einer normalen Viewportaufnahme geprüft werden. Mobile Breakpoints und alle Unterrouten sind noch gesondert zu validieren.

## Mobile Prüfung

Home, Entdecken, Community, KI, Profil und Botanik wurden bei 412 × 915 Pixeln geprüft. Der Blattkern und die fünfteilige Bottom-Navigation sind sichtbar, fokussierbar angelegt und überlagern keine primären Schaltflächen. Botanik, Aquaristik, Terraristik und KI bleiben visuell unterscheidbar; Community, Wissen und Naturwelten zeigen ohne Daten nachvollziehbare Leer- beziehungsweise Policy-Zustände. Die englische Browser-Locale wurde korrekt erkannt; die Sprach- und Einheitenauswahl ist im Profil sichtbar. Ein zunächst falsch angezeigter Datenschutzwert wurde anschließend durch das echte serverseitige Feld `profileVisibility` ersetzt.

## Kontrast- und Bewegungsprüfung

Der reproduzierbare Prüflauf `node scripts/contrast-audit.mjs` bestätigt für alle zentralen Text-/Hintergrundpaare mindestens WCAG-AA-Normalkontrast. Die gemessenen Spannen reichen von **5,50:1** für die zurückgenommene Navigationsfarbe bis **19,69:1** für primären Fließtext. Mint-Eyebrows, Cyan-Status, Gold-Status, aktive Navigation, Primärschaltfläche und Einstellungsbeschriftungen liegen jeweils oberhalb von 7:1 beziehungsweise deutlich darüber.

Alle verbleibenden CSS-Transitions betreffen ausschließlich `transform` und/oder `opacity`. Farb-, Hintergrund-, Rand-, Filter- und Schattenwechsel werden nicht animiert. Die globale `prefers-reduced-motion`-Regel reduziert Animationen und Transitionen auf eine Millisekunde; Fokusrahmen sind für Buttons, Links und Formfelder sichtbar definiert.

## Kernabläufe und Datenwahrheit

Die erweiterten Mobilaufnahmen bestätigen eine echte serverseitige Profildarstellung, bearbeitbare Profilfelder, vier getrennte Einwilligungsschalter, Sprach-/Einheitenauswahl, die private Beobachtungserfassung mit optionalem Bild sowie den Community-Entwurfs- und Freigabefluss. Das angemeldete reale Konto wird weiterhin mit der serverseitigen Rolle `user` und Status `active` dargestellt; es erfolgte ausdrücklich keine lokale Admin- oder Moderator-Hochstufung.

Botanik zeigt bei leerem Bestand einen klaren privaten Leerzustand unterhalb des Erfassungsformulars. Community bietet zunächst einen privaten Entwurf und veröffentlicht erst nach aktiver Auswahl. Der öffentliche Feed bleibt ohne reale Beiträge leer; weder Personen noch Reaktionen oder Beiträge werden vorgetäuscht. Alle Formularflächen blieben bei 412 × 915 Pixeln innerhalb des Viewports und lesbar.

## Finale Routenprüfung

Die finalen Desktopaufnahmen von Home, Entdecken, Community, KI, Profil, Wissen, Botanik und Terraristik bestätigen eine konsistente gemeinsame Marken- und Materialwelt. Die mobilen Aufnahmen bestätigen Blattkern, Bottom-Navigation, reale Kontoanzeige, vollständige Profilform, Community-Entwurf und Aquaristik-Erfassung. Als einziger visueller Restfehler wurde die vierteilige Sensorzeile auf 412 Pixeln horizontal abgeschnitten. Sie wurde anschließend für kleine Ansichten auf ein zweispaltiges Raster umgestellt; ab 760 Pixeln bleibt die vierteilige Desktopzeile bestehen.

Die erste Rasterkorrektur legte zwar zwei Spalten fest, ließ den impliziten einspaltigen Eltern-Gridtrack jedoch weiter auf die maximale Inhaltsbreite wachsen. Nach der zusätzlichen Festlegung `grid-template-columns: minmax(0, 1fr)` für `home-stack` und `page-stack` zeigt die erneute 412-×-915-Aufnahme **Wasser, Luft, pH-Wert und Gerätezeit vollständig**. Hero, Textumbruch, Blattkern und Bottom-Navigation bleiben zugleich innerhalb des Viewports.

## Deutsche Hauptsprache

Nach der Nutzerpräzisierung wurde Deutsch als Standard für neue Sitzungen gesetzt. Nach der Anmeldung priorisiert der globale App-Shell die in MySQL gespeicherte Kontosprache gegenüber der Browser-Locale. Die erneute mobile Prüfung bestätigt deutsche Start-, Sensor-, Navigations-, Profil- und Aktionsbeschriftungen; Englisch bleibt im Profil weiterhin auswählbar und wird bei Auswahl serverseitig gespeichert.
