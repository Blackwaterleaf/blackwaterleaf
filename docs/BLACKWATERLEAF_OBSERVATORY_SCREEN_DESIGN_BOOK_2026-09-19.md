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


## 15.41 Monetarisierung · Free / Pro (2026-09-27)

- **Free bleibt offen:** Katalog, Basis-Suche, Community, öffentliche Beobachtungen, Basis-Karte, eine private Anlage und **10 kostenlose KI-Bestimmungen pro UTC-Tag**.
- **Pro-Kennzeichnung:** Pro erscheint immer mit sichtbarem `PRO`-/Sparkles-Symbol, Preis und konkreter Leistungsbeschreibung. Keine versteckten oder irreführenden Sperren.
- **BlackWaterLeaf Pro:** **9,99 € monatlich oder 54,99 € jährlich**. Kernnutzen sind unbegrenzte private Anlagen, Pflegehistorie, Auswertungen, **300 monatliche KI-Bestimmungen**, Export/Backup, Herkunftskarten und werbefreie Nutzung.
- **Creator / Expert:** bleibt bis zur Aktivierung der LIVE-Funktionen als späteres Paket sichtbar, aber nicht buchbar. Geplante Leistungen: Fach-LIVEs, exklusive Videos, Creator-Statistiken und Community-Badges.
- Web und Native verwenden dieselben Begriffe, Preise und Free-/Pro-Grenzen. Zahlung wird erst nach Anschluss und Prüfung eines Zahlungsanbieters aktiviert. Die Abo-Seite erklärt transparent, dass Pro den Betrieb der IONOS-KI, Server- und Speicherinfrastruktur mitträgt; Free-Nutzer sehen eine klare In-App-Mitteilung und einen Upgrade-CTA.
- Kleine Android-Geräte erhalten eine einspaltige Pro-Kartenansicht; keine Blur-/Glow-Pflicht für Pro-Flächen.


## 15.42 Profil · Abo-Status und Upgrade

Web und Native zeigen im privaten Benutzerprofil einen eigenen Abo-Bereich. Der Bereich benennt den aktuellen Status (`FREE · AKTUELL` oder `PRO AKTIV`), zeigt die Free-/Pro-Leistungsgrenzen kompakt und führt über eine klare Upgrade-Aktion zur vollständigen Pro-Übersicht. Die Zahlung bleibt bis zum Anschluss eines geprüften Zahlungsanbieters deaktiviert; der Hinweis `ZAHLUNG VORBEREITET` muss sichtbar bleiben. Auf kleinen Android-Geräten stapeln sich die Free-/Pro-Karten einspaltig.

## 15.43 Native Community Release · Upload, Folgen und Icon-Raster

- Der Community-Upload verkleinert Bilder vor dem Base64-Transport auf höchstens 3200 Pixel Kantenlänge, normalisiert sie als JPEG und überträgt sie erst nach einer expliziten Medienfreigabe. Die API akzeptiert ausschließlich validierte JPG-, PNG- oder WebP-Bilder bis 32 MB und prüft Eigentümerschaft, MIME-Signatur, Größe und Metadaten serverseitig.
- Der mobile Web-Upload akzeptiert nun geprüfte Originalbilder bis **32 MB**. Für die Community werden große Bilder regulär mit maximal 3200 Pixel Kantenlänge auf JPEG verkleinert. Wenn ein Samsung-Browser die Canvas-Verarbeitung eines großen Fotos nicht bereitstellt, darf er das unveränderte Original innerhalb der 32-MB-Grenze hochladen; darüber zeigt die Oberfläche einen konkreten Qualitäts-/Größenhinweis statt einer ungenauen Verarbeitungsmeldung.
- Die Bereichsauswahl ist verbindlich getrennt: reguläre Konten wählen **Botanik**, **Aquaristik** oder **Terraristik**; nur serverseitig als Admin erkannte Konten erhalten **Alle Feeds · Admin**. Öffentliche Community-Veröffentlichung ist wieder aktiv, bleibt aber an Einwilligung, Content-Policy und Moderation gebunden.
- Folgen, Entfolgen, Follower- und Folge-ich-Listen verwenden Web und Native über denselben `social.*`-Vertrag. Nach einer Aktion lädt Native den aktuellen Beziehungsstatus erneut vom Server, damit der Zustand nicht nur lokal angezeigt wird.
- Kopfaktionen haben ein einheitliches 40×40-Raster. Profilmenü-Karten richten Icon und Text horizontal aus; alle fünf Icons haben 21 px und dieselbe linke Achse. Diese Regel verhindert Überlappung und ungleich große Aktionen auf kleinen Android-Geräten.


