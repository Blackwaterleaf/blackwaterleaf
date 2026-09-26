# BlackWaterLeaf – Phase-1-Premium-Audit

**Stand:** 26. September 2026  
**Methode:** Konsolidierung von vier unabhängigen, ausschließlich lesenden Prüfungen: Web-Staging-Code, Expo/React-Native-App, Produktinformationsarchitektur sowie anonymer Prüfung von `https://blackwaterleaf.com`. **Es wurden keine UI-, Konfigurations- oder Datenänderungen vorgenommen.**

> **Statuslegende:** **Vorhanden** = in Code oder öffentlich sichtbar verifiziert. **Vorbereitet** = implementierter, aber bewusst nicht produktiv/extern aktivierter Pfad. **Unklar** = mit der vorliegenden Evidenz nicht verifizierbar. **Fehlt / fehlerhaft** = nicht vorhanden oder nachweislich nicht dem beabsichtigten Verhalten entsprechend.

## 1. Management Summary / Ist-Zustand

BlackWaterLeaf ist im geprüften Stand ein funktionsreiches Observatory-Portal mit **React 19/Vite, Wouter, tRPC/React Query, Express, Drizzle/MySQL und Tailwind/CSS** sowie einer separaten Expo/React-Native-App. Das Web besitzt einen echten Server- und Datenzugriffspfad, eine umfangreiche Routenlandschaft, öffentliche und geschützte Zustände, privacy-preserving Beobachtungskarten sowie einen partnergetrennten Marketplace. Die Native-App nutzt in vielen Bereichen die Staging-API und besitzt einen privaten Offline-Outbox-Ansatz.

Der Zustand ist **nicht release-grün**: `pnpm check` und der Produktions-Build sind erfolgreich, aber die vollständige Testsuite enthält **4 fehlerhafte Testdateien / 6 fehlerhafte Tests**; außerdem scheitert `pnpm db:baseline:verify`, weil der Verifier noch 38 Migrationen mit Head `0037_woozy_inertia` erwartet, während 39 Migrationen bis `0038_aspiring_strong_guy` vorliegen. Produktionsnahe Prüfungen von Datenbestand, Secrets, SMTP, Storage/Media, Endpunkt-Erreichbarkeit und externen Kontingenten liegen nicht vor.

Funktional sind die wichtigsten Bausteine vorhanden, doch die Informationsarchitektur ist noch nicht konsolidiert: mehrere Alias-Routen, ein globaler Kartenanker statt eines eigenständigen Web-Kartenmodus, eine Capture-Auswahl statt eines Capture-Formulars und parallel erreichbare Profil-/Managementwege erzeugen Doppelungen. Auf Native bestehen zusätzlich ein fehlender Shared-Contract-Adapter, ein Outbox-Idempotenzfehler, ein nicht evidenzbasierter „Bereit“-Status je Realm und ein KI-UI-Konflikt mit dem Design Book.

## 2. Prüfumfang und Evidenzquellen

| Kürzel | Bereich | Verifizierte Evidenz / Quelle |
|---|---|---|
| **[W]** | Web-Staging, read-only | `client/src/App.tsx` (47 explizite Routendeklarationen), `AppShell.tsx` (sechs Primärziele), `index.css`, `ConnectionStateBanner.tsx`, `server/routers.ts` und Domänenrouter, `server/_core/*`, `server/db.ts`, `service-worker.js`, Manifest/Robots/Sitemap. Aktueller Checkout `c663aa7`; `pnpm check` und Build erfolgreich, Tests/Baseline-Verifier nicht grün. |
| **[N]** | Native, read-only | `mobile-natur/App.tsx`, `src/api.ts`, `src/observationOutbox.ts`, `MomentCapture.tsx` und `shared/blackwaterleaf-contract-v1.ts`; TypeScript-Check `tsc --noEmit` erfolgreich. |
| **[IA]** | Informationsarchitektur, read-only | Routen, Seiten und Tests in `client/src/*`, insbesondere `Explore.tsx`, `FlowDestination.tsx`, `Realm.tsx`, `Search.tsx`, `Knowledge.tsx`, `Assistant.tsx`, `Marketplace.tsx`, `Community.tsx`, `ProfileHome.tsx`; Design Book und Settings/Map-Analyse. |
| **[P]** | Öffentliches Web, anonym/read-only | Sichtprüfung von Homepage, Explore, Login/Register, geschützten Routen, Marketplace/Partnerlink sowie `robots.txt`, `sitemap.xml`, `/privacy`, `/datenschutz`, `/impressum`; Header- und Ressourcenbeobachtung ohne Login oder Formularübermittlung. |

