# Umsetzungsplan – BlackWaterLeaf Vorstellungsvideos

## Ziel

Die bisherige stumme 8-Sekunden-Natursequenz wird durch zwei deutschsprachige, markenkonforme MP4-Videos ersetzt: eine **75-Sekunden-Langfassung** für die vollständige Produktgeschichte und eine **30–35-Sekunden-Fassung** für die Startseite. Beide erklären BlackWaterLeaf als digitales Observatorium für Botanik, Aquaristik und Terraristik mit realen App-Bildschirmen, Sprechertext, Untertiteln und zurückhaltenden Motion Graphics.

## Bestätigte Produktbotschaften

1. Eigene Naturmomente werden erfasst und einer persönlichen Welt zugeordnet.
2. Wissen und Quellen helfen beim Einordnen.
3. Neue Beobachtungen sind privat; die Sichtbarkeit wird bewusst gesteuert.
4. Die Community zeigt echte Naturmomente echter Konten.
5. Smart-Werte und Kamera sind optional und erst nach ausdrücklicher, widerrufbarer Freigabe aktiv.
6. Partnerangebote sind transparent gekennzeichnet; Kauf, Zahlung, Versand, Rückgabe und Support liegen beim Partner.
7. Organisationen (Vereine, Schulen, Naturschutz, Forschung) sind eine **geplante** künftige Zielgruppe. Der Film behauptet weder bestehende Organisationsrollen noch Rechte oder Workflows.

## Nichtziele

- Keine erfundene KI-Bestimmung, keine vorgetäuschten Sensorwerte und keine nicht vorhandenen Organisationsfunktionen.
- Keine In-App-Zahlung oder Kaufabwicklung darstellen.
- Keine öffentliche Veröffentlichung im Rahmen dieser Umsetzung.

## Architektur und Dateien

| Bereich            | Umsetzung                                                                                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Produktionsquellen | Reproduzierbare Motion-Graphics-Quelle, Produktionsmanifest, Sprechertext und Untertitel unter `video/intro/`.                                                                       |
| App-Belege         | Bildschirmaufnahmen tatsächlicher BlackWaterLeaf-Ansichten, aufgenommen aus der laufenden App bzw. vorhandenen öffentlichen Ansichten und als lokale Produktionsassets dokumentiert. |
| Videoausgaben      | Zwei H.264/AAC-MP4-Dateien unter `client/src/assets/intro/`; Vite erzeugt beim Build versionsbasierte Same-Origin-Asset-URLs.                                                        |
| Startseite         | `Home.tsx` importiert die Kurzfassung direkt als Vite-Asset, ergänzt zugängliche Beschriftung, Poster, Texttrack und einen Link zur Langfassung.                                     |
| Langfassung        | Eine öffentliche, statische Langfassung wird über einen klar beschrifteten Link/Modal-Zugang auf der Startseite erreichbar; beide Dateien bleiben im selben Build-Assetpfad.         |
| Medienpolitik      | Kein externer CDN-Redirect für die eingebettete MP4. Die CSP erhält ein explizites `media-src 'self'`; die vorhandene restriktive Standardrichtlinie bleibt erhalten.                |
| Routen             | `client/public/manus-routes.json` deklariert die vollständige aktuelle SPA-Routenmenge; die Videointegration führt keine neue App-Route ein.                                         |
| Marke              | Die vorhandene BlackWaterLeaf-Blattmarke wird als unverändertes offizielles Asset wiederverwendet und als Projektlogo registriert.                                                   |

## Produktionsablauf

1. Vorhandene Produktoberflächen und Logo als belastbare Referenzen sichern.
2. Szenen nach dem bestätigten Konzept erstellen: Hook, drei Naturwelten, Erfassen, Wissen, Privatheit, Community, optionale Technik, transparente Partner, als geplant markierte Organisationen, Zweck und CTA.
3. Sprechertext, deutsche WebVTT-Untertitel, dezentes Musikbett und Motion Graphics in beiden Längen aus einem gemeinsamen inhaltlichen Master erzeugen.
4. Beide MP4-Dateien mit H.264-Video und AAC-Audio ausgeben; die Kurzfassung erhält die Startseitenintegration.
5. Die Medienintegration auf Same-Origin-Buildassets umstellen und die CSP ausdrücklich dafür schließen.

## Auslieferungs- und Cache-Entscheidung

Die bestehende Architektur bleibt bestehen: **React/Vite-SPA** als gebaute statische Oberfläche unter `dist/public`, bedient durch den vorhandenen **Express/tRPC-Server** für dynamische API-, Authentifizierungs- und Storage-Proxypfade. Der Build erzeugt die Videoausgaben als gehashte Dateien im Assetpfad. Diese dürfen langfristig unveränderbar gecacht werden; der stabile HTML-/SPA-Einstieg bleibt revalidierbar. Authentifizierte und personenbezogene API-Antworten behalten die bestehende private/sensible Cache-Politik. Es werden keine Routen oder Hostingressourcen veröffentlicht oder verändert.

## Qualitätssicherung

- Text- und Anspruchsprüfung gegen die bestätigten Produktbotschaften und Nichtziele.
- Prüfung von MP4-Codec, Auflösung, Dauer, Audio-Stream und Wiedergabefähigkeit mit `ffprobe`.
- Prüfung repräsentativer Frames der Einleitung, jeder Lesepause, wichtiger Übergänge und des Markenendes.
- TypeScript-Prüfung, relevante bestehende Tests und Produktionsbuild.
- Prüfung, dass die erzeugten Buildassets als MP4 vor dem SPA-Fallback auffindbar sind, sowie Prüfung der Startseitenquelle auf die neue Same-Origin-Videoeinbindung.
- Pull Request als Ergebnis; keine Veröffentlichung.

## Projektstruktur nach der Änderung

```text
client/
  public/
    manus-routes.json
  src/
    assets/intro/                 # gerenderte Kurz- und Langfassung, Poster, Untertitel
    pages/Home.tsx                # zugängliche Kurzvideo- und Langvideo-Einbindung
server/
  security.ts                     # explizite Same-Origin-Medien-CSP
video/intro/
  README.md                       # Produktionsmanifest und Reproduktionshinweise
  script.de.md                    # Sprechertext
  captions.de.vtt                 # Untertitelquelle
  render/                         # Motion-Graphics-Quelle
ideas.md                           # verbindliche Gestaltungsrichtung
```
