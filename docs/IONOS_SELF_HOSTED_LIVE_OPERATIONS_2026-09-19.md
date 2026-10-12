# BlackWaterLeaf – Eigenes IONOS-Live-System

## Ergebnis und Betriebsgrenze

BlackWaterLeaf kann Live-Video ohne YouTube, Twitch oder einen anderen Videoanbieter betreiben. Der Ausbaustand verbindet ein Staff-Control-Deck im Live Hub mit einer separat zu betreibenden IONOS-Medieninstanz. Die Website bleibt für Sitzungen, Berechtigungen, Chat und Schlüsselrotation zuständig; der IONOS-Server verarbeitet ausschließlich die Medienübertragung.

> **Die IONOS-Instanz wird absichtlich nicht im Web-Projekt betrieben.** Videotransport ist ein dauerhafter, bandbreitenintensiver Dienst mit eigenen Ports und Docker-Containern. Das passt nicht in das stateless Web-Deployment.

| Ebene | Aufgabe | Schutzmaßnahme |
| --- | --- | --- |
| BlackWaterLeaf Live Hub | Staff legt Sitzung an; Mitglieder sehen Player und Chat | Authentifizierung, Blocklisten, Rate-Limits, serverseitige Rollen |
| Live-Control-Deck | erzeugt pro Sitzung einen Einspielschlüssel; rotiert ihn bei Verdacht | Nur der SHA-256-Hash liegt in der Datenbank; Klartext erscheint nur einmal |
| IONOS Media Stack | RTMPS-Eingang aus OBS/Stream Deck; HLS-Ausgabe | MediaMTX, Docker, TLS, geschlossene HLS-Ports |
| Playback Gateway | hält das HLS-Video hinter einem kurzlebigen, signierten Mitgliedsticket | HLS ist nur innerhalb des Docker-Netzes erreichbar; der Browser erhält nie eine offene MediaMTX-URL |

## Eingangsweg – bewusste erste Stufe

Die erste produktive Eingangsquelle ist **OBS mit optionalem physischem Elgato Stream Deck**. OBS liefert eine ausgereifte Szenensteuerung, Kamera- und Mikrofonverwaltung. Das Stream Deck steuert dabei Szenen, Start/Stopp und Moderationsabläufe, während der BlackWaterLeaf-Staff-Bereich Einspielschlüssel und Sitzungstatus verwaltet. Ein eigenes Browser-Studio bleibt als spätere zweite Eingangsquelle möglich, ohne diesen Transport oder die Wiedergabe neu zu bauen.

## Staff-Ablauf

1. Staff legt im geschützten Live Hub eine Community-Sitzung oder einen Fachvortrag an.
2. Bei Auswahl **BLACKWATERLEAF / IONOS** erzeugt das Control Deck einen Einspielpfad und einen einmal sichtbaren Einspielschlüssel.
3. Der Schlüssel wird in OBS als Passwort für die RTMPS-Zieladresse hinterlegt. Der Pfad ist der angezeigte Sitzungswert.
4. MediaMTX fragt den BlackWaterLeaf-Autorisierungsendpunkt bei jedem Publish-Versuch. Nur ein gültiger Schlüssel für genau diesen Pfad wird akzeptiert.
5. Sobald der tatsächliche Stream verfügbar ist, meldet MediaMTX den Status zurück. BlackWaterLeaf markiert die Sitzung erst dann als live.
6. Mitglieder öffnen die Sitzung. BlackWaterLeaf prüft Konto, Sperren und Sitzungsstatus vor der Weiterleitung zum Player.
7. Bei einem Schlüsselwechsel verliert der vorherige Schlüssel sofort seine Gültigkeit.

## IONOS-Bereitstellung

Der fertige Container-Bundle liegt unter `deploy/ionos-live/`. Er enthält MediaMTX, einen kleinen HLS-Playback-Gateway und Caddy für TLS. Der Zielserver braucht eine eigene öffentliche IPv4-Adresse, Docker Compose, eine auf diese Adresse zeigende DNS-Subdomain und die freigegebenen Ports **80/TCP**, **443/TCP** und **1936/TCP**. HLS-Port 8888 bleibt intern und darf nicht am Host geöffnet werden.

1. Einen Linux-Server bei IONOS anlegen und Docker Compose installieren.
2. `stream.blackwaterleaf.com` als A/AAAA-Record auf den IONOS-Server setzen.
3. Den Ordner `deploy/ionos-live/` sicher auf den Server kopieren.
4. `runtime.example` außerhalb des Repositories in `runtime.env` kopieren und ausfüllen. Ein gemeinsames Geheimnis mit mindestens 32 Zeichen erzeugen, etwa mit `openssl rand -base64 48`.
5. Das **identische** Geheimnis als `BWL_MEDIA_CONTROL_SECRET` in den WebDev-Projektsecrets setzen. `BWL_MEDIA_ORIGIN` erhält den Wert `https://stream.blackwaterleaf.com`.
6. Auf IONOS `docker compose --env-file runtime.env up -d --build` ausführen.
7. Die Health-Adresse `https://stream.blackwaterleaf.com/healthz` prüfen, dann eine Test-Sitzung anlegen und per OBS einspielen.

## OBS-Konfiguration

| Feld in OBS | Wert |
| --- | --- |
| Dienst | Benutzerdefiniert |
| Server | Die aus dem Control Deck kopierte vollständige **OBS-Serveradresse**: `rtmps://stream.blackwaterleaf.com:1936/<angezeigter-Pfad>?user=studio&pass=<einmaliger-Schlüssel>` |
| Stream Key | Leer lassen |
| Protokoll | RTMPS, nicht unverschlüsseltes RTMP |

Die im Bundle verwendete MediaMTX-Konfiguration erzwingt RTMPS. Der IONOS-Medienserver akzeptiert keinen offenen HLS-Reader vom Internet: Nur der Playback-Gateway kann intern auf HLS zugreifen.

## Noch erforderliche Bereitstellungseingaben

Die Anwendung und der Deployment-Bundle sind vorbereitet. Für die echte Inbetriebnahme fehlen ausschließlich externe Werte und Zugriff:

- IONOS-Linux-Server oder Cloud-Instanz,
- DNS-Verwaltung für `stream.blackwaterleaf.com`,
- sichere Eingabe des gemeinsamen Mediengeheimnisses in BlackWaterLeaf und auf IONOS,
- administrativer Zugang zur IONOS-Instanz für Docker-Deployment.

Es werden **keine** YouTube-, Twitch- oder anderen Videoanbieterzugänge benötigt.

## Quellen

Die Architektur und Paketwahl sind in den [verifizierten Quellen und Architekturentscheidungen](SELF_HOSTED_IONOS_STREAMING_SOURCES_2026-09-19.md) festgehalten. IONOS dokumentiert die Nutzung eigener RTMP/HLS-Server.[1][2] MediaMTX dokumentiert die Docker-Bereitstellung, externe HTTP-Autorisierung, Hooks und Browser-HLS.[3][4][5][6]

[1]: https://www.ionos.com/digitalguide/server/configuration/create-rtmp-server/
[2]: https://www.ionos.com/digitalguide/server/know-how/create-http-live-streaming-server/
[3]: https://mediamtx.org/docs/kickoff/install
[4]: https://mediamtx.org/docs/features/authentication
[5]: https://mediamtx.org/docs/features/hooks
[6]: https://mediamtx.org/docs/read/web-browsers
