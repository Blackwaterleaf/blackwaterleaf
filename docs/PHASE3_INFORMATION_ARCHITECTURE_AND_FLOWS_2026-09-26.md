# BlackWaterLeaf – Phase 3: Informationsarchitektur und Nutzerflüsse

**Stand:** 26. September 2026  
**Status:** Konzept- und Konsolidierungsgrundlage; **keine Implementierung**.

## 1. Verbindliche Produktstruktur

BlackWaterLeaf erhält eine gemeinsame Aufgabenarchitektur für Web und Native. Die Bedeutung der Aufgaben, Begriffe, Sichtbarkeiten, Datenzustände und Datenschutzregeln ist plattformübergreifend identisch. Die Navigation darf sich technisch unterscheiden: Web nutzt Rail/Sidebar und kontextuelle Pane, Native nutzt kompakte Hauptziele und kontextuelle Arbeitsnavigation.

### Hauptziele

| Aufgabe | Web-Hauptzugang | Native-Hauptzugang | Bedeutung |
|---|---|---|---|
| Start | `/home` beziehungsweise bestehender Home-Einstieg | `home` | Persönlicher Einstieg, ehrliche Statusinformationen und direkte Aufgabenwahl; kein zweites Entdecken. |
| Entdecken | `/explore` | `explore` | Portale, öffentliche Beobachtungen und fachliche Einstiege. |
| Community | `/community` | `community` | Öffentlicher Feed für angemeldete aktive Konten, Composer und Postdetail. |
| Profil | `/profile` | `profile` | Identität, Creator-Medien und persönlicher Bereich. |
| Erfassen | dauerhaft sichtbare Primäraktion; bestehender Einstieg `/flow/foto` als Kompatibilitätspfad | kontextuelle Primäraktion `photo`/`post` | Eine klar beschriftete Aktion mit drei nachgelagerten, verifizierten Zielen: Beobachtung, Beitrag oder KI-Analyse. Nicht als zusätzliche Navigationsregisterkarte zählen. |

### Kontextuelle Arbeitsbereiche

- **Karte:** eigenständige öffentliche Karten-/Listenarbeit; Realm-Seiten zeigen nur gefilterte Vorschauen.
- **Katalog:** browsebarer Taxon-Katalog mit Realm-Filter; nicht mit der globalen Suche gleichsetzen.
- **Suche:** globale Querschnittssuche über Arten, Wissen, Personen, Community und Partnerangebote.
- **Wissen:** quellengebundene Evidenzfläche; von Katalogdetail, Suche und Entdecken erreichbar.
- **KI:** ein zentraler KI-Workspace. Die Erfassung öffnet bei Bildanalyse direkt den passenden KI-Kontext, erzeugt aber keinen zweiten parallelen KI-Bereich.
- **Marketplace:** partnergetrennter Angebotsbereich mit Werbung-/Partner-/Kein-Checkout-Hinweisen.
- **Verwalten:** ein Management Hub unter `/profile/manage`; Unterbereiche werden dort gebündelt.

## 2. Kanonisierung und Kompatibilität

| Bestehender Einstieg | Zielstatus | Begründung |
|---|---|---|
| `/explore` | Kanonisch | Einziger globaler Discovery-Einstieg. |
| `/explore#map` | Kompatibilitätspfad | Übergang zur eigenständigen Kartenarbeit; kein zweiter globaler Entdecken-Begriff. |
| `/map` | Zielkanonik | Öffentliche Karte/Liste mit erklärtem Datenschutzkontext. Noch nicht umgesetzt. |
| `/flow/foto` | Kompatibilitätspfad zum Erfassen-Hub | Der aktuelle Screen ist eine Auswahl, nicht die eigentliche Speicherung. |
| `/catalog` | Kanonischer Katalog | Browsebare Taxonomie; Realm über Query-Filter. |
| `/search` | Kanonische globale Suche | Der bestehende Inhalt durchsucht mehr als Taxa und ist deshalb nicht „Katalog“. |
| `/knowledge` | Kanonische Quellenfläche | `wissen` bleibt als lokalisierter Kompatibilitätsalias. |
| `/community` | Kanonischer Feed | Einziger Feed-Einstieg. |
| `/community/post/:id` | Kanonisches Postdetail | Query-Links `?post=` werden künftig nicht mehr erzeugt. |
| `/profile/manage` | Kanonischer Management Hub | Einziger Hauptzugang für Einstellungen und private Verwaltung. |
| `/marketplace` | Kanonischer Marketplace | `/shop` bleibt Redirect-/Kompatibilitätsalias. |
| `/world/:realm` | Kompatibilitätspfad | Gültige Realms führen fachlich korrekt weiter; unbekannte Werte zeigen NotFound statt stiller Botanik-Fallbacks. |

