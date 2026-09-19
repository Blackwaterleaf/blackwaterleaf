# BlackWaterLeaf Enterprise-Risikoregister und Freigabestopp

**Stand:** 19. September 2026  
**Geltung:** Web, Native, API, Datenbank, Objekt-Speicher und Releaseprozess  
**Status:** AP-01 initial umgesetzt; formale Security-/Datenschutzabnahme folgt.

## Verbindliche Freigaberegel

Die folgenden Pfade sind serverseitig **fail-closed gesperrt**. Eine Entsperrung erfordert das genannte Arbeitspaket, negative Tests, Review durch die zuständigen Rollen und einen versionierten Release-Nachweis. Bestehende Daten werden nicht gelöscht oder überschrieben.

| Risiko | Gesperrter Pfad | Gate | Abhängigkeit | Nachweis vor Entsperrung |
|---|---|---|---|---|
| R-01 | Neue Bild-/Medienuploads | `mediaUpload` | AP-03/AP-04 | Objekt-Autorisierung, Metadaten- und Altlinktests |
| R-02 | Öffentliche Community-/Beobachtungsveröffentlichung | `publicPublication` | AP-07/AP-08 | Melden, Quarantäne, Einspruch und Sperrtests |
| R-03 | Neue öffentliche Produktaktivierung/Platzierung | `marketplaceActivation` | AP-09 | Pflichtfelder, Händlertransparenz, Rückruf-Gate |
| R-04 | Kontofunktion mit Löschversprechen | `accountErasure` | AP-05 | DB-, Session- und Storage-Löschlauf |
| R-05 | Globaler produktiver Drizzle-Lauf | `databaseMigration` | AP-06 | Backup-ID, TiDB-Restore, Baseline und Vorwärtsplan |
| R-06 | Community-Live | dauerhaft deaktiviert | AP-07/AP-08/AP-17 | vollständiger Live-Safety-Nachweis |

## Bestandsschutz

Die Sperren betreffen neue oder geänderte Risikoaktionen. Vorhandene Konten, Pflanzen- und Fischdaten, Kataloge, echte Händlerprodukte, private Entwürfe und bereits gespeicherte Medien bleiben erhalten. Es findet keine destruktive Migration und keine automatische Datenbereinigung statt.

## Zuständigkeiten

| Rolle | Verantwortung |
|---|---|
| Projektverantwortung | Risiko-Owner, Ausnahmeentscheidung und Release-Nachweis |
| Security | Zugriff, negative Tests, Signaturen und Widerruf |
| Datenschutz | Zwecke, Schutzklassen, Standort, Retention und Löschweg |
| Trust & Safety | Meldungen, Quarantäne, Sperren und Einsprüche |
| Marketplace Compliance/Legal | Produkt- und Händlerpflichten |
| Datenbetrieb | Backup, Restore, Baseline und Migration |

## Change-Log

| Datum | Änderung |
|---|---|
| 2026-09-19 | AP-01 gestartet; fünf fail-closed Gates und ein geschützter Migrationsbefehl eingeführt. |
