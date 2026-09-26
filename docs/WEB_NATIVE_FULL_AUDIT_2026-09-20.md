# BlackWaterLeaf Web-/Native-Vollprüfung – 20. September 2026

## Auditstand

Die erste Desktop-Stichprobe der Startseite zeigt eine grundsätzlich konsistente Observatory-Richtung mit schwarzem Waldgrün, Lime-Akzent, klarer linker Navigation und funktionalen Portalkarten. Auffällig sind jedoch die lange sichtbare Consent-Fläche im Hauptinhalt, unterschiedliche Akzentfarben innerhalb der Fachkarten, teilweise sehr kleine Mono-Texte sowie eine hohe Informationsdichte ohne durchgehend gleiche Abstände. Die Startseite zeigt außerdem Community- und Partnerbereiche bereits als echte Module, muss aber für nicht angemeldete Personen klar zwischen geschützten Daten und öffentlicher Orientierung unterscheiden.

Der vollständige Audit wird um Routenabdeckung, Daten-/Auth-Zustände, Native-Parität, Textkonsistenz, Farb- und Icon-Tokens, Tastatur-/Touch-Ziele und responsive Screens ergänzt.

## Mobile-Stichprobe

Die Mobile-Stichprobe bei 390 × 844 px bestätigt die Portalrichtung und die feste untere Navigation. Die Bereiche sind erkennbar, aber die Consent-Fläche nimmt auf jeder Route viel vertikalen Raum ein. Auf der Suchroute wird der Eingabetext am rechten Rand abgeschnitten; die Filterleiste ist horizontal übervoll und nicht vollständig erklärbar. Die Fachkarten sind visuell stark, allerdings sind Überschriften und Hilfstexte sehr klein und die Karten-/Listenfläche beginnt teilweise unterhalb des ersten Viewports. Das ist kein reiner Farbfehler, sondern eine Priorisierungs- und Textgrößenfrage.

## Kritischer Web-Laufzeitfehler

Die Desktop-Stichprobe der Route `/community` zeigt keinen Feed, sondern die Error Boundary mit `Rendered more hooks than during the previous render` in `Community.tsx` (Stacktrace um Zeile 426, `updateWorkInProgressHook`). Das ist ein Release-Blocker und muss vor visueller Detailarbeit behoben werden. Die `/live`-Route rendert dagegen als geschützter Zustand korrekt, zeigt aber erwartungsgemäß keine Sessions ohne Datenquelle.

## Community-Reparatur

Die Hook-Reihenfolge wurde korrigiert: Alle React-Hooks werden nun vor dem geschützten Auth-Zustand ausgeführt. Die Route `/community` rendert wieder stabil und zeigt im Preview den geschützten, aber funktionsfähigen Feed mit Navigation, Aktualisieren, Beitragerstellung, Bereichsfiltern und echtem Beitragsdatensatz. Eine Regression prüft die Hook-Position dauerhaft.

## Profil- und Fachbereich-Stichprobe

Die Profilansicht zeigt eine klare Identitäts-/XP-/Anlagenstruktur und die Fachbereichskarten sind visuell konsistent. Die Start-Consent-Fläche bleibt jedoch auch auf geschützten Seiten sichtbar und verdrängt relevante Inhalte. In der Botanikansicht war im aufgenommenen Stand noch der alte Karten-Leerzustand sichtbar; nach dem aktuellen Kartenpatch muss diese Fachbereichsansicht erneut geprüft werden. Außerdem zeigt die Fachbereichsaktion „Pflanze bestimmen“ explizit „NICHT VERFÜGBAR“ – das ist als Produktlücke zu behandeln, nicht als fertige Funktion.


## Abschlussprüfung und Paritätskorrekturen

Die Bestimmungsaktion ist keine Produktlücke mehr: „Pflanze bestimmen“ führt auf Web in den vorhandenen KI-Pflanzenworkflow (`/assistant#plant`), der Katalogzugang besitzt zusätzlich den stabilen Alias `/catalog`. Für schmale Screens wurden Wiederherstellungskarten so angepasst, dass sie in zwei Spalten beziehungsweise bei sehr kleinen Breiten untereinander ohne Text-Clipping laufen.