## 3. Vorher/Nachher der Doppelungen

| Vorher | Nachher | Entscheidung |
|---|---|---|
| Entdecken und Karte teilen den Explore-Einstieg; Realm-Karten wiederholen die Aufgabe. | Entdecken bleibt Portal-/Discovery-Einstieg; Karte wird eigenständige öffentliche Karten-/Listenarbeit; Realm-Karten sind Filtervorschauen. | Zusammenführen und klar trennen. |
| Erfassen, Realm-Formulare, Community-Composer und KI-Fotobestimmung erscheinen als konkurrierende Startpunkte. | Ein Erfassungs-Hub mit drei expliziten Zielen: Beobachtung erfassen, Beitrag erstellen, Mit KI analysieren. | Zusammenführen der Auswahl, Fachflows bleiben getrennt. |
| `/search` heißt Katalog, durchsucht aber Personen, Community und Angebote. | `/catalog` = Taxonomie; `/search` = globale Suche; `/knowledge` = Quellen. | Begriffe trennen. |
| `/community`, `/feed`, `/community/feed` und defekte `?post=`-Links. | `/community` plus `/community/post/:id`; Aliaspfade bleiben nur für Weiterleitung. | Kanonisieren. |
| Profil, Verwalten, Privatbereich und direkte Einstellungslinks überschneiden sich. | `/profile` = Identität/Creator; `/profile/manage` = Management Hub; Kacheln öffnen Unterbereiche. | Zusammenführen. |
| Botanik-/Aquarium-Aktionen mit unterschiedlichen Namen führen teils zum selben Habitat-Ziel. | Aktionstext muss das echte Ziel benennen; „Wasserwerte“ wird separat oder ehrlich umbenannt. | Ehrlichkeit vor scheinbarer Tiefe. |

## 4. Verifizierte Nutzerflüsse

### 4.1 Art finden und lernen

1. Nutzer öffnet **Entdecken** oder die globale **Suche**.
2. Suche akzeptiert gebräuchlichen Namen, wissenschaftlichen Namen, Gattung, Familie, Synonym oder Realm.
3. Ergebnis führt zu Taxondetail oder quellengebundenem Wissen.
4. Taxondetail zeigt Bild, gebräuchlichen Namen, botanischen Namen, Quellen, Habitat-/Pflegefelder und – nur wenn vorhanden – Herkunftskarte.
5. „Im Katalog stöbern“ führt zum browsebaren Realm-Katalog; „Quelle lesen“ führt zu Wissen.

### 4.2 Öffentliche Beobachtungsorte ansehen

1. Nutzer öffnet **Karte** aus Entdecken oder die eigenständige Kartenarbeit.
2. Karte und Liste zeigen ausschließlich öffentliche, generalisierte Orte.
3. Filter und Legende bleiben bei 320 CSS-Pixel/400-%-Zoom reflowbar.
4. Ausgewählter Eintrag öffnet eine verständliche Detailkarte.
5. Exakte private Orte werden nie angezeigt; dieser Hinweis bleibt direkt am Ergebnis sichtbar.

### 4.3 Beobachtung erfassen