**Quellenpriorität:** Bei Konflikten haben aktueller Quellcode, aktuelle Commands und öffentlich sichtbares Verhalten Vorrang vor historischen Dokumenten. Mehrere Dokumente vom 16.–20. September enthalten überholte Aussagen (u. a. zu Crawler-Dateien oder Storage-Proxy-Risiken). Die Analyse `SETTINGS_MAP_UX_MARKET_ANALYSIS_2026-09-26.md` ist ausdrücklich **Planung/Analyse, keine Umsetzung**.

## 3. Verifiziertes Feature-Inventar nach Status

| Bereich / Fähigkeit | Status | Verifizierter Befund | Nachweis |
|---|---|---|---|
| Web-Routing und Shell | **Vorhanden** | 47 explizite Routen, NotFound-Fallback, ein lazy geladener HabitatBuilder; Desktop-Sidebar und Mobile-Navigation führen zu Entdecken, Karte, Erfassen, Katalog, Community und Profil. | [W] `App.tsx:39–104`, `AppShell.tsx:11–27,113–173` |
| Server- und Datenfunktionen | **Vorhanden** | 21 tRPC-Domänen für u. a. Profile/Auth, Beobachtungen, Wissen/Suche, Community, Nachrichten, Consent, Care, Habitate, Live, Analytics und Admin. CRUD-/Upload-Prozeduren sind nicht nur statische Screens. | [W] `server/routers.ts:28–77`, Domänenrouter |
| Daten- und Mediengrenzen | **Vorhanden** | Drizzle/MySQL wird nur bei `DATABASE_URL` initialisiert; der Storage-Proxy erlaubt unveränderliche Design-Assets und eng geprüfte Katalogbilder, aber keine beliebigen Raw-Keys. | [W] `server/db.ts:5–18`, `storageProxy.ts:4–40` |
| Privacy-preserving Karte und geschützte Flows | **Vorhanden** | Öffentliche Beobachtungen werden mit generalisierten Standorten dargestellt; exakte private Orte bleiben verborgen. Community, Verwaltung, KI und Foto-Flow sind öffentlich sichtbar geschützt. | [W], [IA], [P] Explore und geschützte Routen |
| Suche, Katalog, Wissen | **Vorhanden** | `/search` durchsucht domänenübergreifend; `/catalog?realm=…` ist ein Realm-Katalogmodus; `/knowledge` ist die separate Quellen-/Evidenzoberfläche. | [IA] `Search.tsx`, `Knowledge.tsx`, `Realm.tsx` |
| Realm-Kontexte | **Vorhanden** | Botanik, Aquaristik und Terraristik sind spezialisierte gemeinsame Realm-Implementierungen mit öffentlicher Vorschau, Katalogstreifen und privaten Shortcuts. | [IA] `Realm.tsx` |
| KI-Workspace (Web) | **Vorhanden** | Chat, Pflanzenbestimmung und Aquarienanalyse besitzen Auth-, Consent- und Verfügbarkeits-Gates. | [IA] `Assistant.tsx:56–128` |
| Marketplace | **Vorhanden** | Shop-/Partner-first-Zugang, Werbung-/Provider-/Kein-Checkout-Hinweise und Partnerlink; Native gruppiert Produkte partnerbezogen und behauptet keinen Checkout. | [IA], [N], [P] `Marketplace.tsx`, öffentlicher Produkt-/Partnercheck |
| PWA- und Crawler-Dateien | **Vorhanden** | Manifest, Icons, `robots.txt`, Sitemap und produktionsgebundene Service-Worker-Registrierung. Der Worker cached keine Navigation, API- oder Account-Antworten. | [W] `client/public/*`, `main.tsx` |
| Betriebsendpunkte | **Vorhanden** | `/healthz`, `/livez`, `/readyz`; Readiness prüft Datenbank und konfigurierten Forge-Storage mit begrenzter Ausgabe. | [W] `server/_core/index.ts` |
| Öffentliche Transport-/Browser-Schutzheader | **Vorhanden** | Beobachtet wurden HSTS mit Preload, CSP, `nosniff`, `strict-origin-when-cross-origin`, `SAMEORIGIN` und COOP same-origin. Dies ist **kein Penetrationstest**. | [P] anonyme Headerprüfung |
| Offline-Erfassung (Native) | **Vorhanden, mit Defekt** | Private-first Queue, UUID-`clientId`, persistente lokale Warteschlange und Consent vor Upload sind implementiert. Bei Bild-Upload-Fehler wird die neu erzeugte `observationId` jedoch nicht zuverlässig gespeichert. | [N] `observationOutbox.ts:66–143` |
| Selbst gehostetes Live/Media | **Vorbereitet** | IONOS/MediaMTX-Ingest, Playback und geschützte Tickets haben Server-/UI-Pfade. Ohne gültigen HTTPS-Media-Origin und Media-Control bleibt der Zustand korrekt „nicht verbunden/verfügbar“. YouTube/Twitch sind getrennt unterstützt. | [W] Live-UI/Release-Dokumentation |
| Smart Devices | **Vorbereitet** | Auswahl, private Zuordnung und manuelle Messungen existieren; der Status bleibt `awaiting_authorization`. Kein Hersteller-OAuth, Webhook, Secret-Setup oder automatischer Sync ist verifiziert. | [W] UI/Dokumentation |
| Habitat Builder | **Vorbereitet** | Authentifizierter lazy Planner mit lokaler Browserpersistenz und JSON-Export; keine zentrale API-Persistenz und keine Arten-/Produkt-/PBR-Zusagen. | [W] lazy Route / Builder-Befund |
| Management Hub / fokussierter Kartenmodus | **Vorbereitet (Plan)** | 2×2-Management-Hub, einziger Management-Einstieg und unabhängiger Kartenmodus sind Vorschläge der aktuellen Analyse, nicht nachweislich umgesetzt. | [W], [IA] Settings/Map-Analyse vom 26.09. |
| Shared Contract in Native | **Fehlt / fehlerhaft** | Die App importiert/validiert `shared/blackwaterleaf-contract-v1.ts` nicht. `src/api.ts` führt parallele, permissive Typen und unwrappt tRPC-JSON ohne Versions-/Zod-/Standard-Fehlerprüfung. | [N] `src/api.ts:249–259`, Shared Contract |
| Korrekte unbekannte Realm-/Flow-Routen | **Fehlt / fehlerhaft** | Ungültiges `/world/:realm` fällt still auf Botanik zurück; ungültiges `/flow/:flow` auf Live. Es gibt keinen expliziten Invalid-Parameter-/NotFound-Zustand. | [W] `Realm.tsx:46–53`, `FlowDestination.tsx:39–48` |
| Öffentliche Datenschutz-/Impressumsseiten an Standardrouten | **Fehlt / fehlerhaft (geprüfte Routen)** | `/privacy`, `/datenschutz` und `/impressum` zeigten jeweils die App-404. Auf den geprüften Login-/Registerseiten waren keine entsprechenden Links sichtbar. Eine andere, nicht verlinkte oder authentifizierte Quelle wurde nicht ausgeschlossen. | [P] anonyme Routensichtprüfung |
| Produktionsbetrieb und externe Abhängigkeiten | **Unklar** | Keine Prüfung von Secrets, Datensätzen, E-Mail-Zustellung, Forge-/Media-Readiness, API-Quoten, externen Providerverträgen oder öffentlich erreichbarer Readiness in Produktion. | [W], [P] Prüfumfang |