## 15.44 Social-Profile · Mehrere Konten und offizielle Links (2026-09-27)

- Ein Mitglied kann im Profil mehrere öffentliche **Instagram-, TikTok-, YouTube-, Facebook- oder Website-Links** mit eigener Bezeichnung verwalten. Es werden nur `https`-URLs gespeichert; niemals Zugangsdaten, Tokens oder fremde Kontoberechtigungen.
- Web und Native bieten denselben speicherbaren Mehrfach-Link-Vertrag. Im öffentlichen Profil erscheinen diese Links erst, wenn das Profil über die bestehende Sichtbarkeitsfreigabe öffentlich ist. Private Anlagen, Nachrichten, Standorte und unveröffentlichte Inhalte bleiben davon getrennt.
- Die offiziellen Profile sind im Impressum und im offiziellen BlackWaterLeaf-Profil sichtbar: **Instagram BlackWaterLeaf**, **Instagram House of Channa**, **TikTok BlackWaterLeaf** und **TikTok Channa World One**. Externe Links öffnen immer in einem neuen Webkontext und sind klar als externe Profile markiert.
- Kleine Android- und mobile Web-Ansichten verwenden einspaltige Linkkarten mit 36–40 px Touchflächen, vollständigen Labels und sichtbarer Plattformkennzeichnung; der Editor verzichtet auf dichte, überlappende Steuerelemente.


## 15.45 Community · Sichtbarer Großbildupload (2026-09-27)

Web und Native zeigen bei jedem Community-Medienupload eine persistent sichtbare **Phasenkarte**: Entwurf vorbereiten, Bild aufbereiten, sicher übertragen und gegebenenfalls veröffentlichen. Die Karte enthält einen Fortschrittsbalken, aktuelle Prozentanzeige, aktive Phase und während der Übertragung eine klare Ladeanimation. Bei Bildern ab 5 MB erklärt sie ausdrücklich, dass die Optimierung und Übertragung je nach Verbindung länger dauern kann und die Seite beziehungsweise App geöffnet bleiben soll. Die Prozentanzeige beschreibt den tatsächlichen Ablauf der Arbeitsphasen; sie verschwindet bei Erfolg oder Fehler nicht unbemerkt hinter einem unveränderten Button. Beide Clients verwenden dieselben deutschen Begriffe, dieselbe Reihenfolge und denselben geschützten Uploadvertrag.

## 15.47 KI-Ergebnisflächen · Evidence Rail und Analysephasen (2026-10-12)

Der KI-Pflanzenscreen verwendet in Web und Native den **Evidence-Rail-Standard**: Bildvorschau, sichtbarer Analysefortschritt, Ergebnisstatus, Kandidaten, Merkmale und unabhängige Prüfung erscheinen in dieser Reihenfolge. Der lange KI-Antworttext bleibt als Detailnachweis erhalten und ersetzt die strukturierten Karten nicht.

Während der Verarbeitung zeigen beide Clients dieselben drei Phasen: **Bild vorbereiten**, **Merkmale prüfen**, **Quellen abgleichen**. Der aktive Zustand wird als Statuskarte mit kurzer, ruhiger Sweep-Animation dargestellt. Web und Native verwenden Observatory-Grün für den Systemstatus; violette Flächen dürfen den Bild- und Textinhalt nicht mehr dominieren. `prefers-reduced-motion` beziehungsweise reduzierte Bewegung deaktivieren den Sweep, ohne Statusinformationen zu verlieren.

