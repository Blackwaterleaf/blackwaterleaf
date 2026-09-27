## 15.19 Phase 7 · Native Shell, Home und Realm-Karten
Die Native-App übernimmt jetzt die Phase-4-Designvorgaben in den drei sichtbaren Primärbereichen. Die Shell ist auf Suche, Benachrichtigungen und Profil als kompakte Kopfaktionen reduziert; Postfach, Marketplace und Pflege bleiben erreichbar, aber konkurrieren nicht länger mit der Hauptnavigation. Die untere Primärnavigation verwendet vier Ziele: Home, Entdecken, Community und Profil.
Der Home-Einstieg verwendet einen großen, bildstarken Observatory-Hero, einen ehrlichen Statusstreifen ohne erfundene Messwerte sowie ein 2×2-Kartenraster. Botanik, Aquaristik und Terraristik besitzen eigene Bild- und Akzentfarben; KI bleibt als eigener Bereich mit dem reservierten Indigo-/Violett-Akzent sichtbar. Realm- und Home-Aktionskarten verwenden große Medienflächen, dunkle Leseschicht, Bereichs-Glow, klare Labels und eine vollständige Tastatur-/Screenreader-Aktion.
Die Karten verwenden eine opake bzw. getönte Fallbackstruktur und keine dauerhafte Vollflächen-Unschärfe. Medien werden durch eine lokale Abdunklung hinter Text lesbar; der Native-Style nutzt die kompatible `StyleSheet.absoluteFill`-Definition. Die Migration wurde mit Native-TypeScript, Web-TypeScript, Produktionsbuild und `git diff --check` validiert.
## 15.20 Native-Host-Dashboard und Inhaltsabstand
Das Host-Dashboard ist in Web und Native ausschließlich für das serverseitig geprüfte Eigentümerkonto `blackwaterleaf@gmail.com` zugänglich. Der Native-Management-Hub öffnet keine externe Web-Weiterleitung mehr, sondern eine eigene Dashboard-Ansicht mit denselben aggregierten Analytics-Daten wie Web: registrierte Konten, Seitenaufrufe, Besuche, Logins, Aufenthaltsdauer, Absprungrate und Top-Seiten. Diagramme werden als sparsame, zugängliche Balken dargestellt; Werte werden niemals simuliert.
Native-Seiten mit fester Observatory-Bottom-Navigation reservieren ausreichend unteren Inhaltsabstand. Upload-Fortschritt, Medieneditor, Communitykarten und weitere Inhaltsflächen dürfen nicht hinter der Navigation liegen. Marketplace- und andere Leerzustände bleiben klar sichtbar und quellengetreu; es werden keine Platzhalterangebote oder erfundenen Grafiken ergänzt.
## 15.21 Medienupload wieder aktiv
Der bisherige Uploadfehler lag in der serverseitigen P0-Konfiguration: `mediaUpload` war trotz fertiger Uploadoberflächen global auf aktivem Blockierstatus. Dieser Gate ist jetzt deaktiviert. Bild- und Video-Uploads laufen weiterhin durch Eigentumsprüfung, aktuelle Medien-Einwilligung, MIME-/Container- und Signaturprüfung, Größenlimit, Metadatenbereinigung sowie geschützte Speicherung. Die Sperre für öffentliche Veröffentlichung bleibt davon getrennt bestehen.
## 15.22 Bildstarke Aktionskarten und Mobile-Layout
Alle fachlichen Aktionskarten verwenden vorhandene, verifizierte Bereichsbilder: Botanik grün, Aquaristik cyan, Terraristik gold und KI indigo/violett. Bildflächen erhalten eine dunkle Leseschicht, damit Text und Icons auf kleinen Displays sicher lesbar bleiben. Native Karten rendern die zugewiesene Medienquelle auch in visuellen Clusterkarten; Web-Karten verwenden dieselbe Quelle als Cover-Hintergrund.
Mobile Layouts wechseln kontrolliert zwischen zwei und einer Spalte, reduzieren Innenabstände ohne Inhalte zu beschneiden, halten Filter und Kartensteuerungen tappbar und reservieren Abstand für die feste Bottom-Navigation. Es werden keine künstlichen Ersatzbilder oder erfundenen Katalogdaten ergänzt; wenn ein Bildnachweis fehlt, bleibt der fachliche Leerzustand sichtbar.
## 15.23 Bilddetailflächen · kein kollabierender Ladezustand
Alle Bilddetailansichten verwenden eine stabile, responsive Bildfläche mit Mindesthöhe, `object-fit: contain`, sichtbarem Ladezustand und ehrlichem Fehlerfallback. Das gilt verbindlich für Katalog-/Taxonbilder, Community-Lightboxen, private Anlagenbilder und öffentliche Medien. Das Bild wird erst nach erfolgreichem Laden eingeblendet; ein fehlgeschlagener Abruf darf weder ein leeres Modal noch eine kollabierte Fläche erzeugen. Web und Native behalten Bildnachweis und Schließen-Aktion auch im Fehlerzustand.
## 15.24 Einheitlicher Arten-Steckbrief · Web und Native
Jede veröffentlichte Katalogkachel führt in einen eigenständigen Steckbrief mit Coverbild, gebräuchlichem Namen, wissenschaftlichem Namen, Nachweisstatus, Kurzprofil, Quellenangabe, Herkunfts-/Habitatkarte und strukturierten Faktenfeldern. Die Faktenfelder werden ausschließlich aus dem geprüften `careProfile` des Datensatzes befüllt: Pflegeaufwand, Licht, Wasser, Temperatur, Luftfeuchte, Substrat, Größe, Ernährung, Verhalten, Lebensraum, natürliches Habitat, natürliche Verbreitung, Herkunft und Verbreitung.
Web und Native verwenden dieselbe Feldlogik. Auf kleinen Displays werden die Fakten zweispaltig und bei sehr schmalen Breiten einspaltig dargestellt; lange Werte umbrechen und dürfen keine Karte oder Navigation überdecken. Nicht vorhandene Felder werden nicht mit Schätzwerten ersetzt. Der Steckbrief zeigt stattdessen einen quellengebundenen Leerzustand.
### Terraristik-Regel
Terraristik ist als eigener Fachbereich und Steckbrief-Typ aktiv. Der Katalog enthält derzeit drei veröffentlichte, geprüfte Erstdatensätze und informiert weiterhin transparent, wenn für eine weitere Art kein geprüfter Datensatz vorliegt. Es werden keine erfundenen Tierarten, Bilder, Herkunftsorte oder Pflegewerte angezeigt. Neue geprüfte Terraristik-Taxa erscheinen automatisch in derselben Cover → Name → wissenschaftlicher Name → Faktenblatt → Herkunfts-/Habitatbezug-Struktur.
## 15.25 Terraristik-Erstbestand und Herkunftsnachweis
Der Terrarium-Katalog enthält jetzt drei veröffentlichte, quellengebundene Taxa: *Eublepharis macularius* (Leopardgecko), *Correlophus ciliatus* (Kronengecko) und *Pantherophis guttatus* (Kornnatter). Jede Kachel beginnt mit einem hochwertigen Coverbild und führt in einen eigenständigen Steckbrief mit wissenschaftlichem Namen, gebräuchlichen Namen, Kurzprofil, Pflegeprofil, Quellenangabe und Herkunftsbezug. Der Fachbereich nutzt Gold als eigenen Akzent; Botanik, Aquaristik und die KI bleiben visuell getrennt.
Die Bildmedien stammen nicht aus Wikipedia-Artikelseiten, sondern aus Wikimedia Commons und werden nur zusammen mit Lizenz, Attribution, Quellseite und Abrufdatum veröffentlicht. Die Quellen- und Austauschdokumentation liegt in `docs/TERRARIUM_IMPORT_SOURCES_2026-09-27.md`. Eigene Bilder können später pro Datensatz ersetzt werden, ohne die Taxonomie- oder Steckbriefstruktur zu verändern.
## 15.26 OAuth-Zugang
Der Manus-Login startet Web und Preview künftig über `/api/oauth/start`. Portaladresse und App-ID bleiben serverseitig; der Server setzt das HttpOnly-CSRF-Cookie und erzeugt die Rücksprungadresse aus dem tatsächlich geöffneten Host. Dadurch kann eine veraltete oder fehlende Vite-Umgebungsvariable keinen ungültigen Login-Link mehr erzeugen. Bei fehlender OAuth-Konfiguration wird ein klarer JSON-Status `oauth_not_configured` zurückgegeben, statt eine leere Weiterleitung aufzubauen.
## 15.27 Eigene Anlagen · bildstarke Bereichsansicht
Die private Anlagenansicht übernimmt die Home-Farbwelten: Botanik arbeitet mit Mint-/Grünakzent, Aquaristik mit Cyan und Terraristik mit Gold. Kopfbereich, Register und Karten bleiben innerhalb dieser Bereichsatmosphäre; ein flacher olivfarbener Fremdblock ist nicht zulässig. Bereichsbilder werden als ruhige, lebende Hintergrundflächen mit dunkler Leseschicht eingesetzt.
Jede gespeicherte eigene Anlage erscheint als große Bildkarte. Wenn private Medien vorhanden sind, wird das erste echte Anlagenbild als Cover verwendet; weitere Bilder bleiben als gut erkennbare Vorschau erreichbar. Ohne eigenes Bild wird nur das verifizierte Fachbereichsbild als atmosphärischer Hintergrund verwendet und nicht als Anlagenfoto ausgegeben. Name, Bereich, Aktualisierungsdatum und vorhandene Messwerte liegen in einer klaren unteren Informationsschicht.
Die drei Bereichsumschalter sind als zusammengehörige Filtergruppe gestaltet. Leerzustände verwenden verständliche Formulierungen, erklären den privaten Charakter der Daten und führen mit einer klaren Aktion zur ersten Anlage. Karten und Formulare reservieren den Abstand für die feste Native-Navigation und dürfen keine Inhalte hinter System- oder App-Navigation verstecken.

