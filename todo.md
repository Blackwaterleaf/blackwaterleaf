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
- [ ] Korrigierte Fakten im KI-Kontext nutzen (faktenbasiert statt generisch) – offen, Backend speichert Korrekturen bereits

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