Die Ergebnisfläche führt ausdrücklich mit **Analyse abgeschlossen · vorläufig**. Kandidaten enthalten gebräuchlichen Namen, wissenschaftlichen Namen, beobachtete Begründung und Sicherheitsband. Keine Karte darf eine sichere Artbestimmung, erfundene Quelle, erfundenen Fundort oder erfundene Messwerte behaupten. Muster B, **Focus Card**, bleibt als dokumentierte mobile Alternative erhalten; bis zu einer späteren Abnahme wird ausschließlich Muster A produktiv gerendert.

## 15.48 KI-Kostenstandard · kompakter Kontext und datensparsamer Resultatcache (2026-10-12)

- Die Datenbank bleibt die vollständige fachliche Quelle. Für KI-Anfragen wird daraus nur ein kompakter Abgleichkontext mit maximal zwei sichtbaren Referenzen und gekürzten Kurzfeldern erzeugt; vollständige Datensätze bleiben in den Katalog-Steckbriefen verfügbar.
- Text-Chat sendet höchstens die letzten zwei gekürzten Nachrichten. Der allgemeine Antwortbudget liegt bei 420 Tokens, die strukturierte Pflanzen-Triage bei 800 Tokens. Web und Native verwenden dieselbe Begrenzung.
- Pflanzenbilder werden vor dem Modellaufruf in Web und Native auf maximal 1280 px Kantenlänge normalisiert. Das Original bleibt unverändert im Gerät und wird nicht in der KI-Datenbank gespeichert.
- Wiederholte Analysen desselben normalisierten Bildsets werden bis zu sieben Tage aus `assistant_result_cache` beantwortet. Gespeichert werden ausschließlich SHA-256-Fingerabdruck, Modellname, strukturierte Bestimmung, Prüfstatus und Ablaufzeit; keine Bildbytes, EXIF-Daten, Notizen oder Prompts. Cache-Treffer verbrauchen keine neuen KI-Tokens und keine neue Pflanzenbestimmung.
- Jeder Modell- und Cache-Aufruf bleibt im Usage-Ledger mit Provider, Tokenwerten und geschätzten USD-Kosten nachvollziehbar. Der Cache ist kein wissenschaftlicher Konsens und ändert keine Katalogdaten.

## 15.49 Premium-Codes und Punktebonus (2026-10-12)

- Admins können zeitlich begrenzte Premium-Codes mit 1 Woche, 2 Wochen, 1 Monat oder 2 Monaten Laufzeit erstellen. Optional wird ein serverseitiger Punktebonus und eine maximale Einlösezahl festgelegt; eine zusätzliche Code-Frist kann den Code vor Ablauf der Premium-Laufzeit schließen.
- Der Klartext wird nur bei der Erstellung angezeigt. Persistiert wird ausschließlich ein SHA-256-Digest; Web und Native verwenden denselben `promoCodes.redeem`-Vertrag. Ein Code kann pro Konto nur einmal eingelöst werden, Einlösungen und Punktebonus sind im unveränderlichen Ledger nachvollziehbar.
- Eine Einlösung verlängert den persönlichen `pro_override`-Anspruch sicher bis zum späteren Ablaufzeitpunkt, verbraucht keinen KI-Token und aktiviert keine Zahlung. Widerruf stoppt weitere Einlösungen, verändert aber keine bereits gewährte Laufzeit.
- Profil und Native-App zeigen Status, Ablaufdatum und Einlösungshistorie. Admin zeigt Code-Label, Laufzeit, Bonus, Einlösungszähler und Status, aber niemals den gespeicherten Codewert. Fehlerzustände werden als verständliche serverseitige Rückmeldung angezeigt; es gibt keine simulierten Premium- oder XP-Werte.

