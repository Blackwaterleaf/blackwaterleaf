# Übergabeprompt für einen neuen Manus-Chat

Kopiere den folgenden Text zusammen mit dem ZIP-Paket in einen neuen Manus-Chat.

```text
Arbeite im GitHub-Repository Blackwaterleaf/blackwaterleaf auf dem Branch design/reference-overlay-layout.

Ziel: Übertrage das BlackwaterLeaf-Design aus dem beigefügten Grafikpaket auf die echten Seiten der bestehenden Web-App bzw. PWA. Das Ergebnis muss auf Desktop, iOS und Android dieselbe visuelle Sprache verwenden: fast schwarzes Tannengrün, organische Regenwald-/Unterwasserfotografie, dunkle transparente Glasflächen, feine helle Konturen, weiche Lichtreflexe sowie bereichsspezifische Neonfarben.

Lies zuerst diese Dateien aus dem Paket:
1. PUBLISHED_SITE_SCREEN_AUDIT.md – tatsächliche öffentliche Seiten und ihr aktueller ehrlicher Funktionszustand.
2. INTERACTIVE_PAGE_SCREENS.md – grafischer Seitenvertrag und Einordnung jeder Zielgrafik.
3. LIVING_FLOW_HANDOFF.md und REFERENCE_OVERLAY_HANDOFF.md – Routen- und bestehende Umsetzungsregeln.
4. screens/ – die verbindlichen visuellen Zielbilder.

Verbindliche Farbwelt:
- Botanik: Neon-Grün #C7F35B
- Aquaristik und Live: starkes Neon-Blau #28D8FF
- Terraristik: Gelbgrün #E1D661
- KI-Assistent: Neon-Lila #C36BFF

Wichtige Grundregel: Die Grafiken zeigen die Unterseiten NACH einem Tipp auf eine Auswahl. Sie dürfen nicht nochmals als Home-Seite umgesetzt werden. Jede Seite benötigt ihren eigenen Hero, die zugehörigen Funktionskarten und ihren eigenen Neon-Akzent.

Seiten, die vollständig gestaltet werden sollen:
- Botanik / Pflanzen
- Aquaristik / Aquarien
- Terraristik
- KI-Assistent
- Entdecken / World Index
- Community / Feed
- Profil
- Wissen
- Live-Bereich
- Foto-Aufnahme
- Beitrag-Erstellung

Nutze die Grafiken als visuelle Blaupause, aber erhalte sämtliche bestehenden tRPC-Datenzugriffe, Authentifizierung, Routen, Uploads, Kameraabläufe, Formulare und Speicherfunktionen. Ersetze echte Daten niemals durch Beispieldaten.

Ehrliche Zustände sind verbindlich:
- Community darf ohne reale Daten keine erfundenen Personen, Likes, Kommentare oder Beiträge darstellen.
- Wissen darf ohne veröffentlichte Quellen keine Artikel erfinden.
- Live darf ohne echte Sensor-/Kameraanbindung keine Messwerte vortäuschen; verwende klar „Noch nicht verbunden“.
- Profil darf ohne Login kein erfundenes Benutzerprofil darstellen.
- Terraristik darf keine Datenbank-Speicherung vortäuschen, bis ein echtes Terrarium-Datenmodell mit Migration existiert.
- Die KI-Seite trägt sichtbar den Grundsatz: „ECHTE KI-HILFE. KEINE SCHEINANTWORT.“

Gestaltungsreihenfolge:
1. Baue zentrale Design-Tokens und wiederverwendbare Komponenten für Header, Sensorleiste, Bereichs-Hero, Glaskarten und Bottom Navigation.
2. Übertrage zuerst Botanik, Aquaristik, Terraristik und KI anhand von 01–04.
3. Übertrage anschließend Entdecken, Community, Profil und Wissen anhand von 08–11.
4. Vervollständige Live, Foto und Beitrag anhand von 05–07.
5. Halte die bestehenden Schnellaktionswege aus QuickActionWheel.tsx mit den Zielseiten verbunden.
6. Prüfe jede Seite mobil und auf Desktop. Baue abschließend mit `pnpm exec vite build` und führe `git diff --check` aus.

Es sollen keine hundert neuen Icons, keine flachen Standard-Dashboards und keine hellen Vollflächen entstehen. Verwende wenige, präzise Vector-Icons, klare Touch-Ziele, echte Bildflächen, Glassmorphism und zurückhaltende Animationen mit `prefers-reduced-motion`-Fallback.

Arbeite autonom weiter, dokumentiere neue Entscheidungen in docs/design/ und committe nur kohärente, getestete Änderungen auf den bestehenden Branch.
```

## Enthaltene Grafikreihe

| Datei | Verbindlicher Screen |
| --- | --- |
| `screens/01-botanik.jpg` | Botanik nach dem Tippen |
| `screens/02-aquaristik.jpg` | Aquaristik nach dem Tippen |
| `screens/03-terraristik.jpg` | Terraristik nach dem Tippen |
| `screens/04-ki-assistent.jpg` | KI-Assistent nach dem Tippen |
| `screens/05-live-bereich.jpg` | Live-Bereich nach dem Tippen |
| `screens/06-foto.jpg` | Fotoaufnahme nach dem Tippen |
| `screens/07-beitrag.jpg` | Beitrag-Erstellung nach dem Tippen |
| `screens/08-entdecken.jpg` | Entdecken / World Index |
| `screens/09-community.jpg` | Community-Leerzustand |
| `screens/10-profil.jpg` | Profil / Zugang und Präferenzen |
| `screens/11-wissen.jpg` | Wissen-Leerzustand |

Die vom Auftraggeber gelieferte Ausgangsreferenz liegt zusätzlich als `reference-screenshot.jpg` bei.
