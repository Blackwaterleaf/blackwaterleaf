# BlackWaterLeaf – Phase 4: Design-System und visuelle Leitlinie

**Stand:** 26. September 2026  
**Status:** Verbindliche Spezifikation für den späteren Prototyp und die Implementierung; **keine Code- oder UI-Änderung**.

## 1. Design-DNA

BlackWaterLeaf ist ein **Dark-Biophilic-Luxury-Observatory**: ein ruhiger, dunkler Wald-/Wasserraum mit fachlicher Klarheit. Naturmedien tragen Bedeutung; Atmosphäre ordnet den Raum, ersetzt aber keine Information. Die Oberfläche wirkt organisch und hochwertig, nicht wie ein generisches Sci-Fi-Dashboard.

Die visuelle Hierarchie lautet:

1. Aufgabe und Status
2. reale Information und Quellen
3. primäre Handlung
4. unterstützende Details
5. atmosphärische Medien und Glow

## 2. Semantische Farbrollen

| Token/Rolle | Grundidee | Zulässige Bedeutung | Verbotene Verwendung |
|---|---|---|---|
| `surface.portal` | tiefes Wald-/Wasser-Schwarzgrün | globaler Raum | rein schwarzes, leeres Grundlayout ohne Tiefenstaffelung |
| `surface.raised` | dunkles, opakes Grün | Karten, Listen, Formulare, Leseflächen | dauerhaft transparente Textfläche über bewegtem Bild |
| `surface.glass` | 80–88 % dunkler Blatt-/Neutral-Tint | höchstens eine kleine, nicht scrollende Kontextfläche | Glaslisten, Glasnavigation, verschachtelte Gläser |
| `surface.dialog` | 92–100 % opak | Dialoge, Sheets, Bestätigung, Datenschutz | Blur-Modal über Foto/Video |
| `text.primary` | warmes Weiß | Fließtext, Überschriften | leuchtende Body-Schrift |
| `text.secondary` | gedämpftes Grün-/Grau | Zusatzinformation, Zeit, Metadaten | alleinige Fehlermeldung |
| `accent.botany` | Lime/Blattgrün | Botanik, Wachstum, primäre Naturaktion | Erfolgssystem, allgemeiner Status |
| `accent.aquarium` | Cyan/Aqua | Aquaristik, Wasser, Karte, Erfassung, Fokus | KI, Erfolg, beliebiger Glow |
| `accent.terrarium` | Naturgold | Terraristik, Prüfung/Warnung | Premiumdekor, Auswahl ohne Label |
| `accent.ai` | Violett/Indigo | ausschließlich KI-Unterstützung, Analyse, KI-Provenienz | allgemeiner Status, Erfolg, Systemaktivität |
| `status.success` | kontraststabiles Grün plus Icon/Text | abgeschlossene reale Aktion | nur grüner Punkt |
| `status.warning` | Gold plus Warnicon/Text | Prüfung erforderlich | Gold als Premium-Highlight |
| `status.error` | kontraststabiles Rot plus Text/Icon | Fehler und blockierte Aktion | Rot nur als dekorative Linie |
| `status.info` | Cyan/Neutraltint plus Text/Icon | erklärende Information | Cyan als Erfolgssignal |
| `focus` | sichtbarer Cyan-/Neutralring | Tastatur- und TalkBack-Fokus | Glow allein als Fokus |

Alle Tokens benötigen echte Pairing-Tests. Farbe, Glow oder Helligkeit allein darf keine Information übertragen. Status erhält immer Text, Icon/Form oder eine programmatische Ansage.

## 3. Flächen und Material

### Standard: opak

Opake Flächen sind verbindlich für Feed-/Katalogzeilen, Wissensartikel, Tabellen, Formulare, Eingaben, CTAs, Bottom-/Rail-Navigation, Sheets, Dialoge, Datenschutztexte und jede scrollende Liste. Sie sind kontraststabil und GPU-vorhersehbar.

### Ausnahme: ruhiges Glas

Glas ist eine seltene Kontextmarkierung:

- maximal eine Glasregion gleichzeitig;
- nicht scrollend und nicht über Video/Animation;
- dunkler Tint mit 80–88 % Deckkraft und feiner 1-dp-Kontur;
- kein verschachteltes Glas;
- kein animierter Blur, Schatten- oder Filterradius;
- auf älteren Android-Geräten: vollständiger getönter No-Blur-Fallback;
- Dialoge und lange Leseflächen bleiben opak.

Live-Blur darf erst nach Messung und nur experimentell auf leistungsfähigen Geräten aktiviert werden. Die visuell vollständige No-Blur-Variante ist der Primärentwurf, nicht der Restzustand.

### Tiefenstaffelung

Jede Seite verwendet höchstens drei Oberflächenebenen: Portal, Raised Content und ein fokussiertes Floating Element. Eine einzelne subtile Elevation oder ein 1-dp-Rand genügt. Keine Schattenwolke und kein Glow an jedem Listeneintrag.

## 4. KI als eigener professioneller Bereich

KI ist eine erkennbare, aber nicht dominante Fachwelt:

- Violett/Indigo ist ausschließlich KI vorbehalten.
- Jeder KI-Bereich trägt ein Textlabel wie **KI-gestützt**, **KI-Vorschlag** oder **Analyse läuft**.
- Ein KI-Element zeigt Eingabemethode, Verarbeitungsstatus, Unsicherheit, Quellen/Begründung soweit vorhanden, Datenschutzstatus und nächste Aktion.
- KI-Violett darf nicht mit „wissenschaftlich geprüft“, „sicher“ oder „System bereit“ verwechselt werden.
- KI-Ausgaben werden als Vorschlag, nicht als Diagnose oder Gewissheit dargestellt.
- Es gibt genau einen Tool-Selector für Chat, Pflanzenbestimmung und Aquarienanalyse.

