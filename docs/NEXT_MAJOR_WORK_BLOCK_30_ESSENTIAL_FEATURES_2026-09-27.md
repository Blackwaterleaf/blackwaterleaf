# BlackWaterLeaf · Nächster großer Arbeitsblock

**Stand:** 27. September 2026  
**Entscheidung:** Der nächste Großblock schließt den persönlichen Natur- und Pflegekreislauf, bevor Discovery, Creator-Mechaniken oder Live ausgebaut werden.

## 1. Warum dieser Block als Nächstes kommt

BlackWaterLeaf besitzt bereits viele sichtbare Bausteine: quellengebundene Kataloge, Realm-Karten, private Anlagen mit Galerie und Statuschips, Beobachtungen, KI-Kandidaten, Community-Antworten, Staff-Review, Datenexport, Feedback und steuerbare Benachrichtigungen.

Die größte verbleibende Produktlücke ist die Verbindung dieser Bausteine. Eine Person muss einen Fund erfassen, Unsicherheit verstehen, ihn privat dokumentieren, Pflege oder Bestand verknüpfen, gezielt um Rat bitten und später eine konkrete nächste Handlung erhalten können. Genau diese Kette erzeugt fachlichen Nutzen und freiwillige Rückkehr. Ein generischer Kurzvideo-Feed würde diese Lücke nicht lösen.

Die Funktionen unten sind deshalb **kein Wunschzettel**, sondern ein sequenzieller Arbeitsblock mit 30 Funktionen. Bereits vorhandene Funktionen werden nicht neu gebaut, sondern nur integriert, geprüft oder erweitert.

## 2. Priorisierte 30 Funktionen

### Phase A · Beobachtung als verlässlicher persönlicher Datensatz — P0

| Nr. | Funktion | Warum essenziell | Abhängigkeit / Release-Gate |
|---:|---|---|---|
| 1 | **Beobachtungsdetailseite Web + Native** | Ein Fund braucht einen stabilen Ort für Bild, Taxon, Status, Quelle, Ortsschutz und nächste Aktion. | Vor jeder weiteren Discovery-Funktion fertigstellen. |
| 2 | **Gemeinsamer Statusfluss** | Entwurf, gespeichert, Hilfe angefragt, Rückfrage offen, Vorschlag vorhanden und Staff-Review müssen identisch erscheinen. | Gleiche Statuswerte in Shared Contract, Web und Native. |
| 3 | **Mehrbild-Beobachtung** | Ein Hauptbild reicht bei Pflanzen und Tieren oft nicht für eine belastbare Einordnung. | Upload-Härtung bleibt einziger Medienweg. |
| 4 | **Beobachtungszeit und lokale Zeitzone** | Zeit ist für Verlauf, Pflege, saisonale Auswertung und wissenschaftliche Nachvollziehbarkeit notwendig. | Keine automatische Umwandlung ohne sichtbare Zeitzonenregel. |
| 5 | **Detailtyp und Beleg-Checkliste** | Blatt, Blüte, Frucht, Fischmerkmal oder Reptilienmerkmal helfen beim nächsten sinnvollen Bild. | Keine erfundenen visuellen KI-Merkmale; fehlende Modellinformation klar markieren. |
| 6 | **Kandidatenvergleich mit Unsicherheitsband** | KI darf nicht wie eine bestätigte Bestimmung wirken. Alternativen und Unsicherheit müssen vergleichbar sein. | Drei getrennte Wahrheiten bleiben erhalten: KI, Community, Staff. |
| 7 | **Katalog- und Quellenverknüpfung aus dem Kandidaten** | Ein Kandidat muss direkt zum geprüften Steckbrief und dessen Quellen führen. | Nur veröffentlichte, quellengebundene Taxa verlinken. |
| 8 | **KI-Provenienzkarte** | Nutzer müssen Modellstand, Katalogstand und Grenzen der Antwort erkennen können. | Keine Modell- oder Konfidenzangabe erfinden, wenn sie nicht geliefert wird. |
| 9 | **Foto ergänzen / erneut prüfen** | Eine offene Beobachtung braucht eine konkrete nächste Aktion statt eines toten Fehlerzustands. | Neue Medien müssen denselben Eigentums- und Consent-Prüfungen unterliegen. |
| 10 | **Privat speichern ohne Veröffentlichung** | Der schnelle private Nutzen muss ohne Community-Druck funktionieren. | Privat bleibt Default; keine automatische Feed-Erstellung. |

### Phase B · Fachliche Antwort und Schutz — P0