## 15.50 KI-Bestimmung · Pflanzen-/Fisch-Auswahl (2026-10-12)

- Die Bild-KI bietet in Web und Native vor der Analyse eine eindeutige Auswahl **Pflanze bestimmen** oder **Fisch bestimmen**. **Aquarium verstehen** bleibt davon getrennt und analysiert ausschließlich das private Beckenprofil.
- Beide Auswahlwege verwenden denselben tokenarmen Bild-, Kontingent- und Fortschrittspfad. Der Auswahlwert wird im Serververtrag, im Usage-Ledger und im Cache-Fingerprint geführt; ein Pflanzenbild und ein Fischbild können daher niemals denselben fachlichen Cacheeintrag teilen.
- Pflanzenbestimmungen verwenden den Botanik-Katalog und optional die unabhängige Pl@ntNet-Prüfung. Fischbestimmungen verwenden ausschließlich den veröffentlichten Aquaristik-Katalog und zeigen keine botanische Prüfquelle an. Wikimedia/Wikipedia bleiben ausgeschlossen.
- Ergebnisstatus, Kandidaten, Merkmale, Quellenabgleich und vorläufige Sicherheit sind in beiden Clients strukturell gleich. Nur Fachsprache, Icon, Akzent und Katalogbereich wechseln zu Botanik beziehungsweise Aquaristik.


## 15.51 Primärnavigation · Feed-Bezeichnung und Marketplace-Aktivzustand (2026-10-12)
- Web und Native verwenden für das direkte Community-Ziel einheitlich die sichtbare Bezeichnung **Feed**. Die Route `/community` und ihre fachliche Community-Funktion bleiben unverändert; angepasst wird ausschließlich die globale Navigationssprache.
- Der Marketplace bleibt ein kontextuelles Ziel außerhalb der sieben Primärziele. Beim Öffnen darf in Native kein anderes Primärziel, insbesondere **Profil**, als aktiv markiert werden. Es wird entweder kein Primär-Tab markiert oder der kontextuelle Marketplace-Zustand separat dargestellt.
- Navigationslabels und Aktivzustände werden in beiden Clients durch Vertragsprüfungen abgesichert, damit sprachliche oder visuelle Rückfälle nicht unbemerkt in einen Release gelangen.


## 15.39 KI-Modernisierung · fachliche Akzente und Pro-Zustand
Die KI-Ergebnisfläche ist in Web und Native fachlich codiert: Botanik verwendet den Observatory-Mint-/Grünakzent `#C7F35B`, Fischbestimmung und private Aquarienanalyse den Aqua-Cyan-Akzent `#28D8FF`, der allgemeine KI-Dialog einen zurückhaltenden Violettakzent. Derselbe Akzent gilt innerhalb eines Modus für Auswahl, Uploadfläche, Ladeanimation, Evidenz-/Ergebniskarte und Quellenstatus; ein globaler Einheitsakzent ist nicht zulässig.

Die Ladeanimation bleibt inline und sichtbar: ein kompakter Orb, eine kurze Statuszeile und die drei Phasen **Bild vorbereiten**, **Merkmale prüfen**, **Quellen abgleichen**. Sie darf weder Foto, Ergebnis noch Navigation überdecken. `prefers-reduced-motion` deaktiviert ausschließlich die nicht notwendige Rotation, nicht den Status oder die Textinformation.

Die Bestimmungskontingentkarte benennt den Fachmodus korrekt als **PFLANZENBESTIMMUNG** oder **FISCHBESTIMMUNG**. Private Aquarienanalysen werden als Aquaristik-Kontext geführt. Web und Native verwenden denselben serverseitigen Usage-/Quota-Vertrag und denselben IONOS-Provider; kein Client darf Kontingente selbst bestimmen.