## 4. Konsolidierungsmatrix: Funktionen, Zugänge und Doppelungen

> **„Entscheidung“ bezeichnet eine empfohlene Produkt-/Konsolidierungsentscheidung aus der Phase 1, keine durchgeführte Änderung.**

| Ist-Funktion | Nachweis / Quelle | Nutzerzweck | Primärer Zugang | Mögliche Doppelung | Entscheidung | Begründung |
|---|---|---|---|---|---|---|
| Entdecken | [IA] `Explore.tsx`; [W] Shell | Einstieg in Portale und öffentliche Beobachtungen | `/explore` | Realm-Entdecken und teils generische Terrarium-Handoff | **Beibehalten als einziger Discovery-Einstieg** | Die Seite bündelt Spezialportale; Realms bleiben Kontexte statt globale Taskfamilien. |
| Karte | [W] `AppShell`; [IA] Explore/Realm | Öffentliche, privatsphärengeschützte Beobachtungen ansehen | `/explore#map` | Globaler Anker plus eingebettete Karten in allen Realms | **Eigenständiges `/map` kanonisieren** | Der aktuelle Anker und die Wiederholung verschleiern Gesamtkarte versus gefilterte Realm-Vorschau. Realm-Karten nur als Vorschau mit Filter-Handoff. |
| Erfassen | [IA] `FlowDestination.tsx`, `Realm.tsx`, Community, Assistant | Beobachtung, Beitrag oder KI-Analyse starten | `/flow/foto` | Auswahlseite, Realm-Formulare, Community-Composer, KI-Fotobestimmung | **Kanonischen Capture-Hub definieren** | Der aktuelle Flow speichert nicht selbst; Daten-, Privacy- und Ergebnissemantik der drei Ziele unterscheiden sich. |
| Globalsuche / „Katalog“ | [W] Shell; [IA] `Search.tsx`, `Knowledge.tsx` | Taxa, Wissen, Personen, Community und Angebote finden | `/search`; Realm-Katalog `/catalog?realm=…` | Bezeichnung „Katalog“ für domänenübergreifende Suche; Alias `/catalog` | **Suche und Katalog trennen** | `/search` ist keine reine Taxonomie. `/catalog` sollte der kanonische browsebare Taxon-Katalog sein; Wissen bleibt eigene Evidenzfläche. |
| Wissen / Quellen | [W], [IA] `Knowledge.tsx` | Quellenbasierte Wissensinhalte lesen | `/knowledge` | Alias `/wissen`; visuell dem Katalogzustand zugeordnet | **`/knowledge` klar als Quellenunterbereich führen** | Der Zweck ist Evidenz, nicht bloß ein weiteres Suchergebnis. |
| Community und Postdetail | [W] Routen; [IA] `Community.tsx`, `ProfileHome.tsx` | Feed, Erstellen, Kommentare, Detailansicht | `/community`, Detail `/community/post/:id` | `/feed`, `/community/feed`; erzeugte `?post=`-Links funktionieren nicht, da nur `?compose=1` gelesen wird | **Eine Feed- und eine Detailkanonik festlegen** | `/community` und `/community/post/:id` entsprechen der vorhandenen Routierung; Query-Postlinks sind inkonsistent. |
| Profil und Verwaltung | [W] `AppShell`; [IA] Profile-Routen / Design Book | Identität, Privatbereich und Einstellungen verwalten | `/profile`, Management `/profile/manage` | Header-/Home-Direktlinks, sieben `/profile/*`-Pfade auf dieselbe breite `Profile`-Komponente | **Management Hub als alleinigen Administrationszugang durchsetzen** | Mehrere Begriffe und Direktpfade machen Profil, Verwalten, Einstellungen und Privatbereich schwer unterscheidbar. Kompatibilitätspfade sollten fokussieren/umleiten. |
| Botanik | [IA] `Realm.tsx` | Pflanzen erfassen, Sammlung und Katalogkontext | `/botanik` | `/world/botany`; „Meine Pflanzen“ und „Pflanze hinzufügen“ führen beide zu Habitats | **Kanonische Realm-Route und getrennte Aktionen** | Labels versprechen derzeit unterschiedliche Ziele, liefern aber dasselbe. |
| Aquaristik | [IA] `Realm.tsx` | Aquarien, Beobachtungen und Werte | `/aquaristik` | `/world/aquarium`; Sammlung, Hinzufügen und Wasserwerte verweisen auf Habitats | **Kanonische Realm-Route; Werte separat oder ehrlich benennen** | „Wasserwerte“ hat keine eigene Zielseite. |
| Terraristik | [IA] `Realm.tsx`; [N] Catalog-Typen | Terrarienkontext und Entdecken | `/terraristik` | `/world/terrarium`; generischer Explore-Handoff; Native Catalog unterstützt nicht vollständig Terrarium-Typen | **Kanonische Realm-Route; realm-gefilterter Handoff** | Generisches Entdecken und unvollständige Native-Typen schwächen die Kategorieeigentümerschaft. |
| KI-Workspace | [IA] `Assistant.tsx`; [N] `App.tsx`, `api.ts` | Chat, Pflanzenidentifikation, Aquarienanalyse | `/assistant`; Capture-Branch für Bildanalyse | Zweite Capture-nahe KI-Option; Native hat vierer Action-Cluster plus zweiten Drei-Tab-Selector | **Einen KI-Workspace; Capture öffnet gezielt dessen Pflanzentab** | Web-Gates sind vorhanden. Native verletzt die Vorgabe „genau ein Tool-Selector“ und kann strukturierte Evidenz nicht darstellen. |
| Marketplace | [IA], [N], [P] | Partnerangebote je Shop ansehen | `/marketplace`, Shopdetail `/marketplace/shop/:id` | Alias `/shop`; Suchtreffer können Produkte neben Katalogdaten zeigen | **Shop-first beibehalten und `/shop` umleiten** | Trennung von Taxonomie und Partnerangeboten sowie kein behaupteter Checkout sind ein verifizierter Schutz. |
| Native Navigation | [N] `App.tsx:4133–4172`; [IA] Design Book/Vertragstest | Mobile Hauptebenen und Kontextarbeit | Sichtbar: Home, Entdecken, Community, Profil | Web hat sechs Primäraufgaben; veralteter Test sucht sechs Native Labels nur als Source-Strings | **Vier-Tab-Modell als maßgeblich dokumentieren; Kontextleiste definieren** | Das spätere Native-Design-Book stützt vier Home-Tabs, aber aktuelle Deep-Route-/Aktivzustände sind nicht wahrheitsgetreu genug. |

