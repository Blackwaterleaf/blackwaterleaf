# Sichtprüfung: Referenzroute

**Datum:** 16. September 2026

Die Route `/design-reference` wurde unter einer lokalen Vite-Vorschau auf Desktopgröße geprüft. Sie rendert die linke Smartphone-Komposition und die rechte Dokumentationsspalte ohne sichtbare Laufzeitfehler. Nach dem Austausch nicht verfügbarer relativer Bestands-Assets gegen hochgeladene Bildquellen sind Hero-Post, Themenkarten und die Bereichs-Stimmungsbilder sichtbar. Die responsive Umsetzung zeigt die vier Themenwelten, Sensorleiste, Aktionsmenü und die spezifizierten Mikroanimationen.

Die bestehende Gesamtprüfung ist außerhalb des Scope der neuen Designseite derzeit nicht grün: `pnpm check` und der Serverteil von `pnpm build` scheitern an bereits im Ausgangsbranch vorhandenen Backup-Routen (`server/_core/adminBackupRoutes.ts`, `server/_core/backupRoutes.ts`, `server/routers/export.ts`, `server/routers/import.ts`, `server/routers/index.ts`), die auf nicht vorhandene interne Module verweisen. Der Vite-Frontend-Schritt selbst wurde erfolgreich erzeugt.

Zusätzliche DOM-Prüfung in der Browservorschau: Die Renderfläche enthielt exakt **1** Smartphone-Container, **6** Overlay-Spezifikationen, **4** Themenkarten und **7** Schnellaktionen. Alle neun gerenderten Bildreferenzen meldeten erfolgreich geladene Bilddaten (`naturalWidth > 0`).

## Interaktive Bereichsauswahl

Die produktive Feed-Route rendert die vier Bereichs-Wahltasten (`.bwl-world-choice`) und das zentrale Schnellaktionsrad (`.bwl-quick-wheel`). Eine DOM-Prüfung bestätigte vier Karten und einen Aktionskreis; der Seitenhintergrund bleibt das definierte dunkle Tannengrün `rgb(7, 10, 8)`. Die Karte verlinken auf `/plants`, `/aquariums`, `/discover` und `/ai`; die sieben Schnellaktionen sind bis zum Öffnen des Aktionsrads aus der Tab-Reihenfolge ausgeblendet.

Beim ersten automatisierten Klicktest wurde der React-Zustand synchron abgefragt; der nachfolgende Testlauf muss die Zustandsaktualisierung asynchron abwarten. Der Button bleibt semantisch mit `aria-expanded` ausgestattet, und die Schnellaktionslinks sind im geschlossenen Zustand nicht fokussierbar.

Die Button-Struktur selbst ist vorhanden und funktionsbereit (`type="button"`, nicht deaktiviert, React-Handler gebunden). Die Browser-Konsole kann den React-State in dieser isolierten Vorschau jedoch nicht zuverlässig durch ein synthetisches DOM-`click()` aktualisieren; die Interaktion wird zusätzlich über eine echte Browser-Klickprüfung vor Übergabe validiert.

Eine echte Browser-Klickprüfung bestätigte anschließend das Aktionsrad: Der Schalter änderte seine Beschriftung von „Schnellaktionen öffnen“ auf „Schnellaktionen schließen“. Nach dem Öffnen waren alle sieben Aktionen als sichtbare, per Tastatur erreichbare Links verfügbar. Der Screenshot zeigte die Farblogik eindeutig: Pflanzen in Neongrün, Aquaristik in intensivem Neonblau, Terraristik in gelbgrün und KI-Assistent in Neonlila.

Nach der finalen Anpassung zeigt der Feed im Ausgangszustand ausschließlich den zentralen, leuchtenden Blattbutton. Die sieben Wahl-Icons sind nicht sichtbar und erscheinen erst über die Klickinteraktion. Die Browseransicht weist den Button korrekt als „Schnellaktionen öffnen“ aus.

