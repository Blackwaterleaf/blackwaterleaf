# BlackWaterLeaf – Übergabepaket

**Stand:** 29. September 2026  
**Zweck:** Sicherer Übergang in einen anderen Manus-Account oder an ein weiteres Entwicklerteam.

> Dieses Dokument enthält **keine Passwörter, API-Schlüssel, Tokens, Session-Cookies, privaten Schlüssel oder Zahlungsdaten**. Zugangsdaten werden ausschließlich direkt auf den offiziellen Login-Seiten eingegeben.

## 1. Projekt und Quellcode

- GitHub-Repository: https://github.com/Blackwaterleaf/blackwaterleaf
- Hauptzweig: `main`
- Aktueller BlackWaterLeaf-Projektstand: Web + React Native/Expo, tRPC, Drizzle/TiDB/MySQL-kompatible Datenbank
- Wichtige aktuelle Arbeitsdateien:
  - `client/src/pages/Home.tsx` – öffentliche Startseite und Feedvorschau
  - `client/src/pages/Community.tsx` – Web-Community-Feed
  - `server/routers/community.ts` – geschützter Feed und öffentliche Feedvorschau
  - `mobile-natur/App.tsx` – Native-App, Feed, Dashboard, Entdecken und Tagesphase
  - `mobile-natur/src/api.ts` – Native-API- und Feed-Mapping
  - `shared/day-phase.ts` – gemeinsame Tagesphasenlogik
  - `deploy/ionos-live/` – separates IONOS-Media-/Streaming-Deployment

## 2. Letzter Funktionsstand

### Startseite und Community

- Startseite zeigt vor der Anmeldung eine **öffentliche Feedvorschau**.
- Sichtbar sind nur veröffentlichte, öffentliche Beiträge aktiver Nutzer.
- Vorschaukarten zeigen, sofern vorhanden: Bild, Autorname, Fachbereich und Likes.
- Private Profile, private Entwürfe und geschützte Inhalte werden nicht öffentlich ausgegeben.
- Klare Einstiege: Feed entdecken und Mitmachen.
- Server-Endpunkt: `community.publicPreview`.
- Geschützter Mitglieder-Feed bleibt unter `community.feed`.
- Medien werden serverseitig dedupliziert; Autorname nutzt einen robusten `displayName`-Fallback.

### Social-System

- Folgen/Entfolgen wie bei Instagram.
- Blockieren/Entblocken im Profil.
- Öffentliche Follower-/Folge-ich-Listen.
- Autorname und Avatar öffnen das öffentliche Profil.
- Beiträge können geliked, kommentiert und geteilt werden.

### Medien und Uploads

- Web und Native unterstützen große Bilduploads bis zum vorgesehenen Limit.
- Mehrphasige Uploadanzeige: vorbereiten, aufbereiten, sicher übertragen, veröffentlichen.
- Web bietet manuelle Bildrotation; automatische EXIF-Drehung wird nicht erzwungen.
- Native verwendet den nativen Bildbearbeitungsdialog.
- Community-Feed nutzt eine ressourcenschonende Vorschau und Skeleton-Ladezustände.

### Entdecken und Katalog

- Entdecken zeigt benannte Pflanzenkarten im Raster bzw. horizontalen Kartenreihen.
- Pflanzenkarten besitzen Bilder, Quellen-/Lizenzhinweise, Galerie, klickbare Detailseiten und Pflegeparameter.
- Aquarienpflanzen enthalten u. a. Licht, pH, Temperatur, CO₂, Wasserhärte, Substrat und Rückschnitt.
- Große Katalogimporte bleiben als Entwurf markiert, bis Quellen, Pflegeangaben und Bildlizenzen unabhängig geprüft sind.

### KI und Kostenkontrolle

- Tägliches Pflanzenbestimmungs-Kontingent wird in Web und Native sichtbar angezeigt.
- Quotenkarte zeigt Restkontingent und Fortschrittsbalken.
- Nach erfolgreicher Bestimmung wird die Anzeige aktualisiert.
- Öffentliche Artikel-/Wissensabfragen nutzen einen serverseitigen TTL-Cache.
- Datenbank besitzt zusätzliche unterstützte Veröffentlichungs-/Statusindizes.
- Temporäre LLM-Fehler werden höchstens zweimal wiederholt; nicht wiederholbare Fehler nicht.
- IONOS AI Model Hub ist **optional vorbereitet**, aber ohne geschützten Token absichtlich nicht aktiviert.

## 3. IONOS – sichere Anmeldung und Betrieb

Offizielle Einstiege:

- IONOS Login: https://login.ionos.com/
- IONOS Kundenkonto: https://mein.ionos.de/
- IONOS CloudPanel: https://cloudpanel.ionos.com/
- IONOS AI Model Hub: https://cloud.ionos.com/managed/ai-model-hub
- IONOS Cloud/DCD: https://dcd.ionos.com/latest/

**Vorgehen:**

