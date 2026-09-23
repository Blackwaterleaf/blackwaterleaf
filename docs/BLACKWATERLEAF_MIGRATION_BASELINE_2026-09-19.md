# BlackWaterLeaf AP-06: Migrationsbaseline

**Stand:** 23. September 2026
**Projekt:** `blackwaterleaf-parity-staging`
**Sicherheitsstatus:** `db:push` und unkontrollierte globale Migrationen bleiben bis zu einem nachgewiesenen Backup-/Restore-Test gesperrt.

## Aktueller Repository-Stand

| Prüfpunkt | Wert |
|---|---|
| SQL-Migrationen im Repository | 37 |
| Letzte Repository-Migration | `0036_lumpy_omega_sentinel.sql` |
| Drizzle-Dialekt | MySQL |
| Journal-Einträge | 37, Index 0–36 |
| Schema-Hash | `552cac5123aa2f85bd00ee1146c7c9be1560fcd60f69233d1b12b81be00f122c` |
| Journal-Hash | `4f8828297d442c830c442e8bf48a3700f6b57ac5941ceb8727d27b704be46d46` |
| Head-Migrationshash | `c0718546f8f953e7a98f7eddd1b5fae44b6b97af2852818b92b12b0e4d575d64` |

Die Hashes bilden den **aktuellen Repository-Ausgangspunkt** ab. `node scripts/verify-migration-baseline.mjs` prüft diese interne Konsistenz deterministisch. Dieser Nachweis beweist nicht, dass eine externe oder produktive Datenbank bereits alle Migrationen bis 0036 angewendet hat.

## Zielumgebungsprüfung

Vor einer produktiven Freigabe muss die Zielumgebung ausschließlich lesend gegen diesen Stand geprüft werden. Dazu gehören `__drizzle_migrations`, Tabellen, Spalten, Indizes und die Voraussetzungen der Community-Video-Migration. Abweichungen werden dokumentiert und nicht durch ein blindes `db:push` oder eine globale Migration überschrieben.

## Restore-Freigabekriterien

Eine Datenbankänderung darf erst freigegeben werden, wenn ein unabhängiges Backup-Artefakt, dessen Prüfsumme, ein Restore in eine isolierte Zielinstanz und ein Schema-/Datensatzvergleich dokumentiert sind. Die Restoreprobe darf niemals auf der Produktionsdatenbank erfolgen. Bis dahin bleibt `pnpm db:push` durch den bestehenden Guard blockiert.

## Aktuelle Nichtbehauptung

Im Rahmen des Vollständigkeitsaudits wurde kein Backup erstellt, keine Datenbank wiederhergestellt und keine Migration auf einer Zielumgebung ausgeführt. Es wird deshalb nicht behauptet, dass Migration 0036 bereits produktiv angewendet wurde. Die Repository-Baseline ist ein Kontrollinstrument und kein Ersatz für einen Anbieter- oder Infrastruktur-Backupnachweis.

## Verbindlicher Ablauf

Nach Vorlage des Backup-/Restore-Nachweises wird zuerst die Zielumgebung adoptiert oder auf den Repository-Stand gebracht. Danach wird die additive Migration 0036 gezielt angewendet und mit einem Schemavergleich sowie realen Staging-Accounts für Community-Medien verifiziert. Livestream-Migrationen bleiben davon getrennt und werden später freigeschaltet.

## References

[1]: https://orm.drizzle.team/docs/kit-overview "Drizzle Kit documentation"
[2]: https://dev.mysql.com/doc/refman/8.0/en/backup-and-recovery.html "MySQL backup and recovery documentation"