## 15.28 Eigene Anlagen · Galerie, Overlay-Aktionen und Statuschips
Die Web- und Native-Anlagenkarten öffnen private Bilder in einer Vollbild-Galerie mit Vor-/Zurück-Navigation, Zoom und Bildzähler. Kleine Lösch-Overlay-Icons liegen direkt auf den Bildkacheln; die Bearbeiten-Aktion bleibt als kompakte Kartenaktion sichtbar. Temperatur, Luftfeuchte, pH, Pflegezustand und Aktualisierungszeit werden ausschließlich aus tatsächlich gespeicherten privaten Anlagendaten dargestellt. Fehlende Werte bleiben unsichtbar; es gibt keine Platzhalterwerte.

## 15.29 Habitat-Planer als getrenntes Modul
Der testweise Habitat-Planer gehört nicht zum aktiven Kernprodukt und wird weder in der Web-Shell noch in der Native-Navigation angezeigt. Die private Konto-Anlagenverwaltung bleibt ein aktiver Kernbereich. Eine spätere Planer-Version wird als separat versioniertes, feature-geflaggtes Modul entwickelt und darf erst nach erneuter fachlicher Freigabe in Web oder Native eingebunden werden.

## 15.30 Native-API-Parität und Android-Performance
Die Native-App verwendet keinen temporären Sandbox-Origin. `EXPO_PUBLIC_API_ORIGIN` kann den API-Host pro Build überschreiben; EAS-Builds verwenden andernfalls `app.json.extra.apiOrigin`. Die öffentliche BlackWaterLeaf-API antwortete im Audit auf Web- und Preview-Domain mit HTTP 200 für `platform.availability`.
Auf Android ist der globale Hintergrund-Blur deaktiviert. Neon-Glows verwenden reduzierte Schattenwerte; Karten- und Anlagenlisten bleiben mit `FlatList` performant. Ein realer S10-/S23-Ultra-Abnahmetest ist erst nach Verbindung eines Geräts möglich und wird nicht als bereits ausgeführt behauptet. Details stehen in `docs/ANDROID_PERFORMANCE_AUDIT_2026-09-27.md`.
EOF
wc -c docs/BLACKWATERLEAF_OBSERVATORY_SCREEN_DESIGN_BOOK_2026-09-19.md
git diff --check