## 5. Priorisierte Risiken und empfohlene Phase-1-Folgearbeit

### P0 – Release-, Daten- und Vertrauensrisiken

| Kategorie | Risiko | Evidenz | Priorisierte Maßnahme |
|---|---|---|---|
| **Release-Qualität** | Repository-Gate ist rot: 6 fehlgeschlagene Assertions in vier Native-/Portal-Contract-Testdateien; Migration-Baseline-Verifier erwartet einen veralteten 38er-Stand. | [W] `pnpm test`; `scripts/verify-migration-baseline.mjs` | Vollsuite und Baseline-Verifier nachvollziehbar grün stellen; Migrationen zunächst auf Backup-/Restore-Kopie validieren, **nicht** die Ledger-Historie unbedacht ändern. Exakte Commit-/Command-Ausgaben im Release Record festhalten. |
| **Privacy / Legal** | Die drei getesteten konventionellen Datenschutz-/Impressumsrouten liefern 404; auf Login/Register keine sichtbaren Links. Ressourcenbeobachtung zeigte Google Fonts, OSM und `manus-analytics.com/api/send`; Payload, Consent und Rechtmäßigkeit wurden nicht geprüft. | [P] anonyme Routensicht- und Ressourcenprüfung | Öffentliche, global verlinkte Datenschutz- und Anbieterinformationen bereitstellen, insbesondere Login/Register; dokumentierte Drittparteien, Speicherung/Cookies, Rechte und authentifizierte Datenkontrollen abdecken. Rechtliche Bewertung bleibt außerhalb dieses Audits. |
| **Privacy / Auth** | Login erklärt E-Mail-Sign-in als noch im Aufbau, zeigt aber aktivierte Pflichtfelder und einen aktivierten Anmelden-Button. Form ist im DOM `GET /login`; JS-Interception wurde nicht ausgelöst. | [P] DOM-Inspektion ohne Submit | Bis zur Funktionsfähigkeit deaktivieren oder klar als nicht verfügbar kennzeichnen; in sicherer Testumgebung verifizieren, dass Credential-Flows POST verwenden und nie Anmeldedaten in URLs erscheinen. Kein bestätigter Credential-Leak. |
| **Datenintegrität (Native)** | Nach erfolgreichem `observations.create` und fehlgeschlagenem Bildupload kann die neue `observationId` verloren gehen. Ein Retrying kann erneut anlegen/konfligieren statt nur Bild hochzuladen. | [N] `observationOutbox.ts:104–139` | Neue ID vor Bildupload persistent speichern, in Fehlerpfad erhalten und nur den Bildschritt wiederholen. Regressionstests für Retry, Offline, Konflikt und keine Duplikate ergänzen. |
| **Datenwahrheit (Native)** | Direct Home→Realm kann ungeladene/stale `publicObservationRows` mit hartem `BEREIT` zeigen. | [N] `App.tsx:600–639,1482–1527` | Pro Realm laden/abgleichen; „Bereit“ nur nach erfolgreicher aktueller Antwort zeigen; Lade-, Fehler- und Leerzustände testen. |