1. Offizielle Login-Seite öffnen.
2. IONOS-E-Mail und Passwort selbst eingeben.
3. Falls eine zusätzliche Cloud-Anmeldung erscheint, diese ebenfalls selbst bestätigen.
4. Serverzugriff erst nach erfolgreicher Anmeldung prüfen.
5. Keine Zugangsdaten in GitHub Issues, Markdown-Dateien, Chatnachrichten oder `.env`-Dateien committen.

### Vorgesehene Domains

- Web-App: `https://www.blackwaterleaf.com`
- Medien-/Streaming-Subdomain: `https://stream.blackwaterleaf.com`
- Für ein separates Studio wäre als Namenskonvention geeignet: `https://studio.blackwaterleaf.com`

Die DNS-Subdomain muss im IONOS-DNS auf die öffentliche Server-IP zeigen. Vor dem Anlegen prüfen, ob `studio.blackwaterleaf.com` frei ist und ob das Studio statisch, als Node-Dienst oder als Docker-Service betrieben werden soll.

### IONOS-Streaming-Konfiguration

Die vorhandene Struktur liegt unter `deploy/ionos-live/` und enthält Caddy, MediaMTX, TLS-Zertifikatssynchronisierung und Playback-Gateway.

Die geschützte Runtime erwartet mindestens:

```text
BWL_APP_ORIGIN=https://www.blackwaterleaf.com
BWL_MEDIA_ORIGIN=https://stream.blackwaterleaf.com
BWL_MEDIA_DOMAIN=stream.blackwaterleaf.com
BWL_TLS_EMAIL=<eigene Betriebs-E-Mail>
BWL_MEDIA_CONTROL_SECRET=<zufälliger Wert, mindestens 48 Zeichen>
```

`runtime.env` bleibt ausschließlich auf dem IONOS-Server. Das Mediengeheimnis muss zusätzlich als geschütztes Server-Secret der Web-App hinterlegt werden. Niemals in GitHub speichern.

### IONOS AI Model Hub – optional

Für die Aktivierung werden serverseitig benötigt:

```text
AI_PROVIDER=ionos
IONOS_AI_API_KEY=<IONOS-Token, nur als Secret>
IONOS_AI_API_URL=https://openai.inference.de-txl.ionos.com
IONOS_AI_MODEL=Qwen/Qwen3.5-9B
```

Nach der Aktivierung nur einen Chat- und einen Bildtest durchführen, Nutzungsgrenzen prüfen und kein Token loggen. Ein IONOS-Budgetalarm ist zusätzlich außerhalb des Codes im Konto einzurichten.

## 4. Expo / Android

- Expo-Projektname: `BlackWaterLeaf`
- Expo-Slug: `bwl`
- Android-Paket: `com.blackwaterleaf`
- Aktuelle App-Version im Projekt: `1.0.24`
- Android versionCode: `24`
- EAS-Projekt-ID: `40ef1859-d5f9-484d-89e9-046333b708f4`
- Expo-Team/Account: `blackwaterleaf2s-team`
- Expo-Projektseite: https://expo.dev/accounts/blackwaterleaf2s-team/projects/bwl
- Konfiguration: `mobile-natur/app.json`, `mobile-natur/eas.json`

### APK-Build

Im Verzeichnis `mobile-natur/`:

```bash
npx eas-cli login
npx eas-cli build --platform android --profile preview --non-interactive
```

Das Profil `preview` erzeugt eine interne Android-APK. Für den Play Store ist das Profil `production` vorgesehen und benötigt die korrekt eingerichtete Expo-/Google-Play-Signierung.

Vor jedem Build:

```bash
npx tsc --noEmit
npx expo-doctor
npx expo export --platform android
```

Expo-Anmeldedaten, persönliche Zugriffstokens und Signierungsschlüssel niemals in GitHub oder Chat schreiben.

## 5. Verifikation des letzten Web-Stands

Für den letzten Web-Stand wurden erfolgreich geprüft:

```bash
pnpm check
pnpm build
pnpm exec vitest run server/community-feed-ui.test.ts
 git diff --check
```

Die Community-UI-Regressionen umfassen 14 Tests. Der letzte WebDev-Checkpoint mit der Startseiten-Feedvorschau ist:

`manus-webdev://382811f8`

## 6. Offene nächste Schritte

1. Studio-ZIP in den Arbeitsbereich übernehmen und seine technische Struktur prüfen.
2. Entscheidung für `studio.blackwaterleaf.com` bestätigen und DNS-/TLS-Ziel festlegen.
3. Studio mit der bestehenden BlackWaterLeaf-Authentifizierung und dem serverseitigen KI-Adapter verbinden.
4. IONOS-Serverzugang über CloudPanel prüfen und Deployment ohne Secrets automatisieren.
5. KI-Provider zunächst mit kleinem Testkontingent aktivieren und Kostenalarm kontrollieren.
6. Web und Native nach Studio-Anbindung erneut typprüfen, bauen und visuell testen.

## 7. Umgang mit dem bisherigen Chatverlauf

Der vollständige private Chatverlauf wird nicht in ein öffentliches GitHub-Repository kopiert. Dieses Dokument enthält stattdessen die technische Zusammenfassung und die für die Fortsetzung benötigten Pfade. Private Zugangsdaten, Kontoangaben und Sitzungsinformationen bleiben außerhalb des Repositories.