## 15.31 Verbindliche Sicherheits- und Marketplace-Regeln
Das Design Book ist die **einzige aktive Designquelle**. Mischlayouts, nicht abgestimmte Altflächen und Beispielinhalte aus Mockups dürfen nicht als Fake-Daten in Web oder Native erscheinen. Die Begriffe **Aqua-Cyan**, Umsetzungssperre und Migrationsstand bleiben verbindliche Übergaberegeln.

Der geschützte Account-Löschprozess bleibt eine nicht-destruktive Vorschau über `profile.erasurePreview`. Vor einer späteren Freigabe müssen DB-, Session- und Storage-Löschlauf separat geprüft werden; bis dahin bleibt die Storage-Löschung `not_yet_executed`.

Marketplace und Partnerbereich verwenden getrennte Händler-Shops. Web und Native führen über `/marketplace/shop/:id` beziehungsweise `/marketplace/shop/` in die ausgewählte Händlerfläche. Die UI darf keine bestätigten Verkäufe behaupten; es werden nur Kaufinteressen, Weiterleitungen und **bestätigte Verkäufe** aus den jeweiligen autorisierten Daten angezeigt. `Partner`-Attribution und die Information „BlackWaterLeaf verarbeitet keine Zahlung“ bleiben sichtbar.

Die Marketplace-Übersicht beginnt mit einer kompakten **Shopauswahl**; Produkte werden erst innerhalb des ausgewählten Händler-Shops angezeigt.