Der Native-Live-Bereich wurde gegen die bestehenden geschützten Live-Prozeduren gespiegelt. Er lädt Track, Sitzungsliste, Status, Host, Quelle und datensparsame Zuschauerzahl aus der API, trennt Community Live und Fachvorträge, zeigt echte Lade-/Fehler-/Leer-/geschützte Zustände und enthält eine Sitzungsdetailansicht mit Member-Chat, Nachrichtenlimit-Hinweis und Viewer-Heartbeat. IONOS/MediaMTX wird über `expo-video` als HLS-Player mit Bearer-Token wiedergegeben; YouTube und Twitch werden als geprüfte externe Anbieterquellen geöffnet und nicht als Fake-Video eingebettet. Staff sieht die vorhandenen Start-, Ende- und IONOS-Schlüsselrotationsaktionen nur mit serverseitiger Berechtigung.

Community besitzt auf Native nun eine eigene Beitragsdetailansicht mit vollständigem Beitrag, Medien, Melden-/Blockieren-/Like-Aktionen, verschachtelten Antworten und Kommentar-Editor. Der Feed bleibt authentifiziert und zeigt keine erfundenen Beiträge. Web und Native teilen die Zustands- und Sicherheitsregeln aus dem Design Book.

## Validierung

Die Web-Produktionsbuild ist erfolgreich. Die vollständige Vitest-Suite ist erfolgreich: **84 Testdateien, 327 Tests**. Native TypeScript ist erfolgreich (`pnpm run check`), `git diff --check` ist ohne Befund. Der zusätzliche Expo-Native-Player ist in `mobile-natur/package.json`, `mobile-natur/pnpm-lock.yaml` und `mobile-natur/app.json` registriert.

## Verbleibende echte Infrastrukturvoraussetzung

Die IONOS-Medienwiedergabe bleibt bis zur Hinterlegung der produktiven MediaMTX-/Caddy-Umgebung absichtlich im ehrlichen Zustand „nicht verbunden“. Das ist kein UI-Platzhalter: Start, Playback und geschützte Tickets werden erst aktiv, wenn `selfHostedMediaCapabilities()` eine gültige HTTPS-Origin und das serverseitige Kontrollgeheimnis erkennt. Externe Provider-Sitzungen können unabhängig davon genutzt werden.


## Visuelle Revalidierung

Die Desktop- und Mobile-Stichprobe der aktualisierten Routen bestätigt: `/assistant#plant` öffnet direkt den Pflanzenbestimmungs-Workflow, `/catalog` ist im Observatory-Rahmen erreichbar, Community zeigt den stabilen geschützten Feed und Live zeigt die getrennten Tracks mit ehrlichem Leerzustand. Die Mobile-Community- und Live-Karten bleiben innerhalb des Viewports und die feste untere Navigation ist ohne Überlagerung nutzbar.

Eine kleine responsive Restkorrektur bleibt: Der lange Such-Placeholder im `/catalog`-Input wird auf 390 px trotz korrekter Input-Grenze visuell am rechten Ende abgeschnitten. Der Text wird auf einen kürzeren, weiterhin eindeutigen Placeholder reduziert; die horizontal scrollbare Filterleiste bleibt absichtlich scrollfähig und erzeugt keinen Seitenüberlauf.


Die letzte Mobile-Aufnahme des Katalogs bei 390 × 844 px bestätigt den korrigierten Placeholder „Pflanze, Wissen oder Produkt …“ ohne sichtbares Abschneiden; die Filterchips bleiben innerhalb einer horizontalen Scrollfläche ohne Dokumentüberlauf.

Nach der Korrektur ist die Validierung vollständig grün: **85 Testdateien, 330 Tests**, Web-TypeScript, Produktionsbuild, Native-TypeScript und `git diff --check`. Der zusätzliche Native-Paritätsvertrag schützt künftig Live-API-Verträge, HLS-Player, getrennte Live-Tracks, geschützten Chat und die Community-Detailansicht.


## Postfach-, Notification- und Pre-Live-Technikprüfung

