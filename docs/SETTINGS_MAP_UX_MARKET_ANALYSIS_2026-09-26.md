# BlackWaterLeaf: Analyse Einstellungen, Management-Hub und Kartenroute

**Stand:** 26. September 2026  
**Status:** Analyse abgeschlossen, **keine Umsetzung dieses Blocks**  
**Nächster Schritt:** Ergebnis besprechen; erst danach implementieren.

## 1. Klare Entscheidung

Der Button **VERWALTEN** soll nicht mehr in ein langes, uneinheitliches Menü oder in verstreute Unterseiten führen. Er soll auf Web und Native denselben **Management-Hub** öffnen. Dieser Hub enthält alle persönlichen Einstellungen und Werkzeuge in einer festen, visuellen **2×2-Kachelstruktur**.

Die **Karte** erhält dagegen eine eigene primäre Seite. Sie darf nicht wie ein zusätzlicher Abschnitt auf der Start- oder Profilseite wirken. Die Seite wird auf Web und Native als eigenständiger Kartenmodus mit Karte, Filter und Liste organisiert. Die im Projekt bereits vorhandene Webroute `/explore` ist die richtige Basis, aber sie muss als echte Kartenroute weitergeführt werden. Die Native-Ansicht ist noch nicht gleichwertig: Sie zeigt aktuell eine statische Karten-/Schutzfläche statt einer interaktiven Kartenbasis.

## 2. Was der aktuelle Code zeigt

### Web

- Der Profil-Header öffnet ein Popover mit mehreren Ebenen.
- Pflege, Anlagen, Postfach, Benachrichtigungen, Fortschritt und Gespeichert stehen außerhalb von „Einstellungen“.
- Unter „Einstellungen“ liegen Profil/Privatbereich, Datenschutz/Freigaben, Sprache/Einheiten und weitere Werkzeuge.
- Die eigentliche Profilseite enthält zusätzlich eigene Abschnitte für Profil bearbeiten, Anzeigen, Datenschutz, Sitzungen, Avatar, Konto und Werkzeuge.
- Dadurch existieren mehrere Wege zu ähnlichen Funktionen. Besonders „Profil öffnen“, „Profil & Privatbereich“ und „Profil bearbeiten“ sind für Nutzer nicht sauber getrennt.
- Das Host-/Analytics-Dashboard existiert bereits als `/admin`. Es bietet reale Kennzahlen für registrierte Konten, Seitenaufrufe, Besuche, Dauer, Logins und Absprungrate. Diese Funktion ist jedoch nicht als klarer, rollenabhängiger Kachelpunkt im persönlichen Management-Hub sichtbar.
- `/explore` ist bereits eine eigene Webroute und verwendet eine echte MapView mit OpenStreetMap-Fallback. Die Seite kombiniert aber weiterhin Karte, Liste, Fachbereichskarten, Katalog- und Quellenbereiche in einer langen Arbeitsfläche. Für Nutzer muss die Karte als primäre Aufgabe stärker isoliert werden.

### Native

- Das Native-Profilmenü enthält mehr einzelne Punkte als das Webmenü und mischt Profil bearbeiten, Avatar, Privatbereich, Anlagen, Fortschritt, Datenschutz, Sprache, Werkzeuge und Pflege ohne gemeinsame Gruppierung.
- Die Native-Ansicht besitzt zwar ein `explore`-Screenmodell, filtert Karte/Liste und zeigt einen Datenschutzstatus, rendert die Karte aktuell jedoch als statisches Bild bzw. Schutzfläche. Das ist keine 1:1-Parität zur Webkarte.
- Der Native-Code besitzt bereits echte Screens für Nachrichten, Benachrichtigungen, Community, Live, Profil, Anlagen, Pflege, Suche und Katalog. Das Problem ist daher überwiegend die Informationsarchitektur, nicht das Fehlen aller Funktionen.
- Nutzerzahlen und Reichweiten sind im Native-Management noch nicht als gleichwertiges, rollenabhängiges Dashboard sichtbar.

## 3. Zielstruktur für „Verwalten“

### Management-Hub: feste 2×2-Struktur

Die erste Ebene zeigt vier gleich große Kacheln. Jede Kachel besitzt ein echtes, verständliches Linienicon, einen kurzen Titel und eine konkrete Unterzeile. Keine Kachel darf nur dekorativ sein.

**Kachel 1 — Konto & Profil**  
Profilbild, Name, Benutzername, Bio, öffentliche Sichtbarkeit, verbundene Profile und Kontoschluss.

