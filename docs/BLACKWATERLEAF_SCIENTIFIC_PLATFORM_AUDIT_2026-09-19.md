# BlackWaterLeaf: Prüfung der Hauptbereiche und wissenschaftliche Zielarchitektur

## Ergebnis

BlackWaterLeaf besitzt bereits die richtigen Grundbausteine für eine wissenschaftliche Naturplattform: getrennte Bereiche für **Botanik, Aquaristik und Terraristik**, private Beobachtungen, explizite Veröffentlichungsfreigaben, Community-Beiträge, Kommentare, Benachrichtigungen, KI-Bestimmung, PlantNet-Zweitprüfung, Quellen-/Taxonomie-Daten und eine Native-Paritätsbasis.

Die entscheidende nächste Aufgabe ist keine neue parallele App, sondern die **Fusion zu einem gemeinsamen fachlichen Objektfluss**:

> **Privater Naturmoment → Beobachtung/Fachfall → KI-Hypothese oder manuelle Eingabe → Quellen und Evidenz → menschliche Prüfung → kontrollierte Veröffentlichung → Community-Feedback oder kuratierter Live-Beitrag.**

## Prüfung der drei Hauptbereiche

| Bereich | Aktueller Stand | Ziel im fusionierten Produkt | Wichtigste Lücke |
|---|---|---|---|
| **Botanik** | Realm-Seite, private Beobachtungen, Pflege-/Wissenspfade und KI-Einstieg sind vorhanden. | Pflanzenatlas mit Taxon, Quellen, Bildern, Pflegekontext, Beobachtungen, Community und KI-Prüfung. | „Pflanze bestimmen“ ist im Realm derzeit noch als vorbereitet/nicht verfügbar markiert und muss direkt in den geprüften Live-Kamera-/Foto-Flow führen. |
| **Aquaristik** | Realm-Seite, private Aquarien/Wasserwerte, Channa-Katalog, Aquarium-KI und Beobachtungen sind vorhanden. | Wasser- und Artenobservatorium: Aquarium, Fisch/Pflanze, Messwerte, Quellen, Karte/Liste, Community und Live-Fachwissen in einem Kontext. | Private Messwerte, Beobachtung, Katalogeintrag und Community-Post müssen über dasselbe Beobachtungsobjekt verbunden werden, ohne private Daten zu veröffentlichen. |
| **Terraristik** | Realm-Seite, Fotoerfassung, Wissen, KI-Fragen und private Beobachtung sind vorhanden. | Mikrohabitat-Atlas mit Tier/Pflanze, Habitat, Pflege, Quellen, Medien und sicherer Sichtbarkeit. | Terraristik braucht dieselbe Evidenz-, Datenschutz- und Community-Struktur wie Botanik und Aquaristik, nicht nur eine eigene Farbvariante. |

## Community-Feed

Der Feed soll **TikTok-ähnlich bedienbar**, aber nicht TikTok-typisch beliebig sein. Die richtige Interpretation ist ein fokussierter vertikaler Fach-Feed:

1. Ein wichtiger Naturmoment oder Fachbeitrag pro Ansicht.
2. Vertikales Wischen zwischen Beiträgen, aber mit sichtbarer Quelle, Bereich, Autor, Zeit, Evidenzstatus und Datenschutzstatus.
3. Botanik, Aquaristik und Terraristik über Themenfilter verbinden.
4. Bilder und Aquarium-/Habitat-Videos zulassen.
5. Kommentare, Antworten, Speichern, Teilen, Melden und „nicht interessiert“ direkt am Beitrag.
6. KI-Ergebnisse immer als **KI-Vorschlag** kennzeichnen; keine automatische Bestätigung und keine automatische Veröffentlichung.
7. Kuratierte Fach-Lives separat markieren und moderieren; kein Engagement-Ranking als Qualitätsbeweis.

Der vorhandene Web-Feed kann dafür weiterverwendet werden: Er hat bereits Realm-Filter, Entwürfe, explizite Veröffentlichung, Bilder, Likes, Kommentare, Antworten sowie owner-scoped Bearbeiten/Löschen. Er muss visuell und datenmodellseitig auf Beobachtungen/Fachfälle erweitert werden.

## KI-Bestimmung und kostengünstige Suche

Der kostengünstige Ablauf ist eine **Datenbank-first-Architektur**:

1. Normale Suche nach wissenschaftlichem Namen, gebräuchlichem Namen, Synonym, Taxonomie, Realm und Quellen läuft ohne LLM.
2. Die Datenbank liefert zunächst kompakte Kandidaten und Quellen-IDs.
3. Nur bei Bildbestimmung, uneindeutiger Sprache oder einer fachlichen Frage wird KI aufgerufen.
4. Das Modell erhält nur die relevanten Kandidaten, komprimierte Quellen-Auszüge und die Bildzusammenfassung – keine komplette Rohdatenbank.
5. PlantNet bzw. andere spezialisierte Bildprüfung läuft als zweite, gezielte Validierung.
6. Das Ergebnis wird strukturiert gespeichert: Kandidaten, Unsicherheit, Quellen, Modellstand, Sicherheitsnotizen und weitere benötigte Bilder.
7. Eine menschliche Korrektur bleibt möglich und wird als Prüfdatensatz an Admins/Moderation übergeben.

