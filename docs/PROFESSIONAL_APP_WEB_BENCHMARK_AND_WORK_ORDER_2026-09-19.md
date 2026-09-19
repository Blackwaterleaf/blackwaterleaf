# BlackWaterLeaf: Professional-App-Web-Benchmark und Umsetzungsauftrag

**Berichtsdatum:** 19. September 2026  
**Autor:** Manus AI  
**Geltungsbereich:** BlackWaterLeaf Web-Baseline in `/home/ubuntu/blackwaterleaf-parity-staging` (read-only geprüft), mit Vergleich zu iNaturalist, Planta, Fishbrain, Instagram und Shopify Marketplace Connect. Dieser Auftrag beschreibt das Web-Produkt; er trifft keine Negativaussage über Funktionen, die ausschließlich im Expo-Client existieren könnten.

## Entscheidung in einem Satz

BlackWaterLeaf besitzt bereits eine solide Grundlage für private Habitate, explizite Veröffentlichungsfreigaben, Community-Posts, Rollen und Partnervermittlung. Der professionelle nächste Schritt ist **nicht** ein größerer Feed oder ein Checkout, sondern ein sicherer, zugänglicher Kernkreislauf aus *privatem Log/Beobachtung → nachvollziehbarer fachlicher Prüfung oder Pflegehandlung → kontrollierter Veröffentlichung → qualifizierter Rückmeldung*.

Die Reihenfolge ist entscheidend. Erst wenn Sichtbarkeit, Evidenz, Moderation, Benachrichtigungen, Barrierefreiheit und Ladezeit belastbar sind, sollten personalisierte Discovery, Karten-Discovery, Rankings und Commerce ausgebaut werden. Dieser Weg übernimmt die starken Muster der Benchmarks, ohne ihre risikoreichen Anreize zu kopieren: iNaturalists evidenzorientierte Bestimmung und Geoprivacy, Plantas handlungsorientierte Pflege, Fishbrains kontrollierte Sichtbarkeit pro Log und Instagram-artige Nutzerkontrollen. [1] [2] [3] [7] [13] [19] [21]

## 1. Auftrag, Evidenz und Priorisierungslogik

### 1.1 Produktziel und Abgrenzung

BlackWaterLeaf bedient drei fachlich unterschiedliche Realms: **Botanik, Aquaristik und Terraristik**. Das Produkt darf sie unter einer gemeinsamen Community-Oberfläche verbinden, muss jedoch private Anlagen, wissenschaftlich bzw. fachlich prüfbare Beobachtungen, Pflegeaufgaben und kommerzielle Angebote als unterschiedliche Objekte behandeln. Ein Foto einer Zimmerpflanze, ein Aquarienwert und eine Wildbeobachtung haben nicht dieselbe Datenschutz-, Evidenz- oder Veröffentlichungslogik.

Die Leitarchitektur lautet daher:

> **Privat ist der Ausgangspunkt. Veröffentlichung ist eine bewusste, verständliche und rückgängig zu machende Freigabe. KI ist eine Hypothese. Fachliche Zustimmung braucht sichtbare Evidenz. Commerce ist gekennzeichnet und nie ein fachlicher Wahrheitsbeleg.**

Diese Trennung folgt direkt aus dem iNaturalist-Modell, das Bestimmungen als begründbare, veränderbare Beiträge behandelt und Standortschutz nicht als absolute Sicherheitszusage darstellt. [1] [2] [3] Sie passt auch zu Fishbrains Wahl pro Fang zwischen exakter Öffentlichkeit, grober Gewässerangabe und privat sowie zu dessen Trennung zwischen persönlichem Log und Feed-Verteilung. [13] [14]

### 1.2 Evidenzbasis

Die externe Vergleichsbasis besteht aus den im Benchmark bereitgestellten, offiziell geprüften Produkt-, Hilfe-, Richtlinien- und Standardquellen. Aussagen zu BlackWaterLeafs aktuellem Zustand stammen aus einer read-only-Inspektion des Staging-Repositorys am 19.09.2026. Wichtige geprüfte Dateien sind `client/src/App.tsx`, `client/src/components/AppShell.tsx`, `client/src/pages/Community.tsx`, `client/src/pages/Profile.tsx`, `client/src/pages/Marketplace.tsx`, `client/src/components/Map.tsx`, `drizzle/schema.ts`, `server/routers/community.ts` und die zugehörigen Tests.

Die Repository-Inspektion belegt Struktur und Implementierungsabsicht, jedoch nicht vollautomatisch Laufzeitqualität, Sicherheit unter Last, mobile Parität oder rechtliche Konformität. Alle als **Verify** markierten Punkte erfordern deshalb gezielte Laufzeit-, Accessibility-, Sicherheits- oder Rechtsprüfung vor einer Release-Entscheidung.

### 1.3 Prioritäten

| Priorität | Bedeutung | Freigaberegel |
|---|---|---|
| **P0** | Sicherheits-, Datenschutz-, Zugänglichkeits- oder Kernhandlungsblocker. | Nicht mit einem breiten Community-, Karten- oder Commerce-Release überspringen. |
| **P1** | Hoher Nutzwert nach geschütztem Kern; erhöht Aktivierung, Wiederkehr und fachlichen Nutzen. | Nach P0 in produktionsfähigen, messbaren Inkrementen liefern. |
| **P2** | Qualitätssteigerung oder Ausbau, dessen Nutzen erst nach validierter Kernnutzung eintritt. | Nur umsetzen, wenn die P0/P1-Metriken und Betriebskapazität stabil sind. |
| **Nicht jetzt** | Hoher Komplexitäts-, Haftungs- oder Manipulationsaufwand ohne bewiesenen Kernnutzen. | Architektur vorbereiten, aber nicht als aktuelle Produktzusage oder Scope aufnehmen. |

## 2. Ist-Bild: Was die Web-Baseline bereits trägt

Die Baseline ist weiter als ein reines Konzept. Die App hat eine klare Fünf-Tab-Schale für **Home, Entdecken, Marktplatz, Community und Profil**, private Anlagen und Entwürfe, Rollen und Status auf dem Server, explizite Consent-Zwecke, einen Community-Feed, Likes, eine Comment-/Notification-Datenbasis, Partnerangebote mit Offenlegung sowie grundlegende Progressionsmechaniken. Die Web-Shell reagiert auf `prefers-reduced-motion`. Im Marktplatz werden externe Ziele als Werbung/Partnervermittlung ausgewiesen und mit `sponsored nofollow noopener` geöffnet. Diese Substanz soll weiterverwendet, nicht parallel ersetzt werden.

| Bereich | **Bestehend und nutzbar** | Professioneller Wert |
|---|---|---|
| UX und IA | Fünf erkennbare Hauptziele, zentraler Erstellen-Einstieg und realmbezogene Inhalte. | Solide Navigation, auf der eine klarere Kernhandlung aufgebaut werden kann. |
| Private Daten | Private Habitate, Entwürfe, `private/unlisted/public`-Sichtbarkeiten sowie versionierte Freigaben für Profil, Beobachtung, Community und Medienverarbeitung. | Gute Grundlage für Privacy-by-default. |
| Community | Öffentlicher Feed, Bildmedien, Likes, verschachtelbare Comment-Struktur im Vertrag, Rollen, Status und Audit-Fundament. | Ein belastbarer Startpunkt für fachlichen Austausch. |
| Benachrichtigungen | Empfängerbezogene In-App-Ereignisdaten, Unread Count und „einzeln/alle gelesen“-Operationen sind im Backend vorhanden. | Die Datenbasis für eine echte Inbox existiert. |
| Marktplatz | Partner-, Produkt-, Bild-, Platzierungs- und Einwilligungsmodell; Draft-to-Review-Ansatz; externe Vermittlung; Filter, Details und lokale Merkliste. | Glaubwürdiger, transparenter Partnerbereich statt fingierter Transaktion. |
| Moderation | Rollen, aktive/suspendierte/gesperrte Konten, Reports/Audit-Log-Struktur und serverseitige Inhaltsprüfung. | Governance-Fundament, das zu einem abgestuften Verfahren ausgebaut werden kann. |
| Performance | Bild-Lazy-Loading im Feed, Video-Metadaten-Preload, Service Worker/PWA-Assets und einzelne Code-Splitting-Ansätze. | Ausgangspunkt für messbare Budgets und kritischen Pfad. |

