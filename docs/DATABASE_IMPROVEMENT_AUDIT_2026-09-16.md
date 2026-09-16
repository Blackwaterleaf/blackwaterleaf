# BlackWaterLeaf – Datenbank-Verbesserungsaudit

**Prüfstand:** 16. September 2026
**Umfang:** Quellschema, lokale Drizzle-Migrationen, Live-Schema, Indizes, Fremdschlüssel, Ausführungspläne und ausschließlich aggregierte Tabellenmengen.
**Ursprüngliche Prüfung:** Keine Tabelle, kein Index und keine Nutzerdaten verändert.
**Umsetzungsstatus, 16. September 2026:** Die in diesem Bericht als unmittelbar sichere, additive Maßnahmen bewerteten Tabellen, Fremdschlüssel, Indizes und Serverprüfungen wurden kontrolliert umgesetzt und geprüft. Die Migrationsbaseline bleibt ausdrücklich offen.

## Gesamturteil

Die Datenbank ist für den aktuellen Staging-Umfang **strukturell solide und datensparsam**. Die meisten fachlichen Beziehungen besitzen Fremdschlüssel, Eigentumsprüfungen erfolgen zusätzlich im Servercode, Bilddateien liegen nicht in MySQL, und private KI-Eingaben werden nicht als Prompt oder Bild gespeichert. Die vorhandenen Inhalte sind sehr klein: ein Konto, ein XP-Ereignis sowie wenige Audit- und Partnerprüfdatensätze; Beobachtungen, Medien, private Lebensräume, lokale Logins, Community-Inhalte und KI-Nutzung enthalten derzeit keine Datensätze.

Die wichtigste Korrektur betrifft nicht die Geschäftslogik, sondern die **Migrationsführung**. Das lokale Drizzle-Journal enthält zwölf Migrationen (`0000` bis `0011`), während `__drizzle_migrations` in der Datenbank nur sieben Hashes führt. Die Tabellen und Spalten aus den späteren Migrationen sind physisch vorhanden. Ein unkontrollierter globaler `drizzle-kit migrate`-Lauf kann daher bereits vorhandene Tabellen erneut anlegen wollen oder die Wiederherstellbarkeit verfälschen. Dieser Zustand muss vor jeder weiteren Schemaerweiterung bereinigt werden.

## Umsetzungsnachtrag

Die Datenbank wurde **ohne Löschung und ohne globale Drizzle-Ausführung** erweitert. Die neue Tabelle `user_consent_current` übernimmt die fünf bestehenden Freigaben als aktuellen Zustand; `user_consent_events` enthält fünf entsprechende Baseline-Ereignisse. Alle KI-, Medien- und Veröffentlichungsprüfungen lesen nun den aktuellen Zustand. Die neue Tabelle `smart_device_measurements` stellt eine private, append-only Messzeitreihe für manuelle und später autorisierte Gerätewerte bereit. Sie speichert keine Zugangsdaten und keine Rohpayloads.

| Bereich | Umgesetzt | Verifikation |
|---|---|---|
| Einwilligungen | Aktueller Zustand, Baseline-Ereignisse und serverseitige Umstellung der Prüfungen | 5 Legacy-Zeilen, 5 aktuelle Zustände, 5 Baseline-Ereignisse; keine verwaisten Datensätze |
| Wasserwerte | Private Zeitreihentabelle, Metrik-/Einheitenvertrag und geschützte API für manuelle Werte | Drei Fremdschlüssel, Eindeutigkeit für Gerätemessungen, zwei Abrufindizes |
| Integrität | Kommentar-Elternschlüssel mit `SET NULL`, Validierung des Medienkontexts im Servercode | Fremdschlüssel und neue Indexe im Live-Schema bestätigt |
| Leistung | Zehn gezielte zusammengesetzte Indizes auf nachgewiesenen Listen-, Medien- und Messpfaden | Alle zehn Indexe im Live-Schema bestätigt |

Die alte Migrationshistorie ist damit **nicht gelöst**: Die neuen DDL-Schritte wurden wegen des bereits dokumentierten Journaldrifts kontrolliert und einzeln angewandt. Vor einem regulären globalen Migrationslauf bleibt die Baseline-Versöhnung zwingend.

## Nachgewiesener Ist-Zustand