Aktive Pro-Konten sehen keine Preise, Credit-Kaufkarten oder Upgrade-Aufforderungen. Stattdessen erscheint ein klarer Status **PRO AKTIV** beziehungsweise **DEIN PRO-ZUGANG IST AKTIV** mit dem verbleibenden Kontingent. Preise und Kaufoptionen werden ausschließlich für Free-Konten gerendert. Diese Regel gilt für Pro-Seite, Profilkarte und Native-Pro-Screen.

Der Modernisierungsstand wurde mit Web-TypeScript, Native-TypeScript, gezielten Monetarisierungs-/KI-Vertragstests, Produktionsbuild und `git diff --check` validiert.

## 15.52 P1-Feldmissionen · echte Aufgaben statt Demo-Telemetrie
- Web und Native bieten unter **Feldmissionen** denselben serverseitigen Challenge-Vertrag: veröffentlichte Missionen, Fachbereich, Regeltext, Enddatum, Punkte und persönlicher Beitritts-/Fortschrittsstatus.
- Eine Mission erscheint nur, wenn sie serverseitig veröffentlicht ist und ihr Zeitraum noch offen ist. Ohne Datensatz zeigt die Oberfläche einen transparenten Leerzustand; es werden keine Beispielmissionen oder simulierten Fortschrittswerte erfunden.
- Nicht angemeldete Personen dürfen veröffentlichte Missionen lesen, werden für Beitritt und Fortschritt aber zum sicheren Login geführt. Ein Beitritt wird serverseitig idempotent gespeichert.
- Die visuelle Codierung folgt dem Observatory-System: Botanik Mint/Grün, Aquaristik Aqua-Cyan, Terraristik Gold. Die Karte besteht aus Aufgabenbeschreibung, verbindlichem Regeltext, Enddatum, Punktewert und Status.
- Das vorbereitete **Signal-Labor** bleibt bis zu realen Messwerten aus eigener Anlage oder autorisiertem Gerät ein transparenter Statusbereich. Es zeigt niemals erfundene pH-, Temperatur-, Reichweiten- oder eDNA-Werte. Labor- und eDNA-Partnerschaften sind P2 und nicht Bestandteil des aktiven Produkts.
- P1-Abnahme umfasst Web-Route `/missions`, Native-Screen `missions`, Beitritt, Fortschrittsanzeige, Login-Gate, Leer-/Fehlerzustand, Pull-to-Refresh und `git diff --check`.


## KI-Ergebnis-Workspace · 2026-10-16

Die KI-Bestimmung trennt ab sofort strikt zwischen **Eingabe** und **Ergebnis**. Nach erfolgreicher Pflanzen- oder Fischanalyse wird kein langer Ergebnisblock mehr unter dem Uploadformular angehängt.

- **Ergebnisfläche:** eigener Workspace mit Status „vorläufig · mit sichtbarer Evidenz“.
- **Hero-Ebene:** Top-Kandidat, wissenschaftlicher Name, Kurz-Zusammenfassung und Sicherheitsgrad stehen zuerst.
- **Kontext-Ebene:** das analysierte Originalbild bleibt als kompakter Kontext sichtbar; „Neue Analyse“ und „Weiteres Bild“ sind direkt erreichbar.
- **Evidenz-Ebene:** Kandidaten, erkennbare Merkmale, weitere Bilder und unabhängige Prüfung bleiben als Karten strukturiert.
- **Rohantwort:** lange KI-Einordnung ist standardmäßig eingeklappt und nur bei Bedarf aufklappbar.
- **Fachfarben:** Botanik nutzt den Observatory-Limetteton, Aquaristik/Fisch den verbindlichen Cyan-Ton; Ladezustand, Hero, Rahmen und Aktionen verwenden denselben Akzent.
- **Native-Parität:** derselbe Ablauf wird mobil als kompakte Hero-Karte mit aufklappbarer KI-Einordnung umgesetzt; keine Textwand im Standardzustand.
- **Motion:** Ladezustand zeigt die drei Phasen „Bild vorbereiten“, „Merkmale prüfen“ und „Quellen abgleichen“; bei reduzierter Bewegung werden Animationen deaktiviert.