**Positive Produktentscheidung:** Der Marktplatz sollte bis auf Weiteres ausdrücklich eine **Vermittlungs- und Discovery-Oberfläche** bleiben. Der aktuelle Text macht transparent, dass BlackWaterLeaf nicht selbst verkauft. Das entspricht einer sauberen Trennung von Fachcommunity und Commerce. Shopify Marketplace Connect ist zwar ein nützliches Vorbild für Quellenhoheit, Statusketten und Händleroperationen, aber kein Argument, sofort einen eigenen Zahlungsfluss zu bauen. [25] [26] [27]

## 3. Statusregister: Bestehend, Verify, Must-have, Polish und Nicht jetzt

Die Tabelle ist die verbindliche Scope-Entscheidung. „Bestehend“ bedeutet: in der geprüften Web-Baseline vorhanden und wiederverwendbar. „Verify“ bedeutet: vor einer Produktbehauptung oder einem Rollout testen. „Must-have“ sind Lücken, die für eine professionelle Kernreise geschlossen werden müssen.

| Domäne | Bestehend | **Verify vor Claim/Release** | **Must-have-Gap** | Polish | Nicht jetzt |
|---|---|---|---|---|---|
| **UX / Kernreise** | Home, Realm-Ziele, Create-Menü und private Anlagen sind vorhanden. | Task Completion: von Start zu privatem Log/Beobachtung, Veröffentlichung und Rückmeldung auf Mobile/Web. | Eine sichtbare, immer erreichbare Hauptaktion „Beobachtung hinzufügen“ bzw. „Pflege erfassen“; keine leere Feed-Landung. **P0** | Kontextuelle Vorschläge und Shortcuts. **P2** | Vollautomatische, proaktive Journeys ohne Nutzersteuerung. |
| **Information Architecture** | Fünf Tabs und Profil-Unterseiten existieren. | Karten-, Care- und Notification-Priorität mit Tree Test und Card Sort prüfen. | `/notifications` als echtes Ziel; Bell nicht auf Community umleiten. Core-Aufgaben in Header und mobiler Navigation sichtbar machen. **P0** | Reichspezifische Subnavigation. **P2** | Zusätzliche globale Tabs für jede Einzelfunktion. |
| **Onboarding** | Interests und Experience Level sind Datenbasis; private Anlagen können angelegt werden. | Funnel, Abbruchgründe, Permission-Timing und Zeit bis zum ersten Nutzen messen. | Zielwahl → private erste Anlage/Beobachtung → Nutzenmoment → erst dann optionale Push-Freigabe. **P1** | Kontextuelle Wiedereinstiegs-Checkliste. **P2** | Alle Profil-, Standort- und Berechtigungsdaten vor erstem Nutzen erzwingen. |
| **Suche / Discovery** | Discover-Hub, Kategorieflächen und Marktplatzfilter sind vorhanden. | Relevanz, Nulltreffer, Filterpersistenz und Suchabbruch analysieren. | Einheitliche Suche über Taxa/Organismen, Beiträge, Gruppen, Personen, offene Hilfefälle und Produkte; serverseitige Filter und stabile Rücknavigation. **P1** | Saved Searches und Synonyme. **P2** | Black-box-Empfehlungsranking als Ersatz für Suche. |
| **KI-Vertrauen** | KI-Review-Route und KI-Consent sind vorhanden. | Konfidenzkalibrierung, Fehlerklassen, Datenweitergabe, Prompt-Injection/Abuse und Nutzerverständnis testen. | KI-Vorschlag als Hypothese mit Konfidenz, Quelle/Modellstand, Grenzen, editierbarer Taxon-Ebene und menschlicher Evidenzdiskussion. **P0** | Erklärbare Merkmalsmarkierung, Feedback-Datensatz. **P2** | „KI bestätigt Art/Pflege als Wahrheit“ oder autonome Veröffentlichung. |
| **Community / Post Actions** | Feed, Likes, Backend-Kommentare, Rollen und Audit-Fundament existieren. | Comment-Thread, Antwort, Notification und Deep Link Ende-zu-Ende prüfen. | In situ: Antworten, Speichern, Melden, Blockieren/Stummschalten, „nicht interessiert“, klare Community-Regeln und Report-Status. **P0** | Collections, Folgeempfehlungen. **P2** | Engagement-optimierte Viralmechaniken. |
| **Moderation** | Reports, Admin-/Moderationsbasis und Account-Status existieren. | Falschpositive, SLA, Eskalation, Einspruch, Log-Integrität und Abuse-Rate testen. | Sicherheitsberichte von fachlicher Uneinigkeit trennen; abgestufte, menschlich überprüfbare Maßnahmen statt alleiniger Regex-Sperre. **P0** | Moderator:innen-Copilot mit Human-in-the-loop. **P2** | Unwiderrufliche automatische Sperren für mehrdeutige Inhalte. |
| **Profile / Settings** | Profil, private Bereiche, Habitate, Fortschritt, Privacy/Consent und Präferenzen sind angelegt. | Öffentliche Sichtbarkeit, Besitzwechsel, Export/Löschung und Consent-Widerruf testen. | Öffentliche Profilreise mit klar getrenntem Eigentümerbereich; öffentliche Beiträge, Fachgebiete, optional verifizierte Rollen und Safety Controls. **P1** | Follows, Favoriten, Sammlungen. **P1/P2** | Öffentliche Standardprofile für private Habitate. |
| **Ranking / Challenges** | XP, Level, Streak, Badges, Tages-Check-in, Challenge und Top-10-Rangliste sind vorhanden. | Betrug, Mehrfachbeiträge, Verteilung, Bias und Frust bei Neulingen messen. | Validitätsgating, transparente Punkteformel, Fortschritt/Ablauf/Abschlussstatus und thematische Monats-Challenges. **P1** | Kohorten-Rankings und persönliche Insights. **P2** | All-time-Global-XP als primäres Qualitäts- oder Expertenmaß. |
| **Pflanzenpflege** | Pflanzendaten für Wasser, Licht, Feuchte, Temperatur und Substrat sind vorhanden. | Zeitzone, DST, Offline-Sync, Push-Deduplizierung und Fehlidentifikation testen. | Persistente Care-Task-/Plan-Engine und „Heute“-Ansicht. **P1** | Journal, Fotoverlauf, delegiertes Care Share. **P2** | Universell präzise Pflegeversprechen ohne Kontext und Nutzerfeedback. |
| **Marketplace** | Partnervermittlung, Disclosure, externe Links, Produktdetail, Filter und lokale Merkliste. | Angebotsprüfung, Link-Sicherheit, Disclosure-Verständnis und Outbound-Messung. | Serverseitige Merkliste/Alerts, Händlerprüfung, Policies, Review-Status, Sicherheits-/Compliance-Queue. **P1** | Bulk-Katalog, Preis-/Bestands-Sync mit Konfliktzustand. **P2** | In-App-Checkout, Auszahlungen, Retouren und Liefertracking. |
| **Privacy / Standort** | Consent und mehrere Sichtbarkeitsstufen; private Habitate. | Re-Identifikation über Medien/Metadaten, Caches, Deep Links, Backups und Rollenwechsel testen. | Feldgenaue Orts-/Habitat-Entscheidung: genau, ungefähr/verschleiert, privat; sensible Taxa-Warnung; getrenntes Objektmodell. **P0** | Vertrauensbasierte Freigaben, Sensitivitätsregeln pro Taxon. **P2** | Absolute Sicherheitsversprechen oder öffentliche exakte Privatstandorte als Default. |
| **Accessibility** | Viele `aria-label`s, Statusflächen, reduzierte Bewegung und teilweise ausreichend große Targets. | Keyboard-only, Screenreader, Fokus, Kontrast, Zoom, Dynamic Type und Touch-Targets durch Fachtest. | Nicht-leere redaktionelle Alttexte, zugängliche Namen für alle Icon-Aktionen, Fokusmanagement, Live-Status und gleichwertige Listenansicht für Karten. **P0** | Personalisierbare Dichte/Lesemodus. **P2** | Karte als einzige Ergebnisdarstellung. |
| **Performance** | Bild-Lazy-Loading, Video-Metadaten-Preload, PWA-Fallback und HabitatBuilder-Splitting. | LCP, INP, CLS, JS-Budget, Bildgrößen, API-Latenz, Feed-Scroll, Offline-Warteschlange auf echten Zielgeräten. | Route-Splitting, responsive Bildderivate, Cursorpagination/Virtualisierung, Performance-Budget und RUM. **P0** | Edge-Caching, Vorabrendering öffentlicher Wissensseiten. **P2** | Vollständiges Offline-Caching aller API- und Karteninhalte. |
| **SEO** | PWA-Assets und öffentliche Seiten existieren. | Indexierbarkeit, Canonicals, Robots, Sitemap, SSR/Prerender, Meta/OG und Privacy-Leaks auditieren. | Public/private Indexierungsregel, eindeutige Canonicals, Sitemap nur für bewusst öffentliche Evergreen-Seiten, semantische Metadaten. **P1** | Strukturierte Daten für geprüfte Artikel/Produkte. **P2** | Indexierung von Profilen, privaten Anlagen, dynamischen Feed-Filtern oder KI-Entwürfen. |
| **Operations** | Audit-Spuren, Rollen, Status und Review-orientierte Commerce-Struktur. | Monitoring, Restore, Incident-Probe, Moderationskapazität und Datenschutzprozess durchführen. | Ownership, Metrik-Dashboard, Feature Flags, Rollback, DSR-/Löschprozess, Incident-Runbooks und Moderation-SLA. **P0** | Partner-Sync-Health, Taxonomie-Governance. **P2** | Multi-Channel-Commerce-Sync ohne Betriebsmodell. |