| Bereich | Befund | Bewertung |
|---|---|---|
| Laufzeitdatenbank | TiDB `8.0.11-TiDB-v8.5.3-serverless` im strikten SQL-Modus. | Geeignet; jede neue DDL-Anweisung muss gegen TiDB getestet werden. |
| Tabellen und Beziehungen | 22 Tabellen; 26 dokumentierte Fremdschlüsselbeziehungen. | Solide Basis für Konten, Inhalte, Medien, XP, Partner und Geräteauswahl. |
| Datenvolumen | Fast alle fachlichen Tabellen sind leer; es gibt keine Hochlastdaten, die eine sofortige Skalierungsmaßnahme erzwingen. | Günstiges Zeitfenster für eine saubere Baseline. |
| Referenzintegrität | Stichproben auf verwaiste Medien, Geräteverbindungen und Tokens sowie auf abweichende Like-/Kommentarzähler ergaben jeweils `0`. | Gegenwärtig konsistent. |
| Query-Pläne | `post_comments` nutzt den passenden zusammengesetzten Index. Die Listen für eigene Beobachtungen und eigene Community-Beiträge benötigen dagegen einen zusätzlichen Sortierschritt. Medien für einen öffentlichen Beitrag werden nur über den Nutzerindex vorgefiltert. | Vor dem Wachstum gezielt optimieren. |
| KI-Datensparsamkeit | `assistant_usage` protokolliert Modell, Zeichenmengen und Zeit, aber weder Prompt, Antwort noch Pflanzenbild. | Gute Datenschutzentscheidung. |

## Priorität 0 – Migrationshistorie mit dem Live-Schema versöhnen

**Befund.** Die sieben in der Datenbank registrierten Hashes entsprechen den lokalen Migrationen `0000`, `0001`, `0002`, `0004`, `0005` und `0006`; der registrierte vierte Hash entspricht nicht der aktuellen Datei `0003_slimy_bloodaxe.sql`. Die lokalen Migrationen `0007` bis `0011` fehlen vollständig im Datenbankjournal. Gleichzeitig existieren `private_habitats`, `local_credentials`, `partner_products` mit Bildspalten und `smart_device_connections` bereits im Live-Schema.

**Risiko.** Eine reguläre Migration kann die Staging-Datenbank in einen Fehlerzustand bringen, weil sie bereits vorhandene DDL erneut ausführen würde. Noch wichtiger: Ein späterer Rollback oder ein neu aufgebautes Staging wäre nicht zuverlässig reproduzierbar.

**Empfehlung.** Bis zur Bereinigung darf **kein** globaler Drizzle-Migrationslauf ausgeführt werden. Zuerst wird ein schreibgeschützter Schemadump inklusive Tabellen, Indizes und Fremdschlüssel erzeugt. Danach wird die aktuelle Datenbank als verbindliche Baseline übernommen. Die fehlenden Änderungen werden nicht blind erneut ausgeführt; stattdessen wird eine kontrollierte Baseline-/Adoptionsmigration erstellt und in einer frischen, leeren Testdatenbank gegen die lokale Journalfolge verifiziert. Erst wenn frischer Neuaufbau, Upgrade und erneuter Schemaabgleich funktionieren, wird die produktive Migrationskette wieder freigegeben.

> **Entscheidungsregel:** Die Datenbankhistorie darf entweder von Drizzle oder von dokumentierten manuellen DDL-Schritten geführt werden. Beide Mechanismen parallel, ohne Abgleich, sind nicht ausreichend sicher.

## Priorität 1 – Einwilligungen als aktuellen Zustand und als Ereignishistorie trennen

**Befund.** `user_consents` ist je `(userId, purpose, policyVersion)` eindeutig. Der Anwendungscode prüft jedoch nur `(userId, purpose, granted = true)`. Wenn eine neue Policy-Version gespeichert wird, kann ein älterer Eintrag mit `granted = true` weiterhin als Freigabe gelten. Der aktuelle zusammengesetzte Index deckt die beiden ersten Filterspalten ab, muss dann aber `granted` nachfiltern.

**Risiko.** Die Freigabe kann fachlich auf einer überholten Policy-Version beruhen. Das betrifft insbesondere Medienverarbeitung, Veröffentlichung und KI-Verarbeitung.

**Empfehlung.** Das Modell sollte in zwei Ebenen aufgeteilt werden:

