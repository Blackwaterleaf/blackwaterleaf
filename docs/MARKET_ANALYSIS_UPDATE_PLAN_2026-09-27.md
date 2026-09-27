

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


## 10.5 Direktes Nutzerfeedback und steuerbare Rückkehr · umgesetzt am 27.09.2026
- Web und Native besitzen einen leuchtenden Header-Einstieg zu einem geschützten Feedback-Formular mit den Kategorien Feedback, Problem und Wunsch/Verbesserung.
- Feedback wird serverseitig dem angemeldeten Konto, der Kategorie, der Nachricht, der Ursprungsseite und einem triagierbaren Status zugeordnet; es gibt keine anonyme Ablage im öffentlichen Feed.
- Das Profil bietet vier getrennte Benachrichtigungsschalter für Community, Nachrichten, Moderation/Review und System/Sicherheit. Der Server filtert Feed und ungelesene Anzahl entsprechend; die Defaultwerte bleiben aktiv, bis der Nutzer sie ändert.
- Native und Web-Typecheck, Produktionsbuild sowie 19 gezielte Vertrags-/Sicherheitsprüfungen sind erfolgreich.

### Noch offen aus der Marktanalyse
1. **P1 Natur-/Anlagenjournal:** append-only Ereignis-Timeline und Messwertverlauf mit Ereignismarkern.
2. **P1 sichere Snapshot-Freigabe:** feldweise Vorschau vor Community-Post; keine exakten Anlagenorte oder ungeprüften privaten Medien.
3. **P2 Rückkehr ohne Druck:** Ruhezeiten, optionale Expeditionen und Fortschrittsansicht ohne Pflichtserie.


## 10.6 Internationale Nutzung · umgesetzt am 27.09.2026
- Web und Native unterstützen jetzt fünf abgestimmte Locales: Deutsch, Englisch, vereinfachtes Chinesisch, Spanisch und Französisch.
- Der Web-Erstbesuch erkennt die Browser-Sprache; die manuelle Auswahl wird lokal und bei angemeldeten Konten serverseitig gespeichert und gilt geräteübergreifend.
- Der Sprachwähler befindet sich sichtbar im Web-Header und bleibt durch native Select-Technik Samsung-Browser-kompatibel; Native bietet dieselben Optionen im Profil.
- Die Locale-Enums in Shared Contract, Datenbank (`users`, `knowledge_articles`) und API sind synchronisiert. Migration `drizzle/0049_lazy_mach_iv.sql` wurde additiv angewendet.
- Validierung: 20 gezielte Verträge, Web-TypeScript, Produktionsbuild, Native-TypeScript und `git diff --check` erfolgreich.
