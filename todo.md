# BlackwaterLeaf – TODO

## Übernommen aus ZIP (vorhanden & lauffähig)
- [x] Datenbankschema (11 Tabellen) migriert
- [x] Auth (Manus OAuth + Session)
- [x] AppLayout (Sidebar Desktop + Bottom-Nav Mobile)
- [x] Community-Feed (Posts, Likes, Kommentare, Kategorie-Filter)
- [x] Pflanzenprofile (Pflegeparameter, Foto-Timeline, KI-Button, CRUD)
- [x] Aquarienprofile (Wasserwerte, Ereignisprotokoll, Foto-Timeline, KI-Button)
- [x] KI-Assistent (eigenständig + kontextuell, Historie)
- [x] Entdecken (Suche, Filter)
- [x] Benachrichtigungen
- [x] Nutzerprofil
- [x] Kamera (CameraCapture + ImageUpload)
- [x] PWA (manifest, sw, install prompt)
- [x] TypeScript 0 Fehler, 11 Vitest-Tests grün

## Phase A: Feed-Kategorien & Polish
- [x] Feed-Kategorien an Vorgabe anpassen: Tipps, Fragen, Showcase, Marktplatz (zusätzlich Allgemein)
- [x] Marktplatz-Kategorie im Feed (Grundlage für späteren Marktplatz)
- [x] Premium-Polish: vorhandenes Dark-Theme beibehalten

## Phase B: Wissensdatenbank
- [x] Schema: knowledge_articles
- [x] Router: knowledge.list / get
- [x] Seed: 5 Artikel (Aquaristik, Aquascaping, Channa, Schwarzwasser, Zimmerpflanzen)
- [x] Seite /knowledge (Liste + Kategorien) und /knowledge/:slug (Detail)
- [x] Nav-Eintrag "Wissen"

## Phase C: Pflanzenbestimmung per Foto
- [x] Router: ai.identify (Bild -> LLM Vision -> strukturierte Bestimmung)
- [x] UI: Foto/Kamera -> Bestimmung (Name, wiss. Name, Pflege, Konfidenz, Alternativen)
- [x] Einbindung im KI-Assistenten (Tab "Bestimmen")

## Phase D: Discover-Hub erweitern
- [x] Community Highlights (Trending-Beiträge, aktive Mitglieder)
- [x] Trending / Neue Pflanzen & Aquarien
- [x] BlackwaterLeaf Wissen (empfohlene Artikel)
- [x] Wochen-Challenge-Banner

## Phase E: Gamification
- [x] Schema: user_stats, badges, user_badges, challenges
- [x] Router: gamification.me / checkIn / leaderboard / badges
- [x] Level-System (Anfänger, Pflanzenfreund, Sammler, Experte, Legende)
- [x] Abzeichen-System + Anzeige (Ranking-Seite)
- [x] Tägliche Login-Belohnung + Streak
- [x] Wöchentliche Challenge (Anzeige)
- [x] XP/Badges an echte Aktionen gekoppelt (Post, Pflanze, Aquarium, Bestimmung)

## Phase F: Qualität & Abschluss
- [x] PWA-Assets vorhanden (Icon/Splash, Shortcuts Feed + KI)
- [x] TypeScript 0 Fehler
- [x] Vitest erweitert (15 Tests grün)
- [x] Checkpoint + Auslieferung

## Phase G: Folgewünsche (Nutzer)
- [x] Profil bearbeiten zuverlässig reparieren (updateProfile + uploadAvatar testen)
- [x] KI-Korrektur: Nutzer kann KI-Antwort/Bestimmung als falsch markieren und korrigieren
- [x] Korrekturen speichern (Tabelle ai_corrections) und der KI als Community-Fakten zuführen
- [x] Korrigierte Fakten im KI-Kontext nutzen (faktenbasiert statt generisch) – getCommunityFactsBlock injiziert freigegebene Korrekturen mit Vorrang in Chat + Bestimmung

## Phase L: SEO-Fixes
- [x] /profile/:id – H1 + H2 hinzugefügt (Name als H1, "Sammlung & Beiträge" als H2)
- [x] /plants – H2 hinzugefügt (immer sichtbar im Header)

