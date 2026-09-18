# BlackWaterLeaf – Quellenintegration und Übernahmeentscheidungen

**Stichtag:** 16. September 2026
**Ziel:** Kontrollierte Überführung vorhandener Web- und Native-Stärken in eine neue, gemeinsame Stagingarchitektur.

## Quellenhierarchie

| Priorität | Quelle | Verbindlicher Nutzen | Nicht ungeprüft übernehmen |
|---:|---|---|---|
| 1 | `BlackWaterLeaf_EXPO_ERROR_DIAG/living-blackwater-system-spec.md` | Produktgrenze, Living-UI, zentrale Blattinteraktion, fünf Hauptbereiche, ehrliche Zustände und Trennung von Studio. | Keine ältere statische Kartenansicht. |
| 2 | `BlackWaterLeaf_EXPO_ERROR_DIAG/lib/native-observation-contract.ts` | Evidenzstatus, Naturwelten, private lokale Beobachtung und explizite Synchronisationszustände. | Zufallsbasierte lokale IDs werden nicht als serverseitige Identität verwendet. |
| 3 | `BlackWaterLeaf_EXPO_ERROR_DIAG/lib/blackwaterleaf-api-contracts.ts` | Serververifizierte Rollen, Kontostatus, Profilfelder und Nullwerttreue. | Der fest codierte Zustand „Datenbank nicht verbunden“ wird durch echte Laufzeitprüfung ersetzt. |
| 4 | `BlackwaterLeaf_ENTERPRISE_MASTER_UPDATE_20260916/01_web_app/blackwaterleaf-web/drizzle/schema.ts` | Nutzer, Pflanzen, Aquarien, Medien, Wissen, Community, Gruppen, Nachrichten und Moderation als vorhandene Domänenbasis. | Keine bestehende Tabelle wird als produktiv befüllt behauptet; fehlende Terraristik-, Consent- und Syncmodelle werden additiv ergänzt. |
| 5 | Vorhandene Webrouter und Sicherheitsmodule | Bewährte Ownership-, Sichtbarkeits-, Upload-, Rate-Limit-, Header- und Origin-Prüfung als Referenz. | Aktive KI-/PlantNet-Flows, pauschale öffentliche Abfragen und veraltete Sicherheitsannahmen werden nicht blind kopiert. |

## Übernahmeentscheidungen

Der neue V1-Vertrag in `shared/blackwaterleaf-contract-v1.ts` ist die alleinige gemeinsame Außengrenze für Web und Native. Datenbankzeilen werden vor Auslieferung in diese Typen übersetzt; interne Speicherfelder wie `storageKey`, Moderationsnotizen oder OAuth-IDs werden nicht an öffentliche Clients gegeben.

Die neue Webbasis verwendet die bereitgestellte Fullstack-Stagingumgebung mit React, Express, tRPC, MySQL, serverseitiger Authentifizierung und S3-kompatiblem Medienspeicher. Webador bleibt bis zur gesonderten Domainfreigabe die aktive Website. Der Browser und die Native-App greifen niemals direkt auf MySQL oder Speicher-Secrets zu.

| Domäne | Übernahme | Erweiterung beziehungsweise Korrektur |
|---|---|---|
| Konto und Rollen | `user`, `moderator`, `admin`; `active`, `suspended`, `banned`. | Locale, Einheitensystem, Profil-Sichtbarkeit und Einwilligungen werden serverseitig persistiert. Keine E-Mail-basierte Hochstufung. |
| Naturbeobachtungen | Pflanzen- und Aquariumdaten sowie Native-Evidenz-/Synczustände. | Gemeinsame Beobachtungstabelle mit `botany`, `aquarium`, `terrarium`, Client-ID, Revision und privater Voreinstellung. |
| Medien | Bestehende Eigentümer- und Speicherreferenzidee. | Einheitliche Medienmetadaten, signaturgeprüfte Bildtypen und Sichtbarkeit; keine Binärdaten in MySQL. |
| Wissen | Veröffentlichte Artikel und Taxonomie als Basis. | Locale, Quellenliste, Evidenzstatus und Veröffentlichungsstatus sind Pflicht für öffentliche Auslieferung. |
| Community | Beiträge, Kommentare und Moderationsrollen. | Öffentliche Auslieferung nur für sichtbare Inhalte aktiver Nutzer; keine künstlichen Zähler oder Seed-Beiträge. |
| Offline/Sync | Native `local_only`-Grundlage. | Idempotente Client-ID, Revision und Konfliktstatus werden Teil des Serververtrags. Ein Sync wird erst nach expliziter Clientaktion angestoßen. |
| KI | Nur UI-Platz und Policy-Zustand. | Keine aktive Modell- oder Anbieteranbindung, bis Anbieter, Kosten, Datenschutz und Quellenregeln ausdrücklich freigegeben sind. |

