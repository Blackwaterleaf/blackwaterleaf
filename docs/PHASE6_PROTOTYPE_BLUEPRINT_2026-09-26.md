# BlackWaterLeaf – Phase 6: Prototyp-Blueprint und UX-Review

**Stand:** 26. September 2026  
**Status:** Vorimplementierungsfreigabe; **kein Produktions-UI, keine Route und kein Design-Token wurde geändert**.

> Dieser Blueprint ist die verbindliche Grundlage für den nächsten klickbaren Prototyp. Er beschreibt die überprüfbaren Zustände und Übergänge, ohne eine unabhängige Demo-App oder Fantasiedaten zu erzeugen.

## 1. Prototypprinzip

Der Prototyp verwendet ausschließlich verifizierte Inhalte, reale Leer-/Fehler-/Offlinezustände und die in Phase 3 festgelegten Primärzugänge. Jede Fläche besitzt eine klare Aufgabe und eine sichtbare nächste Aktion. Der Prototyp muss auf Web und Native dieselbe Bedeutung zeigen, darf aber plattformgerechte Shells verwenden.

## 2. Screen-Map mit Flussverweisen

### [P01 – Start / Home](#p01--start--home)

- **Einstieg:** Start.
- **Inhalt:** Markenheader, ehrliche Statusleiste, ein Natur-/Observatory-Hero, vier Aufgaben: Chat/KI, Pflanze bestimmen, Aquarium fragen, Wissen durchsuchen.
- **Primäraktionen:** Entdecken und Profil.
- **Zustände:** Daten bereit, keine Messquelle, offline, Fehler beim Hero-Medium.
- **Verbot:** Keine erfundenen Temperatur-, pH-, Wetter- oder Sensorwerte.

### [P02 – Entdecken](#p02--entdecken)

- **Einstieg:** Entdecken.
- **Inhalt:** Botanik, Aquaristik, Terraristik, öffentliche Beobachtungs-Vorschau und Katalog-/Wissensverweise.
- **Primäraktion:** Bereich wählen oder Karte öffnen.
- **Zustände:** loading, echte Daten, leer, offline, geschützte Orte.

### [P03 – Karte und Liste](#p03--karte-und-liste)

- **Einstieg:** aus Entdecken oder Erfassen-Kontext.
- **Inhalt:** echte öffentliche Karte plus autoritative Liste; generalized location-Hinweis direkt am Ergebnis.
- **Interaktionen:** Suche, Filter, Legende, Eintrag auswählen, Liste statt Karte.
- **Zustände:** map ready, no data, provider unavailable, offline, protected location.
- **Reflow:** Filter/Legende/Sheet/List bei 320 CSS-Pixel und 400 % Zoom einspaltig.

### [P04 – Katalog](#p04--katalog)

- **Einstieg:** aus Entdecken, Suche oder Realm.
- **Inhalt:** Alphabetnavigation, Realm-Filter, Familie, Gattung, Bildnachweis; große Bild-/Name-/botanische-Name-Karten.
- **Interaktionen:** A–Z, Filter kombinieren, Taxondetail öffnen.
- **Zustände:** verifiziertes Bild, kein Bild, loading, leerer Realm, Quelle.

### [P05 – Taxondetail](#p05--taxondetail)

- **Einstieg:** Katalog, Suche, Realm.
- **Inhalt:** großes echtes Bild, gebräuchlicher und wissenschaftlicher Name, Synonyme, Familie/Gattung, Quellen, Habitat-/Pflegefelder, Herkunftskarte nur bei Quelle.
- **Primäraktionen:** Quelle lesen, im eigenen Bereich erfassen.
- **Verbot:** Keine erfundenen Koordinaten, Messwerte, KI-Sicherheit oder Quellen.

### [P06 – Erfassen-Hub](#p06--erfassen-hub)

- **Einstieg:** dauerhaft sichtbare Erfassen-Aktion.
- **Drei Ziele:** Beobachtung erfassen, Beitrag erstellen, Mit KI analysieren.
- **Zustände:** angemeldet, geschützt, nicht verfügbar, offline.
- **Regel:** Auswahlseite ist kein gespeicherter Datensatz.

### [P07 – KI-Workspace](#p07--ki-workspace)

- **Einstieg:** Start, KI oder Erfassen-Hub.
- **Tool-Selector:** Chat, Pflanzenbestimmung, Aquarienanalyse.
- **Pflichtinformationen:** KI-Label, Eingabemethode, Consent/Datenschutz, Analyse läuft, Unsicherheit, Quellen/Begründung soweit verfügbar, Korrektur und nächste Aktion.
- **Zustände:** gated, unavailable, analyzing, suggestion, error, correction.
- **Farbregel:** Violett/Indigo nur hier.

### [P08 – Community-Feed](#p08--community-feed)

- **Einstieg:** Community.
- **Inhalt:** ausschließlich reale veröffentlichte Beiträge aktiver Konten; Botanik/Aquaristik/Terraristik-Filter.
- **Interaktionen:** Beitrag öffnen, kommentieren, melden, moderieren nach Rolle, Composer öffnen.
- **Zustände:** signed-out locked, empty, loading, error, published.