## 15.32 Datenkontrolle · Export und Kontoschließung
Web und Native bieten im Datenschutzbereich einen geschützten maschinenlesbaren Kontoexport (`blackwaterleaf-account-export-v1`) mit Profil, privaten Anlagen, Beobachtungen, Pflege, Messwerten, Einwilligungsereignissen und Medienmetadaten. Storage-URLs und geheime Storage-Schlüssel werden im Export nicht ausgegeben. Solange die vollständige DB-, Session- und Storage-Löschkette nicht nachweisbar abgeschlossen ist, verwendet die Oberfläche ausschließlich die Formulierung **Deaktivierung/Anonymisierung** und nicht „vollständig gelöscht“.

Die geschützte Kontofunktion bleibt über `profile.erasurePreview` nachvollziehbar. Der vollständige **DB-, Session- und Storage-Löschlauf** ist vor einer späteren Freigabe separat zu prüfen; bis dahin bleibt die Storage-Löschung `not_yet_executed`.

## 15.33 Katalog → private Anlage
Jeder valide Pflanzen-, Aquaristik- und Terraristik-Steckbrief bietet eine kompakte Aktion **IN ANLAGE ÜBERNEHMEN**. Nur angemeldete Konten öffnen den privaten Erfassungsflow. Artname und wissenschaftlicher Name werden vorbefüllt; private Felder wie Messwerte, Pflegezustand, Notizen, Einrichtung und Bilder bleiben leer und werden nie aus Katalogdaten erfunden. Web und Native verwenden denselben Übergabevertrag und zeigen nach der Übernahme weiterhin den jeweiligen Fachbereichsakzent.


## 15.34 Wissenschaftlicher Review · Status, Begründung und Rollen
- Beobachtungen mit `queued_for_review` erscheinen ausschließlich in der geschützten Staff-Moderation.
- Jede Prüfung speichert evidenzbezogenen Status, Begründung, prüfende Person und Zeitpunkt; die Entscheidung wird zusätzlich im Audit-Ledger protokolliert.
- KI-Korrekturen behalten die ursprüngliche KI-Antwort unverändert. Ablehnungen benötigen eine Moderationsbegründung; die betroffene Person erhält eine Benachrichtigung.
- `evidenceState` darf nie als pauschaler Expertenkonsens beworben werden. Öffentliche Kartenpunkte bleiben von privaten Koordinaten und vom Reviewstatus getrennt.

## 15.35 Datenkontrolle · Export-Historie
- Jeder Kontoexport wird als geschütztes Audit-Ereignis `account_export_created` erfasst.
- Web zeigt die letzten zehn Exportzeitpunkte kompakt im Datenschutzbereich; Native bestätigt die protokollierte Exportanzahl nach dem Teilen.
- Exportdateien enthalten Profildaten, eigene Datensätze und Medienmetadaten, aber keine Storage-Schlüssel, Zugangsdaten oder geheimen API-Werte.


## 15.36 Beobachtungsantworten · fachlich, kompakt, nicht als Social-Ranking
Öffentliche Beobachtungen zeigen in Web und Native eine kleine, bereichseigene Antwortleiste. Zulässige Aktionen sind **Bestätigen**, **Taxon vorschlagen**, **Frage stellen** und – als Antwort auf eine Frage – **Antworten**. Die Aktionen stehen unter dem evidenzbezogenen Status und dürfen diesen nicht als Expertenkonsens darstellen.

