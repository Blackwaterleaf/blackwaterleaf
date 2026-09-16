# BlackWaterLeaf – Sicherheits- und Releaseprüfung

**Prüfstand:** 16. September 2026  
**Zielsystem:** getrennte Fullstack-Stagingumgebung

## Ergebnis

| Prüffeld | Ergebnis | Nachweis |
|---|---|---|
| Vitest | Bestanden | 8 Testdateien, 38 Tests, 0 Fehler |
| TypeScript | Bestanden | `tsc --noEmit`, 0 Fehler |
| Produktionsbuild | Bestanden | Vite-Client und gebündelter Express-Server erzeugt |
| Produktionsabhängigkeiten | Bestanden | `pnpm audit --prod --audit-level high`: keine bekannten Schwachstellen |
| MySQL-Migrationen | Bestanden | Zwei additive Migrationen geprüft, ausgeführt und im Journal registriert |
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