### P1 – Accessibility, Performance und nutzerkritische UX

| Kategorie | Risiko | Evidenz | Priorisierte Maßnahme |
|---|---|---|---|
| **Accessibility** | `maximum-scale=1` verhindert Pinch-Zoom. Web-Iconbuttons sind 38×38 px; Native enthält u. a. 27-, 33- und 36-px-Controls. Es gibt keine globale CSS-Reduced-Motion-Regel; Native hat keine nachgewiesene Reduced-Motion-, Dynamic-Type-/Kontrastbehandlung. Viele informative Bilder haben leere Alt-Texte; wiederverwendbare Native Pressables oft keine explizite Rolle/Bezeichnung/Zustand. | [W] `index.html`, `index.css`; [N] `App.tsx`/Styles; [P] Explore | Zoombegrenzung entfernen; wirksame Ziele möglichst mindestens 44 px; globale Reduced-Motion-Strategie; informationshaltige Bilder einzeln mit passenden Alternativtexten entscheiden; Roles/Labels/Hints/States und Modal-Fokus auf Native ergänzen. Keyboard-, Screenreader-, TalkBack-, Large-Text- und Kontrasttests durchführen. |
| **Accessibility** | Öffentliche Explore-Seite hat Landmarken und benannte Navigation/Karte, aber keinen gefundenen Skip-to-main-Link. | [P] anonyme Renderprüfung | Sichtbaren Keyboard-Skip-Link hinzufügen und Header, Profilmenü, Karte und Listenalternative per Tastatur/Screenreader testen. |
| **Performance** | Erfolgreicher Build mit 1.641,96 kB Main-JS (455,86 kB gzip), 960,60 kB HabitatBuilder (257,15 kB gzip), 429,15 kB CSS (77,74 kB gzip), 370,02 kB HTML (106,10 kB gzip); Vite warnt bei Chunks >500 kB. Explore lud im Sandbox-Browser u. a. ca. 451 kB transferiertes JS / 1,64 MB dekodiert, CSS, Fonts, Bilder, Analytics und OSM-Tiles. | [W] Build; [P] anonyme Laufzeitbeobachtung | Main-Bundle profilieren, seltene Admin-/Live-/Assistant-/Map-Abhängigkeiten gezielt splitten, Rollup-Chunking und Budgets definieren, globales CSS sowie responsive/lazy Images prüfen. Reale Mobile-Netze und Core Web Vitals messen; Sandbox-Zeiten sind keine Produktions-CWV. |
| **Performance (Native)** | Android deaktiviert Full-Page-Blur und reduziert einige Effekte, doch wiederverwendbare Listen-/Action-Stile besitzen noch harte Shadows/Elevation bis 8. | [N] `App.tsx` und Styles | Wiederholte Elevation/Shadows durch adaptive Tokens führen; auf Android minimale Tiefe ohne Glow pro Zeile, QA auf Low-End-Android. |
| **UX / IA** | Karte ist global ein `/explore#map`-Anker und zugleich Realm-Modul; Explore ist eine lange Mischfläche. | [W], [IA], [P] | Dedizierte Kartenroute und map-first, filter-/listenfähiger Modus; Realm als gefilterte Vorschau mit klarer Übergabe. Responsive QA bei 320, 390, 412, 768 und 1280 px. |
| **UX / IA** | Capture, Katalog/Suche, Profileinstellungen, Routenaliases und Post-Querylinks sind semantisch bzw. technisch doppelt/unklar. | [W], [IA] | Matrix-Entscheidungen aus Abschnitt 4 als kanonische Routen-/Labelpolitik beschließen; `/community/post/:id` statt `?post=` nutzen; Alias-Routen nur als Kompatibilitätsredirect behandeln. |
| **UX / Datenwahrheit (Native)** | Leere/geschützte Karten verwenden Aquarium-/Realm-Stockbilder als Kartenfläche, obwohl keine echten Kartendaten vorhanden sind. | [N] `App.tsx:1473,1525` | Bildbasierte Pseudo-Karte durch geschützten Leer-/Map-Fehlerzustand ersetzen; Liste bleibt unabhängig und autoritativ. |
| **UX / KI (Native)** | Zwei Toolselector und unstrukturierte Assistant-Antworten verhindern die geforderte Darstellung von Kandidaten, Konfidenz, Merkmalen, Quellen/Reasoning und Zweitprüfung. | [N] `App.tsx:1532–2172`, `api.ts:249–259` | Einen Drei-Optionen-Selector festlegen und vor einem Paritätsanspruch strukturiertes Ergebnisformat mit Backend verhandeln. |