Antworten sind nur für angemeldete Konten möglich. Jede Antwort speichert Autor, Beobachtung, optionalen Elternbeitrag, Typ, Zeit und Moderationsstatus. Der Eigentümer erhält eine Benachrichtigung; die Antwort wird nicht automatisch in Katalog, KI-Ergebnis oder Staff-Review übernommen. Ein Taxon-Vorschlag bleibt ausdrücklich **nicht verifiziert**.

## 15.37 Composer-Schutzkarten
Der Beobachtungs-Composer verwendet Privat als Standard. Standort, Medienverarbeitung, öffentliche Veröffentlichung und optionale KI-Prüfung werden separat und verständlich freigegeben. Vor öffentlicher Veröffentlichung werden generalisierte Koordinaten verwendet; private Koordinaten werden nie an Kartenfeeds oder Antworten ausgegeben. KI-Kandidaten bleiben mit Modell-/Katalogstand und Unsicherheitskennzeichnung getrennt von Community-Vorschlägen und `evidenceState`.


## 15.38 Feedback-Header und Benachrichtigungspräferenzen
Der Web- und Native-Header führt einen klaren, leuchtenden Einstieg **FEEDBACK · PROBLEME · WÜNSCHE**. Der Glow ist ein Wegweiser, kein Werbebanner; bei reduzierter Bewegung bleibt der Einstieg funktional und sichtbar. Der Inhalt ist nur nach Anmeldung sendbar, wird dem eigenen Konto zugeordnet und mit Kategorie, Nachricht und Ursprungsseite gespeichert.

Benachrichtigungen werden im privaten Profil nach Community, Nachrichten, Moderation/Review und System/Sicherheit einzeln geschaltet. Ohne gespeicherte Präferenz gelten die sicheren Standardwerte; sobald eine Präferenz gespeichert ist, filtert der Server den Feed und die ungelesene Anzahl nach diesen Schaltern. Die Plattform sendet keine globale, nicht steuerbare Sammelbenachrichtigung.


## 15.39 Internationale Locale-Regel · fünf Sprachen, ein Gerätevertrag
Web und Native verwenden denselben Locale-Vertrag: **Deutsch (`de`), Englisch (`en`), vereinfachtes Chinesisch (`zh-CN`), Spanisch (`es`) und Französisch (`fr`)**. Im Web wird beim ersten Besuch die Browser-Sprache ausgewertet; eine vom Nutzer gewählte Sprache wird lokal und – bei Anmeldung – im Konto gespeichert und hat Vorrang vor Browser-/IP-Hinweisen. Nicht unterstützte Browser-Sprachen fallen transparent auf Englisch zurück.

Der Web-Header führt den Sprachwähler als native, tastatur- und Samsung-Browser-kompatible Auswahl. Auf sehr kleinen Breiten werden kompakte Sprachkürzel verwendet, ohne die Hauptnavigation zu überdecken. Native zeigt dieselben fünf Optionen im Profil. Fach- und Wissensdaten werden nur aus der jeweils angeforderten Locale geladen; fehlende Übersetzungen werden nicht durch erfundene Inhalte ersetzt.


## 15.40 Partneranfrage · Web-/Native-Parität und Eingangsbestätigung
- Marketplace, Shop-Detail und Produktdetail zeigen denselben kompakten **PARTNER WERDEN**-Einstieg. Nicht angemeldete Personen werden zum Login geführt; angemeldete Konten senden die Anfrage serverseitig.
- Jede Anfrage wird mit Konto, verifizierter Kontaktadresse, Nachricht, Status und Zeit gespeichert. Der Absender erhält unmittelbar eine private `partner_inquiry`-Benachrichtigung mit Eingangsbestätigung; aktive Host-Administratoren erhalten die Prüfbenachrichtigung.
- Web und Native verwenden denselben `partners.submitInquiry`-Vertrag. Ein Klick auf die Host-Benachrichtigung führt zur Admin-Prüfung, ein Klick auf die Absenderbestätigung zum Marketplace. Keine Mailzustellung wird behauptet, solange kein Maildienst konfiguriert ist.
- Die Oberfläche nennt die bestehenden Kontaktadressen ausschließlich an den vorgesehenen Partner-/Legal-Flächen: `Partnerblackwaterleaf@gmail.com` für Partneranfragen, `blackwaterleaf@gmail.com` für allgemeine Geschäftsanfragen und `info.blackwaterleaf@gmail.com` für Impressum/Datenschutz.
