# Selbst gehostetes BlackWaterLeaf-Streaming – Quellen- und Architekturgrundlage

## Verifizierte Infrastrukturgrundlage

IONOS beschreibt den Betrieb eines eigenen RTMP/HLS-Servers ausdrücklich als Möglichkeit, die vollständige Kontrolle über Inhalte ohne den Umweg über Plattformen wie Twitch oder YouTube zu behalten. RTMP dient als Einspielprotokoll, etwa aus OBS; HLS liefert die Segmente über HTTP an den Website-Player aus.[1][2]

Für kleine HLS-Projekte nennt IONOS zwei CPU-Kerne mit 2 GHz und 2 GB RAM als Ausgangspunkt; bei wachsenden Anforderungen werden vier CPU-Kerne und 4 GB RAM empfohlen. Entscheidend bleibt der ausgehende Datentransfer: Datenrate × Zuschauende × parallele Qualitätsstufen.[2] Diese Angaben sind ein Planungsstart, keine Kapazitätsgarantie.

## Gewählter Open-Source-Baustein

Das Deployment-Bundle verwendet **MediaMTX** von bluenviron, ein aktiv gepflegtes Open-Source-Medienserverprojekt. Es akzeptiert unter anderem RTMP, SRT und WebRTC und stellt HLS/WebRTC für die Wiedergabe bereit. Die offizielle Dokumentation empfiehlt den Docker-Container für Produktionsumgebungen.[3]

MediaMTX kann Zugriffe über einen externen HTTP-Endpunkt autorisieren. Bei jedem Publish- oder Read-Versuch übermittelt es dabei Nutzer, Token, Pfad, Aktion und Protokoll an den Autorisierungsdienst.[4] Seine Hooks melden, wenn ein Pfad online oder offline geht. Dies ermöglicht dem IONOS-Server, den echten Sitzungstatus zurück an BlackWaterLeaf zu melden.[5]

| Ebene | Zweck | Gewählte Grenze |
| --- | --- | --- |
| Studio | OBS und optional physisches Stream Deck | Sendet nur über kurzlebigen Einspielschlüssel an eine einzelne Sitzung |
| IONOS-Medienserver | MediaMTX in Docker, Reverse Proxy und TLS | Verarbeitet Medien dauerhaft außerhalb des Web-Projekts |
| BlackWaterLeaf | Sitzungssteuerung, Schlüsselrotation, Berechtigungen, Chat | Speichert keine Klartext-Einspielschlüssel; Zuschauerzugriff bleibt angemeldet |
| Wiedergabe | HLS zuerst, WebRTC als spätere niedrige Latenz | Kein kommerzieller Videoanbieter erforderlich |

## Quellen

[1] IONOS, [How to set up a RTMP streaming server](https://www.ionos.com/digitalguide/server/configuration/create-rtmp-server/).

[2] IONOS, [How to create your own HTTP Live Streaming server](https://www.ionos.com/digitalguide/server/know-how/create-http-live-streaming-server/).

[3] MediaMTX, [Install – Docker deployment](https://mediamtx.org/docs/kickoff/install).

[4] MediaMTX, [Authentication](https://mediamtx.org/docs/features/authentication).

[5] MediaMTX, [Hooks](https://mediamtx.org/docs/features/hooks).

[6] MediaMTX, [Read with web browsers](https://mediamtx.org/docs/read/web-browsers).
