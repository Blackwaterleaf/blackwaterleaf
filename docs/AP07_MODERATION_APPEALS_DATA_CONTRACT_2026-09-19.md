# AP-07: Moderationsfälle, Meldungen und Einsprüche

## Nachgewiesener Ist-Stand

Die bestehende Anwendung kann öffentliche Community-Beiträge serverseitig ausblenden oder entfernen. Administratoren dürfen Beiträge löschen; Moderatoren dürfen öffentliche Beiträge ausblenden. KI-Pflanzenkorrekturen besitzen bereits einen geprüften Status (`pending`, `approved`, `rejected`) und werden im Audit-Ledger protokolliert. Automatisch erkannte sexuelle Inhalte werden blockiert und das Konto wird gesperrt.

## Noch fehlender Datenvertrag

Für eine echte Nutzer-Meldung und einen Einspruch braucht die Plattform separate, querybare Datensätze. Freie Audit-Logtexte reichen nicht aus, weil Reporter, Betroffene, Status, Begründung, Fristen und Einspruchsverlauf getrennt geschützt und gefiltert werden müssen.

Der additive Entwurf benötigt mindestens:

| Entität | Kernfelder | Zweck |
|---|---|---|
| `moderation_reports` | reporter, target type/id, reason, evidence, status, assigned reviewer, timestamps | Nutzer-Meldung und Fallstatus |
| `moderation_appeals` | appellant, report/action reference, statement, status, reviewer, timestamps | Einspruch mit eigener Entscheidung |

Vorgesehene Statuswerte sind `open`, `triaged`, `actioned`, `dismissed`, `appealed`, `closed` für Fälle sowie `submitted`, `under_review`, `accepted`, `rejected` für Einsprüche. Jeder Statuswechsel muss einen signierten Audit-Eintrag erzeugen. Reporter dürfen nicht automatisch die Identität anderer Nutzer oder private Medien sehen.

## Sicherheitsentscheidung

Die produktive Migration wird in AP-07 **noch nicht ausgeführt**, weil AP-06 keinen unabhängigen Backup-/Restore-Nachweis besitzt. Die bestehende Moderation bleibt unverändert aktiv; es werden keine bestehenden Beiträge, Nutzer oder Auditdaten gelöscht. Erst nach Restorefreigabe wird der Vertrag als additive Migration umgesetzt und gegen Web/Native getestet.