| Tabelle | Zweck | Kernregel |
|---|---|---|
| `user_consent_current` | Aktueller, direkt prüfbarer Zustand je Zweck. | Eindeutiger Schlüssel `(userId, purpose)`; enthält `policyVersion`, `granted`, `grantedAt`, `revokedAt`, `updatedAt`. |
| `user_consent_events` | Unveränderbare Historie jeder Erteilung und jedes Widerrufs. | Ereignis-ID, `userId`, Zweck, Policy-Version, Zustand und Zeitstempel. |

Die Serverprüfungen müssen danach den aktuellen Datensatz und die erwartete Policy-Version prüfen. Für eine Übergangsphase ist mindestens ein Index auf `(userId, purpose, granted)` sinnvoll. Zusammengesetzte Indizes funktionieren für vollständige Bedingungen und für linke Präfixe; die Spaltenreihenfolge muss deshalb an den tatsächlichen Zugriff angepasst werden.[1]

## Priorität 1 – Zeitreihenmodell vor der Smart-Home-Anbindung einführen

**Befund.** Die Anwendung kann Geräte auswählen, aber es gibt keine Tabelle für automatisch eingehende Wasserwerte. `private_habitats.details` enthält manuelle JSON-Werte und eignet sich als Profil-Snapshot, nicht als fortlaufende Messreihe.

**Risiko.** Ohne Zeitreihentabelle würden pH, Temperatur, Leitwert und weitere Messungen entweder überschrieben, in JSON verborgen oder in einer nicht durchsuchbaren Form gespeichert. Verlauf, Ausreißererkennung, Datenqualität und Gerätestatus wären später schwer nachrüstbar.

**Empfehlung.** Vor dem ersten echten Geräteconnector eine schlanke Tabelle `habitat_measurements` vorsehen. Sie sollte mindestens `id`, `userId`, `habitatId`, `deviceConnectionId`, `metric`, `valueDecimal`, `unit`, `observedAt`, `receivedAt`, `source` und `quality` enthalten. Ein eindeutiger Schlüssel auf `(deviceConnectionId, metric, observedAt)` verhindert Duplikate. Ein Abrufindex auf `(habitatId, metric, observedAt)` unterstützt Verlaufskurven und Grenzwertanalysen. Es sollen weder Zugangstoken noch Rohpayloads der Geräte in dieser Tabelle gespeichert werden.

Für die Datenmenge braucht es vor der Aktivierung eine Aufbewahrungsentscheidung: beispielsweise Rohdaten nur für einen klar beschlossenen Zeitraum, danach stündliche oder tägliche Aggregate. Die konkrete Frist darf nicht technisch geraten werden; sie muss zum Nutzerversprechen und zur Datenschutzdokumentation passen.

## Priorität 1 – Löschung, Anonymisierung und Objekt-Speicher gemeinsam definieren

**Befund.** Die vorhandenen Fremdschlüssel verwenden überall `NO ACTION`. Das ist defensiv: Eine Kontolöschung kann keine abhängigen Datensätze unbemerkt hinterlassen. Gleichzeitig gibt es noch keinen dokumentierten, transaktional definierten Ablauf für Kontolöschung, Anonymisierung oder Medienlöschung.

**Risiko.** Ein späterer Löschwunsch könnte durch Fremdschlüssel blockiert werden. Außerdem können Objekte im Dateispeicher zurückbleiben, wenn ein DB-Schreibvorgang nach dem Upload fehlschlägt oder wenn ein Datensatz entfernt wird.

**Empfehlung.** Die Restrict-Strategie beibehalten und einen expliziten Datenlebenszyklus implementieren. Dieser sollte zuerst öffentliche Inhalte entziehen, dann private Daten anonymisieren oder löschen, referenzierte Speicherobjekte entfernen und zum Schluss einen unveränderbaren, datensparsamen Löschbeleg hinterlassen. `CASCADE` darf nur für Beziehungen eingesetzt werden, deren vollständige automatische Löschung fachlich beabsichtigt ist; Fremdschlüsselaktionen unterscheiden zwischen `CASCADE`, `SET NULL` und `RESTRICT`/`NO ACTION`.[2]

## Priorität 2 – Indizes und Paginierung vor dem Inhaltswachstum ergänzen

Die aktuellen Mengen sind klein. Dennoch zeigen die Live-Ausführungspläne schon jetzt zwei unnötige Sortierungen und einen Medienfilter, der nicht vollständig im Index liegt. Die folgenden Maßnahmen sind gezielt und begründet; sie sollten erst **nach** der Migrationsbereinigung in einer additiven Migration umgesetzt werden.

