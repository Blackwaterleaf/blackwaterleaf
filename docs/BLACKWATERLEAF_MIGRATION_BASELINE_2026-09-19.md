# BlackWaterLeaf AP-06: Migrationsbaseline

**Stand:** 19. September 2026  
**Projekt:** `blackwaterleaf-parity-staging`  
**Sicherheitsstatus:** `db:push` bleibt bis zu einem nachgewiesenen Backup-/Restore-Test gesperrt.

## Aktueller nachweisbarer Stand

| Prüfpunkt | Wert |
|---|---|
| SQL-Migrationen | 27 |
| Letzte Migration | `0026_sticky_dazzler.sql` |
| Drizzle-Dialekt | MySQL |
| Journal-Einträge | 27, Index 0–26 |
| Schema-Hash | `a041ffa9cf7c9fa1108d6c93ede6957fa2ee6b788fc3313a23506cd04ab310c6` |
| Journal-Hash | `2b0856a23a0141bac3212dc24ab9356a9dba171ecf3cde28a9a425ff59fe606d` |
| Head-Migrationshash | `13e5f8182e9d45fe0ff6a8142d15d436b95a5983cf8634ee851d4446a1ac2ba6` |

Die Hashes bilden den geprüften Ausgangspunkt ab. Bei jeder Änderung an `drizzle/schema.ts`, `drizzle/meta/_journal.json` oder der letzten Migration muss die Baseline bewusst neu erstellt und erneut geprüft werden.

## Restore-Freigabekriterien

Eine Datenbankänderung darf erst freigegeben werden, wenn ein unabhängiges Backup-Artefakt, dessen Prüfsumme, ein Restore in eine isolierte Zielinstanz und ein Schema-/Datensatzvergleich dokumentiert sind. Die Restoreprobe darf niemals auf der Produktionsdatenbank erfolgen. Bis dahin bleibt `pnpm db:push` durch den bestehenden Guard blockiert.

## Bewusste Nichtbehauptungen

In diesem Arbeitsschritt wurde **kein Backup erstellt, keine Datenbank wiederhergestellt und keine Migration ausgeführt**. Es wird daher kein erfolgreicher Restore behauptet. Die Baseline ist ein Kontrollinstrument, kein Ersatz für einen Anbieter- oder Infrastruktur-Backupnachweis.