### P2 – Konsistenz und Wartbarkeit

- **Native Contract:** Shared-Zod-Contract am API-Rand verwenden, Version und Error-Codes validieren, retryable/offline/locked/error zentral mappen und Kompatibilität mit tRPC-Antworten testen.
- **Route-Fallbacks:** Unbekannte `world`-/`flow`-Werte in einen expliziten Invalid-/NotFound-Zustand überführen; Deep Links anschließend prüfen.
- **Kategorieeigentümerschaft:** Realm-Hintergründe/Iconografie trennen, Terraristik-Catalog-Typ/-Detailrouting vervollständigen und Home-Ton nicht als universelle Realm-Identität verwenden.
- **Unbenutzter Web-Code:** `ComponentShowcase.tsx`, `LeafCore.tsx`, `LiveSensorStrip.tsx` und `ManusDialog.tsx` haben keine externen Client-Imports bzw. keinen registrierten Routeinsatz. Entweder entfernen oder bewusst integrieren, damit keine irreführende Wartungsoberfläche bleibt.
- **Statusmatrix:** Eine datierte, nach Checkpoint erneuerte Matrix „vorhanden / vorbereitet / geplant / unklar / fehlt“ pflegen, um historische Design-/Auditkonflikte zu vermeiden.

## 6. Positive Kontrollpunkte, die erhalten bleiben sollen