**Kachel 2 — Anlagen & Pflege**  
Botanik, Aquaristik, Terraristik, heutige Pflegeaufgaben, Messwerte und private Anlagen.

**Kachel 3 — Kommunikation**  
Postfach, Benachrichtigungen, Community-Aktivität, Folgen, Blockierungen und gespeicherte Inhalte.

**Kachel 4 — Datenschutz & Sicherheit**  
Freigaben, Standort-/Medien-/KI-Verarbeitung, aktive Sitzungen, Abmeldung auf allen Geräten und Kontosicherheit.

Darunter folgt eine zweite, klar getrennte Reihe für seltener benötigte Einstellungen. Sie bleibt ebenfalls im 2×2-Raster:

**Kachel 5 — Sprache & Barrierefreiheit**  
Sprache, Einheiten, Schriftgröße, reduzierte Bewegung, Kontrast und Benachrichtigungston.

**Kachel 6 — Fortschritt & Merkliste**  
XP, Level, Ranking, gespeicherte Arten, gespeicherte Beiträge und persönliche Lernziele.

**Kachel 7 — Host-/Team-Dashboard**  
Nur für das Eigentümerkonto und berechtigte Staff-Konten. Registrierte Konten, aktive Konten, Besucher, Seitenaufrufe, Logins, Reichweite, Moderation und Audit-Protokoll.

**Kachel 8 — Hilfe, Daten & Werkzeuge**  
Datenexport, Support, Quellenhinweise, Smart-Device-Verbindungen, externe Anbieter und technisch nicht aktivierte Integrationen.

Die Kachel **Host-/Team-Dashboard** wird nicht für normale Nutzer gerendert. Das verhindert eine irreführende „verfügbar“-Anzeige und hält den persönlichen Hub übersichtlich.

### Warum diese Gruppierung sinnvoll ist

Die aktuelle Struktur mischt Zielgruppen und Aufgaben: tägliche Pflege steht neben Kontosicherheit, und seltene Werkzeuge stehen neben dem Postfach. Das erhöht Suchaufwand und Fehlbedienung. Die neue Struktur trennt nach Nutzerabsicht: **Identität**, **eigene Anlagen**, **Kommunikation**, **Schutz**, **Darstellung**, **Fortschritt**, **Hostbetrieb** und **Hilfe**.

Die Detailseiten bleiben bestehen, werden aber nur noch aus dem Management-Hub geöffnet. Im Header und in Popovers erscheinen keine parallelen zweiten Einstellungslisten mehr.

## 4. TikTok-Muster: Was übernommen werden sollte

TikTok bündelt Kontoverwaltung und Sicherheit in einer zentralen Settings-Fläche und behandelt Kommunikationspräferenzen, Datenschutz, Datenrechte und Kontolöschung als echte Kontoeinstellungen. Die aktuelle TikTok-Dokumentation bestätigt außerdem, dass Nutzer Kontoinformationen direkt ändern, Daten anfordern sowie Deaktivierung oder Löschung aus den Einstellungen starten können. [1]

Für BlackWaterLeaf sind daraus folgende Muster sinnvoll:

1. **Ein zentraler Einstieg:** „Verwalten“ führt immer an dieselbe Stelle.
2. **Primärfunktionen zuerst:** Konto, Anlagen, Kommunikation und Datenschutz stehen oben.
3. **Sekundärfunktionen darunter:** Sprache, Fortschritt, Datenexport und Werkzeuge werden nicht mit den täglichen Aufgaben vermischt.
4. **Klare Statuswerte:** Ein Schalter zeigt „aktiv“, „aus“, „nur privat“ oder „nicht verfügbar“, nicht nur ein abstraktes Icon.
5. **Kontosicherheit als eigener Bereich:** Sitzungen, Abmelden auf allen Geräten, Konto schließen und Datenexport gehören zusammen.
6. **Benachrichtigungen steuerbar:** Postfach-, Community-, Pflege-, KI- und Host-Benachrichtigungen müssen getrennt, aber in einem Benachrichtigungszentrum verwaltet werden.
7. **Digitale Balance als Option:** TikTok bietet konfigurierbare Tageslimits, Ruhezeiten, Schlaf-Erinnerungen und Wochenübersichten an. Für BlackWaterLeaf sollte das als freiwillige „Ruhezeiten & Benachrichtigungen“-Einstellung erscheinen, ohne ein Social-Media-Suchtmodell zu kopieren. TikTok berichtet, dass ein Prompt zur Aktivierung von Screen-Time-Werkzeugen deren Nutzung in Tests um 234 % erhöhte. [2]
8. **Rollenabhängigkeit:** TikTok trennt allgemeine Einstellungen und Familien-/Sicherheitskontrollen. BlackWaterLeaf sollte analog persönliche Einstellungen, Moderation und Host-Dashboard strikt nach Rolle trennen. [2]