## 5. Tageszeitstimmung

Die Atmosphäre folgt ausschließlich der lokalen Gerätezeit als datensparsamer Fallback. Standortdaten sind dafür nicht erforderlich.

| Phase | Zeitfenster als Startregel | Stimmung | Unverändert bleiben |
|---|---|---|---|
| Morgendämmerung | 05:00–07:00 | gedämpftes Blaugrün, niedrige Reflexion | Navigation, Text, Status und Layout |
| Sonnenaufgang | 07:00–09:00 | etwas wärmeres Moosgrün, weicher Rand | Kontrast und Hauptaktionen |
| Tag | 09:00–17:00 | klares Wassergrün, höchste Lesbarkeit | Informationsarchitektur |
| Sonnenuntergang | 17:00–20:00 | warmes Waldgold sehr sparsam | keine veränderten Bedeutungen |
| Nacht | 20:00–05:00 | tiefes Blau-/Waldschwarz, reduzierte Medienhelligkeit | alle Inhalte und Bedienwege |

Die Zeitphasen sind nur atmosphärische Tonwerte. Kein Layout, keine Quelle, keine Statusfarbe und kein Content darf von ihnen abhängen. Nutzer können die Atmosphäre reduzieren oder deaktivieren.

## 6. Organische Hintergrundebene

Eine statische, komprimierte Baum-/Wurzel-/Wasserstruktur darf als zusammenhängende Hintergrundebene dienen. Sie bleibt hinter einem kontraststabilen Content-Layer, wird nicht als Fortschrittsmetrik ausgegeben und darf keine falschen Naturdaten darstellen.

Eine Entwicklung des Baums ist nur zulässig, wenn eine reale, verständliche Produktmetrik nachgewiesen ist, etwa bestätigte Beobachtungen oder veröffentlichte Beiträge. Bis dahin bleibt der Hintergrund statisch oder sehr sanft atmosphärisch. Keine Punkte, keine künstliche Knappheit, keine FOMO.

## 7. Typografie und Raster

- Primärschrift: gut lesbare System-/Inter-artige Sans-Serif.
- Display-Schrift: sparsam für kurze Bereichsüberschriften.
- Monospace: nur für Quellen-/Systemcodes, nicht für längere Lesetexte.
- Fließtext erhält robuste Zeilenhöhe und darf bei großer Schrift umbrechen.
- Keine essenzielle Information ausschließlich in Uppercase.
- Kompakt: ein primäres Pane; weit: Rail, Liste+Detail oder Karte+Liste.
- Medien werden responsiv und kontexttragend dargestellt; `alt` und Quellenstatus sind Teil des Medienmodells.

## 8. Komponentenregeln

| Komponente | Standard | Pflichtzustände |
|---|---|---|
| App Shell | Web Rail/Header, Native vier Home-Ziele plus Kontextnavigation | default, selected, focus, pressed, offline |
| Suche/Filter | klare deutsche Labels, Ergebnisart sichtbar | loading, empty, filtered, error |
| Primäraktion | genau eine führende Aktion pro Bereich | default, pressed, disabled, loading, success, error |
| Karte/Liste | Karte nie ohne autoritative Liste/Statusalternative | protected, empty, loading, error, offline |
| Katalogkarte | großes relevantes Bild, Name, botanischer Name, Familie/Gattung, Nachweis | image loading, no image, source, selected |
| KI-Karte | Bild/Resultat, Unsicherheit, Quelle/Begründung, nächste Aktion | analyzing, suggestion, uncertainty, unavailable |
| Community-Medium | echte Proportion, Zoom, Alttext/Quelle, Fortschritt | upload, processing, published, error |
| Profil | Identität, Bio, Creator-Medien, separater Management-Einstieg | public, private, blocked, empty |
| Empty State | ehrlicher Grund und nächster sinnvoller Weg | empty, locked, offline, unavailable |
| Statusbanner | Text plus Icon, nicht nur Farbe | info, warning, error, success, offline |

## 9. Accessibility- und Interaktionskontrakt

- Zielgröße: 48 × 48 dp bzw. 44 × 44 pt; benachbarte Ziele mindestens 8 dp Abstand.
- Text mindestens 4,5:1; große Schrift und Nichttextgrenzen mindestens 3:1 nach passendem WCAG-Kontext.
- `prefers-reduced-motion` und native Reduce-Motion-Einstellung werden respektiert.
- Gesten haben sichtbare Alternativen; Fokus ist sichtbar und nicht nur ein Glow.
- Dynamic Type, 200 % Text und 400 % Browserzoom/320 CSS-Pixel werden in Kernflows geprüft.
- Statusmeldungen sind semantisch/programmatisch zugänglich; Upload, Sync und KI-Verarbeitung bewegen den Fokus nicht unerwartet.
- Dekorative Medien erhalten leeres Alt; informative Medien erhalten beschreibendes Alt und Quellenstatus.

## 10. Freigabekriterien vor Implementierung

1. Farbpairings bestehen Kontrastprüfung in hellster, dunkelster und unruhigster erlaubter Kulisse.
2. Jede Glasfläche ist im Komponentenregister begründet und hat eine opake Fallback-Variante.
3. KI-Violett taucht außerhalb nachweislicher KI-Kontexte nicht auf.
4. Jede Kategorie besitzt eigene Akzentfarbe, Bildsprache, Empty-/Error-Zustände und klare Begriffe.
5. Web und Native zeigen denselben Daten- und Datenschutzstatus, auch wenn Shell und Layout unterschiedlich sind.
6. Kein visuelles Konzept wird als implementiert bezeichnet, bevor der Prototyp mit real vorhandenen Zuständen geprüft wurde.