- **Datenschutzorientierte Kartenlogik:** keine präzisen privaten Orte in öffentlicher Karte/Liste; öffentliche Pins nur nach entsprechender Freigabe generalisierter Lage.
- **Ehrliche Integrationszustände:** Live- und Smart-Device-Funktionen nicht als aktiv vermarkten, solange Media-Origin, Vendor-OAuth/Webhooks und End-to-End-Tests fehlen.
- **Serverseitige Sicherheitsgrenzen:** objekt-autorisierter Medienzugriff, serverseitige Rollenprüfung, Consent-Gates, Same-Origin-Mutationsschutz und datensparsame Readiness-Ausgaben als Regressionsanker bewahren.
- **Marketplace-Trennung:** Werbung, Provider, Partnerverantwortung und fehlender BlackWaterLeaf-Checkout bleiben sichtbar; Partnerangebote nicht als Katalogdatensätze ausgeben.
- **Betriebs- und Feedbackzustände:** Fokusoutline, `aria-live`/Statusfeedback, Offline-/Server-/DB-Banner sowie Lade-/Fehler-/Leer-/Auth-Zustände sind eine belastbare Basis.

## 7. Nicht verfügbare Evidenz und Auditgrenzen

Folgendes wurde **nicht** verifiziert und darf aus diesem Bericht nicht abgeleitet werden:

