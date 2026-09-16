# BlackWaterLeaf – Zustandsmatrix der Kernrouten

**Geltungsbereich:** Web-Staging V1. Alle Zustände beruhen auf realem Browser-, API-, Authentifizierungs- oder Datenbankstatus. Es werden keine Ersatzinhalte erzeugt.

| Route | Offline | API-/Serverfehler | Datenbank nicht verbunden | Nicht autorisiert | Laden | Leer | Erfolgreich |
|---|---|---|---|---|---|---|---|
| Home | Globaler Banner `NET/OFFLINE` | Globaler Banner `API/UNREACHABLE` und Feed-Fehlerpanel | Globaler Banner `DB/NOT_CONNECTED` | Öffentliche Basis bleibt erreichbar | Feed-Prüfstatus | Ehrlicher Moment-Leerzustand | Reale öffentliche Communitydaten und Plattformstatus |
| Entdecken | Globaler Banner | Globaler Banner | Globaler Banner | Öffentliche Weltübersicht bleibt erreichbar | Nicht datenabhängig | Nicht anwendbar | Direkte Welt- und Wissensnavigation |
| Community | Globaler Banner | Globaler Banner und `FEED/ERROR` | Globaler Banner | `AUTH/OPTIONAL` für Entwurf/Veröffentlichung | `FEED/CONNECT` | `FEED/EMPTY` | Reale öffentliche Posts; Mutationen nur nach Anmeldung und Einwilligung |
| KI | Globaler Banner | Globaler Banner und `AI/STATUS_ERROR` | Globaler Banner | `AUTH/REQUIRED`; keine persönliche Verarbeitung | `AI/CHECKING` | Nicht anwendbar | `AI/READY` erst nach aktiver KI-Einwilligung, verfügbarer Audit-Tabelle und serverseitiger Modellfreigabe; andernfalls sichtbarer `AI/STAGING_HOLD` oder Consent-Lock |
| Profil | Globaler Banner | Globaler Banner und `PROFILE/ERROR` | Globaler Banner | `AUTH/REQUIRED` | `PROFILE/LOAD` | Nicht anwendbar | Serververifiziertes Profil, Einwilligungen, Avatar, Sprache, Einheiten und – nach XP-Aktivierung – XP-/Levelübersicht |
| Wissen | Globaler Banner | Globaler Banner und `KNOWLEDGE/ERROR` | Globaler Banner | Öffentliche veröffentlichte Wissensbasis | `KNOWLEDGE/CONNECT` | `KNOWLEDGE/EMPTY` | Nur veröffentlichte, quellenbelegte Artikel |
| Naturwelt | Globaler Banner | Globaler Banner und `OBS/ERROR` | Globaler Banner | `AUTH/REQUIRED` | `OBS/LOAD` | Weltbezogener privater Leerzustand | Eigene Beobachtungen, optionale Medien, Revision und Sichtbarkeit |

Die globale Bannerlogik wird durch `server/connection-state.test.ts` für Offline, Serverfehler, nicht verbundene Datenbank und erfolgreichen Betrieb getestet. Routenbezogene Auth-, Lade-, Leer- und Fehlerdarstellungen werden vor dem Staging-Checkpoint zusätzlich visuell auf Desktop und Mobilansicht geprüft.