## 4. Professionelle Zielreise und Informationsarchitektur

### 4.1 Ein Objekt, drei Ausgaben: Log, Fachfall, Community-Post

Die wichtigste strukturelle Lücke ist kein Screen, sondern ein Datenmodell. Gegenwärtig gibt es Pflanzen, private Habitate, Community-Posts und KI-Review, aber kein konsistentes Modell für eine fachlich prüfbare Beobachtung oder Pflegehandlung. Das Produkt braucht ein **Log-/Beobachtungsobjekt** als Ausgangspunkt. Es kann privat bleiben, in einen Fachfall überführt oder gezielt als Community-Post verteilt werden.

| Ebene | Zweck | Pflichtfelder | Optionale Felder | Sichtbarkeit |
|---|---|---|---|---|
| **Privater Log** | Persönlicher Verlauf für Anlage, Pflege oder Sichtung. | Realm, Zeit, Eigentümer, Status. | Medien, Habitat, Parameter, Notiz, Organismusgruppe. | Privat als Default. |
| **Fachfall / Beobachtung** | Nachvollziehbare Bestimmung, Diagnose oder Evidenzfrage. | Evidenz, Organismus-/Problemgruppe, Taxon-Ebene oder Symptom, Zeitpunkt. | KI-Hypothese, sichtbare Merkmale, Quellen, Kommentar. | Private Hilfe, Gruppe oder öffentlich – explizit gewählt. |
| **Community-Post** | Austausch und Inspiration. | Beitragstext oder Medienkontext, Zielgruppe, Regeln. | Referenz auf Log/Fachfall, Produktreferenz mit Kennzeichnung. | Explizit freigegeben; keine automatische Übernahme privater Felder. |

Die Beziehung ist absichtlich nicht 1:1. Ein privates Pflegeereignis darf in der privaten Historie bleiben. Eine öffentliche Beobachtung darf ein verschleiertes Gebiet statt der exakten Anlage zeigen. Ein Community-Post kann auf einen Fachfall verweisen, ohne dessen Medien, Metadaten oder unklare KI-Hypothese vollständig zu veröffentlichen. Diese Trennung übernimmt iNaturalists Grundsatz, nur so präzise zu bestimmen, wie die Evidenz es trägt, und ergänzt ihn um BlackWaterLeafs private Habitat-Szenarien. [1] [2]

### 4.2 Empfohlene Navigation

Die bestehende Fünf-Tab-Struktur bleibt bestehen, erhält aber eine präzisere Aufgabenhierarchie:

| Ort | Primärer Auftrag | Pflichtelemente | Was dort nicht dominieren darf |
|---|---|---|---|
| **Home / Heute** | Nächste sinnvolle Handlung. | Fällige Pflege, offene Rückfragen, Upload-/Sync-Status, „Beobachtung hinzufügen“. | Breiter, unpriorisierter Social Feed. |
| **Entdecken** | Suchen, lernen, relevante Fälle finden. | Einheitliche Suche, Filter, „Bestimmen helfen“, kuratierte Themen. | Verdecktes, unerklärtes Ranking. |
| **Erstellen** | Privates Log/Beobachtung/Pflege erfassen. | Fortschritt, Entwurf, Medienstatus, grobe Gruppe, Sichtbarkeit vor Veröffentlichung. | Erzwungene Community-Freigabe. |
| **Community** | Austausch und nachvollziehbare Antworten. | Für dich, Folge ich, Favoriten; Post Actions; Regeln; sichere Kommentare. | Commerce als Feed-Unterbrechung. |
| **Marktplatz** | Gekennzeichnete Partnerangebote. | Filter, Händleridentität, Disclosure, externe Zieltransparenz. | Fachliche Identifikation oder Pflegebestätigung durch Verkaufssignale. |
| **Profil** | Eigentum, Einstellungen, öffentliche Identität. | Private Anlagen, Consent, Benachrichtigungen, Datenschutz, öffentliche Profilvorschau. | Vermischung öffentlicher und privater Daten. |
| **Benachrichtigungen** | Ereignisse verstehen und handeln. | Unread Badge, Gruppierung, direkte Zielaktion, Präferenzen. | Ein irreführender Link zur Community. |

Eine echte Benachrichtigungsroute ist P0, weil die aktuelle Kopplung der Bell-Aktion an `/community` eine erwartete Systemaktion bricht. Nielsen Normans Heuristik „Sichtbarkeit des Systemstatus“ ist hier unmittelbar anwendbar: Upload, Veröffentlichung, Rückmeldung und Bestätigung müssen als Zustände sichtbar sein, nicht nur als technische Nebenwirkung. [6]

### 4.3 Onboarding: Erst der Nutzen, dann die Berechtigung

Der erste Besuch soll nicht nach „Interessen“ und anschließend in einem leeren Feed enden. Der Ablauf ist:

1. **Ziel wählen:** „Eine Anlage dokumentieren“, „Art/Pflanze bestimmen“, „Pflege nicht vergessen“, „Hilfe geben“ oder „Lokale Inspiration finden“.
2. **Private erste Handlung:** Foto/Medium hinzufügen, grobe Gruppe wählen, Raum/Anlage oder ungefährer Ort ergänzen, Sichtbarkeit prüfen.
3. **Unmittelbarer Ertrag:** z. B. ein editierbarer KI-Vorschlag, ein erster Pflegeplan, eine gespeicherte Beobachtung oder drei passende offene Fachfälle.
4. **Rückkopplung erklären:** „Wenn jemand Evidenz ergänzt oder deine Bestimmung verbessert, erscheint es hier.“
5. **Erst danach Push erklären und anfragen:** konkrete Ereignisse nennen und granular steuerbar machen.

Planta zeigt die nützliche Reihenfolge aus Foto-ID, Standort/Licht und danach einem konkreten Pflegeplan; seine Parameter- und Wetterlogik sind Herstellerangaben, aber das Interaktionsmuster ist klar: Erinnerung wird erst wertvoll, wenn ein persönlicher Plan existiert. [7] [8] [9] Die Push-Anfrage gehört deshalb nach den Nutzenmoment. Unkontrollierte Benachrichtigungs-Bursts sollen vermieden und Einstellungen leicht erreichbar sein. [11]

## 5. P0: Sicherheits- und Kernhandlungs-Work Order

### P0-A: Privacy-by-default und das fachliche Beobachtungsmodell

**Problem und Begründung.** Ein einzelnes `isPublic`- oder globales Profil-Sichtbarkeitsmodell reicht nicht für exakte Habitate, gefährdete Arten, private Zimmerpflanzen und offene Community-Beiträge. iNaturalist beschreibt Geoprivacy ausdrücklich mit verschleierten und privaten Koordinaten und weist zugleich auf Rückschlussrisiken über Bilddetails, Text oder benachbarte Beobachtungen hin. [3] BlackWaterLeaf darf „privat“ daher nicht als absolute Sicherheit vermarkten.