| Zugriff | Beobachtung | Empfohlene Änderung |
|---|---|---|
| Eigene Beobachtungen | Die Abfrage filtert `userId` und sortiert nach `updatedAt`; der bestehende Index enthält dazwischen `realm`, wenn kein Realm gefiltert wird. | Index `(userId, updatedAt)` ergänzen; später Cursor-Paginierung nach `(updatedAt, id)`. |
| Eigene Community-Beiträge | Die Abfrage nutzt nur den FK-Index auf `userId` und sortiert anschließend. | Index `(userId, updatedAt)` ergänzen; Cursor-Paginierung nach `(updatedAt, id)`. |
| Öffentliche Beitragsmedien | Filter auf `postId`, `userId` und `visibility`; der Plan startet derzeit über `userId` und filtert die übrigen Bedingungen danach. | Index `(postId, userId, visibility)` ergänzen; beim Feed alle Medien einer Seite in einer Sammelabfrage laden. |
| Beobachtungsmedien | Abfrage über `observationId` und `userId`, danach Sortierung nach `createdAt`. | Index `(observationId, userId, createdAt)` ergänzen, sofern mehrere Bilder pro Beobachtung vorgesehen sind. |
| Persönliche Lebensräume | Der vorhandene Index enthält `kind`; die Liste aller Lebensräume eines Mitglieds sortiert jedoch unabhängig davon nach `updatedAt`. | Index `(userId, updatedAt)` ergänzen, sobald mehrere Lebensräume pro Konto üblich werden. |

Die öffentliche Community-Feed-Abfrage hat bereits einen passenden Index für `status`, `visibility` und `createdAt`. Der Kommentarpfad nutzt außerdem bereits `(postId, status, createdAt)` und vermeidet deshalb den zusätzlichen Sortierschritt.

## Priorität 2 – Polymorphe Medien und Kommentarantworten stärker absichern

**Befund.** In `media_assets` können `observationId` und `postId` beide null oder beide gesetzt sein. Die Spalte `kind` wird im Code gesetzt, wird aber nicht durch eine Datenbankregel an genau einen zulässigen Elternkontext gebunden. Bei `post_comments.parentId` existiert keine Fremdschlüsselbeziehung und der Schreibpfad prüft nicht, ob der übergeordnete Kommentar zum selben Beitrag gehört.

**Risiko.** Fehlerhafte Import- oder spätere Adminpfade können Medien in einen widersprüchlichen Kontext bringen. Kommentarantworten könnten auf einen nicht existierenden oder fremden Beitrag zeigen.

**Empfehlung.** Vor Community-Wachstum eine zusätzliche Integritätsregel implementieren. Für Medien muss der Zustand eindeutig sein: Avatar ohne Inhaltseigentümer, Beobachtungsbild nur mit `observationId`, Beitragsbild nur mit `postId`. Ob dies als TiDB-kompatible `CHECK`-Constraint oder zusätzlich durch strikt getestete Servertransaktionen umgesetzt wird, ist vor der Migration zu verifizieren. Für Kommentare sind eine Fremdschlüsselreferenz von `parentId` auf `post_comments.id`, ein Index für Thread-Abfragen sowie eine serverseitige Prüfung auf dieselbe `postId` sinnvoll.

## Priorität 2 – Partnerfreigaben und Zähler skalierbar halten

**Befund.** Die öffentliche Partnerabfrage lädt alle Freigabeereignisse und ermittelt den neuesten Zustand anschließend im Anwendungsspeicher. Bei wachsender Partnerhistorie wird jeder Home-Aufruf unnötig umfangreicher. Likes und Kommentare werden als Zähler in `community_posts` geführt; die aktuelle Stichprobe zeigt keine Abweichung, aber spätere Moderations- oder Löschpfade müssen diese Zähler immer mitführen.

**Empfehlung.** Die aktuelle Partnerfreigabe pro Partner sollte entweder materialisiert auf dem Partnerprofil liegen oder über eine datenbankseitige „neuester Datensatz je Partner“-Abfrage geladen werden. Für Interaktionszähler ist ein verbindlicher Schreibvertrag nötig: jeder Statuswechsel eines Kommentars sowie jede Löschung aktualisiert den Zähler in derselben Transaktion. Zusätzlich sollte ein ausschließlich administrativer Konsistenzcheck erhalten bleiben.