Vor dem produktiven Live-Streaming wurden persönliche Nachrichten als echter geschützter Bereich ergänzt. Web und Native bieten `/messages` beziehungsweise den entsprechenden Native-Screen, eine Unterhaltungsübersicht, einen autorisierten Nachrichtenverlauf, neue 1:1-Unterhaltungen aus öffentlichen Profilen, Antwortversand, Lesestatus und ungelesene Zähler. Notifications vom Typ `message` führen auf beiden Plattformen in das Postfach. Die Serverregeln verhindern Selbstnachrichten, inaktive oder suspendierte Empfänger, beidseitig blockierte Konten, policy-widrige Inhalte und mehr als 100 sichtbare Nachrichten pro Konto und Stunde. Private Inhalte werden nicht in öffentliche Profil- oder Feedantworten kopiert.

Die Web- und Native-Header zeigen die privaten Benachrichtigungs- beziehungsweise Postfachzähler; Native aktualisiert diese Werte nach dem Öffnen eines Gesprächs oder Notification-Eintrags. Das Postfach enthält echte Lade-, Fehler-, Leer- und geschützte Zustände und zeigt keine Test- oder Ersatznachrichten. Eine Regression deckt Schema, Router, Web, Native, Blockprüfung, Rate-Limit und Notification-Ziel ab.

Die Prüfung der verbleibenden `unavailable`-Markierungen korrigierte veraltete Hinweise für bereits implementierte Benachrichtigungen und Pflanzenbestimmung: `/flow/live` führt zu `/notifications`, `/flow/foto` zu `/assistant#plant`. Bewusst offen bleiben nur reale externe beziehungsweise noch nicht implementierte Bereiche: die produktive IONOS/MediaMTX-Origin, Community-Video-Uploads und Smart-Device-Herstellerfreigaben. Diese werden weiterhin wahrheitsgemäß als nicht verbunden beziehungsweise nicht verfügbar gekennzeichnet; es werden keine Fake-Daten oder Fake-Videos ergänzt.

## Validierung dieses Nachtrags

Web-TypeScript, die vollständige Vitest-Suite mit **86 Testdateien und 333 Tests**, Native-TypeScript, Produktionsbuild und `git diff --check` wurden erfolgreich ausgeführt. Der Produktionsbuild meldet weiterhin nur die bestehende Chunkgrößen-Warnung; es gibt keinen Buildfehler. Der finale Checkpoint muss nach einer letzten Status-/Diff-Prüfung gespeichert werden.

## Community-Medien und Smart-Device-Status

Der Community-Composer unterstützt auf Web und Native neben Bildern nun auch MP4- und WebM-Videos. Uploads bleiben an die Einwilligung zur Medienverarbeitung und an den ausdrücklichen Veröffentlichungs-Schalter gebunden. Der Server prüft MIME-Typ, Base64-Kodierung, Container-Signatur und ein Limit von 16 MB; pro Beitrag ist höchstens ein Video zulässig. Feed und Diskussionsdetail verwenden kontrolliertes Playback ohne Autoplay. Die additive Migration `drizzle/0036_lumpy_omega_sentinel.sql` ist erzeugt und geprüft, wurde aber entsprechend dem Deployment-Vertrag nicht automatisch auf einer verbundenen Produktionsdatenbank ausgeführt.

Die Smart-Device-Anbindung bleibt absichtlich herstellerneutral: Die Web-Auswahl, private Zuordnung, manuelle Messwerte und der Status `awaiting_authorization` sind vorhanden; es werden keine Herstellerzugangsdaten erfragt und keine automatische Verbindung behauptet. Eine echte Synchronisierung benötigt vor Aktivierung eine konkret freigegebene Hersteller-API, OAuth-/Webhook-Spezifikation und sichere Secret-Verwaltung. Bis dahin zeigt die Oberfläche den ehrlichen Nicht-verbunden-Zustand.


## Vollständigkeitsnachtrag 23. September 2026

Die erneute Prüfung hat vier konkrete Lücken geschlossen. Community-Likes sind jetzt echte Umschalter und prüfen beide Richtungen der Blockbeziehung. Neue Kommentare sowie Post- und Kommentar-Meldungen werden bei einer Blockbeziehung serverseitig abgewiesen; damit kann eine lokale UI-Aktion keine blockierte Person wieder erreichen. Die Unified-Suche gibt Community-Inhalte Gästen nicht mehr zurück und filtert bei angemeldeten Konten gegenseitige Blockbeziehungen ebenfalls aus.