**Arbeitsauftrag.** Das Datenmodell um `ObservationOrLog`, `Identification`, `Evidence`, `LocationPrecision`, `SensitivityRule` und `PublicationProjection` erweitern. `LocationPrecision` verwendet mindestens `exact`, `obscured`, `private`; die letzte Option ist Standard, sofern ein Standort überhaupt erfasst wird. Privater Habitat-Ort, öffentliche Beobachtungsort-Angabe und öffentliche Profilinformation werden separat gespeichert. Medien-EXIF wird vor Freigabe entfernt oder der Umgang damit sichtbar erklärt. Eine sensible Taxon-/Themenregel warnt vor Veröffentlichung und liefert einen verständlichen Link zur Erklärung.

**Abhängigkeiten.** Taxonomie-Quelle/Versionierung; Authentifizierung und Eigentümerprüfung; Medienpipeline; Consent- und Audit-System; Datenschutz-/Rechtsreview.

**Akzeptanzkriterien.**

- Ein neuer Log ist ohne weitere Entscheidung privat und erscheint weder Feed noch Suche noch Sitemap.
- Beim Publizieren kann die Person Ort und Habitat unabhängig von Text/Medium auf „genau“, „ungefähr“ oder „privat“ setzen und sieht eine Audience-Vorschau.
- Ein verschleierter Datensatz gibt über öffentliche API, HTML, Open Graph, Kartenmarker, Suchcache und Export keine exakten Koordinaten aus.
- Eine Identifikation speichert vorgeschlagene Taxon-Ebene, Evidenz und Autor; ein Konflikt senkt auf die engste konsensfähige Ebene statt einen Autor zu bestrafen.
- Alle Sichtbarkeitswechsel, sensitive Warnungen und Standort-Downloads sind auditierbar.

**Tests.** Unit-Tests für jede Sichtbarkeitskombination; Autorisierungs- und IDOR-Tests; API-Snapshot auf Ortslecks; EXIF-Regressionstest; E2E-Publish-Test mit Browser-Cache/OG-Debugger; Threat-Modelling-Workshop für Re-Identifikation; Datenschutz-Abnahme.

### P0-B: KI als Hypothese, nicht als fachlicher Endpunkt

**Problem und Begründung.** Der bestehende KI-Review kann hilfreich sein, aber ohne Observation-/Identification-Modell wird ein Ergebnis nicht fachlich überprüfbar. iNaturalist fordert ausdrücklich, KI nicht als alleinige Basis zu verwenden und nur bis zu der von Evidenz gedeckten taxonomischen Ebene zu bestimmen. [2]

**Arbeitsauftrag.** Jede KI-Antwort erhält: Kandidat(en), Konfidenzbereich statt Scheingenauigkeit, verwendete Eingaben, Modell-/Datumsstand, Grenzen, editierbare Taxon-Ebene, „Warum passt das?“ und klare Folgeaktionen. Die Oberfläche unterscheidet sichtbar **KI-Vermutung**, **Community-Bestimmung**, **verifizierte Quelle** und **offene Frage**. Bei Pflanzenpflege und Diagnose werden sichere Sofortmaßnahmen von unsicherer Behandlung getrennt; bei potenziell gefährlichen oder tierwohlrelevanten Ratschlägen gibt es Warntexte und Expert:innen-Eskalation.

**Abhängigkeiten.** P0-A-Datenmodell; Modellanbieter- und Datenschutzvertrag; Taxonomie/Quellen; Redaktions- und Safety-Policy; Evaluation-Dataset.

**Akzeptanzkriterien.**

- Kein KI-Ergebnis kann automatisch als bestätigt, research-grade oder öffentlich verifiziert erscheinen.
- Nutzer:innen können Art/Taxon, Unsicherheit und Begründung ohne Neu-Upload korrigieren.
- Alle KI-UI-Zustände erklären mindestens eine Grenze und einen nächsten sicheren Schritt.
- Ein fachlicher Widerspruch öffnet eine Evidenzdiskussion, keinen Moderationsfall.
- AI-Opt-in, Zweck, Aufbewahrung und Widerruf sind in den Einstellungen und am Auslösepunkt verständlich.

**Tests.** Kalibrierungs- und Adversarial-Testset; UX-Comprension-Test („Was ist sicher?“); Prompt-/Input-Abuse-Test; Datenminimierungsreview; Test für fehlende/unscharfe Medien; Red-Team für gefährliche Diagnoseempfehlungen.

### P0-C: Vollständige Community- und Moderationsreise

**Problem und Begründung.** Ein Feed ohne inhaltnahe Report-, Block- und Antwortaktionen gibt Nutzenden bei Belästigung, Spam oder fachlichem Konflikt keine angemessene Kontrolle. Fishbrain spezifiziert Meldung, Blockieren, Sperrstufen und Einspruch; Instagram nutzt vor Ranking eine Integritätsprüfung und verarbeitet Hide/Report-Signale. [16] [21] Die bestehende automatische Suspendierung bei engem Regex-Treffer ist gleichzeitig zu hart für Mehrdeutigkeit und zu schmal für Scam, Tierhandel, Spam, wiederholte Grenzverletzungen oder koordinierte Meldungen.

**Arbeitsauftrag.** Jede Post-, Kommentar- und öffentliche Profiloberfläche erhält ein Overflow-Menü mit **Speichern**, **Melden**, **Blockieren**, **Stummschalten**, **Realm/Autor weniger zeigen** und bei Empfehlungen **Warum sehe ich das?**. Kommentare werden Ende-zu-Ende verfügbar: Thread öffnen, antworten, benachrichtigen, Deeplink. Reportgründe unterscheiden Sicherheitsverletzung, Spam/Scam, illegale Angebote, Tierwohl-/Sicherheitsrisiko, Privatsphäre und fachliche Unstimmigkeit. Nur die ersten Kategorien gehen in die Sicherheitsqueue. Fachliche Unstimmigkeit wird als Evidenzanfrage, Gegenbestimmung oder Qualitätsdiskussion geführt.

**Abhängigkeiten.** Identity/Rate Limits; Policy/Reason Codes; Mod-Queue; Notification P0-D; Audit-Log; Rechts-/Trust-&-Safety-Owner.

**Akzeptanzkriterien.**

- Eine Meldung ist vom störenden Inhalt aus in höchstens zwei bewusst bestätigten Schritten möglich; der Melder erhält eine Bestätigung und später einen statusgerechten Abschluss.
- Blockierte Personen können keine neuen Interaktionsbenachrichtigungen, Direktkontakte oder personalisierte Ausspielung auslösen; Sichtbarkeitsregeln sind serverseitig erzwungen.
- Ein Widerspruch bei einer Bestimmung erzeugt keinen Account-Sanktionspfad.
- Moderator:innen sehen Evidenz, Kontext, frühere Maßnahmen, Entscheidung, Begründung und Einspruchsstatus; jede Entscheidung ist auditiert.
- Automatische Hochrisikofälle sind reversibel und vor einer dauerhaften Kontomaßnahme menschlich prüfbar.

**Tests.** Abuse- und Rate-Limit-Tests; Block-Bypass-Test über Feed/API/Notifications; Moderations-Tabletop mit mindestens zehn Grenzfällen; Appeal-Workflow; False-positive/false-negative sampling; Zugänglichkeitstest des Overflow-Menüs.

### P0-D: Benachrichtigungen und sichtbarer Systemstatus

**Problem und Begründung.** Backend-Ereignisse und Unread Count sind vorhanden, aber Web hat keine eigene Inbox; die Bell-Aktion führt zur Community. Das zerstört Erwartungskonformität und verhindert eine messbare Rückkehrschleife. Instagram priorisiert und bündelt Hinweise; Android empfiehlt klare Kanäle, passende Dringlichkeit, Gruppierung und direkte Zielaktionen. [22] [24]

**Arbeitsauftrag.** Route `/notifications` bauen, Bell dahin verlinken, Unread Badge ausliefern und Ereignisse nach Handlung gruppieren. Jede Benachrichtigung führt zu einem konkreten Deep Link: Kommentar öffnen, Antwort verfassen, Identifikation prüfen, Pflegeaufgabe anzeigen oder Sicherheitsentscheidung lesen. Einstellungen werden nach Kanälen modelliert: Interaktionen, Antworten, Fachfälle, Pflege, Sicherheit/Moderation, Marketplace. Pro Kanal: In-App, Push, E-Mail (falls eingeführt), Ruhezeiten und Dringlichkeit. Push ist nicht P0-Voraussetzung; seine korrekte Zustimmung und Kanalverwaltung sind Voraussetzung, bevor er aktiviert wird.