### [P09 – Postdetail](#p09--postdetail)

- **Einstieg:** `/community/post/:id`.
- **Inhalt:** Autor/Creator, Medien mit Originalproportion, Zoom, Quelle/Alttext, Kommentarthread, Moderationsaktionen.
- **Interaktionen:** edit/delete/report nach Eigentum/Rolle; Antwort erstellen.
- **Verbot:** Keine Query-Postlinks als parallele Detailarchitektur.

### [P10 – Profil / Creator](#p10--profil--creator)

- **Einstieg:** Profil oder öffentlicher Creator-Link.
- **Inhalt:** Avatar, Name, Handle, Bio, freigegebene Medien, Kennzahlen nur wenn real.
- **Primäraktion:** Verwalten bei eigenem Profil; Folgen/Blockieren bei fremdem Profil, falls serverseitig vorhanden.
- **Zustände:** public, private, blocked, empty, signed-out.

### [P11 – Management Hub](#p11--management-hub)

- **Einstieg:** `/profile/manage`.
- **Raster:** Konto, Anlagen, Kommunikation, Datenschutz/Freigaben, Sprache/Einheiten, Fortschritt, Werkzeuge.
- **Regel:** Untereinstellungen bleiben unter diesem Hauptzugang; direkte Kompatibilitätslinks fokussieren den passenden Hub-Bereich.
- **Zustände:** authenticated, unauthorized, empty, save error.

## 3. Repräsentative klickbare Übergänge

1. **P01 → P02:** „Entdecken“ öffnet den Portalbereich.
2. **P02 → P03:** „Karte öffnen“ zeigt Karte/Liste mit Datenschutzkontext.
3. **P02 → P04:** „Katalog“ öffnet den browsebaren Fachkatalog.
4. **P04 → P05:** Karte öffnet Taxondetail; Zurück erhält Filter-/Alphabetzustand.
5. **P01/P02 → P06:** Erfassen-Aktion öffnet den Drei-Ziele-Hub.
6. **P06 → P07:** KI-Ziel öffnet den einzigen KI-Workspace direkt im passenden Tool.
7. **P02/P08 → P08/P09:** Beitrag öffnet ausschließlich das kanonische Postdetail.
8. **P10 → P11:** eigener Profilbereich öffnet den Management Hub.
9. **Alle Screens → Offline/Fehlerzustand:** Inhalt bleibt verständlich; keine falsche Live-Aktivität.

## 4. Prototyp-Review-Matrix

| Prüfbereich | Prüffrage | Bestehensregel |
|---|---|---|
| Orientierung | Erkennen Nutzer den Hauptbereich? | Kontextlabel, aktive Navigation und Zurückweg sind sichtbar. |
| Findability | Finden Nutzer Art, Ort, Foto, Community und Profilverwaltung? | Kein Ziel benötigt einen Alias- oder Zufallsbegriff. |
| Hierarchie | Gibt es pro Screen eine führende Aktion? | Eine Primäraktion, unterstützende Details danach. |
| Wahrheit | Werden echte/fehlende Daten unterschieden? | Kein dekorativer Status ersetzt Quelle oder Zustand. |
| KI-Vertrauen | Ist KI als Vorschlag erkennbar? | Label, Unsicherheit, Eingabe, Quelle/Begründung und Korrektur sichtbar. |
| Accessibility | Funktioniert die Aufgabe ohne Farbe, Glow, Bewegung oder Bild? | Text/Icon/Status/Fokus bleiben verständlich. |
| Reflow | Funktioniert 320 CSS-Pixel/400 % Zoom? | Kein Clipping wesentlicher Inhalte; Kartencontrols reflowen. |
| Performance | Ist die opake Variante vollständig? | No-Blur- und Reduced-Motion-Varianten sind gleichwertig nutzbar. |
| Datenschutz | Sind private Orte/Entwürfe geschützt? | Sichtbarkeit und Cachezustand stehen am relevanten Ergebnis. |
| Cross-Platform | Bleibt dieselbe fachliche Bedeutung erhalten? | Web/Native können anders aussehen, aber nicht anders handeln. |

## 5. Offene Prototypeingaben

- finaler Entscheidungstest für vier Home-Ziele versus sichtbare Erfassen-Aktion;
- bestätigte kanonische Web-Kartenroute oder fokussierter Explore-Map-State;
- freigegebene KI-Anbieter-/Modell-/Quellenlage;
- echte Daten für repräsentative Katalog-, Community- und Kartenstates;
- rechtlich geprüfte öffentliche Datenschutz-/Impressumsziele;
- Zielgeräte für Low-End-Android- und Reduced-Motion-Abnahme.

## 6. Stopppunkt

Phase 6 ist als überprüfbarer Blueprint abgeschlossen. **Vor Phase 7 wird angehalten.** Es wurden keine Produkt-Routen, Komponenten, Tokens, Datenmodelle, Integrationen oder bestehenden Screens geändert. Die nächste Umsetzung darf erst nach einer Designfreigabe und der Beseitigung der im Phase-1-Audit genannten Release-Gates beginnen.