Nicht übernommen werden sollten TikTok-typische endlose Feed-Mechaniken, aggressive Engagement-Prompts oder eine Vermischung von Werbung und persönlichen Kontoeinstellungen.

## 5. Markt- und UX-Befund

### Progressive Disclosure statt langer Menüliste

Nielsen Norman Group empfiehlt, zunächst nur die wichtigsten Optionen zu zeigen und seltene oder fortgeschrittene Funktionen erst auf einer sekundären Ebene anzubieten. Das verbessert Lernbarkeit, Effizienz und Fehlerrate. Die Aufteilung in acht Management-Kacheln mit klarer zweiter Ebene folgt genau diesem Prinzip. [3]

Wichtig ist, dass die zweite Ebene vorhersehbar benannt wird. „Datenschutz & Sicherheit“ ist verständlicher als „Weitere Werkzeuge“. „Konto & Profil“ ist verständlicher als eine Mischung aus „Profil öffnen“, „Profil bearbeiten“ und „Privatbereich“.

### Navigation muss Navigation bleiben

Apple beschreibt Tab Bars als Navigation zwischen primären Bereichen, nicht als Sammelstelle für Aktionen. Die bestehende BlackWaterLeaf-Hauptnavigation mit Entdecken, Karte, Erfassen, Katalog, Community und Profil sollte deshalb erhalten bleiben. Einstellungen, Host-Dashboard und Pflege sind keine zusätzlichen Primärtabs; sie gehören in kontextuelle Management-Flächen. [4]

### Touch- und Icon-Anforderungen

Auf Mobile sollen sichtbare Icons nicht kleiner als nötig werden. Material Design empfiehlt für Touch-Ziele in der Regel mindestens 48 × 48 dp, bei mindestens 8 dp Abstand zwischen Zielen; Apple nennt 44 × 44 dp als Richtwert. Für die neue 2×2-Kachelstruktur bedeutet das: die gesamte Kachel ist antippbar, nicht nur das Icon. [5]

Icons müssen semantisch eindeutig bleiben:

- Konto: `UserRound`
- Anlagen & Pflege: `Leaf`, `Fish`, `Sprout` oder ein einheitliches Anlagen-Icon
- Kommunikation: `MessageCircle` oder `Inbox`
- Datenschutz & Sicherheit: `ShieldCheck`
- Sprache & Barrierefreiheit: `Globe2` oder `Accessibility`
- Fortschritt: `Trophy` oder `ChartNoAxesCombined`
- Host-Dashboard: `LayoutDashboard` oder `BarChart3`
- Hilfe & Daten: `LifeBuoy` oder `Database`

Die vorhandenen Naturbilder bleiben als Kontextbilder in Fachbereichen und Katalogen. Für Einstellungen sind sie als große Hintergrundbilder ungeeignet, weil sie den Zweck der Auswahl verschleiern. Dort sind klare Icons besser als Bildkacheln.

## 6. Eigene Karten-Seite: Zielmodell

### Web und Native gleich

Die Karte wird ein eigener Primärmodus mit genau drei sichtbaren Aufgaben:

1. **Karte:** echte Interaktion, Zoom, Marker und sicherer Datenstatus.
2. **Filter:** Alle, Botanik, Aquaristik, Terraristik sowie optional „nur meine freigegebenen Beobachtungen“.
3. **Liste:** dieselben Daten wie auf der Karte, niemals eine zweite oder abweichende Datenquelle.

Die bevorzugte Zielansicht ist ein **2×1-Raster**: eine dominante Kartenfläche und eine sekundäre Listen-/Filterfläche. Auf kleinen Displays werden diese beiden Flächen untereinander angeordnet, wobei die Karte zuerst sichtbar bleibt. Auf Desktop können Karte und Liste nebeneinander stehen. Eine lange Folge aus Portal-, Katalog- und Quellenkacheln gehört nicht in den primären Kartenmodus.

Die Karte darf weiterhin keine exakten privaten Orte darstellen. Öffentliche Marker müssen generalisiert, serverseitig freigegeben und mit Fachbereich, Taxon und Quellenstatus verbunden sein. Wenn es keine zulässigen Ortsdaten gibt, bleibt die Karte echt, aber zeigt einen ehrlichen leeren Datenzustand.

### TikTok-ähnlich, aber fachlich korrekt

