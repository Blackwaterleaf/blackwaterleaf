

## 10.2 P1-Reviewblock · umgesetzt am 27.09.2026
Der prüfbare Review-Weg ist jetzt serverseitig und im Staff-UI vorhanden. Beobachtungen mit `queued_for_review` erscheinen in einer geschützten Warteschlange; die Entscheidung speichert `evidenceState`, Begründung, prüfende Person und Zeitpunkt. Die betroffene Person erhält eine Moderationsbenachrichtigung und der Audit-Ledger protokolliert die Entscheidung. KI-Korrekturen speichern zusätzlich die Moderationsbegründung; eine Ablehnung ohne Begründung wird im UI verhindert. `evidenceState` bleibt ein evidenzbezogener Status und wird nicht als allgemeiner Expertenkonsens bezeichnet.

## 10.3 Datenkontrolle · Export-Historie
Jeder Kontoexport wird als `account_export_created` im unveränderlichen Audit-Ledger protokolliert. Web zeigt die letzten zehn Exportzeitpunkte im Datenschutzbereich; Native bestätigt die Anzahl der protokollierten Exporte nach dem Teilen. Exportdateien enthalten niemals Storage-Schlüssel oder geheime Zugangsdaten.


## 10.4 P0-Engagement · umgesetzt am 27.09.2026
- Öffentliche Beobachtungen können nur durch angemeldete Konten beantwortet werden.
- Antworttypen: Bestätigung, Taxon-Vorschlag, Frage und Antwort; Antworten dürfen die Katalogtaxonomie oder den Staff-Evidenzstatus nicht direkt verändern.
- Beobachtungsantworten werden mit Autor, optionalem Elternbeitrag, Status und Zeit gespeichert. Der Eigentümer erhält bei fremden Reaktionen eine Benachrichtigung.
- Web und Native zeigen kompakte Antwortaktionen innerhalb der Beobachtungsliste; der Composer kennzeichnet KI-Kandidaten ausdrücklich als vorläufig und verlangt transparente Einwilligung für Standort-, Medien- und KI-Verarbeitung.
- Migration `drizzle/0046_bent_hedge_knight.sql` wurde additiv angewendet. Web-TypeScript, Native-TypeScript, Produktionsbuild, Android-Export und 8 P0-Vertragstests sind erfolgreich.

### Verbleibende priorisierte Punkte
1. **P1 Natur-/Anlagenjournal:** append-only Ereignis-Timeline, Messwertverlauf mit Ereignismarkern, private Organismenhistorie.
2. **P1 sichere Snapshot-Freigabe:** Feldweise Vorschau vor Community-Post, keine exakten Anlagenorte oder ungeprüften privaten Medien.
3. **P2 Rückkehr ohne Druck:** steuerbare Ereignispräferenzen, Ruhezeiten, optionale Expeditionen und Fortschrittsansicht ohne Pflichtserie.