## Phase H: Branding (Logos vom Nutzer)
- [x] Rundes BL-Emblem als App-Icon/Favicon (PWA-Manifest, Apple-Touch-Icon)
- [x] Horizontales Banner-Logo im Header (Sidebar/Topbar)
- [x] Logos auf Landing/Login-Seite einbinden


## Phase I: Benachrichtigungen & Branding (aktuell)
- [x] In-App-Benachrichtigungen: Likes & Kommentare verdrahtet
- [x] Badge-Vergabe mit Benachrichtigungen verdrahten
- [x] AI-Korrektur-Events als Benachrichtigungen speichern
- [x] Benachrichtigungs-Glocke im Sidebar mit Badge (in AppLayout)
- [x] BL-Emblem als App-Icon/Favicon (PWA-Manifest, Header, Sidebar)
- [x] BL-Banner (horizontal) in Header/Landing einbinden
- [x] Finaler Checkpoint

## Phase J: Design-Overhaul + Save-to-Plants
- [x] Premium-Farbsystem: Tiefschwarz + Dunkelgrün + Gold/Beige-Akzente in index.css
- [x] Playfair Display für alle Überschriften, Inter für Fließtext (Google Fonts)
- [x] Karten mit Tiefe: subtile Gradienten, Glasmorphismus-Elemente, bessere Schatten
- [x] AppLayout: elegantere Sidebar (Gold-Akzente, bessere Icons, Profil-Bereich)
- [x] Feed-Seite: Premium-Karten, bessere Post-Darstellung
- [x] KI-Seite: Premium-Redesign (Chat + Bestimmen)
- [x] „Als Pflanze speichern"-Button nach Bestimmungsergebnis
- [x] Direkte Weiterleitung zum neuen Pflanzenprofil nach dem Speichern

## Phase K: Channa-Bereich
- [x] Channa-Artprofile als Wissensartikel in der Datenbank anlegen (6 neue Arten: andrao, bleheri, gachua, pulchra, asiatica, micropeltes)
- [x] Channa-Kategorie-Filter in der Wissensdatenbank (bereits vorhanden, Artikel erscheinen automatisch)

## Phase M: Showcase Video + Channa-KI + Bild-Fehlerprüfung
- [x] Showcase/Feed: Video-Upload nach S3 (Datei vom Gerät, bis 25MB)
- [x] Video-Player in Feed-Posts (Wiedergabe, Controls)
- [x] Eigene Channa-KI: spezialisierter Modus (Channa-Toggle), nutzt Channa-Wissensartikel als Kontext
- [x] Kamera/Bild-Fehlerprüfung beim Upload (Format, Größe, Auflösung, Helligkeit, Unschärfe)
- [x] TypeScript-Check + Tests + Checkpoint

## SEO-Verbesserungen (Reichweite Deutschland)
- [x] robots.txt im Projekt: Crawling erlauben + Sitemap-Verweis (überschreibt Host-Default Disallow:/)
- [x] sitemap.xml mit allen öffentlichen Seiten
- [x] index.html erweitern: robots(index,follow), og:locale de_DE, og:url, og:site_name, twitter card
- [x] JSON-LD strukturierte Daten (Organization + WebSite/SearchAction)
- [x] Verifizieren: robots.txt & sitemap.xml korrekt ausgeliefert (dev)

## React Helmet (dynamische Meta-Tags pro Seite)
- [x] react-helmet-async installieren + HelmetProvider in main.tsx
- [x] Wiederverwendbare <Seo>-Komponente (title, description, canonical, og, twitter, optional JSON-LD)
- [x] Wissensartikel-Detailseite: dynamische Meta aus Artikel (title/excerpt/slug) + Article JSON-LD
- [x] Hauptseiten mit eigenen Meta versehen (Home, Feed, Entdecken, Wissen-Übersicht, Pflanzen, Aquarien, Ranking, KI)
- [x] Verifizieren: Titel/Description ändern sich pro Route