| Nr. | Funktion | Warum essenziell | Abhängigkeit / Release-Gate |
|---:|---|---|---|
| 11 | **Hilfeanfrage aus einer Beobachtung** | Nutzer können gezielt eine fachliche Frage stellen, statt einen beliebigen Post zu schreiben. | Nur angemeldete Konten; Beobachtungsbesitzer bleibt sichtbar zuständig. |
| 12 | **Taxon-Vorschlag mit Ebene und Begründung** | Community-Hilfe wird strukturiert und bleibt von einer Staff-Bestätigung getrennt. | Vorschlag darf Katalog und `evidenceState` nicht direkt verändern. |
| 13 | **Antwort-Thread mit Rückfragen** | Fachliche Diskussion braucht Kontext, Elternbeiträge und nachvollziehbare Antworten. | Moderationsstatus und Autor müssen bei jeder Antwort erhalten bleiben. |
| 14 | **Antwort als hilfreich markieren** | Der Besitzer braucht eine klare Möglichkeit, eine hilfreiche Antwort zu erkennen. | Kein globales Expertenranking; nur kontextbezogene Bestätigung. |
| 15 | **Melden, Blockieren und Stummschalten im Beobachtungskontext** | Schutz muss dort verfügbar sein, wo die Interaktion passiert. | Report und fachliche Uneinigkeit strikt trennen. |
| 16 | **Aktions-Postfach mit Deep Links** | Benachrichtigungen müssen direkt zu Kandidat, Rückfrage, Antwort oder Review führen. | Präferenzschalter und Ruhezeiten beachten. |
| 17 | **Review- und Einspruchsansicht für eigene Inhalte** | Nutzer brauchen nachvollziehbare Statusänderungen und Begründungen. | Staff-Entscheidung bleibt geschützt und auditierbar. |
| 18 | **Sensible-Taxon-Schutz** | Seltene oder gefährdete Arten benötigen strengere Orts- und Veröffentlichungsregeln. | Regel mit Grund, Version und Reviewzeitpunkt speichern. |
| 19 | **Geoprivacy-Wizard mit Ergebnisvorschau** | Nutzer müssen sehen, was öffentlich sichtbar sein wird. | Präzise, generalisiert und privat; keine exakten privaten Koordinaten im Feed. |
| 20 | **Medien- und Text-Leak-Prüfung** | EXIF, Ortsnamen, Bilddetails und Zeitnähe können einen Standort indirekt verraten. | Öffentliche Veröffentlichung bei bestätigtem Leak blockieren und erklären. |

### Phase C · Persönliches Natur- und Anlagenjournal — P1

| Nr. | Funktion | Warum essenziell | Abhängigkeit / Release-Gate |
|---:|---|---|---|
| 21 | **Append-only Naturtagebuch** | Beobachtungen, Medien, Notizen und Meilensteine werden zu einem persönlichen Gedächtnis. | Ereignisse werden versioniert, nicht still überschrieben. |
| 22 | **Anlagen-Journal** | Pflege, Umbau, Problem, Besatz und Fotos müssen im Anlagenkontext nachvollziehbar sein. | Private Anlagen und öffentliche Beobachtungen bleiben getrennte Domänen. |
| 23 | **Pflegeaufgaben mit Erledigt-Historie** | Eine Aufgabe soll nicht nur verschwinden, sondern als Pflegeereignis dokumentiert werden. | Zeitzone, DST, Wiederholung und Pause testen. |
| 24 | **Messwert-Zeitlinie** | Temperatur, Luftfeuchte und pH werden über Zeit verständlich statt nur als aktueller Chip angezeigt. | Nur tatsächlich gespeicherte Werte; keine interpolierten oder simulierten Werte. |
| 25 | **Ereignismarker im Messwertverlauf** | Wasserwechsel, Fütterung, Rückschnitt, Häutung oder Umbau erklären Messwertänderungen. | Einheiten und Herkunft jedes Wertes anzeigen. |
| 26 | **Private Organismen- oder Bestandsgruppe** | Ein Katalogtaxon kann optional als privates Exemplar oder Bestand in eine Anlage übernommen werden. | Katalogfakten nicht als private Historie kopieren. |
| 27 | **Lebensereignisse** | Einzug, Umzug, Beobachtung, Verlust und Medien bilden eine fachlich brauchbare Geschichte. | Keine automatische Veröffentlichung und keine Pflichtfelder ohne Datenbasis. |
| 28 | **Vorher-Nachher-Vergleich** | Fortschritt wird sichtbar, ohne Streaks oder Druckmechaniken zu benötigen. | Nur vom Nutzer gewählte Medien vergleichen. |

### Phase D · Sicheres Teilen und freiwillige Rückkehr — P1/P2

| Nr. | Funktion | Warum essenziell | Abhängigkeit / Release-Gate |
---:|---|---|---|
| 29 | **Snapshot-Freigabe aus Journal oder Anlage** | Nutzer können gezielt Rat oder Fortschritt teilen, ohne eine komplette Anlage offenzulegen. | Feldweise Vorschau: Bild, Frage, Art, gerundete Messwerte und grobe Region separat wählen. |
| 30 | **Rückkehr ohne Druck** | Ruhezeiten, optionale Wochenrhythmen, persönliche Meilensteine und Wiedereinstieg geben einen Grund zurückzukommen. | Kein Pflichtstreak, kein manipulativer Push, jederzeit pausierbar. |