Die finale echte Browser-Klickprüfung ist erfolgreich: Ein Klick auf das zentrale Blatt blendet **alle sieben** Auswahl-Icons (Video, Foto, Beitrag, Pflanze hinzufügen, Fisch hinzufügen, Terrarium hinzufügen und KI fragen) rund um den Mittelpunkt ein. Der Zustand wechselt zuverlässig zu „Schnellaktionen schließen“; die Icon-Buttons sind sichtbare, routbare Links.

## Produktions-Overlay: Bildquellenprüfung (16. September 2026)

Die lokale Vite-Vorschau löst die historischen Pfade unter `/manus-storage/` nicht auf; die Browserprüfung lieferte für das bisherige Aquarium-Hero-Bild eine natürliche Breite von `0`. Damit die neue produktive Gestaltung im Repository selbst vollständig übertragbar bleibt, werden die geprüften Bereichsmotive aus `docs/design/assets/` nach `client/public/design/` kopiert und die neuen Heroes ausschließlich über diese versionierten Pfade geladen. Die vorhandenen Altseiten werden dadurch nicht inhaltlich verändert.

## Produktions-Overlay: Sichtprüfung (16. September 2026)

Die lokale Vorschau bestätigt die neuen, versionierten Hero-Motive: `/aquariums` rendert die Aquaristikseite mit dem Neonblau `#28D8FF`, einem echten Unterwasserbild und einer klaren Offline-Sensorleiste. Der Pfad `/flow/ki-assistent` zeigt den bestehenden lila KI-Hero, vier Auswahlkarten und die viergliedrige schwebende Bottom-Navigation. Der Pfad `/flow/live` zeigt das blaue Live-Layout mit dem klaren, nicht vortäuschenden Status „Noch nicht verbunden“. Die Community-Seite nutzt eine eigene heroische Bildfläche, den Bereichs-Selektor und das geschlossene Aktionsrad. Sämtliche sieben Schnellaktionen bleiben zunächst verborgen und sind erst über den Blatt-Schalter erreichbar.

## Produktions-Overlay: Zielseitenvertrag (16. September 2026)

Die vier Wahlkarten im Community-Feed führen jetzt unmittelbar zu den grafisch vollständigen Zielseiten `/flow/botanik`, `/flow/aquaristik`, `/flow/terraristik` und `/flow/ki-assistent` statt zu generischen Übersichten. Dort führen die vorhandenen Funktionskarten wiederum zu den echten Sammlungen, Formularen, Uploads, KI- und Wissensfunktionen. Alle Abschnittsmotive werden unter `/design/` aus versionierten Dateien im Repository ausgeliefert, sodass ihre Verfügbarkeit weder an eine temporäre Sitzung noch an einen externen Bildpfad gebunden ist.

## Produktions-Overlay: Community-Leerzustand (16. September 2026)

Eine echte Browserprüfung bestätigte den Fallback: Ohne geladene Beiträge erscheint im Feed der gestaltete, ehrliche Zustand „NOCH KEINE FREIGEGEBENEN NATURMOMENTE.“ mit dem Login-Button. Der DOM-Test lieferte `true` für die erwartete Überschrift. Die neue Ansicht zeigt keine fiktiven Konten, Kennzahlen oder Interaktionen und bleibt trotz fehlender Daten grafisch vollständig.

## Produktions-Overlay: Botanik und Aquaristik (16. September 2026)

Die Browserprüfung bestätigt die abgeschlossenen Bereichseinstiege: `/plants` hat nun ein botanisches Hero mit Neongrün, echte Anmeldeaufforderung und die neue schwebende Vier-Tab-Navigation. `/flow/aquaristik` liefert die gewünschte blaue, vollständig gestaltete Auswahlseite mit den vier weiterführenden Funktionen „Meine Aquarien“, „Aquarium hinzufügen“, „Wasserwerte“ und „KI zur Aquaristik“. Beide Seiten verwenden die neuen lokalen Bildpfade unter `/design/`.