**Abhängigkeiten.** Routing; Event-Schema; Kommentar-/Identifikationsobjekte; Settings; optional Expo-Push-Architektur; Datenschutz.

**Akzeptanzkriterien.**

- Bell öffnet `/notifications`, zeigt die serverseitige Unread-Zahl korrekt und bleibt per Tastatur bedienbar.
- Gleichartige Ereignisse werden gruppiert und doppelte Zustellungen gedrosselt.
- Ein Klick landet auf dem konkreten Inhalt mit verfügbarer nächster Aktion, nicht nur auf einer Übersichtsseite.
- „Gelesen“ ist nicht das gleiche wie „erledigt“; insbesondere Pflege- und Moderationsaktionen behalten ihren Aufgabenstatus.
- Keine nicht dringliche Nachricht wird außerhalb einer gewählten Ruhezeit zugestellt.

**Tests.** Event-contract-, Deduplizierungs- und Deep-Link-Tests; Zeitzonen-/DST-Test; Permission-Timing-Usability-Test; Keyboard/Screenreader-Test; Kanalpräferenz-E2E-Test.

### P0-E: Barrierefreiheit, Performance und Release-Operations als Gates

**Problem und Begründung.** Die Baseline zeigt gute Ansätze, doch leere `alt`-Attribute bei Community- und Partnerbildern, icon-lastige Controls und ein großer Build sind konkrete Release-Risiken. Der vorhandene Build enthält aktuell u. a. ca. 1,7 MB `index`-JavaScript und ca. 1,08 MB HabitatBuilder-Chunk vor Kompression; dies ist eine technische Bestandsaufnahme, keine reale Feldmessung. Die W3C hebt für Mobile mindestens 24 × 24 CSS-px Touch-Ziele hervor; Karten benötigen zusätzlich eine gleichwertige Nicht-Karten-Alternative. [12]

**Arbeitsauftrag.** Ein gemeinsames Qualitäts-Gate für Web-Releases einführen. Es umfasst verpflichtende beschreibende Alttexte oder begründete Dekorativ-Markierung, zugängliche Namen/States, sichtbaren Fokus, semantische Live-Statusmeldungen, ausreichenden Kontrast und eine Ergebnisliste als Kartenalternative. Technisch: Route-Splitting, responsive Bildderivate mit Abmessungen, Cursorpagination, Virtualisierung ab vereinbarter Schwelle, kritischer CSS-/JS-Budgetcheck, Real User Monitoring (RUM), Error Tracking, Feature Flags und Rollback.

**Abhängigkeiten.** Design-System; Bildpipeline; Analytics-/Consent-Architektur; CI; Error/RUM-Anbieter; Release Owner.

**Akzeptanzkriterien.**

- Alle interaktiven Icon-Controls haben zugänglichen Namen und State; Modal-Dialoge unterstützen Escape, Fokusfalle und Fokus-Rückgabe.
- Redaktionell relevante Medien können nicht ohne Alttext veröffentlicht werden; eine kontrollierte Ausnahme ist protokolliert.
- Feed- und Suchendpunkte verwenden Cursor statt wachsender fixer Listen; die UI bleibt beim Scrollen auf Zielgeräten reaktionsfähig.
- CI blockiert den Merge bei vereinbartem JS-/Bildbudget, kritischen Accessibility-Fehlern oder fehlenden Privacy-Tests.
- Öffentliche Seiten haben Fehler-, Lade- und Empty-States; private Daten erscheinen weder in RUM-Events noch in URLs/Logs.

**Tests.** Axe plus manuelle NVDA/VoiceOver-/TalkBack-Prüfung; Keyboard-only; Zoom 200–400 %; Kontrastprüfung; Lighthouse/Lab und RUM an echten Mittelklasse-Geräten; k6/Artillery API-Lasttest; Offline-/Flaky-Netzwerk-Test; Backup-/Rollback-Übung.

## 6. P1: Wertsteigerung nach dem geschützten Kern

### P1-A: Pflanzenpflege als ausführbarer Plan

BlackWaterLeaf speichert bereits Pflegekontext, aber noch keinen persistenten, erklärbaren Plan. Planta zeigt ein wirksames Interaktionsmuster: Erinnerungen für mehrere Tätigkeiten, Kontext aus Pflanze/Umgebung/Klima und eine Historie aus erledigt, verschoben oder übersprungen. Die konkrete Wirksamkeit der über 30 Parameter ist eine Herstellerangabe, nicht unabhängig belegt. [7] [8] Der relevante Benchmark ist daher **nicht** „Planta kopieren“, sondern „aus Freitext eine kontrollierbare nächste Handlung machen“.

**Arbeitsauftrag.** `CarePlan`, `CareTask`, `CareEvent`, `AdjustmentReason` und `CareJournal` modellieren. Eine „Heute“-Fläche bündelt Aufgaben pflanzenübergreifend und bietet erledigt, verschieben sowie überspringen mit Grund. Jede Anpassung erklärt einen nachvollziehbaren Auslöser, etwa Saison, Standortwechsel, beobachtetes Substrat oder Nutzerfeedback. Der Nutzer kann die Regel stets überschreiben.

**Akzeptanzkriterien.** Eine Aufgabe enthält Pflanze, Tätigkeit, Fälligkeit und schnelle Aktion; mehrere Fälligkeiten werden gebündelt; Historie unterscheidet Abschluss, Verschiebung und Überspringen; Zeitzone/DST und gelöschte Pflanze erzeugen keine Phantom-Tasks; private Journale werden nicht in Ranking, Feed oder Commerce exportiert.

**Tests.** Zeitreihentests, Offline-Completion mit Wiederaufnahme, Push-Deduplizierung, Standortwechsel, Planüberschreibung, Datenlöschung und Care-Share-Rollenwechsel (falls später aktiviert).

### P1-B: Suche, „Bestimmen helfen“ und sinnvolle Discovery

Die aktuelle Discover-Seite ist ein Hub, keine arbeitsorientierte Recherche. iNaturalists Identify-Ansicht zeigt, wie Filter nach Taxon, Ort und weiteren Merkmalen eine konkrete Hilfsaufgabe unterstützen. [2] Fishbrain ergänzt eine Karte und saisonale Filter; dieses Muster ist nur sinnvoll, wenn Privacy, Datenqualität und Listenalternative bereits P0-reif sind. [13] [14]

**Arbeitsauftrag.** Eine einheitliche Suche mit eindeutigen Vertikalen einführen: **Organismen/Taxa**, **offene Fachfälle**, **Beiträge**, **Gruppen**, **Mitglieder**, **Wissensinhalte**, **Partnerprodukte**. Ergebnisfilter und Rückweg bleiben erhalten. Die separate Queue „Bestimmen helfen“ erlaubt Realm, grobe Gruppe, Region/Datenschutzstufe, Unsicherheit, Medienart, neu/offen und eigene Expertise. Desktop kann tastaturfreundliche Aktionen anbieten; Mobile zeigt große beschriftete Entscheidungen.

**Akzeptanzkriterien.** Suche liefert keinen privaten Inhalt; Filter sind serverseitig durchgesetzt und URL-/Back-Navigation-stabil; ein Nulltreffer bietet sichere nächste Schritte; offene Fachfälle zeigen Evidenz- und Datenschutzstatus; die Reihenfolge ist zunächst deterministisch und erklärbar.

**Tests.** Permission-Aware-Search-Tests, Relevanzbeurteilung mit Fachpersonen, Query- und Filter-Latenz, Nulltreffer-Usability-Test, keyboard/mobile action test, Abuse-Test gegen Taxon-/Standort-Scraping.

### P1-C: Profile, Folgen, Speichern und Community-Retention

Die bestehende Profil- und Consent-Struktur bietet die richtige Basis. Es fehlt die öffentliche Profilreise, durch die Nutzer:innen Fachgebiete, freigegebene Beiträge und nachvollziehbare Rollen finden können, ohne private Anlageinformationen offenzulegen. Instagram zeigt den Wert einer klaren Trennung von öffentlichem Profil und bestätigter Follower-Sichtbarkeit. [19] [20]