## Priorität 3 – Authentifizierungs- und KI-Nutzdaten mit Aufbewahrung und Zustellung absichern

`local_auth_tokens` speichert nur gehashte, ablaufende Einmal-Token; das ist gut. Abgelaufene und verbrauchte Tokens werden jedoch nicht bereinigt. Ebenso werden Token-Erstellung und E-Mail-Versand nicht über eine Zustell-Outbox modelliert. Bei einem Versandfehler kann ein Token existieren, ohne dass die Person ihn erhält.

Vor allgemeiner Freischaltung des lokalen Logins sollte eine datensparsame Outbox ergänzt werden. Die Konto- und Tokenänderung erzeugt dann in derselben Transaktion einen ausstehenden E-Mail-Auftrag. Ein separater, begrenzt wiederholender Versandprozess aktualisiert nur Zustellstatus und Fehlerklasse; er speichert keine Klartexttoken. Die Bereinigung verbrauchter und abgelaufener Token sowie alter KI-Nutzungsmetadaten braucht eine schriftliche Aufbewahrungsentscheidung und einen überwachten Ausführungsweg.

Für `assistant_usage` ist zusätzlich eine fachliche Operationsart sinnvoll, etwa `chat`, `plant_identification` und `aquarium_analysis`. Das erlaubt Kosten-, Qualitäts- und Limit-Auswertungen, ohne Prompt, Antwort oder Bild zu speichern. Ein optionaler Bezug zum privaten Aquarium darf nur als ID erfolgen und nur wenn er für Betrieb und Support wirklich erforderlich ist.

## Empfohlene Umsetzung in sicherer Reihenfolge

1. **Migrationsbaseline herstellen.** Keine globale Migration ausführen, bevor Journal und Live-Schema reproduzierbar zusammengeführt sind.
2. **Einwilligungsmodell korrigieren.** Aktuellen Zustand und Ereignishistorie trennen; KI-, Medien- und Veröffentlichungschecks nur gegen die erwartete aktuelle Policy-Version ausführen.
3. **Lebenszyklus festlegen.** Kontolöschung, Anonymisierung, Speicherobjekt-Löschung, Tokenbereinigung und KI-Metadatenaufbewahrung fachlich bestätigen.
4. **Vor Smart-Home die Zeitreihe bauen.** Messungen, Eindeutigkeit, Qualitätsstatus und Abrufindizes definieren; erst danach Geräteverbindungen aktivieren.
5. **Additive Indizes und Cursor-Paginierung einführen.** Die vier konkret nachgewiesenen Listen-/Medienpfade zunächst in einer frischen Testdatenbank vergleichen und dann kontrolliert migrieren.
6. **Community- und Partnerintegrität schließen.** Medienkontext, Kommentar-Elternbezug, Zählervertrag und Partnerfreigabeabfrage verbessern.

## Nicht empfohlen

Es ist nicht sinnvoll, jetzt pauschal viele Indizes zu erstellen oder JSON-Felder sofort zu normalisieren. Bei fast leeren Tabellen verursachen solche Änderungen nur Schreib- und Wartungskosten. Der sinnvolle Ausnahmefall sind die oben genannten, bereits durch Ausführungspläne und konkrete Produktpfade belegten Indizes. Ebenso sollte kein `ON DELETE CASCADE` pauschal eingeführt werden: Die richtige Löschaktion hängt vom fachlich bestätigten Lösch- und Nachweisprozess ab.

## Fazit

Die aktuelle Datenbank ist **kein Hindernis für die Staging-App**, aber sie benötigt vor weiterem Schemawachstum eine kontrollierte Migrationsbaseline. Danach sind eine policy-sichere Einwilligungsstruktur und ein echtes Messzeitreihenmodell die wichtigsten Verbesserungen. Die Performanceoptimierungen sind klar abgrenzbar und können als additive Migration nachgezogen werden, sobald die Schemahistorie wieder verlässlich ist.

## References

[1]: https://dev.mysql.com/doc/en/multiple-column-indexes.html "MySQL Reference Manual – Multiple-Column Indexes"
[2]: https://dev.mysql.com/doc/refman/8.4/en/create-table-foreign-keys.html "MySQL Reference Manual – Foreign Key Constraints"
