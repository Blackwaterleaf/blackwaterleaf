# BlackWaterLeaf – Vorstellungsvideos (Produktionsmanifest)

Stand: 30. September 2026

## 1. Übersicht der erzeugten Ausgaben

| Datei                                                     | Dauer   | Format / Auflösung         | Audio                | Rolle                                                       |
| --------------------------------------------------------- | ------- | -------------------------- | -------------------- | ----------------------------------------------------------- |
| `client/src/assets/intro/blackwaterleaf-intro-32s.mp4`    | 32,02 s | H.264 / 1920×1080 @ 30 fps | AAC Stereo, 192 kbps | Eingebettetes Video auf der Startseite                      |
| `client/src/assets/intro/blackwaterleaf-intro-75s.mp4`    | 75,02 s | H.264 / 1920×1080 @ 30 fps | AAC Stereo, 192 kbps | Vollständige Erklärung (Startseiten-Modal & autarker Abruf) |
| `client/src/assets/intro/blackwaterleaf-intro-poster.jpg` | –       | JPEG / 1920×1080           | –                    | Lade-Poster für Video-Player                                |
| `client/src/assets/intro/intro-short.de.vtt`              | 32 s    | WebVTT UTF-8               | –                    | Deutsche Untertitel für Kurzfassung                         |
| `client/src/assets/intro/intro-long.de.vtt`               | 75 s    | WebVTT UTF-8               | –                    | Deutsche Untertitel für Langfassung                         |

## 2. Abgedeckte Kerninhalte & Faktenprüfungen

1. **Drei Naturwelten:** Botanik, Aquaristik und Terraristik an einem gemeinsamen Ort.
2. **Erfassen & Zuordnen:** Echte Beobachtungen festhalten, Fotos hochladen, der eigenen Sammlung zuordnen.
3. **Wissen & Quellen:** Strukturierter Katalog, quellenbelegte Wissensartikel, keine Scheinfakten.
4. **Schutz & Sichtbarkeit:** Eigene Daten starten standardmäßig geschützt; Freigabe in die Community erfolgt bewusst.
5. **Echte Community:** Echte Naturmomente von echten Profilen, keine künstlichen Interaktionen.
6. **Optionale Technik:** Smart-Werte und Kameras bleiben rein optional und fließen erst nach expliziter Freigabe.
7. **Transparente Partner:** Marktplatzangebote sind als Partnerangebote/Werbung gekennzeichnet; Kauf, Zahlung, Versand und Support liegen ausschließlich beim jeweiligen Partner.
8. **Geplante Organisationen:** Organisationen (Vereine, Schulen, Naturschutz, Forschung) sind klar als **geplante künftige Zielgruppe** ausgewiesen; es werden keine bereits bestehenden Rollen oder Berechtigungen behauptet.
9. **Observatorium & CTA:** Finale Markenverankerung auf `blackwaterleaf.com`.

## 3. Technische Medienauslieferung

- **Same-Origin-Build-Asset:** Videos werden über Vites Asset-Pipeline als gehashte Dateien (`/assets/...`) ausgeliefert. Dadurch entfällt das bisherige Problem, dass `/blackwaterleaf-intro.mp4` vom Express-Server fälschlich als HTML-Fallback ausgeliefert wurde.
- **CSP-Konformität:** `server/security.ts` deklariert nun explizit `mediaSrc: ["'self'", "blob:"]`.
- **Wiederholbare Skripte:**
  - `scripts/capture_screens.py`: Erstellt reale Bildschirmaufnahmen aus den Produktionsseiten.
  - `scripts/build_long_video.py`: Baut die 75s-Langfassung mit Sprecher, Ambient und Segmenten.
  - `scripts/build_short_video.py`: Baut die 32s-Kurzfassung und das Posterbild.