**Arbeitsauftrag.** Öffentliche Profile als bewusst schmale Projektion bauen: Anzeigename, Bio, Realms/Fachgebiete, freiwillig verifizierte Rolle, freigegebene Beiträge und optional fachliche Hilfsquote. Private Besitzeransichten bleiben separat. Danach Follow/Favorit, Saves und Collections hinzufügen; Follow-Anfragen und Rate Limits berücksichtigen Sichtbarkeit und Safety.

**Akzeptanzkriterien.** Feed-Autoren sind zu einem kontrollierten öffentlichen Profil verlinkt; Follow/Unfollow/Block funktionieren serverseitig; private Anlagen, Journale, Standorte und nicht freigegebene Daten erscheinen nie in öffentlicher Projektion; gespeicherte Items sind kontoseitig synchronisiert, nicht nur lokal.

**Tests.** Visibility-Matrix, Follow-Request-Tests, Block-Interaktion, Privacy-Regression bei Profil-Cache/OG, Collection-Sharing (erst wenn eingeführt), Moderator:innen-Review für Verifizierungsclaim.

### P1-D: Ranking und Challenges an Qualität koppeln

Ein globales All-time-XP-Ranking kann Aktivität statt Fachlichkeit belohnen. Fishbrain beschränkt sein verifiziertes Leaderboard auf Monat und Art und verlangt ein geprüftes Foto; es löst nicht alle Fairnessfragen, zeigt aber die richtige Begrenzung von Wettbewerb. [15] Die bessere BlackWaterLeaf-Variante belohnt **valide, freigegebene und nachprüfbare Beiträge**, nicht bloße Streaks.

**Arbeitsauftrag.** Challenge-State sichtbar machen: beitreten, Fortschritt, Zeitraum, Regel, Gültigkeitsstatus, Belohnung, Abschluss. Eine veröffentlichte Punkteformel und klare Tie-Break-Regel sind Pflicht. Persönliche Insights – regelmäßige Pflege, dokumentierte Entwicklung, hilfreiche Antworten – stehen vor globaler Ranglistenposition. Qualitäts-/Validity-Gating liegt serverseitig.

**Akzeptanzkriterien.** Nicht valide, private oder vom Nutzer ausgeschlossene Einträge ändern keinen öffentlichen Zähler; eine Challenge zeigt immer Regel und Zeitfenster; Bearbeitung/Löschung korrigiert Wertungen nachvollziehbar; Moderationsentscheidungen können Wertung pausieren oder revidieren; keine Badge-Mechanik fordert riskante Veröffentlichung.

**Tests.** Betrugssimulation, Tie-Break, Lösch-/Edit-Reconciliation, Fairnessanalyse nach Realm/Erfahrung, experimentelle Messung von hilfreichen Antworten statt nur Postmenge.

### P1-E: Professionalisiertes Partner-Operations-Hub und SEO-Fundament

Der aktuelle Marktplatz ist glaubwürdig, weil er keine nicht vorhandene Transaktion vorgaukelt. Sein nächster Schritt ist Operationsqualität: Partneridentität, rechtliche Hinweise, Reviewstatus, Compliance und nachprüfbare Angebotsdaten. Shopify fordert für Marketplace-Verbindungen u. a. verifizierte Verkäufer, Policies, Zahlungsweg und Versandraten; für BlackWaterLeaf sind diese Anforderungen zunächst ein Muster für **Prüfung und Transparenz**, nicht für einen eigenen Checkout. [26] [27] Shopify weist außerdem auf Konflikte durch mehrere Connectoren hin; falls BlackWaterLeaf später synchronisiert, braucht jedes Feld eine klare Quelle und Konfliktbehandlung. [25]

**Arbeitsauftrag.** Händler-Onboarding als Schrittfluss: Identität/Firma, Kontakt- und Rechtsangaben, Policies, Produktattribute, Bildrechte, Kategorien, Produkt-URLs, Kennzeichnung, Review und Status. Eine serverseitige Merkliste und fachbezogene Alerts können nach diesem Fundament folgen. Parallel SEO-Regeln implementieren: nur bewusst öffentliche, stabile Evergreen-Seiten indexieren; `noindex` für Such-/Filterkombinationen, Profile nach Default, Community-Entwürfe, private bzw. unlisted Inhalte und Marketplace-Parameter; Canonical, Sitemap und Open Graph dürfen keine geschützten Daten leaken.

**Akzeptanzkriterien.** Kein Produkt wird ohne Partnerstatus, aktuelle Freigabe, HTTPS-Ziel, Disclosure und Prüfung öffentlich; ein Review hat Status und Begründung; externe Link-Klicks sind datensparsam messbar; lokale Favoriten migrieren sicher in eine Server-Merkliste mit Nutzerzustimmung; Robots/Sitemap/Canonical entsprechen der Visibility-Matrix.

**Tests.** Händler- und Produktstatus-Transitionen, Link-/Malware-/Redirect-Prüfung, Disclosure-Usability-Test, DSR-/Löschtest, robots/canonical/sitemap crawler test, Search Console Preflight, Privacy-Scan aller OG-Tags und Caches.

## 7. P2: Nachweisbar nützlicher Ausbau

### 7.1 Karte als Discovery-Produkt, nicht als dekoratives Widget

Der vorhandene `MapView`/Google-Maps-Lader ist keine map-led Discovery. Eine Karte wird erst dann produktreif, wenn sie echte Markerquellen, Privacy-Transformation, Zeit-/Kategorie-/Qualitätsfilter, Clustering, Ladelimits, eine zugängliche Ergebnisliste und Erklärung von Ortspräzision besitzt. Fishbrains Karte liefert dafür ein Muster von Filterung und privaten Waypoints, aber sie darf nicht die Offenlegung privater Anlagen normalisieren. [13] [14]

**P2-Arbeitsauftrag.** Eine eigene `/map`-Route auf Basis von P0-A und P1-B bauen: öffentliche, zulässige Beobachtungen; eigene private Anlagen/Notizen; relevante Fachorte; gegebenenfalls klar als Werbung markierte Partnerorte. Exakte Daten werden nur nach der serverseitigen Sichtbarkeitsregel bereitgestellt. Dichte Marker clustern. Jede Karte hat eine gleichwertige Listenansicht, Tastaturfilter und Fokusführung.

### 7.2 Fortgeschrittene Pflege, Care Share und Offline-Queue

Nach stabiler P1-Care-Engine können delegierte Betreuerrollen, zeitlich begrenzter Zugriff, Audit-Trail und Bestätigung an Eigentümer:innen folgen. Eine dauerhafte Offline-Entwurfs- und Upload-Warteschlange ist besonders für Foto-/Ton-Logs wertvoll. Sie benötigt Konfliktauflösung, Verschlüsselungs-/Speicherentscheidung und klare Sync-Zustände – nicht nur einen App-Shell-Fallback.

### 7.3 Erklärbare Empfehlungen und Kontext-Commerce

„Für dich“ kann später aus gewählten Realms, gespeicherten Wissensinhalten, Habitattypen, gefolgten Fachpersonen und positiven, expliziten Signalen entstehen. Jede Empfehlung bleibt erklärbar, opt-out-fähig und darf Diagnose, Tierwohl oder Kaufempfehlung nicht allein aus Engagement ableiten. [21] Partnerangebote dürfen sich auf die betrachtete Art oder Pflegeaktion beziehen, müssen aber Händler, Werbung, Preisstand und externe Zielseite deutlich markieren.

### 7.4 Katalog- und Sync-Qualität

Bulk-Import, Varianten/SKUs, Preis-/Bestandssync, Konfliktwarteschlange, Retry, feldgenaues Änderungsprotokoll und Partnerkennzahlen sind P2. Sie sind erst sinnvoll, wenn Partnerzahl und Aktualisierungsfrequenz den manuellen Betrieb übersteigen. Der Release muss „letzte erfolgreiche Synchronisierung“, Fehlerursache und manuelle Freigabe kritischer Preis-/Bestandsänderungen sichtbar machen.

## 8. Explizit nicht jetzt

