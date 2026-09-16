# BlackWaterLeaf Design-Übergabeprotokoll

**Erstellt:** 16. September 2026
**Status:** Abnahmegrundlage vor der nächsten visuellen Implementierungsphase
**Verbindliche Referenz:** `BlackwaterLeaf-Design-Handoff.zip` mit elf Zielscreen-Grafiken

## Ergebnis der Übergabeprüfung

Die Prüfung bestätigt, dass das aktuelle Projekt die **allgemeine Markenstimmung** bereits teilweise trägt: dunkles Tannengrün, Glasflächen, Blattmarke, mehrere Bereichsfarben, Bottom Navigation, echte Datenzustände und ein zentraler Blatt-Launcher sind vorhanden. Die App erfüllt jedoch noch **keine vollständige 1:1-Übernahme** der gelieferten Zielscreen-Serie.

Die wesentlichen Abweichungen sind strukturell, nicht nur dekorativ. Mehrere Seiten verwenden weiterhin generische Hero-/Formular- oder Dashboard-Kompositionen. Die Referenz verlangt stattdessen pro Bereich einen eigenen bildgestützten Hero, die feste Sensorzone, exakt definierte Bildkarten, eine vierteilige Navigation und eine bereichsspezifische Icon-/Farbsemantik. Darüber hinaus fehlen die Zielseiten für Live, Foto und Beitrag vollständig. Diese Differenzen wurden im verbindlichen [Designregelwerk V2](DESIGN_RULEBOOK_V2_REFERENCE_OVERLAY.md) geregelt.

> **Freigabestatus:** Die ZIP ist ab sofort die verbindliche visuelle Blaupause. Die vorhandene App bleibt verbindlich für Daten, Rechte, Einwilligungen und reale Funktionen. Eine visuell ähnliche Seite ohne korrekten Daten- und Zustandsvertrag gilt nicht als abgenommen.

## Übergebene Referenzartefakte

| Artefakt | Zweck | Umsetzungsvorgabe |
|---|---|---|
| `reference-screenshot.jpg` | Hauptansicht und zentrale Bildsprache | Als Home-Referenz behandeln; nicht auf Unterseiten kopieren |
| `screens/01–04` | Botanik, Aquaristik, Terraristik, KI | Jeweils eigene Zielseite nach Auswahl |
| `screens/05–07` | Live, Foto, Beitrag | Neue erreichbare Zielseiten mit ehrlichen Verbindungs- bzw. Verfügbarkeitszuständen |
| `screens/08–11` | Entdecken, Community, Profil, Wissen | Bestehende öffentliche Routen visuell umkomponieren |
| `INTERACTIVE_PAGE_SCREENS.md` | Screenvertrag | Maßgeblich für Reihenfolge, Titel, Karten und Akzente |
| `implementation/` | Referenzkomponenten | Wiederverwendbare Umsetzungsideen, aber keine Quelle für echte Funktionen |

## Festgestellte Differenzen zur Designreferenz

| Zielseite | Aktueller Zustand | Verbindliche Differenz | Priorität |
|---|---|---|---|
| Botanik | Bestehende Realm-Route mit Hero und Beobachtungsformular | Sensorzone, Alocasia-Hero und vier Bildkarten fehlen; Formular ist zu dominant | P0 |
| Aquaristik | Bestehende Realm-Route mit ehrlich gepflegten Habitatdaten | Unterwasser-Hero, Cyan-Karten, Sensorzone und vier Einstiege fehlen | P0 |
| Terraristik | Bestehende Realm-Route mit Beobachtungserfassung | Frosch-/Moos-Hero, gelbgrüne Karten und Zielkomposition fehlen | P0 |
| KI-Assistent | Echte Auth-, Consent-, Limit- und Chatlogik | Lila Hero, Bildkarten und Referenznavigation fehlen | P1 |
| Live | Live-Wetter-/Privatwertbasis ist auf Home vorhanden | Eigene Route, Verbindungsfläche und vier Karten fehlen | P0 |
| Foto | Zentraler Blatt-Launcher verlinkt derzeit nicht auf eine Foto-Zielseite | Eigene Route, Capture-Priorität und vier Folgewege fehlen | P0 |
| Beitrag | Echter Community-Editor existiert | Eigene visuelle Beitragsseite vor dem Editor fehlt; Video ist nicht implementiert | P0 |
| Entdecken | Vier Welten sind vorhanden | Wasserfall-Hero, echte Sensorzone, 2×2-Kartenlayout und Wissen-Divider fehlen | P0/P1 |
| Community | Echter Feed, Consent und Empty-State existieren | Bildhero, dominanter Referenz-Empty-State, zwei Karten und Reihenfolge fehlen | P1 |
| Profil | Echte Anmeldung, Sprache, Einheiten und private Details existieren | Auth-Overlay, Blatt-Hero, zwei Referenzkarten und Navigation müssen angepasst werden | P1 |
| Wissen | Echter Published-/Locale-Datenpfad existiert | Hero, differenzierter Empty-/Error-State und zwei Karten fehlen | P1 |

