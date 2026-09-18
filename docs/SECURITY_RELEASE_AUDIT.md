# BlackWaterLeaf – Sicherheits- und Releaseprüfung

**Prüfstand:** 16. September 2026
**Zielsystem:** getrennte Fullstack-Stagingumgebung

## Ergebnis

| Prüffeld | Ergebnis | Nachweis |
|---|---|---|
| Vitest | Bestanden | 10 Testdateien, 45 Tests, 0 Fehler |
| TypeScript | Bestanden | `tsc --noEmit`, 0 Fehler |
| Produktionsbuild | Bestanden | Vite-Client und gebündelter Express-Server erzeugt |
| Produktionsabhängigkeiten | Bestanden | `pnpm audit --prod --audit-level high`: keine bekannten Schwachstellen |
| MySQL-Migrationen | Teilweise | Bestehende Basisstruktur ist aktiv; die additive Tabelle `assistant_usage` ist geprüft, aber noch nicht in dieser Staging-Datenbank angelegt |
| Datenwahrheit | Bestanden | Keine Seed-/Beispielnutzer, -beiträge, -likes, -beobachtungen oder KI-Antworten angelegt |

## Sicherheitskontrollen

Die Anwendung bindet Sitzungstoken an die konfigurierte Anwendungs-ID und verwirft korrekt signierte Tokens anderer Anwendungen. Geschützte Verfahren erfordern ein aktives Datenbankkonto; Moderator- und Adminzugriffe benötigen zusätzlich die serverseitige Rolle. OAuth-Profilabgleich darf keine Rolle oder Kontosperre verändern.

Cookie-basierte Mutationen werden durch Same-Origin-Prüfung geschützt. Native Bearer-Token-Anfragen werden getrennt behandelt. Sicherheitsheader, eine restriktive Produktions-CSP und getrennte Rate Limits für allgemeine API-, Auth-, Upload-, Community- und künftige KI-Pfade sind aktiv.

Die Testabdeckung umfasst außerdem die direkt in Profil-, Beobachtungs- und Community-Routern verwendeten Eigentums- und Sichtbarkeitspolitiken. Fremde Konten erhalten keinen Eigentümerstatus; private und nicht gelistete Beobachtungen bleiben außerhalb des Eigentümerkontos unsichtbar; gesperrte Konten werden nicht öffentlich ausgeliefert; Communitydaten sind nur bei gleichzeitig aktivem Autor, öffentlicher Sichtbarkeit und veröffentlichtem Status sichtbar. Komponentennahe Tests prüfen die deklarierten Auth-, Lade-, Leer-, Fehler- und Policy-Zustände der Kernrouten.

JPEG-, PNG- und WebP-Uploads werden zusätzlich zum angegebenen MIME-Typ anhand der tatsächlichen Dateisignatur und Größe validiert. Bildbytes liegen im Objektspeicher; MySQL enthält Eigentum, Sichtbarkeit und Speicherreferenzen. Private Medien werden über kurzlebige signierte Abrufadressen ausgeliefert.

## Abhängigkeitsbereinigung

Der erste Produktionsaudit meldete 85 Befunde, darunter einen kritischen und 23 hohe. Betroffene direkte Pakete wurden gezielt aktualisiert. Die nicht verwendete Chart-Komponente und Recharts-Abhängigkeit wurden entfernt, statt eine unnötige Bibliothek im Produktionsbundle zu behalten. Der abschließende Audit meldet **keine bekannten Schwachstellen**.

## Verbleibender technischer Hinweis

Der Vite-Produktionsbuild weist auf ein JavaScript-Bundle oberhalb von 500 kB hin. Das ist kein Sicherheitsfehler und blockiert die Staging-Abnahme nicht, sollte aber vor einer späteren breit angelegten Produktionseinführung durch routenbasiertes Code-Splitting optimiert werden.

Die vorhandene, leere Tabelle `xp_events` wurde vor dem aktuellen Checkout angelegt und nutzt den Journalvertrag `daily_login`, `photo_upload`, `ai_use`, `points`, Quellenreferenzen, UTC-Tag und Policy-Version. Der Quellcode ist auf diesen vorhandenen Vertrag abgeglichen. Die neue Migration legt bewusst nur `assistant_usage` an und darf nicht über einen unkontrollierten globalen Drizzle-Lauf ausgeführt werden, weil das DB-Migrationsjournal nicht die gesamte lokale Migrationshistorie widerspiegelt. Vor einer Schemaausführung ist eine gezielte, additive SQL-Anwendung mit anschließendem Schemaabgleich erforderlich.