1. Nutzer aktiviert **Erfassen**.
2. Hub zeigt genau drei reale Ziele: „Beobachtung erfassen“, „Beitrag erstellen“, „Mit KI analysieren“.
3. Beobachtung startet mit Botanik, Aquaristik oder Terraristik und bleibt standardmäßig privat.
4. Offline-Status wird als „Entwurf nur auf diesem Gerät“, „bereit zur Synchronisation“, „Sync fehlgeschlagen“ oder „Konflikt prüfen“ angezeigt.
5. Veröffentlichung benötigt eine explizite Aktion und serverseitige Berechtigung.

### 4.4 KI verwenden

1. Nutzer öffnet **KI** oder wählt im Erfassungs-Hub „Mit KI analysieren“.
2. Es gibt genau einen Tool-Selector für Chat, Pflanzenbestimmung und Aquarienanalyse.
3. Vor der Verarbeitung werden Verfügbarkeit, Consent, Eingabemethode und Datenschutzstatus erklärt.
4. Ergebnis zeigt KI-Kennzeichnung, Unsicherheit, Quellen/Begründung soweit vorhanden, Korrektur-/Verwerfen-Aktion und klare nächste Aktion.
5. KI darf keine Sicherheit vortäuschen; fehlende Anbieter-/Modellfreigabe bleibt als nicht verfügbar sichtbar.

### 4.5 Community prüfen und beitragen

1. Nutzer öffnet `/community` beziehungsweise den Native-Community-Bereich.
2. Nicht angemeldete Nutzer sehen den ehrlichen geschützten Zustand.
3. Angemeldete aktive Konten sehen reale Beiträge; blockierte/private Inhalte bleiben ausgeschlossen.
4. Composer startet als eigene Aktion; Medien zeigen Upload-, Qualitäts-, Größen- und Fortschrittsstatus.
5. Postdetail ist immer `/community/post/:id`, Kommentare und Moderation bleiben im Detailkontext.

### 4.6 Profil verwalten

1. Nutzer öffnet **Profil** und sieht Identität, Bio und freigegebene Medien.
2. „Verwalten“ führt ausschließlich zum Management Hub.
3. Hub bündelt Konto, Anlagen, Kommunikation, Datenschutz/Freigaben, Sprache/Einheiten, Fortschritt und Werkzeuge.
4. Sensible Bereiche zeigen Auth-, Rollen- und Consent-Zustände aus dem Serververtrag.
5. Öffentliche Creator-Ansicht und privater Managementbereich bleiben klar getrennt.

## 5. Paritätsregeln

- Derselbe Begriff bezeichnet auf Web und Native denselben Daten- und Sichtbarkeitszustand.
- Web darf auf großen Flächen Rail, Liste+Detail und Karte+Liste nebeneinander zeigen; Native zeigt im kompakten Fenster jeweils ein primäres Pane.
- Keine Plattform darf eine nicht verifizierte Funktion durch dekorative Live-, KI-, Sensor- oder Sync-Anzeige vortäuschen.
- Jede Geste erhält eine sichtbare Alternative. Statusmeldungen sind programmatisch zugänglich und farbunabhängig verständlich.
- Route-/Screen-Matrix, Shared API Contract und reale Testdaten sind Voraussetzung für die spätere Implementierung.

## 6. Offene Freigaben vor Implementierung

1. Findability-Test mit mindestens fünf Kernaufgaben: Art finden, Ort/Beobachtungen ansehen, Foto erfassen, Community prüfen, Profil verwalten.
2. Entscheidung, ob `/map` im Web als neuer kanonischer Pfad eingeführt wird oder zunächst als stabiler fokussierter Zustand unter `/explore` startet.
3. Auflösung der widersprüchlichen historischen Navigationsverträge zugunsten des hier beschriebenen Vier-Ziele-Home-Modells mit separater Erfassen-Aktion.
4. Privacy-/Storage-Review für Offline-Cache, lokale Medien, private Orte und verlorene Geräte.