## 3. Sinnvolle technische Reihenfolge

### Block 1 — Beobachtungsdetail und Statusvertrag

Funktionen **1–10** zuerst als gemeinsamer Web-/Native-Vertrag. Dazu gehören Datenmodell, Medienreferenzen, Beobachtungsdetail, Kandidatenstatus, Foto-Ergänzung und private Speicherung. Erst wenn Web und Native dieselben Zustände anzeigen, darf die Antwortschleife erweitert werden.

### Block 2 — Antwort, Moderation und Geoprivacy

Danach Funktionen **11–20**. Hier liegt das wichtigste Vertrauens-Gate: Eine Beobachtung darf erst öffentlich teilbar sein, wenn Vorschau, Standortschutz, Medienprüfung, Melden/Blockieren und Statusnachvollziehbarkeit funktionieren.

### Block 3 — Journal und Pflegeverlauf

Anschließend Funktionen **21–28**. Das vorhandene Care-Modell wird nicht ersetzt. Es wird um append-only Ereignisse, Messwertverläufe, Anlagenbezug und private Organismen-Historie ergänzt.

### Block 4 — Snapshot und sanfte Rückkehr

Zum Schluss Funktionen **29–30**. Snapshot-Freigabe wird erst gebaut, wenn private Anlagen-, Standort- und Mediengrenzen serverseitig getestet sind. Die Rückkehrmechanik bleibt optional und ruhig.

## 4. Was ausdrücklich nicht in den nächsten Großblock gehört

- Kein TikTok-ähnlicher Vollbild-Feed als Ersatz für Discovery.
- Keine globale XP-Rangliste als Qualitätsmaßstab.
- Keine automatische wissenschaftliche Bestätigung durch KI oder Community-Likes.
- Kein öffentlicher Standard für private Anlagen oder exakte Standorte.
- Kein Live-Streaming-Rollout vor stabiler Community-, Upload-, Moderations- und Datenschutzbasis.
- Kein Marketplace-Checkout, solange Händlerprüfung, Angebotsstatus und Betriebsprozesse nicht belastbar sind.
- Keine zusätzlichen Fake-Sensoren, Beispielbeobachtungen oder erfundenen Aktivitätszahlen.

## 5. Release-Gates für den gesamten Großblock

1. **Web-/Native-Parität:** Jeder Beobachtungsstatus und jede Schutzentscheidung existiert in beiden Clients.
2. **Datenintegrität:** Journal-Ereignisse sind append-only oder versioniert; keine stillen Überschreibungen.
3. **Privatsphäre:** Keine privaten Koordinaten, EXIF-Daten oder ungeprüften Medien gelangen in öffentliche Antworten oder Snapshots.
4. **Fachliche Trennung:** KI-Kandidaten, Community-Vorschläge und Staff-Evidenz bleiben getrennt.
5. **Abbruchfreiheit:** Ein Nutzer kann jederzeit privat speichern, pausieren, zurückgehen oder löschen, ohne eine Veröffentlichung auszulösen.
6. **Accessibility:** Karten haben gleichwertige Listenansichten; Icons besitzen verständliche Namen; Fokus und Statusmeldungen funktionieren per Tastatur und Screenreader.
7. **Performance:** Bild- und Listenpfade verwenden Lazy Loading, Cursor-Pagination und native FlatList-Regeln; Android bleibt ohne globalen Blur.
8. **Betrieb:** Audit-Ledger, Report-Status, Fehlertelemetrie, Rollback und Datenexport bleiben funktionsfähig.
9. **Messbarkeit:** Es werden nur datensparsame Ereignisse gemessen: Start, Abbruch, privat gespeichert, Hilfe angefragt, Antwort, Rückkehr.
10. **Qualitative Abnahme:** Mindestens fünf reale Testpersonen müssen die KI als Vorschlag verstehen und einen privaten Fund ohne Hilfe speichern können.

## 6. Empfehlung

Der nächste konkrete Umsetzungsschritt ist **Block 1 mit Funktionen 1–10**. Nicht alle 30 Funktionen gleichzeitig beginnen. Zuerst muss eine Ende-zu-Ende-Beobachtung auf Web und Native funktionieren: echtes Bild → unsichere Kandidaten → Quellenkarte → privat speichern → Detailseite mit nächster Aktion. Danach wird der Antwort- und Schutzblock auf diesen stabilen Datensatz gesetzt.

**Entscheidungspunkt:** Erst nach Abschluss der vier Block-Gates sollte der nächste Arbeitsauftrag Discovery-/Creator-Funktionen oder Live-Streaming behandeln.