## Phase N: Wissensdatenbank-Erweiterung + Word-Master + Scroll-Bug
- [x] Master-Word-Dokument bereinigt (Duplikate entfernt, kurze Steckbriefe ersetzt durch 2-3-Seiten-Profile)
- [x] App-Wissensdatenbank erweitert: 17 Channa-Artprofile + 7 Pflanzenprofile (jetzt 29 Artikel)
- [x] react-helmet-async + <Seo>-Komponente (dynamische Meta pro Seite, Article JSON-LD)
- [x] Doppelte Meta-Tags aus index.html entfernt (Helmet ist alleinige Quelle)
- [x] KI-Assistent: Eingabeleiste/Upload wird auf Mobil von Bottom-Nav verdeckt (bl-ai-shell, fullHeight prop)
- [x] Feed-Composer (Bild/Video-Upload): unterer Bereich nicht erreichbar (bl-main-pad)
- [x] PlantIdentify (Bestimmen): unterer Bereich/Button verdeckt (bl-main-pad)
- [x] Plant/Aquarium-Create: padding-bottom fuer Bottom-Nav fehlt (bl-main-pad)
- [x] Globaler mobiler Bottom-Abstand fuer fixierte Navigation (bl-main-pad utility)


## Phase O: Monstera & Alocasia Expansion (aktuell)
- [x] Botanische Recherche: 10 Monstera + 10 Alocasia Arten (zertifizierte Quellen: Penn State Extension, NC State, Missouri Botanical Garden, wissenschaftliche Papers)
- [x] JSON-Datenstruktur: 20 Pflanzenprofile mit Blattmerkmalen, Pflegeanforderungen, Wachstum, Vermehrung, Toxizität, Besonderheiten
- [x] Word-Dokument: Master-Wissensdatenbank erweitert (2-3 Seiten pro Art, Tabellen, Formatierung)
- [x] Datenbankseeding: Seed-Skript erstellt und ausgeführt (20 neue Artikel in knowledge_articles)
- [x] Gesamtanzahl Wissensartikel: 49 (29 ursprüngliche + 20 neue)
- [x] Vitest-Tests: 10 neue Tests für Knowledge-Artikel (alle grün)
- [x] App-Verifikation: Neue Monstera/Alocasia Profile in Knowledge-Sektion sichtbar
- [x] TypeScript 0 Fehler, 25 Tests grün


## Phase P: Homepage SEO-Optimierung
- [x] Title reduziert: 65 → 54 Zeichen (Ziel: 30-60) ✓
- [x] Description reduziert: 237 → 155 Zeichen (Ziel: 50-160) ✓
- [x] Keywords fokussiert: 13 → 4 Keywords (Aquaristik, Zimmerpflanzen, Community, Aquascaping) ✓
- [x] Alle SEO-Checks bestanden


## Phase Q: Knowledge-Seite Umstrukturierung (Genus-basiert)
- [x] Datenbankschema: genus Spalte zu knowledge_articles hinzugefuegt
- [x] Bestehende Artikel: Monstera, Alocasia, Philodendron automatisch kategorisiert
- [x] Router-Procedure: knowledge.list mit genus-Filter erweitert
- [x] UI-Redesign: Genus-Filter-Buttons unter Kategorie-Tabs
- [x] Kategorie umbenannt: Zimmerpflanzen zu Alocasia
- [x] Benutzer koennen per Button zwischen Gattungen wechseln
- [x] Alle 25 Tests gruen, TypeScript 0 Fehler


## Phase R: Genus-Filter mit Thumbnail-Bildern
- [x] Drei botanische Thumbnail-Bilder generiert (Alocasia, Monstera, Philodendron)
- [x] GENUS_THUMBNAILS Mapping in Knowledge.tsx hinzugefuegt
- [x] Genus-Filter-Buttons mit Bildern aktualisiert (6x6px Thumbnails)
- [x] Responsive Button-Layout mit flexbox
- [x] Alle 25 Tests gruen, TypeScript 0 Fehler


## Phase S: Datenbankfix - Genus-Werte korrekt eingetragen
- [x] Alle Houseplant-Artikel mit korrekten Gattungen aktualisiert
- [x] Alocasia-Artikel: 10 Artikel mit genus='Alocasia'
- [x] Monstera-Artikel: 10 Artikel mit genus='Monstera'
- [x] Philodendron/Efeutute-Artikel: mit genus='Philodendron'
- [x] Sonstige Pflanzen: mit genus='Sonstige'
- [x] Alle 25 Tests gruen nach Update


