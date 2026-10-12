# BlackWaterLeaf – verifiziertes Web-/Native-Inventar

**Stand:** 2026-09-27, Arbeitsbranch `mandate/gate0-baseline-2026-09-27`, Basis `b9da0938`.

## Web-Routen aus `client/src/App.tsx`

### Öffentlich bzw. Shell-gebunden

`/`, `/explore`, `/search`, `/catalog`, `/community`, `/community/post/:id`, `/live`, `/live/:id`, `/notifications`, `/messages`, `/feedback`, `/pro`, `/support`, `/partner-werden`, `/datenschutz`, `/privacy`, `/impressum`, `/today`, `/assistant`, `/profile`, `/profile/manage`, `/member/:id`, `/plant/:id`, `/aquarium-fish/:id`, `/terrarium/:id`, `/saved`, `/ranking`, `/knowledge`, `/wissen`, `/feed`, `/community/feed`, `/botanik`, `/aquaristik`, `/terraristik`, `/shop`, `/marketplace/shop/:id`, `/marketplace/product/:id`, `/marketplace/manage`, `/marketplace`, `/flow/:flow`, `/world/:realm`, `/404` und NotFound-Fallback.

### Auth-/Account-Einstiege

`/login`, `/register`, `/forgot-password`, `/verify-email`, `/reset-password`.

### Admin

`/admin` und `/admin/:section`; die Oberfläche prüft die Staff-Rolle serverseitig und zeigt für nicht berechtigte Nutzer einen gesperrten Zustand.

## Native-Screen-Inventar aus `mobile-natur/App.tsx`

`home`, `explore`, `botany`, `aquarium`, `terrarium`, `assistant`, `live`, `photo`, `post`, `knowledge`, `marketplace`, `community`, `communityDetail`, `notifications`, `messages`, `care`, `feedback`, `pro`, `management`, `dashboard`, `profile`, `collection`, `search`, `catalogOverview`, `publicProfile`, `taxon`, `aquariumTaxon`, `terrariumTaxon`, `saved` und `ranking`.

Primäre Native-Navigation ist als Vier-Tab-Modell sichtbar: `Home`, `Entdecken`, `Community`, `Profil`. Weitere Ziele werden kontextbezogen geöffnet. Das ist eine plattformbedingte Navigationsform, nicht der Wegfall der fachlichen Funktionen; die Gleichwertigkeit der Deep-Links und Rückwege bleibt zu testen.

## API-/Daten-Domänen

Verifiziert vorhandene Router-/Domänenbereiche: Auth, lokale Authentifizierung, Profile, Social/Follows/Blocks/Saved, Search/Catalog, Knowledge, Observations/Map, Community/Media, Notifications, Messages, Assistant/KI, Live, Care, Habitats, Smart Devices, Sensors/Weather, Gamification, Billing/Donations/Pro, Partners/Marketplace, Admin/Entitlements, Feedback, Analytics, Challenges und Platform Availability.

Verifizierte zentrale Tabellenbereiche: Users/Rollen/Consents/Sessions, Profile-Social-Accounts, Observations/Responses/Media, Community Posts/Likes/Comments/Reports/Blocks, Follows/Saved, Assistant Usage/Credits, Billing/Donations/Entitlements, Habitats/Smart Devices/Measurements, Taxa für Botanik/Aquaristik/Terraristik, Knowledge, Live, Care, Partners, Analytics und Audit Ledger.

## Auftragseinstiege – aktueller Codeabgleich

| Auftragspfad | Aktueller Stand | Nachweis/Status |
|---|---|---|
| `/` | Route vorhanden | verifiziert |
| `/explore` | Route vorhanden | verifiziert |
| `/explore#map` | Explore-Route mit Kartenanker; eigenständiger Kartenmodus noch nicht bestätigt | in Arbeit |
| `/botanik` | Route vorhanden | verifiziert |
| `/plant/30043` | generische Pflanzendetailroute vorhanden; ID-Datensatz nicht in dieser Bestandsaufnahme live bestätigt | in Arbeit |
| `/aquaristik` | Route vorhanden | verifiziert |
| `/terraristik` | Route vorhanden | verifiziert |
| `/assistant` | Route vorhanden | verifiziert |
| `/flow/foto` | generische Flow-Route vorhanden; Ziel-/Validierungsverhalten separat zu prüfen | in Arbeit |
| `/search` | Route vorhanden | verifiziert |
| `/knowledge` | Route vorhanden | verifiziert |
| `/community` | geschützter Community-Feed vorhanden | verifiziert im Code; autorisierter Lauf offen |
| `/marketplace` | Route vorhanden | verifiziert |

## Evidenzgrenzen

- Die Inventarliste beweist Routendeklarationen, nicht automatisch erfolgreichen Lauf, Datenverfügbarkeit, Rollenfreigabe oder APK-Installation.
- Geschützte Bereiche, reale Uploads, Auth, Admin-Entitlements, KI-Ausführung und Android-Lifecycle benötigen autorisierte Testdaten/-zugänge.
- Die im verbindlichen Auftrag referenzierten Premium-/Website-Audit-Quelldateien fehlen im aktuellen Sandbox-Bestand; ältere Projekt-Audits sind nur historische Evidenz und ersetzen diese Quellen nicht.