Die aktuelle AppShell mit fünf Tabs ist mit der Designserie nicht vereinbar. Die Referenz zeigt vier sichtbare Zielpunkte: **Home, Entdecken, Community und Profil**. Der KI-Assistent bleibt als reale Route erreichbar, wird jedoch nicht als fünfter Referenz-Tab dargestellt.

## Verbindliche Routenentscheidung

Die nächste Implementierungsphase arbeitet mit den aktuellen produktiven Routen als Funktionsquelle. Die abweichenden alten Handoff-Pfade für Botanik, Aquaristik, Terraristik und KI werden nicht parallel angelegt.

| Designziel | Verbindlicher Pfad | Entscheidung |
|---|---|---|
| Botanik | `/world/botany` | Bestehende Route visuell umsetzen |
| Aquaristik | `/world/aquarium` | Bestehende Route visuell umsetzen |
| Terraristik | `/world/terrarium` | Bestehende Route visuell umsetzen |
| KI-Assistent | `/assistant` | Bestehende Route visuell umsetzen |
| Live | `/flow/live` | Neu registrieren und aus Schnellaktion öffnen |
| Foto | `/flow/foto` | Neu registrieren; Blatt-Launcher dorthin korrigieren |
| Beitrag | `/flow/beitrag` | Neu registrieren; von dort in den echten Community-Editor übergeben |
| Entdecken | `/explore` | Bestehende Route visuell umsetzen |
| Community | `/community` | Bestehende Route visuell umsetzen |
| Profil | `/profile` | Bestehende Route visuell umsetzen |
| Wissen | `/knowledge` | Bestehende Route visuell umsetzen |

## Verbindliche Implementierungsreihenfolge

Die Reihenfolge schützt vor einer rein kosmetischen Umsetzung, die Routen, Datenschutz oder Datenwahrheit beschädigt.

1. **Gemeinsame Referenz-Shell:** Vierer-Bottom-Navigation, korrekte aktive Zustände, Markenleiste und visuelle Vierer-Sensorleiste als wiederverwendbare Komponenten anlegen. Die bestehende Assistant-Route bleibt erreichbar, aber außerhalb der Referenz-Bottom-Bar.
2. **Echte Datenadapter absichern:** Die bestehende Live-Sensorbasis in eine horizontale Referenzleiste überführen. Fehlende Messwerte, Authentifizierung, Standortfreigabe und Dienstfehler müssen sichtbar bleiben.
3. **Fehlende Zielrouten herstellen:** `/flow/live`, `/flow/foto` und `/flow/beitrag` registrieren. Schnellaktionen auf die richtigen Zwischenziele legen. Dabei keine Kamera-, Video-, Sensor- oder Benachrichtigungsfunktion behaupten, die noch nicht existiert.
4. **Realm-Screens umkomponieren:** Botanik, Aquaristik und Terraristik zuerst als eigene Hero-plus-vier-Karten-Seiten bauen. Bestehende Beobachtungs- und Uploadfunktion hinter den passenden echten Einstiegen erhalten.
5. **Informations- und Kontoseiten angleichen:** Entdecken, Community, KI, Profil und Wissen gemäß ihrer einzelnen Screens umsetzen. Jeder Leer-, Fehler-, Auth- und Consent-Zustand erhält seine referenznahe, aber inhaltlich wahre Darstellung.
6. **Karten-Zielaudit:** Für jede Karte Route, Berechtigung, vorhandene Funktion, fehlende Funktion und ehrlichen Fallback dokumentieren. Nur danach werden Karten aktiv geschaltet.
7. **Feinabgleich:** Bildmotive, Hero-Overlays, Icons, Farben, Chevrons, Abstände, Desktop- und Mobile-Breakpoints gegen jeden einzelnen Screen prüfen.