1. Geheimniswerte, aktive Produktionskonfigurationen, Datenbankinhalt/-provenienz, Migrationsdurchführung in Produktion sowie Backup-/Restore-Sicherheit.
2. SMTP/Resend und tatsächliche E-Mail-Zustellung, Session- und Berechtigungsverhalten nach Login, Consent-Widerruf, Export/Löschung, Upload-Validierung, Kaufinteresse-Verarbeitung oder serverseitige Autorisierung unter authentifizierten Konten.
3. Forge-/Media-Readiness, externe API-Verfügbarkeit/Kontingente, HTTPS-Media-Origin, Herstellerintegration sowie externe Providerverträge.
4. Öffentliche Reachability von Health/Readiness, Vollständigkeit des Cookie-/Storage-Inventars, Analytics-Payload/Consent, Vulnerability-Scan, Lasttest, RUM oder echte Core Web Vitals.
5. Live-Tests bei kleinen Viewports, Tastatur-only, Screenreader, Farbkonstrast, Reduced Motion sowie vollständige Assistive-Technology-Konformität. Die Native-Staging-Prüfung ist kein unabhängiger Beleg für das veröffentlichte Web.
6. Eine möglicherweise vorhandene, aber nicht öffentlich verlinkte oder nur authentifiziert sichtbare Datenschutz-/Legal-Seite.

## 8. Phase-1-Entscheidungsfolge

1. **Release-Gates schließen:** Baseline-Verifier und vollständige Testsuite grün; Native Outbox- und Realm-Statusfehler zuerst beheben und regressionssichern.
2. **Öffentliches Vertrauen schließen:** Login-Zustand sicher behandeln sowie öffentlich verlinkte Datenschutz-/Anbieterinformationen bereitstellen; beobachtete Drittressourcen und Consent fachlich prüfen.
3. **Informationsarchitektur beschließen:** Kanonische Karte, Capture-Hub, Suche versus Katalog, Community-Detailroute, Management-Hub und Web-/Native-Navigationsparität verbindlich festlegen.
4. **A11y- und Performance-Slice:** Zoom, Zielgrößen, Motion, Alternativtexte/semantische Controls, Bundle-/Map-Optimierung und reale Geräte-/Assistive-Technology-QA mit messbaren Budgets durchführen.
5. **Externe Integrationen erst nach End-to-End-Nachweis hochstufen:** Live, Smart Devices und alle produktionsabhängigen Provider bleiben bis dahin „vorbereitet“ bzw. „unklar“.