Damit werden Tokenverbrauch, Latenz und unübersichtliche Rohtexte reduziert. Der Nutzer sieht Karten und Abschnitte statt JSON, Kommafolgen oder ungefilterter Datenbankfelder.

## Live-Funktionen

### Live-Kamera für Bestimmung

Die Kamera öffnet einen geführten Analysemodus für Pflanze, Fisch oder Habitat. Die App zeigt Bildqualität, relevante Perspektive, Datenschutz, Analysephase, Kandidaten und Unsicherheit. Der Eintrag bleibt ein Entwurf, bis der Nutzer ihn manuell prüft und freigibt.

### Community-Live

Community-Live ist für ausgewählte Fachbeiträge vorgesehen: Aquarienvorstellung, Pflanzenpflege, Habitatbeobachtung, Quellenbesprechung oder moderierte Fragerunde. Jede Live-Session benötigt Thema, Realm, Host, Moderationsstatus und Sichtbarkeit. Fachliche Aussagen können während des Lives als Quellen-/Faktenkarten angeheftet werden. Ein Live-Stream ist kein wissenschaftlicher Beleg, sondern ein Austauschformat; geprüfte Fakten müssen separat als Evidenz gespeichert werden.

## Verbindliche Datenobjekte

Die Plattform sollte langfristig ein gemeinsames **Observation-/Nature-Moment-Objekt** besitzen:

- Realm: Botanik, Aquaristik oder Terraristik
- Eigentümer und optionales Habitat
- Zeitpunkt, Medien und Notiz
- Organismusgruppe und Taxon-Ebene
- optionale Messwerte, z. B. Wasserwerte
- KI-Hypothese und Kandidaten
- Quellen, Evidenzstatus und menschliche Korrekturen
- Sichtbarkeit für Log, Fachfall, Community und Medien getrennt
- Standort-/Habitatpräzision: privat, verschleiert oder öffentlich
- Sync-, Moderations- und Revisionsstatus

Dieses Objekt verhindert, dass Aquariumwerte, Pflanzenbilder, KI-Ergebnisse und Community-Posts als unverbundene Sonderfälle auseinanderlaufen.

## Umsetzungsreihenfolge

**P0 – zuerst:** gemeinsames Beobachtungs-/Fachfallmodell, sichtbarer KI-Vorschlag mit Quellen, Datenschutz- und Standortgrenzen, Community-Moderation, Lade-/Fehlerzustände, zugängliche Feed-/Kartenalternative.

**P1 – danach:** vertikaler Fach-Feed, Medien-Upload für Bilder und Videos, kuratierte Community-Lives, Live-Kamera als geführter Entwurfsflow, gespeicherte Suchen und öffentliche Fachprofile.

**P2 – später:** personalisierte Discovery, Ranglisten, umfangreiche Live-Analytics und weitere Marktplatzverknüpfung.

## Designentscheidung

Das Aqua-Observatory-Format ist die richtige gemeinsame visuelle Basis: Portal-Header, Bereichsidentität, globale Suche, kompakte Karten, synchronisierte Liste/Karte, Quellen-/Evidenzpanel, Datenschutzpanel und Offline-/Ladezustand. Botanik und Terraristik erhalten eigene Bildwelten und fachliche Akzente, aber keine voneinander abweichende Bedienlogik.

Die App soll dadurch wie ein **Portal in eine wissenschaftliche Naturwelt** wirken: emotional in der Bildsprache, aber überprüfbar, privat-first, quellengestützt und funktional klar.

## Quellenbasis

Die internationale Designprüfung ist in `docs/INTERNATIONAL_DESIGN_RECHECK_2026-09-19.md` dokumentiert. Sie berücksichtigt Apple HIG, Material 3, Microsoft Fluent, iNaturalist, eBird, Pl@ntNet, GBIF und ausgewählte öffentliche UX-Diskussionen. Einzelmeinungen wurden von belastbaren Design- und Accessibility-Prinzipien getrennt.

## Freigaberegel für die nächste Produktphase

Kein neuer breiter Community- oder Live-Ausbau sollte veröffentlicht werden, bevor der gemeinsame Beobachtungsfluss Ende-zu-Ende geprüft ist: privat speichern, KI prüfen, Quellen anzeigen, manuell korrigieren, sichtbar freigeben, kommentieren, moderieren und wieder zurücknehmen.