## Akzeptanzkriterien vor Designfreigabe

Die nächste Implementierungsphase darf eine Zielseite erst als fertig markieren, wenn alle Kriterien erfüllt sind:

- Der Seitenaufbau entspricht dem eigenen Referenzscreen und wiederholt nicht die Startseite.
- Hero, Titel, Unterzeile, Akzentfarbe, Bildwelt, Iconsemantik und Kartenanzahl stimmen mit dem Screen überein.
- Die Sensorleiste enthält nur reale, private, fehlende oder nicht verbundene Werte.
- Jede Kartenaktion besitzt eine reale Route oder einen ausdrücklichen Nichtverfügbar-/Künftig-Status.
- Authentifizierung, Consent, private Daten, `unverified`, Empty, Error und Loading bleiben fachlich korrekt.
- Die Vierer-Bottom-Navigation hat genau einen aktiven Eintrag und überdeckt keine Touchfläche.
- Die Seite wird bei 412 × 915 sowie auf Desktop visuell geprüft.
- Fokus, Kontrast und reduzierte Bewegung bleiben intakt.
- `pnpm check`, die Test-Suite, der Produktionsbuild und `git diff --check` sind erfolgreich.

## Nicht zulässige Abkürzungen

Die folgende Vorgehensweise ist ausgeschlossen: Referenzwerte als Mock-Daten einsetzen, Screens als zusätzliche Home-Seiten kopieren, generische Dashboard-Karten anstelle der Bildkarten verwenden, fehlende Links stillschweigend auf Profil oder Home umleiten, den Community- oder Wissensfeed mit Beispieldaten füllen, Smartgeräte als verbunden darstellen, KI ohne Readiness/Consent präsentieren oder Formulare vollständig durch dekorative Karten ersetzen.

## Übergabe an die nächste Implementierungsphase

Die Umsetzung beginnt mit dem Lesen von `DESIGN_RULEBOOK_V2_REFERENCE_OVERLAY.md`, den elf Screenbildern und der aktuellen Route-/Datenstruktur. Änderungen werden in kleinen, prüfbaren Gruppen umgesetzt. Jede Gruppe erhält einen visuellen Vorher-/Nachher-Vergleich gegen genau einen Referenzscreen und einen Test der zugehörigen echten Funktion.

Die Design-ZIP bleibt bei jeder Umsetzung verfügbar und wird nicht nur als Stimmungsvorlage, sondern **Icon für Icon, Farbe für Farbe, Wahlbereich für Wahlbereich und Seite für Seite** als Abnahmereferenz verwendet.

## References

[1]: ../../blackwaterleaf-design-handoff/BlackwaterLeaf-Design-Handoff/README.md "BlackwaterLeaf Design-Übergabepaket"
[2]: ../../blackwaterleaf-design-handoff/BlackwaterLeaf-Design-Handoff/docs/INTERACTIVE_PAGE_SCREENS.md "BlackwaterLeaf Grafische Zielseiten"
[3]: DESIGN_RULEBOOK_V2_REFERENCE_OVERLAY.md "BlackWaterLeaf Designregelwerk V2 Reference Overlay"
[4]: ../client/src/App.tsx "Aktuelle BlackWaterLeaf-Routen"
[5]: ../client/src/components/AppShell.tsx "Aktuelle globale Navigation"