## Phase T: App-Login-Fix (Bearer) + Domain + Download-Landingpage (aktuell)
- [x] Backend: authenticateRequest akzeptiert Session-Token auch per Authorization: Bearer (abwaertskompatibel zum Cookie)
- [x] Backend: neue Route /api/oauth/app-callback (platform=app) liefert Token per Deep-Link blackwaterleaf://auth?token=... (live/published)
- [x] App: API-Client speichert Token (AsyncStorage) + sendet Bearer-Header; AuthContext Deep-Link-Login
- [x] App: app.json Android intentFilter fuer blackwaterleaf://auth
- [x] Domain-Diagnose: Webador A-Records 104.18.x entfernt (Endlosschleife); apex zeigt jetzt 35.204.150.5
- [x] Landingpage: Download-Sektion "HOL DIR DIE APP" (APK-Direktdownload, Google-Play "bald", Handy-Mock, PC-Hinweis)
- [x] Landingpage: Nav-Link "App laden" + Hero-CTA "App herunterladen" -> #download
- [x] TypeScript 0 Fehler, 37 Tests gruen
- [x] Neuer APK-Build bewusst NACH Domain-Stabilisierung geplant (Nutzerwunsch: erst DNS abwarten) -> wird auf Freigabe des Nutzers gebaut

## Phase U: Werbe-/Promo-System fuer externe Accounts (aktuell)
- [x] DB: Tabelle featured_accounts (name, tagline, platform, url, imageUrl/Key, showOnHome, showInCommunity, active, sortOrder, isPaid)
- [x] DB: users um Social-Links erweitert (socialInstagram/Tiktok/Youtube/Facebook/Website)
- [x] Backend: featured-Router (listHome, listCommunity, listAll, create, update, remove, uploadImage) + Admin-Guard
- [x] Backend: users.updateProfile speichert Social-Links; getProfile liefert sie zurueck
- [x] App: FeaturedHero (Account des Tages) auf Startseite
- [x] App: FeaturedStrip (Empfohlene Accounts) oben im Community-Feed
- [x] App: AdminFeaturedScreen (Anlegen/Bearbeiten/Loeschen, Bild-Upload, Plaetze, Reihenfolge, aktiv/bezahlt) + Verlinkung im Admin-Dashboard
- [x] App: Profil-Bearbeiten um Instagram/TikTok/YouTube erweitert
- [x] App: Profil-Sektion KONTAKT (E-Mail BlackwaterLeaf@gmail.com + Instagram @blackwaterleaf)
- [x] TypeScript App+Backend 0 Fehler, Metro-Bundle ok, 41 Tests gruen
- [x] Stufe 2 (später): Bezahl-/Buchungsflow für fremde Werbekunden (Stripe) - bewusst zurückgestellt bis Nutzer-Freigabe

## Phase Play-Store: Rechtsseiten & Store-Assets
- [x] Rechtsseiten: LegalLayout, Impressum, Datenschutz, Nutzungsbedingungen (AGB)
- [x] Routen /impressum /datenschutz /agb /nutzungsbedingungen in App.tsx
- [x] Footer-Links in Home.tsx auf echte Rechtsseiten umgestellt
- [x] TypeScript 0 Fehler
- [x] Checkpoint für Rechtsseiten speichern (Version 0e2f396a)
- [x] Play-Store Feature-Grafik 1024x500
- [x] Play-Store App-Icon 512x512
- [x] Screenshots aufbereitet (8 Stück, 1080x2280, Store-Reihenfolge)
- [x] Play-Store-Upload-Anleitung finalisiert

## Phase Play-Store-Upgrade: Web-App ↔ App Synchronisation
- [x] Web-App veröffentlichen (Publish-Button) – Auto-Publish aktiv, jeder Checkpoint wird automatisch veröffentlicht
- [x] Moderatoren-Verwaltung auf Web-App bauen (Moderatoren-Badge, Dashboard unter /moderator, Melde-Queue)
- [x] Admin-Panel für dich bauen (/admin: Statistiken, Nutzer-Verwaltung, Audit-Log)
- [x] KI-Bestimmungs-Review-System (/ai-review: Pending/Approved/Rejected, Moderatoren bestätigen)
- [x] Design/Navigation Web-App ↔ App synchronisieren (Moderatoren/Admin-Links im Dropdown)
- [x] Checkpoint speichern (Version d21dcbf7)