## Geprüfte Routerbefunde

Die tatsächliche Webrouter-Datei wurde für Konto, Pflanzen, Aquaristik, Community, Entdecken und den Beginn der KI-Fläche geprüft. Die früher dokumentierten Eigentumsprüfungen für Pflanzen- und Aquarium-Medien sowie die öffentliche Sichtbarkeitsprüfung für deren Einzelabfragen sind im Quellstand vorhanden. Diese Logik wird als Referenz verwendet, nicht blind kopiert.

| Befund im bestehenden Router | Entscheidung für V1 |
|---|---|
| Neue Pflanzen und Aquarien verwenden standardmäßig `isPublic: true`. | V1 verwendet für neue Beobachtungen verbindlich `private`; Veröffentlichung erfordert eine ausdrückliche Mutation. |
| Öffentliche Post- und Kommentarlisten prüfen keinen eigenen Veröffentlichungsstatus und filtern Autoren nicht nach aktivem Kontostatus. | V1 liefert nur `public`-Beiträge aktiver Autoren aus; Kommentare sind nur über einen sichtbaren Beitrag erreichbar. |
| Profilabfragen geben Rollen öffentlich aus und besitzen keine eigene Profilsichtbarkeit. | V1 trennt öffentliches Profil von authentifizierten Kontodaten und liefert Rollen nur soweit fachlich erforderlich. |
| Communityaktionen erhöhen denormalisierte Zähler unmittelbar. | V1 führt Reaktion und Zähleränderung atomar aus; es werden keine Zähler vorgetäuscht oder lokal erfunden. |
| Der bestehende KI-Router ruft bereits externe Modell- und Bestimmungsdienste auf. | Diese Router werden nicht übernommen; V1 liefert ausschließlich den Policy-Status `disabled_by_policy`, bis eine ausdrückliche Anbieter- und Kostenfreigabe vorliegt. |
| Gamification und automatisch vergebene Auszeichnungen sind an Schreibaktionen gekoppelt. | V1 übernimmt diese Seiteneffekte nicht, solange die dazugehörigen Produktregeln und realen Daten nicht freigegeben sind. |

## Ausdrücklich ausgeschlossene Altbestandteile

BlackWaterLeaf Studio, Sandbox-, Code- und Agentenfunktionen sind kein Bestandteil dieser Anwendung. Ebenso werden Gamification, bezahlte Promotion, Partnerauszahlungen und aktive KI-Korrekturpipelines nicht in V1 aktiviert, weil dafür keine vollständige Produkt-, Rechts-, Daten- und Kostenfreigabe vorliegt.

Eine Volltextprüfung des neuen Stagingprojekts ergab Studio-, Sandbox- oder Agentenbegriffe ausschließlich in diesem Ausschlussnachweis und im Paritätsvertrag. Es existieren keine Studio-Routen, Studio-Komponenten, Sandbox-Ausführung oder Agentenarbeitsbereiche im Anwendungscode.

## Abnahmeregel

Ein übernommener Bereich gilt erst als integriert, wenn sein V1-Vertrag, sein serverseitiger Berechtigungsweg, sein ehrlicher Leer-/Fehlerzustand und mindestens ein positiver sowie ein negativer Test existieren. Vorhandener Altcode allein ist kein Paritätsnachweis.