| Nicht jetzt | Warum | Architekturvorbereitung |
|---|---|---|
| **Eigener Checkout, Zahlungen, Auszahlungen, Retouren, Versandtracking** | Erfordert Zahlungsaufsicht, Steuer-/Rechtslogik, Streitfälle, Käufer-/Verkäuferschutz, Inventar und 24/7-Support. Die aktuelle Vermittlung ist ehrlicher. | Produkte, Partner, Disclosure, externe Ziel- und Reviewdaten sauber versionieren. |
| **Vollständiger Multi-Channel-Marketplace-Sync** | Hohe Konflikt- und Betriebsanfälligkeit vor klarer Source-of-Truth-Architektur. | Feldherkunft, Audit, Sync-State und Fehlerschlange vorsehen. |
| **Exakte öffentliche Privatstandorte oder „absolut sichere“ Geoprivacy** | Hoher Schaden bei Re-Identifikation und ein falsches Sicherheitsversprechen. | Präzision, Sensitivität und Audience serverseitig modellieren. |
| **Autonome KI-Bestätigung/Diagnose** | Fehlidentifikation und Sicherheitsrisiko; KI ohne Evidenzdiskussion schwächt Vertrauen. | KI als versionierte Hypothese mit Feedback und Quellen führen. |
| **Engagement-maximiertes, untransparentes Ranking** | Fördert Masse, Polarisierung und fragile Inhalte statt Hilfequalität. | Transparente, opt-in Signale und Negative Controls vorsehen. |
| **Karte als alleinige Discovery-Oberfläche** | Exkludiert Nutzer:innen mit Seh-, Motorik-, Kartenverständnis- oder Netzlimitierungen. | Listenansicht und zugängliche Filter als gleichwertigen Pfad bauen. |
| **Push als Wachstumskanal vor Preference Center** | Schafft Spam-Risiko und schadet Vertrauen. | Ereignis-Taxonomie, Kanäle, Ruhezeiten und Deep Links zuerst fertigstellen. |

## 9. Messsystem, Betriebsmodell und Release-Governance

### 9.1 North-Star- und Guardrail-Metriken

Die Kernmetrik soll nicht „Posts pro Tag“ sein. Empfohlen wird **qualifizierte, freiwillige Fach- oder Pflegehandlungen pro aktive Person**, definiert als abgeschlossene Care-Task, evidenzgestützte Identifikation, hilfreiche Antwort oder bewusst gespeicherter privater Log. Jede Zählung erfordert gültigen Besitzer-/Sichtbarkeitsstatus und darf keine private Veröffentlichung belohnen.

| Bereich | Kernmetrik | Guardrail | Auswertung |
|---|---|---|---|
| Aktivierung | Anteil mit erstem privaten Log/Plan binnen 24 h. | Keine erzwungene Standort-/Push-Freigabe. | Nach Zielwahl und Realm. |
| Fachlicher Nutzen | Anteil offener Fachfälle mit begründeter Antwort; Zeit bis erste hilfreiche Rückmeldung. | Widerspruch darf nicht Moderationsquote steigern. | Nach Organismusgruppe und Unsicherheit. |
| Pflege | Aufgabenabschlussquote und freiwillige Plananpassung. | Snooze/Skip darf nicht als „schlechte Nutzung“ behandelt werden. | Nach Zeitzone/Saison/Planart. |
| Community-Sicherheit | Report-Rate, Triagezeit, Einspruchsquote, Wiederholung nach Maßnahme. | Kein automatischer Ban als alleinige Erfolgszahl. | Nach Reason Code, nicht nach geschützter Gruppe. |
| Privacy | Standort-/Visibility-Lecks, Consent-Widerruf, sensible Warnungs-Interaktion. | Null exakte Daten in öffentlichen Obscured-APIs. | Automatisiert und incident-basiert. |
| Accessibility | Kritische Fehler, Screenreader-Task Success, Keyboard-Completion. | Keine Freigabe mit kritischem Blocker. | Pro Release und manuell quartalsweise. |
| Performance | LCP, INP, CLS, API p95, Feed-Scroll-Jank, JS-/Bildbudget. | Keine private Information in Telemetrie. | RUM plus Lab auf Zielgeräten. |
| Commerce | Verifizierte Partner, geprüfte Links, Outbound-CTR, Disclosure-Verständnis. | Keine irreführenden Conversion-Claims. | Nach Partner/Kategorie; datensparsam. |

### 9.2 Operative Verantwortlichkeiten

| Verantwortung | Mindest-Owner | Takt |
|---|---|---|
| Privacy und Datenmodell | Product + Engineering + Datenschutz | Architekturabnahme vor P0-A, quartalsweise Review. |
| KI-Qualität und Safety | AI/Product Owner + Fachexpertise + Trust & Safety | Modellkarte je Version, regelmäßige Fehlersammlung. |
| Community-Moderation | Trust & Safety Owner | Definierte Triage-SLA, wöchentliche Qualitätsstichprobe, Einspruchsreview. |
| Accessibility | Design System Owner + QA | Vor jedem Release automatisiert, je Quartal manuell mit Assistive Tech. |
| Performance/Reliability | Engineering Owner | Budget in CI, RUM-Dashboard, Incident-/Rollback-Probe. |
| Marketplace Governance | Marketplace Owner + Legal/Operations | Partner-/Policy-Review vor Aktivierung, periodische Link-/Compliance-Prüfung. |
| SEO | Content/Engineering Owner | Preflight vor Indexierung, regelmäßiger Crawl- und Cache-Review. |

### 9.3 Definition of Done für jede neue öffentliche Funktion

Eine Funktion gilt nur dann als fertig, wenn sie eine Visibility-Matrix, serverseitige Autorisierung, Empty/Loading/Error-States, Telemetrie ohne private Inhalte, Keyboard-/Screenreader-Abnahme, Performance-Budget, Audit-/Support-Owner, Copy für Unsicherheit und einen Rollback-Pfad besitzt. Bei KI, Standort, Tieren, Gesundheitssymptomen, Marketplace oder moderierten Inhalten kommen ein Abuse-Test und ein Policy-Sign-off hinzu.

## 10. Dreiphasiger Implementierungsauftrag

### Phase 1 — **P0: Sicherer und zugänglicher Kern**

**Ziel.** Aus der bestehenden Web-Baseline wird eine zuverlässige, privacy-first Kernreise: privat erfassen, fachlich einordnen, sicher veröffentlichen, nachvollziehbar reagieren.

**Lieferpakete in Reihenfolge.**

1. **Architecture & Policy Foundation:** Visibility-Matrix, Observation/Identification-/Evidenzschema, Standortpräzision, Audit-Ereignisse, Medien-/EXIF-Policy, Taxonomie-/Sensitivity-Governance und Datenmigrationsplan.
2. **Privacy + Capture:** private Defaults, aufgeschlüsselte Publikation, Publikumsvorschau, sensible Warnung, Upload-/Sync-Status und Widerruf.
3. **KI-Vertrauen:** Hypothesen-UI, Konfidenz/Limits, editierbare Taxon-Ebene, menschliche Evidenz- und Konfliktlogik.
4. **Community Safety:** echte Comments/Replies, in-situ report/block/mute/save, getrennte fachliche Diskussion, abgestufte Mod-Queue, Einspruch und Rate Limits.
5. **Notification Repair:** `/notifications`, Badge, gruppierte Deep Links und Preference Center; Push-Architektur nur vorbereitet oder opt-in nach Nutzenmoment.
6. **Quality Gates:** Alttext-/Icon-/Fokus-/Dialog-Remediation, Cursor/API-Plan, Route-/Bildoptimierung, CI-Budgets, RUM/Error Tracking, Release/Incident-Runbooks.

**Abnahmemeilenstein.** Eine neue Person kann ohne Standort- oder Push-Zwang einen privaten Log anlegen, eine KI-Hypothese verstehen und korrigieren, bewusst eine sichere Community-Freigabe wählen, eine hilfreiche Antwort erhalten, diese über eine korrekte Notification öffnen und problematischen Inhalt kontrolliert melden. Dieser Ablauf besteht Privacy-, Keyboard-, Screenreader-, Performance- und Moderations-Tests.

**Nicht in Phase 1 aufnehmen.** Karte, öffentliches Follower-System, Voll-Care-Engine, Checkout, algorithmisches Ranking und Multi-Channel-Sync.

### Phase 2 — **P1: Wiederkehrender Fach- und Pflegewert**

**Ziel.** Nach stabiler Kernreise entsteht der nachvollziehbare tägliche Nutzen: Aufgaben erledigen, Hilfe finden, Expertise entdecken und Partnerangebote sicher bewerten.

