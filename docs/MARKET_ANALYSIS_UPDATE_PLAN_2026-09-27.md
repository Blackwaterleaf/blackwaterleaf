

## 10.2 P1-Reviewblock · umgesetzt am 27.09.2026
Der prüfbare Review-Weg ist jetzt serverseitig und im Staff-UI vorhanden. Beobachtungen mit `queued_for_review` erscheinen in einer geschützten Warteschlange; die Entscheidung speichert `evidenceState`, Begründung, prüfende Person und Zeitpunkt. Die betroffene Person erhält eine Moderationsbenachrichtigung und der Audit-Ledger protokolliert die Entscheidung. KI-Korrekturen speichern zusätzlich die Moderationsbegründung; eine Ablehnung ohne Begründung wird im UI verhindert. `evidenceState` bleibt ein evidenzbezogener Status und wird nicht als allgemeiner Expertenkonsens bezeichnet.

## 10.3 Datenkontrolle · Export-Historie
Jeder Kontoexport wird als `account_export_created` im unveränderlichen Audit-Ledger protokolliert. Web zeigt die letzten zehn Exportzeitpunkte im Datenschutzbereich; Native bestätigt die Anzahl der protokollierten Exporte nach dem Teilen. Exportdateien enthalten niemals Storage-Schlüssel oder geheime Zugangsdaten.