## Phase V: Web-App Seiten pixel-genau nach Native App umbauen
- [x] Entdecken-Seite (Discover.tsx): Hero + 4 Kategorien + Account des Tages + Feature-Karten + Warum-Grid
- [x] Wissen-Seite (Knowledge.tsx): pixel-genau nach Native App umbauen
- [x] Markt-Seite: Route /marketplace anlegen + Komponente bauen
- [x] KI-Seite (AiAssistant): pixel-genau nach Native App umbauen
- [x] Community/Feed-Seite: pixel-genau nach Native App umbauen
- [x] Profil-Seite: pixel-genau nach Native App umbauen

## Phase W: Terminologie-Update "Pflanzen" → "Botanik"
- [x] Discover.tsx: Kategorie-Button "Pflanzen" → "Botanik" (href /plants bleibt)
- [x] AppLayout / Bottom-Nav: Falls "Pflanzen" als Tab-Label vorkommt → "Botanik"
- [x] Home.tsx: allgemeine "Pflanzen"-Erwähnungen → "Botanik" (außer "Pflanzensammlung", "Pflanzenpflege")
- [x] SEO-Texte (Seo.tsx, SeoEnhanced.tsx): "Aquaristik & Pflanzen" → "Aquaristik & Botanik"
- [x] AiAssistant.tsx: "Pflanzen & Aquaristik" → "Botanik & Aquaristik" in Titeln/Subtiteln
- [x] Feed.tsx: SEO-Titel "Aquaristik & Pflanzen" → "Aquaristik & Botanik"
- [x] Knowledge.tsx: SEO-Titel "Channa & Pflanzen" → "Channa & Botanik"
- [x] ExpertVerification.tsx + ReputationSystem.tsx: 'Pflanzen' → 'Botanik' in Fachgebiet-Labels
- [x] Plants.tsx: Seiten-Titel "Pflanzen – Sammlung" → "Botanik – Sammlung"
- [x] Profile.tsx: Tab-Label "Pflanzen" → "Botanik"; Interessen-Default "Pflanzen" → "Botanik"

## Phase X: oklch → Premium-rgba Migration (ABGESCHLOSSEN)
- [x] Feed.tsx: oklch vollständig migriert
- [x] Profile.tsx: oklch vollständig migriert
- [x] AppLayout.tsx: oklch vollständig migriert
- [x] Knowledge.tsx: oklch vollständig migriert
- [x] AiAssistant.tsx: oklch vollständig migriert
- [x] Marketplace.tsx: oklch vollständig migriert
- [x] AdminPanel.tsx: oklch vollständig migriert (stat.highlight Sonderfall)
- [x] AiIdentificationReview.tsx: oklch vollständig migriert
- [x] Aquariums.tsx: oklch vollständig migriert
- [x] Home.tsx: oklch vollständig migriert
- [x] ModeratorDashboard.tsx: oklch vollständig migriert
- [x] Plants.tsx: oklch vollständig migriert
- [x] Ranking.tsx: oklch vollständig migriert
- [x] BottomNav.tsx: oklch vollständig migriert
- [x] Legal-Seiten (Datenschutz, Impressum, Nutzungsbedingungen, LegalLayout): oklch migriert
- [x] Komponenten (PlantIdentify, Breadcrumb, InstantSearch, RelatedArticles, AccessibilityProvider, ExpertVerification, ReputationSystem): oklch migriert
- [x] Finale Prüfung: 0 oklch-Vorkommen in client/src/
- [x] TypeScript 0 Fehler

## Phase Y: Visuelle Qualitätsprüfung + Premium-Design-Upgrade
- [x] Screenshots aller 6 Hauptseiten analysiert
- [x] AiAssistant.tsx: Empty-State mit Glassmorphism-Icon-Box, Premium-Glow, Suggestion-Karten mit Dot-Indikator
- [x] Knowledge.tsx: Header mit Premium-Hero-Banner (Gradient + Glow + Gold-Trennlinie + BookOpen-Icon)
- [x] Feed.tsx: Header mit Glassmorphism-Banner (Gradient + Glow + Dot-Indikator + FEED uppercase)
- [x] Profile.tsx: Stats-Karten mit abwechselnden Smaragd/Gold-Gradienten + Glassmorphism
- [x] AppLayout.tsx: TopNav mit Gold-Shimmer-Schatten + verstärktem Blur
- [x] BottomNav.tsx: Premium-Upgrade (aktiver Indikator oben, Glow, aktiver Hintergrund, Gold-Shimmer)
- [x] Marketplace.tsx: Tippfehler GEPÜFTE → GEPRÜFTE korrigiert
- [x] TypeScript 0 Fehler, alle Seiten visuell geprüft