**Lieferpakete in Reihenfolge.**

1. **Care Engine & Heute:** CarePlan/Task/Event/Journal, Bündelung, Snooze/Skip-Gründe, Erklärbarkeit, Zeitzonen-/Offline-Qualität.
2. **Search & Help Queue:** einheitliche, berechtigungsbewusste Suche; serverseitige Filter; offene Identifikations-/Hilfsfälle; deterministische erklärbare Reihenfolge.
3. **Profile & Retention:** öffentliche, datensparsame Profile; Follow/Favorit mit Rate Limits; kontoweite Saves/Collections; klare private Besitzeransicht.
4. **Quality-linked Progression:** Challenge-State, Validitätsgating, persönliche Insights, transparente Punkte und begrenzte Themen-Rankings.
5. **Partner Operations & SEO:** Händlerprüfung, Policies, Reviewstatus, serverseitige Merkliste/Alerts, Crawl-/Indexierungs- und Metadata-Regeln.

**Abnahmemeilenstein.** Wiederkehrende Nutzer:innen sehen im „Heute“-Bereich mindestens eine plausible, steuerbare Handlung oder Rückmeldung. Sie finden einen relevanten Fachfall über Suche, können ihn sicher speichern/followen, ihre Privatsphäre behalten und erkennen Werbung zuverlässig. Öffentliche Seiten sind indexierbar nur, wenn sie ausdrücklich freigegeben und technisch korrekt kanonisiert sind.

### Phase 3 — **P2: Skalierbare Discovery und Betriebsreife**

**Ziel.** Discovery, Karten, delegierte Pflege und Commerce-Betrieb werden nur entlang gemessener Nachfrage und einer stabilen Safety-/Privacy-Basis skaliert.

**Lieferpakete in Reihenfolge.**

1. **Accessible Map Discovery:** eigene Route, Privacy-transformierte Marker, Clustering, Filtersystem, Listenalternative, Fokusführung und Missbrauchsschutz.
2. **Care Share & Offline Queue:** zeitlich begrenzte Betreuerrollen, Audit, Konfliktauflösung, persistente Entwürfe und Medien-Upload-Warteschlange.
3. **Erklärbare Empfehlungen:** opt-in „Für dich“, negative Signale, „Warum sehe ich das?“, Feed- und Notification-Drosselung.
4. **Marketplace Scale:** Katalog-Bulk-Tools, Attribute/Varianten, klarer Source of Truth, Sync-Health und Konfliktqueue – ohne Checkout-Versprechen.
5. **Continuous Operations:** Taxonomie-Updates, KI-Evaluation, Mod-Qualität, SEO-Content-Governance, Quartalsweise Accessibility-/Privacy-/Resilience-Reviews.

**Abnahmemeilenstein.** Karte, Empfehlungen und Partnerdaten erhöhen nachweisbar den Fachnutzen, ohne Privacy-Guardrails, Accessibility-Task-Success, Moderations-SLA oder Performancebudgets zu verschlechtern. Ist dies nicht nachweisbar, wird die Funktion gedrosselt, vereinfacht oder hinter einem Feature Flag gehalten.

## 11. Entscheidungslog: Was nicht aus den Benchmarks kopiert werden soll

Die Benchmarks sind keine Blaupausen. iNaturalist ist stark bei offenen Daten und Bestimmung, aber seine Standortschutz-Hinweise zeigen gerade, dass BlackWaterLeaf keine absolute Privatsphäre versprechen darf. [3] Planta ist stark bei wiederkehrenden Pflegehandlungen, doch dessen Parameter-/Wetterlogik ist kein Nachweis einer universell richtigen Pflegefrequenz. [7] [8] Fishbrain liefert ein nützliches Muster aus persönlichem Log, kontrollierter Veröffentlichung und begrenztem Wettbewerb, aber keine Rechtfertigung für exakte Standortoffenlegung. [13] [15] Instagram bietet hilfreiche Kontrollmuster, aber kein Modell für BlackWaterLeafs fachliche Vertrauensanforderungen; Engagement darf keine Tierwohl-, Diagnose- oder Kaufentscheidung bestimmen. [19] [21] Shopify liefert Operationsmuster, doch seine Multi-Channel- und Order-Fähigkeiten sind kein Ersatz für BlackWaterLeafs fehlende Zahlungs-, Dispute- und Fulfillment-Infrastruktur. [25] [26] [28]

Die professionelle Differenzierung von BlackWaterLeaf liegt somit in **nachvollziehbarer Fachlichkeit, freiwilliger Privatheit und klarer Handlungsorientierung**, nicht in der maximalen Anzahl sozialer Funktionen.

## References

[1]: https://www.inaturalist.org/ "iNaturalist – Produktseite"
[2]: https://help.inaturalist.org/en/support/solutions/articles/151000171681-how-to-use-the-identify-page "iNaturalist Help: How to use the Identify page"
[3]: https://help.inaturalist.org/en/support/solutions/articles/151000169938-what-is-geoprivacy- "iNaturalist Help: What is Geoprivacy?"
[4]: https://www.inaturalist.org/pages/community+guidelines "iNaturalist Community Guidelines"
[5]: https://apps.apple.com/us/app/inaturalist/id6475737561 "iNaturalist im Apple App Store"
[6]: https://www.nngroup.com/articles/ten-usability-heuristics/ "Nielsen Norman Group: 10 Usability Heuristics for User Interface Design"
[7]: https://getplanta.com/ "Planta – Plant & Garden Care"
[8]: https://apps.apple.com/us/app/planta-plant-garden-care/id1410126781 "Planta: Plant & Garden Care im Apple App Store"
[9]: https://play.google.com/store/apps/details?id=com.stromming.planta&hl=en_US "Planta: Plant & Garden Care bei Google Play"
[10]: https://getplanta.com/privacy-policy "Planta Privacy Policy"
[11]: https://www.nngroup.com/articles/push-notification/ "Nielsen Norman Group: Push Notification UX"
[12]: https://www.w3.org/TR/wcag2mobile-22/ "W3C: Web Content Accessibility Guidelines (WCAG) 2.2 – Mobile"
[13]: https://fishbrain.com/features "Fishbrain Features"
[14]: https://fishbrain.com/features/logbook "Fishbrain Logbook"
[15]: https://support.fishbrain.com/hc/en-us/articles/22539057744796-How-does-the-leaderboard-work "Fishbrain Support: How does the leaderboard work?"
[16]: https://support.fishbrain.com/hc/en-us/articles/22539035568540-What-are-Fishbrain-s-Guidelines "Fishbrain Support: What are Fishbrain’s Guidelines?"
[17]: https://fishbrain.com/pro "Fishbrain Pro"
[18]: https://apps.apple.com/us/app/fishbrain-fishing-app/id477967747 "Fishbrain im Apple App Store"
[19]: https://help.instagram.com/517073653436611/ "Instagram Help: Private and public accounts"
[20]: https://help.instagram.com/381638392275939 "Instagram Help: Control your experience and content"
[21]: https://transparency.meta.com/features/explaining-ranking/ig-feed/ "Meta Transparency: Explaining ranking on Instagram Feed"
[22]: https://transparency.meta.com/features/explaining-ranking/ig-notifications/ "Meta Transparency: Explaining ranking on Instagram Notifications"
[23]: https://apps.apple.com/us/app/instagram/id389801252 "Instagram im Apple App Store"
[24]: https://developer.android.com/design/ui/mobile/guides/home-screen/notifications "Android Developers: Notifications"
[25]: https://apps.shopify.com/marketplace-connect "Shopify App Store: Marketplace Connect"
[26]: https://help.shopify.com/en/manual/online-sales-channels/marketplaces/marketplace-connect/setup "Shopify Help: Set up Marketplace Connect"
[27]: https://help.shopify.com/en/manual/online-sales-channels/marketplaces/marketplace-connect/products "Shopify Help: Manage products with Marketplace Connect"
[28]: https://help.shopify.com/en/manual/online-sales-channels/shop/customer-experience "Shopify Help: Customer experience"
[29]: https://help.shopify.com/en/manual/online-sales-channels/shop/delivery-tracking "Shopify Help: Delivery tracking"
[30]: https://www.nngroup.com/articles/progressive-disclosure/ "Nielsen Norman Group: Progressive Disclosure"
