## Vollständige Produktions-Overlay-Umsetzung

Diese Änderung überträgt die verbindlichen Vorgaben aus `BlackwaterLeaf-Design-Handoff.zip` auf die echten PWA-Routen, ohne Datenzugriffe, Authentifizierung, Formulare oder Uploadabläufe durch Beispieldaten zu ersetzen.

### Enthalten

- **Grafische Zielseiten:** Die vier Auswahlkarten im Community-Feed führen zu `/flow/botanik`, `/flow/aquaristik`, `/flow/terraristik` und `/flow/ki-assistent`.
- **Sieben Schnellwege:** Das Blatt-Rad führt weiterhin zu Live, Foto, Beitrag sowie Botanik, Aquaristik, Terraristik und KI.
- **Produktive Seiten:** Botanik, Aquaristik und Community besitzen jetzt eigene Bild-Heroes, Glasflächen, Bereichsfarben und ehrliche Zustände.
- **Verbindliche Farben:** Botanik `#C7F35B`, Aquaristik/Live `#28D8FF`, Terraristik `#E1D661`, KI `#C36BFF`.
- **Navigation:** Vier schwebende Tabs wie im Screenshot: Home, Entdecken, Community und Profil.
- **Stabile Bildbereitstellung:** Fünf Bereichsmotive werden aus `client/public/design/` versioniert ausgeliefert; neue Seiten sind nicht auf temporäre `/manus-storage/`-Pfade angewiesen.
- **Ehrliche Leerzustände:** Der Community-Feed zeigt ohne echte Beiträge keine erfundenen Profile, Likes oder Kennzahlen. Der Live-Bereich meldet ohne Anbindung weiterhin „Noch nicht verbunden“.

### Prüfung

- `pnpm exec vite build` erfolgreich.
- `git diff --check` fehlerfrei.
- HTTP-Tests erfolgreich für `/feed`, `/plants`, `/aquariums`, `/flow/botanik`, `/flow/aquaristik`, `/flow/terraristik`, `/flow/ki-assistent`, `/flow/live`, `/flow/foto` und `/flow/beitrag`.
- Alle fünf versionierten Hero-Bilder unter `/design/` antworten mit HTTP `200`.
- Browserprüfung erfolgreich für Botanik, Aquaristik, KI, Live und den Community-Leerzustand.

### Dokumentation

Die vollständige Übergabe steht in [`docs/design/PRODUCTION_OVERLAY_IMPLEMENTATION.md`](docs/design/PRODUCTION_OVERLAY_IMPLEMENTATION.md). Die bisherigen Bildschirmverträge und Validierungsnotizen bleiben unter `docs/design/` erhalten.

> Hinweis: Die öffentlich ausgelieferte Domain `blackwaterleaf.com` wurde aus einer anderen Codebasis gebaut als dieser GitHub-Branch. Die Änderungen sind vollständig im Branch enthalten; der Hosting-Workflow muss diesen Branch als Buildquelle übernehmen, um sie auf der Domain sichtbar zu machen.
