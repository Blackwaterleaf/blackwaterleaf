# BlackWaterLeaf – Revisionssicheres Moderationsaudit

Die eingesetzte Datenbank ist **TiDB Serverless 8.5**. Sie unterstützt keine MySQL-Trigger. Deshalb wird kein nicht funktionierender Trigger-Schutz behauptet oder eingesetzt. Stattdessen nutzt die Anwendung einen serverseitig signierten, hashverketteten Append-only-Ledger.

| Schutzschicht | Umsetzung |
|---|---|
| Anwendungszugriff | Keine Web- oder API-Route bietet Update oder Delete für Ledger-Einträge. |
| Konsistenz | Ein einziger Kopfdatensatz wird innerhalb einer Transaktion gesperrt und danach auf den neuesten Eintrag gesetzt. |
| Erkennbarkeit von Manipulation | Jeder Eintrag enthält den Hash des Vorgängers und eine HMAC-Signatur mit dem ausschließlich serverseitig verfügbaren Sitzungsschlüssel. |
| Nachweis | Änderung eines Eintrags, falsche Reihenfolge oder nachträgliches Einfügen erzeugt eine nicht passende Hashkette oder Signatur. |
| Bestehender Rollenwechsel | Die Rollenänderung bleibt im Legacy-Audit erhalten und wird zusätzlich als signierte Einmalreferenz im Ledger dokumentiert. |

Eine Person mit direktem, privilegiertem Datenbankzugriff kann Daten grundsätzlich verändern. Ohne Datenbanktrigger oder eine externe WORM-Ablage kann die Datenbankebene dies nicht physisch verhindern. Dieser Stand ist deshalb **manipulationsnachweisbar und innerhalb der Anwendung append-only**, aber keine rechtliche Unveränderbarkeitsgarantie. Eine spätere verbindliche WORM-Archivierung erfordert einen separaten freigegebenen Speicheranbieter und Schlüssel-/Aufbewahrungskonzept.

## Ende-zu-Ende-Validierung

Am 16. September 2026 wurde die tatsächlich gespeicherte Admin-Hochstufung von `blackwaterleaf@gmail.com` mit der serverseitigen Prüffunktion validiert. Der Nachweis prüfte den einzigen gegenwärtigen Eintrag, seine HMAC-Signatur, den Genesis-Vorgängerwert und die Übereinstimmung mit dem gespeicherten Ledger-Kopf. Ergebnis: `valid=true`, `checkedEntries=1`, `reason=null`.

[1]: https://docs.pingcap.com/tidb/stable/mysql-compatibility/ "TiDB – MySQL-Kompatibilität und nicht unterstützte Trigger"