## Phase Z: KI-Bestimmung Fix – Phase 1 (ABGESCHLOSSEN)
- [x] DB-Schema: taxonomy_species Tabelle erstellt (scientificName, cultivar, genus, family, commonNames, synonyms, keyFeatures, habitat, careLevel, light, water, source, verified)
- [x] DB-Schema: ai_hallucination_blacklist Tabelle erstellt (term, reason, correctAlternative, addedBy)
- [x] Migration ausgeführt und in DB angewendet
- [x] Taxonomie-Datenbank befüllt: 29 Alocasia, 17 Philodendron, 7 Monstera, 18 Aquarienpflanzen, 15 Channa (86 Einträge verifiziert)
- [x] Blacklist befüllt: Fredek Varigata, Fredek Variegata, Dragon's Tooth, Alocasia longiloba Silver, etc. (9 Einträge)
- [x] Post-Processing-Filter: checkBlacklist() nach LLM-Antwort
- [x] Whitelist-Check: checkTaxonomyWhitelist() gegen taxonomy_species (exakter Match + Genus-Match)
- [x] Neuer Confidence-Algorithmus: calculateValidatedConfidence() (+15 exakt, +5 Genus, -30 unbekannt, max 95 ohne exakten Match)
- [x] System-Prompt überarbeitet: Spezifische Blacklist-Regeln (Fredek Varigata, Dragon's Tooth), POWO/FishBase-Referenz
- [x] TypeScript 0 Fehler, 41 Tests grün
- [x] Checkpoint gespeichert

## Phase AA: KI-Bestimmung Fix – Phase 2

### Aufgabe 1: Multi-Image-Upload
- [ ] UI: 4 Upload-Slots (2x2 Grid Mobile) mit Labels (Blattoberseite, Blattunterseite, Stiel, Gesamtpflanze)
- [ ] Slot 1 = Pflicht (grüner Rahmen), Slots 2-4 = optional (gestrichelter Rahmen)
- [ ] Thumbnail-Preview nach Upload in jedem Slot
- [ ] Bestimmen-Button erst aktiv wenn mind. 1 Bild hochgeladen
- [x] Backend: Confidence-Bonus +3 pro zusätzlichem Bild (max +9)
- [x] Badge "Foto-Profi" wenn alle 4 Perspektiven hochgeladen

### Aufgabe 2: PlantNet API Integration
- [x] PlantNet API-Key als Secret (PLANTNET_API_KEY) einrichten
- [x] Backend: validateWithPlantNet() Funktion (parallel zu LLM)
- [x] Validierungs-Logik: gleich (+25), ähnlich (+10), unterschiedlich (-20)
- [x] Fallback wenn PlantNet nicht erreichbar

### Aufgabe 3: GBIF Referenzbilder
- [ ] Backend: getVerificationImages() via GBIF API (CC-BY/CC0 gefiltert)
- [ ] UI: Vergleichsbilder-Sektion nach Bestimmung (3-5 Fotos)
- [ ] Buttons: "Ja, stimmt!" / "Nein, sieht anders aus"

### Aufgabe 4: Feedback-Loop
- [ ] DB-Schema: verified_identifications + identification_corrections Tabellen
- [ ] Backend: confirmIdentification() + correctIdentification() Procedures
- [ ] Auto-Übernahme in Community-Fakten bei 3+ gleichen Korrekturen

### Aufgabe 5: Ergebnis-UI Redesign
- [ ] Glassmorphism-Card mit Score-Farben (Gold >80%, Emerald 60-79%, neutral <60%)
- [ ] Erkannte Merkmale als Mint-Bullets
- [ ] Vergleichsbilder-Sektion (GBIF)
- [ ] Feedback-Buttons "Stimmt das? Ja / Nein"
- [ ] Alternativen mit Prozentanzeige
- [ ] Link zu /botanik/:genus/:art
