# Sichtprüfung: Referenzroute

**Datum:** 16. September 2026

Die Route `/design-reference` wurde unter einer lokalen Vite-Vorschau auf Desktopgröße geprüft. Sie rendert die linke Smartphone-Komposition und die rechte Dokumentationsspalte ohne sichtbare Laufzeitfehler. Nach dem Austausch nicht verfügbarer relativer Bestands-Assets gegen hochgeladene Bildquellen sind Hero-Post, Themenkarten und die Bereichs-Stimmungsbilder sichtbar. Die responsive Umsetzung zeigt die vier Themenwelten, Sensorleiste, Aktionsmenü und die spezifizierten Mikroanimationen.

Die bestehende Gesamtprüfung ist außerhalb des Scope der neuen Designseite derzeit nicht grün: `pnpm check` und der Serverteil von `pnpm build` scheitern an bereits im Ausgangsbranch vorhandenen Backup-Routen (`server/_core/adminBackupRoutes.ts`, `server/_core/backupRoutes.ts`, `server/routers/export.ts`, `server/routers/import.ts`, `server/routers/index.ts`), die auf nicht vorhandene interne Module verweisen. Der Vite-Frontend-Schritt selbst wurde erfolgreich erzeugt.

Zusätzliche DOM-Prüfung in der Browservorschau: Die Renderfläche enthielt exakt **1** Smartphone-Container, **6** Overlay-Spezifikationen, **4** Themenkarten und **7** Schnellaktionen. Alle neun gerenderten Bildreferenzen meldeten erfolgreich geladene Bilddaten (`naturalWidth > 0`).
