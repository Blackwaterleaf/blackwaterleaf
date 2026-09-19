# BlackWaterLeaf Dateninventar, Zwecke und Schutzklassen

**Stand:** 19. September 2026  
**Status:** Technisch erfasst für AP-02; formale Freigabe durch Datenschutz, Security und Projektverantwortung steht aus.

## Schutzklassen

| Klasse | Regel |
|---|---|
| Öffentlich | Nur veröffentlichte Inhalte; keine exakten privaten Orte oder Kontodaten. |
| Geschützt | Angemeldete oder rollenberechtigte Fachfunktion. |
| Privat | Eigentümer und ausdrücklich autorisierte Personen. |
| Besonders schutzbedürftig | Standort, Credentials, Sessions, Bildoriginale, Moderationsfälle und Löschprozesse. |
| Beweisaufbewahrung | Minimaler, pseudonymisierter, befristeter Nachweis für Sicherheit, Recht oder Audit. |

## Datenlandkarte

| Bereich | Daten | Klasse | Zweck | Zugriff/Löschung |
|---|---|---|---|---|
| `users`, `user_roles` | Konto, Name, E-Mail, Rolle, Profil, grober Standort | Privat/besonders | Konto, Profil, Rollen | Eigentümer; AP-05/AP-12 |
| `local_credentials`, `local_auth_tokens` | Scrypt-Hash, E-Mail, gehashte Einmal-Token | Besonders | Lokale Anmeldung/Recovery | Auth-Service; Ablauf und AP-05 |
| Sessions/OAuth | Signierter Sitzungskontext | Besonders | Authentifizierung | Server; Widerruf AP-12 |
| Consenttabellen | Zweck, Policy-Version, Zustand, Ereignis | Privat/Beweis | Freigabe und Nachweis | Eigentümer/Review; Retention offen |
| `observations` | Beobachtung, Notiz, Metriken, Sichtbarkeit | Privat bis öffentlich | Naturbeobachtung | Eigentümer/Policy; AP-05/AP-14 |
| `media_assets`/Objektspeicher | Keys, Derivate, Dimensionen, Sichtbarkeit | Besonders | Avatar, Habitat, Beobachtung, Community, Produktbild | Objektbezogen; AP-03/AP-04/AP-05 |
| Habitate/Sensoren | Anlagen und Messwerte | Privat/besonders | Persönliche Anlagen und Verlauf | Eigentümer; AP-05 |
| `community_posts`, `post_comments`, `post_likes`, `user_blocks`, `user_follows` | Beiträge, Kommentare, Likes, Blocks, Follows | Geschützt bis öffentlich | Fachcommunity | Policy/Moderation; AP-07/AP-08 |
| `notifications` | Fach-, System- und Moderationshinweise | Privat | Benutzerkommunikation | Eigentümer; AP-05 |
| `moderation_logs`, `audit_ledger_entries`, `audit_ledger_heads` | Fälle, Gründe, Hashes, Akteure, Kette | Beweisaufbewahrung | Sicherheit und Integrität | Minimalrolle; AP-10 |
| `assistant_usage`, `ai_identification_corrections` | Nutzung, Modell, Korrekturstatus; keine Prompts/Bilder | Privat/Beweis | Kostenkontrolle und fachliche Korrektur | Review nach Aufgabe; AP-18 |
| `plant_taxa`, `aquarium_taxa`, `knowledge_articles` | Validierte Taxa und Quellen | Öffentlich | Katalog und Wissen | Öffentlich lesen, Redaktion schreiben |
| `partner_profiles`, `partner_products`, `partner_offer_events` und weitere `partner_*` | Händler, Angebote, Status, Handoff-Ereignisse | Geschützt bis öffentlich | Vermittlungsmarktplatz | Händler/Admin; AP-09/AP-16 |
| XP/Care/Saved/Challenges | Fortschritt, Aufgaben, Merkliste | Privat | Personalisierung | Eigentümer; AP-05 |

## Drittübermittlungen

| Empfänger | Minimierung | Zweck | Status |
|---|---|---|---|
| Pl@ntNet | Normalisierte Bestimmungsbilder und Fachkontext, keine Kontodaten | Pflanzen-Zweitprüfung | AP-18-Adapter erforderlich |
| Open-Meteo | Nur erforderliche gerundete Koordinaten, POST/no-store | Wetterkontext | AP-12 erforderlich |
| Manus Forge Storage | Objektbytes und signierte Operationen | Speicherung | AP-03/AP-04 erforderlich |
| Push-Anbieter | Push-Token und minimaler Ereigniskontext | Benachrichtigung | AP-15 erforderlich |

## Verbindliche Regeln bis zur Abnahme

1. Keine exakten Standorte, Tokens, E-Mails, Medien-URLs, KI-Eingaben oder Rohinhalte in Telemetrie, URLs oder Fehlermeldungen.
2. Neue Tabellen und Felder nur additiv nach AP-06.
3. Jeder neue Datenfluss wird vor Freigabe mit Zweck, Schutzklasse, Empfänger, Rolle und Löschweg ergänzt.
4. Risikoaktionen bleiben durch AP-01 serverseitig gesperrt.

## Offene formale Entscheidungen

Rechtsgrundlage und Retention je Datenklasse, Moderationsrollen, Provider-/Standortbewertung sowie Händlerdaten-Retention müssen vor den jeweiligen Folgepaketen bestätigt werden.