Der Consent-Widerruf setzt öffentliche Beobachtungen, Community-Beiträge und zugehörige Medien im Rahmen der jeweiligen Freigabe atomar zurück. Der Vorgang bleibt serverseitig und ist nicht nur eine UI-Präferenz. Die Repository-Migrationsbaseline wurde auf Migration `0036_lumpy_omega_sentinel.sql` und 37 Journal-Einträge aktualisiert. Die lokale Baseline-Prüfung besteht; eine produktive Datenbankmigration wird weiterhin nicht behauptet, weil kein Backup-/Restore-Nachweis vorliegt und der `db:push`-Guard geschlossen bleibt.

Die Web-Diskussion und die Native-Diskussion unterstützen nun auch Bearbeiten und Löschen eigener Kommentare sowie das Melden fremder Kommentare. Die Taxon-Herkunftskarte bleibt ausdrücklich schematisch: Sie zeigt ausschließlich vorhandene, quellengebundene Herkunfts-, Habitat-, Wasser- oder Temperaturfelder aus dem Datensatz und nie erfundene Koordinaten. Fehlt eine Quelle, bleibt der Zustand sichtbar offen.

### Noch nicht als erledigt behauptet

Eine fachlich belastbare Punktkarte mit exakten Wildfundorten für jedes Taxon ist absichtlich nicht freigeschaltet. Dafür fehlen in den veröffentlichten Datensätzen strukturierte, separat geprüfte Verbreitungsgeometrien und eine Sensitivitätsregel für gefährdete Arten. Ebenso ist die Ziel-Datenbank nicht als migrationsgleich bestätigt, solange der erforderliche isolierte Restore-Test fehlt.

## Kategorie- und KI-Nachtrag 25. September 2026

Die drei Fachbereiche wurden erneut geprüft. Botanik und Aquaristik liefern veröffentlichte Taxa mit vollständigen strukturellen KI-Feldern (`scientificName`, `genus`, `commonNames`, `synonyms`, `summary`, `careProfile`); die Realm-Kataloge zeigen nur verifizierte Bilder mit Provenienz. Terraristik bleibt korrekt als leerer Katalogzustand ausgewiesen, weil keine quellengebundenen Terrarium-Taxa vorliegen. Die Suche wurde um Realm-Deep-Links, partielle Gattungs-/Namenssuche und echte Taxonbilder erweitert. Channa liefert veröffentlichte Treffer mit Bildnachweisen; Alocasia liefert veröffentlichte Treffer, einzelne Datensätze bleiben bis zur individuellen Bildprüfung ohne Bild.

Der KI-Katalogabgleich verwendet nun zusätzlich Gattung, gebräuchliche Namen, Synonyme, kompakte Habitatfakten und ausgewählte Pflegefelder. Der Kontext bleibt auf maximal sechs relevante Referenzen begrenzt, um Antworten stärker an die Datenbank zu binden und unnötigen Modellverbrauch zu reduzieren. Migration 0037 ergänzt dafür schnelle Gattungs-/Familienindizes.

## Host-Reichweitenübersicht 26. September 2026

Das bestehende Admin-Dashboard wurde um eine belastbare Host-Übersicht erweitert. BlackWaterLeaf kann im Bereich `Analytics` jetzt die Gesamtzahl registrierter Konten, Seitenaufrufe, eindeutige Besuche, Logins im gewählten Zeitraum, durchschnittliche Aufenthaltsdauer, Absprungrate, beliebte Seiten und Länderaggregate sehen.

Die Reichweitenmessung läuft automatisch ohne Zustimmungsdialog, wie für den Host gewünscht. Sie speichert ausschließlich eine temporäre Session-Kennung aus `sessionStorage` sowie aggregierbare Ereignisdaten. IP-Adressen, Namen, Konto-IDs, User-Agents und Seiteninhalte werden nicht gespeichert. Die Analytics-Abfrage bleibt serverseitig auf das Eigentümerkonto `blackwaterleaf@gmail.com` beschränkt. Livestream-Zähler bleiben davon getrennt und werden erst später freigeschaltet.