„Wie bei TikTok“ sollte hier nur die klare, fokussierte Vollflächenlogik bedeuten: ein primärer Inhalt, wenige sichtbare Steuerungen und schnelles Wechseln zwischen Bereichen. Es bedeutet nicht, wissenschaftliche Karten in einen endlosen Video-Feed umzuwandeln.

## 7. Was zwingend geändert werden muss

**Priorität 1 — Informationsarchitektur:** Web und Native auf eine gemeinsame Management-Hub-Struktur mit denselben acht Kategorien, Begriffen, Icons und Berechtigungen bringen.

**Priorität 2 — „Verwalten“:** Den Button als eindeutigen Einstieg in den Management-Hub verwenden. Das bestehende verschachtelte Profil-Popover wird auf einen kurzen Einstieg reduziert.

**Priorität 3 — Einstellungen zusammenführen:** Profil bearbeiten, Avatar, Privatbereich, Datenschutz, Sitzungen, Sprache, Einheiten, Benachrichtigungen und Kontoaktionen aus verstreuten Wegen in die passenden Kacheln verschieben.

**Priorität 4 — Host-Dashboard:** Eine rollenabhängige Management-Kachel mit den realen Kennzahlen integrieren. Normale Nutzer sehen diese Kachel nicht. Host und Staff sehen nur Daten, für die sie berechtigt sind.

**Priorität 5 — Karte:** Web- und Native-Karte als dieselbe eigenständige Kartenroute mit 2×1-Zielmodell bauen. Die Native-Statik muss durch eine echte Kartenkomponente oder eine technisch gleichwertige Kartenbasis ersetzt werden.

**Priorität 6 — Verständlichkeit:** Jede Kachel erhält Icon, Titel, Unterzeile, Status und eine klare nächste Aktion. Keine generischen Labels wie „Weitere Werkzeuge“, wenn der Inhalt konkret benannt werden kann.

**Priorität 7 — Messung:** Vor und nach der Umstellung werden nur datensparsame Ereignisse gemessen: Öffnen von Verwalten, Öffnen einer Kachel, erfolgreiche Rückkehr, Suchzeit bis zur Einstellung, Abbruch, Kartenmodus und Listenmodus. Keine privaten Inhalte, exakten Standorte oder Nachrichteninhalte erfassen.

## 8. Entscheidungspunkte vor der Umsetzung

1. **2×2-Raster:** Soll das Raster auf Web und Native immer exakt vier Kacheln pro Ansicht zeigen, oder darf Web die acht Kacheln als zwei 2×2-Gruppen untereinander zeigen?
2. **Host-Dashboard:** Soll die Host-Kachel nur beim Eigentümerkonto erscheinen oder auch für aktive Moderatoren mit reduzierten Kennzahlen?
3. **2×1-Karte:** Ich interpretiere dies als eine dominante Karte plus eine sekundäre Liste/Filterfläche. Falls du mit „2×1“ zwei Kartenflächen nebeneinander meinst, muss das vor der Umsetzung bestätigt werden.
4. **Digitale Balance:** Soll BlackWaterLeaf Ruhezeiten und Benachrichtigungspläne anbieten, oder nur Benachrichtigungsgruppen ohne Nutzungszeit-Limits?

## Kurztext zur Besprechung

Wir müssen „Verwalten“ zu einem einzigen, identischen Management-Hub für Web und App machen. Alle persönlichen Einstellungen werden dort nach Nutzerabsicht in einem 2×2-Raster gruppiert: Konto, Anlagen, Kommunikation und Datenschutz; darunter folgen Sprache/Barrierefreiheit, Fortschritt, Host-Dashboard und Hilfe/Daten. Die Karte wird eine eigene fokussierte 2×1-Seite mit echter Karte, Filtern und synchroner Liste. Die Native-App braucht dafür noch eine echte Kartenbasis. Erst nach der Besprechung dieser vier Entscheidungen wird umgesetzt.

## Quellen

[1]: https://www.tiktok.com/legal/page/us/privacy-policy/en "TikTok Privacy Policy, updated July 15, 2026"
[2]: https://newsroom.tiktok.com/en-us/new-features-for-teens-and-families-on-tiktok-us "TikTok: New features for teens and families on TikTok"
[3]: https://www.nngroup.com/articles/progressive-disclosure/ "Nielsen Norman Group: Progressive Disclosure"
[4]: https://developer.apple.com/design/human-interface-guidelines/tab-bars?changes=__11 "Apple Human Interface Guidelines: Tab bars"
[5]: https://m3.material.io/foundations/designing/structure "Material Design 3: Target sizes"
