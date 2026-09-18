## Vollständige Produktions-Overlay-Umsetzung

Diese Änderung überträgt die verbindlichen Vorgaben aus `BlackwaterLeaf-Design-Handoff.zip` auf die echten PWA-Routen, ohne Datenzugriffe, Authentifizierung, Formulare oder Uploadabläufe durch Beispieldaten zu ersetzen.

### Enthalten

- **Grafische Zielseiten:** Die vier Auswahlkarten im Community-Feed führen zu `/flow/botanik`, `/flow/aquaristik`, `/flow/terraristik` und `/flow/ki-assistent`.
- **Sieben Schnellwege:** Das Blatt-Rad führt weiterhin zu Live, Foto, Beitrag sowie Botanik, Aquaristik, Terraristik und KI.
- **Produktive Seiten:** Botanik, Aquaristik und Community besitzen jetzt eigene Bild-Heroes, Glasflächen, Bereichsfarben und ehrliche Zustände.
- **Verbindliche Farben:** Botanik `#C7F35B`, Aquaristik/Live `#28D8FF`, Terraristik `#E1D661`, KI `#C36BFF`.
- **Navigation:** Vier schwebende Tabs wie im Screenshot: Home, Entdecken, Community und Profil.
- **Stabile Bildbereitstellung:** Die Bereichsmotive liegen auf CDN-URLs; neue Seiten enthalten keine großen lokalen Medien, die den Web- oder Expo-Build bremsen könnten.
- **Native Expo-App:** Der neue Consumer-Client liegt direkt im selben Repository unter `mobile/`. Er setzt denselben Screenshot-Vertrag mit vier Welten, sieben Schnellaktionen und transparenten Leerzuständen um; die Studio-App wurde nicht verändert.
- **Ehrliche Leerzustände:** Der Community-Feed zeigt ohne echte Beiträge keine erfundenen Profile, Likes oder Kennzahlen. Der Live-Bereich meldet ohne Anbindung weiterhin „Noch nicht verbunden“.

### Prüfung

- `pnpm exec vite build` erfolgreich.
- `git diff --check` fehlerfrei.
- HTTP-Tests erfolgreich für `/feed`, `/plants`, `/aquariums`, `/flow/botanik`, `/flow/aquaristik`, `/flow/terraristik`, `/flow/ki-assistent`, `/flow/live`, `/flow/foto` und `/flow/beitrag`.
- Browserprüfung erfolgreich für Botanik, Aquaristik, KI, Live, Community, Profil und Wissen.
- Expo-Prüfung erfolgreich: `pnpm typecheck`, `expo config --type public` und Metro-Webbundle.

### Dokumentation

Die vollständige Übergabe steht in [`docs/design/PRODUCTION_OVERLAY_IMPLEMENTATION.md`](docs/design/PRODUCTION_OVERLAY_IMPLEMENTATION.md). Die Expo-Pushvorbereitung liegt in [`mobile/EXPO_PUSH_PREPARATION.md`](mobile/EXPO_PUSH_PREPARATION.md). Die bisherigen Bildschirmverträge und Validierungsnotizen bleiben unter `docs/design/` erhalten.

> Hinweis: Die öffentlich ausgelieferte Domain `blackwaterleaf.com` wurde aus einer anderen Codebasis gebaut als dieser GitHub-Branch. Die Änderungen sind vollständig im Branch enthalten; der Hosting-Workflow muss diesen Branch als Buildquelle übernehmen, um sie auf der Domain sichtbar zu machen. Der Expo-Client ist vorbereitet, aber `eas init`, ein Preview-Build oder ein Expo-Update wurden nicht ausgeführt.
