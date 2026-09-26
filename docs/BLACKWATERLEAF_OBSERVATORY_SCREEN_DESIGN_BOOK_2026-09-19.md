# BlackWaterLeaf Observatory Screen Design Book

**Version:** 2.0 · **Datum:** 19. September 2026 · **Gültigkeit:** Web und Native

## 1. Verbindlicher Status

Dieses Dokument ist die **einzige aktive Designquelle** für BlackWaterLeaf. Es basiert auf den bereitgestellten Desktop- und Mobile-Screenshots vom 19. September 2026. Das frühere Designbuch, das frühere Reference-Overlay-System, alte Kartenraster, alte Header-/Footer-Varianten und Mischlayouts sind verworfen. Sie dürfen weder als Fallback noch als Teilkomponente in neuen oder umgebauten Screens verwendet werden.

Die Screenshots zeigen dasselbe Produkt in zwei Breakpoints: **Desktop-Observatory** und **Mobile-Observatory**. Inhalte, Begriffe, Icons, Farben, Reihenfolge und Zustände bleiben gleich; ausschließlich die räumliche Anordnung passt sich dem Gerät an.

> Ein Screen ist nicht konform, wenn nur Farben oder ein globaler Rahmen geändert wurden. Hero, Informationshierarchie, Kartenstruktur, Navigation, Zustände und Interaktionen müssen die nachstehenden Regeln sichtbar erfüllen.

## 2. Produktbild

BlackWaterLeaf ist ein wissenschaftliches Naturportal für Botanik, Aquaristik, Terraristik, Artenwissen, Beobachtungen, KI-Bestimmung, Community und transparente Partnerangebote. Die Oberfläche wirkt wie ein ruhiges, hochwertiges Observatorium: tiefes Schwarzgrün, klare Datenflächen, naturbezogene Bilder, gezielte Leuchtakzente und gut lesbare Fachinformationen.

Die Gestaltung ist **kein Entertainment-Feed**, kein generisches Dashboard und kein lose zusammengesetztes Kartenraster. Jede Seite führt den Nutzer von Orientierung über fachliche Auswahl zu echten Daten, Quellen und einer klaren nächsten Aktion.

## 3. Feste Screen-Komposition

### 3.1 Desktop

Der Desktop-Screen besteht aus einem festen Portalrahmen mit oberer Kopfzeile, linker Bereichsnavigation und einer breiten Inhaltsfläche. Die Inhaltsfläche nutzt eine ruhige, horizontale Komposition:

1. **Top-Shell:** Originalmarke links, globale Suche mittig, Suche, Marktplatz, Benachrichtigungen und Drei-Striche-Menü rechts.
2. **Linke Navigation:** Entdecken, Karte, Erfassen, Katalog und Profil. Der aktive Punkt erhält einen Lime-Hintergrund und eine klare rechte Akzentkante.
3. **Bereichs- oder Seitenbanner:** Bildgestützter Hero mit kurzer wissenschaftlicher Aussage, nicht überladen und nicht höher als nötig.
4. **Fachkarten:** Botanik, Aquaristik und Terraristik als kompakte, gleich große Karten. Karten öffnen eigene echte Pfade.
5. **Datenmodul:** Karte und Liste werden als zusammengehörige Fläche dargestellt. Die Liste zeigt nur echte Einträge; die Karte verschweigt private exakte Orte.
6. **Beleg- und Datenschutzflächen:** Quellen, Schutzstatus, Offline-Status oder fachliche Hinweise folgen als kompakte Portalmodule.

### 3.2 Mobile

Der Mobile-Screen nutzt eine vertikale Portalfläche mit fester unterer Navigation:

1. Statusleiste des Geräts bleibt sichtbar und wird nicht nachgebaut.
2. Brand-Zeile mit Originalmarke, BlackWaterLeaf-Name, globaler Suche, Benachrichtigung und Profil.
3. Große Suchleiste mit den Begriffen „Arten, Orte, Themen, Community …“.
4. Kompakter Bild-Hero mit der Aussage „WASSER VERBINDET.“ beziehungsweise einer bereichsspezifischen Entsprechung.
5. Drei gleichwertige Portal-Karten in einer Reihe: Botanik, Aquaristik, Terraristik.
6. Karte-/Listen-Modul mit sichtbarer Bereichskennzeichnung und geschützten Ortsdaten.
7. Eine kompakte Katalogkarte für einen echten Treffer mit Bild, wissenschaftlichem Namen und Verifikationsstatus.
8. Quellen-/Belege-Modul und Offline-Modul.
9. Untere Navigation: Entdecken, Karte, Erfassen, Katalog, Profil. Aktiver Punkt ist Lime und sichtbar unterstrichen.

## 4. Abstände und Größen

Alle Screens verwenden ein ruhiges, wiederholbares Raster. Desktop nutzt einen Inhaltsabstand von 16–28 px, Kartenabstände von 8–14 px und abgerundete Ecken von 14–22 px. Mobile nutzt 12–16 px Außenabstand, 8–12 px Zwischenräume und 14–18 px Kartenradius. Große Überschriften bleiben kompakt und dürfen den Screen nicht durch überdimensionierte Heroes blockieren.

Hero-Banner sind bildstark, aber funktional: Desktop etwa 210–260 px hoch, Mobile etwa 210–250 px. Die großen Karten aus den Referenz-Screenshots bleiben kompakt; kein Bereich darf durch unnötige vertikale Leerflächen endlos werden.

## 5. Farb- und Materialsystem

| Zweck | Farbe | Verwendung |
|---|---|---|
| Portalgrund | tiefes Schwarzgrün, etwa `#020804` bis `#06160E` | Seite, Shell, Hintergrund |
| Kartenfläche | dunkles Waldgrün, etwa `#06200F` bis `#0B2B16` | Karten und Datenmodule |
| Haupttext | warmes Weiß, etwa `#EFFff4` | Überschriften und wichtige Daten |
| Sekundärtext | gedämpftes Salbeigrün, etwa `#A9C5AB` | Erläuterungen und Metadaten |
| Primärakzent | Blatt-Limette, etwa `#B9FB7F` | aktive Navigation, CTA, Bestätigung |
| Aquaristik-/Live-Akzent | Aqua-Cyan, etwa `#40D9FF` | ausschließlich Wasser, Aquaristik und Live |
| Terraristik-Akzent | Moos-/Naturgold, etwa `#E0C75F` | ausschließlich Terraristik |
| Warnung/Löschen | kontrolliertes Rot | Fehler, Löschung und Warnungen |
| Rahmen | transparente Akzentmischung | keine blauen Standardrahmen |

Es gibt **keine zufälligen Farbvarianten** zwischen Seiten. Botanik, Profil, Community und Marktplatz bleiben im Portalton. Aqua-Cyan darf nicht in Botanik oder Profil als Dekoration erscheinen. Neonfarben, künstliche Glows und blaue Standardkarten sind verboten.

## 6. Bilder und Icons

Die Originalmarke bleibt unverändert. Bereichsbilder müssen hochauflösend, scharf und ohne blauen Filter sein. Bilder erhalten nur eine kontrollierte dunkle Lesbarkeitsüberlagerung; ein flächiger blauer Filter ist nicht erlaubt.

Icons sind klar, dünn und funktional. Ein Icon wird pro Bedeutung nur einmal prominent verwendet. Pfeil bedeutet Öffnen, Kamera bedeutet Erfassen, Buch bedeutet Katalog/Wissen, Benutzer bedeutet Profil, Herz bedeutet Merken, Stift bedeutet Bearbeiten und Papierkorb bedeutet Löschen. Icons dürfen nicht ohne Funktion dekorativ vervielfacht werden.

## 7. Daten, Zustände und Interaktionen

Alle Karten, Katalogeinträge, Community-Beiträge, Partnerangebote und Quellen werden aus den bestehenden APIs geladen. Beispielinhalte aus Mockups dürfen nicht als Fake-Daten in der Anwendung erscheinen. Bei fehlenden Daten wird ein klarer Leerzustand gezeigt.

Jede Seite benötigt echte Zustände für Laden, Fehler, leer, offline, geschützt und nicht angemeldet. Aktionen zeigen sichtbares Feedback. Private Inhalte und exakte Standorte werden niemals für nicht angemeldete oder nicht berechtigte Personen angezeigt.

Karten- und Listenansicht sind gleichwertige Zugänge. Wenn eine Karte technisch nicht verfügbar ist, bleibt die Liste vollständig nutzbar. Pull-to-Refresh ist auf privaten Listen und Native-Feeds die Standardaktualisierung; unnötige Aktualisieren-Schaltflächen entfallen.

## 8. Hauptbereiche

**Entdecken** zeigt den Observatory-Hero, die drei Portal-Karten und den verbundenen Datenbereich. **Karte** konzentriert sich auf geschützte Beobachtungsräume und verschleiert private Details. **Erfassen** öffnet Foto, Live-Erkennung, Beobachtung und Community-Beitrag aus einem kompakten Auswahlbereich. **Katalog** verbindet Pflanzen-, Fisch- und Wissenseinträge mit Quellen. **Profil** bleibt auf Identität, Bio, Score, sichtbare Anlagen und eigene Beiträge reduziert; Datenschutz, Sprache, Einheiten und Werkzeuge liegen ausschließlich im Drei-Striche-Menü.

Community bleibt ein vertikaler, fachlich moderierter Feed mit Bereich, Autor, Zeit, Sichtbarkeit, Medien, Kommentaren, Speichern, Bearbeiten, Melden und owner-scoped Löschen. Der Marktplatz bleibt transparent gekennzeichnet und darf wissenschaftliche Evidenz nicht imitieren. Die KI zeigt Hypothese, Kandidaten, Konfidenz, Merkmale, Zweitprüfung, Quellen, Sicherheitshinweise und Korrekturmöglichkeit in klaren Karten.

### Marktplatz: getrennte Händler-Shops und ehrliche Vermittlungszählung

Der Marktplatz zeigt nicht nur eine gemeinsame Produktreihe. Jeder freigegebene Händler erhält einen eigenen, klar abgegrenzten **Shop-Bereich** mit Händlername, Shop-Typ, Produktanzahl, seinen eigenen Produkten und einer eindeutigen Aktion wie „Ich will zu [Händler]“. Die Shop-Auswahl filtert ausschließlich diesen Händler; Produkte verschiedener Händler dürfen nicht visuell zu einem scheinbar gemeinsamen Shop verschmelzen.

Händler verwalten ihren eigenen Shop über ein geschütztes Händlerportal. Dort können sie Shopname und Händlerart ändern, Produktentwürfe anlegen, Produktentwürfe bearbeiten und sie zur Admin-Prüfung einreichen. Veröffentlichung, Freigabe, Startseitenplatzierung und Statuswechsel bleiben serverseitig beim Admin. Die Oberfläche muss auch bei mehreren Händlern übersichtlich bleiben und darf nicht zu einer langen ungegliederten Produktliste werden.

Solange kein Zahlungsanbieter und kein Checkout angeschlossen ist, darf BlackWaterLeaf **keine bestätigten Verkäufe behaupten**. Die Plattform zählt deshalb getrennt: datensparsame Weiterleitungen zum Partner, ausdrücklich gemerkte Kaufinteressen und bestätigte Verkäufe. Der bestätigte Verkaufszähler bleibt bis zur späteren Checkout-Integration bei null. Diese Bezeichnungen müssen in Marktplatz und Händlerportal sichtbar bleiben.

### Admin: Händlerfreigabe-Warteschlange

Der Adminbereich `/admin/merchant-approvals` ist eine eigene Prüfoberfläche und keine öffentliche Shopseite. Die Reihenfolge ist verbindlich: **Profil prüfen**, **Autorisierung prüfen**, **Platzierung prüfen**, anschließend **Produktbestände einzeln prüfen**. Die Oberfläche zeigt dafür vier kompakte Kennzahlen und pro Händler die getrennten Statuswerte. Ein Produkt darf niemals allein durch seine Existenz öffentlich werden.

Der bestätigte Katalogbestand bleibt quellengetreu und idempotent. Der aktuell verifizierte Kiemen-Kumpel-Bestand umfasst **106 gespeicherte Produkte**; die `Energiekostenpauschale` bleibt als bewusst pausiertes Nicht-Angebot erhalten. Eine frühere CSV-Angabe von 108 Quellzeilen darf erst dann als vollständig übernommen bezeichnet werden, wenn die originale CSV erneut vorliegt und ihre Handles gegen den Bestand abgeglichen wurden. Fehlende Quelldaten werden nicht erfunden.

Die öffentliche Marktplatzübersicht ist ausschließlich eine **Shopauswahl**: Banner, kurzer Vertrauenshinweis, Händlerkarten und gegebenenfalls der geschützte Händlerzugang. Die vollständige Produktliste gehört nicht auf diese Übersicht. Ein Händler wird über den Pfad `/marketplace/shop/:id` geöffnet und erhält dort sein eigenes Banner, seine eigene Händlerfarbe (für Aquaristikangebote Aqua-Cyan), Kategorien, **Unterkategorien aus dem echten Produktart-Feld**, Suche, Produktkarten, eine Sortierung nach Relevanz, Aktualität, Name und Preis sowie den Link zum Originalshop. Ein offizielles Händlerbild darf nur aus einer belegten öffentlichen Händlerquelle übernommen werden; Platzhalterlogos oder fremde Suchbilder sind verboten.

## 9. Web-/Native-Parität

Web und Native benutzen dieselben Begriffe, Icons, Bilder, Farbtöne, Kartenhierarchien und Zustände. Native wird als echte Expo-Oberfläche umgesetzt. WebView, Screenshot-Hülle und abweichende Navigationslogik sind ausgeschlossen. Desktop erhält die linke Navigation; Mobile erhält die feste untere Navigation. Die Daten- und Berechtigungslogik bleibt identisch.

## 10. Abnahme vor Veröffentlichung

Vor jedem Checkpoint werden Desktop und Mobile für mindestens Entdecken, Karte, Erfassen, Katalog, Profil, Botanik, Aquaristik, Terraristik, KI, Community und Marktplatz einzeln geöffnet. Abgenommen wird nur, wenn kein alter Hero, kein altes Kartenraster, kein altes Menü, keine unlesbare Farbe, kein Fake-Eintrag und kein unverbundener Button sichtbar ist. Erst danach folgen Volltests, Produktionsbuild, Checkpoint und Veröffentlichung.

## 11. Sicherheitsfortschritt des Enterprise-Plans

AP-01 und AP-02 sind abgenommen. Der anonyme `/manus-storage/*`-Proxy darf ausschließlich die unveränderlichen, im Quellcode festgelegten Observatory-Designassets ausliefern. Dynamische Nutzer-, Habitat-, Beobachtungs-, Community- und Händlerbilder dürfen nicht über einen frei erratbaren Storage-Key ausgeliefert werden; ihre objektbezogene Autorisierung wird in AP-03 umgesetzt. Diese Sicherheitsregel darf nicht durch eine neue UI- oder CSS-Referenz umgangen werden.

AP-04 bereinigt serverseitig vor der Speicherung JPEG-EXIF-/APP1-Metadaten, PNG-Text-, XMP-, EXIF- und physische Metadaten-Chunks sowie WebP-EXIF-/XMP-Chunks. Dadurch werden insbesondere GPS- und Geräteinformationen nicht als Bestandteil eines neu gespeicherten Bildes weitergegeben. Die Bildvalidierung und die Metadatenbereinigung bleiben getrennte, getestete Schritte.

AP-05 stellt vor einer späteren Löschfreigabe eine geschützte `profile.erasurePreview` bereit. Sie zählt die tatsächlich zugeordneten Profil-, Rollen-, Einwilligungs-, Auth-, Beobachtungs-, Community-, Medien-, Habitat-, Geräte- und KI-Datensätze. Die Vorschau löscht nichts; die Ausführung bleibt bis zum nachweisbaren DB-, Session- und Storage-Löschlauf gesperrt. Ein minimierter, pseudonymer Auditnachweis bleibt separat von den gelöschten Nutzdaten erhalten.

AP-07 verwendet für neue Meldungen und Einsprüche eigene Fallobjekte statt freier Audittextfelder. Moderationsfälle und Einsprüche erhalten getrennte Status, Reviewer, Begründungen und Zeitstempel; private Inhalte bleiben für Reporter verborgen. Die bestehende Ausblend-/Löschmoderation bleibt aktiv, aber die neue Tabellenmigration wird erst nach der AP-06-Backup-/Restorefreigabe ausgeführt.

AP-09 behandelt Profilstandorte als private Kontodaten: Öffentliche Profilantworten enthalten keinen Standort. Öffentliche Beiträge werden zusätzlich gegen den aktuellen Kontostatus geprüft. Wird die Einwilligung zur Profilveröffentlichung widerrufen, wird das Profil atomar auf `private` gesetzt. Diese Regeln gelten serverseitig unabhängig vom Web- oder Native-Client.

AP-10 verwendet eine fail-closed Rollenmatrix: `admin` verwaltet Kontorollen und globale Freigaben, `moderator` erhält nur den Staff-/Moderationsbereich, und `merchant` ist eine additive Capability aus `user_roles`, die ausschließlich den eigenen Shop, eigene Produkte und eigene Attribution sieht. Native und Web dürfen Berechtigungen nur anzeigen; die Server-Policy bleibt autoritativ.

AP-11 protokolliert jede privilegierte Zustandsänderung im signierten Audit-Ledger. Challenge-Entwürfe, Challenge-Veröffentlichungen und Wissensentwürfe enthalten Actor, Ziel und Zustandswechsel; sensible Artikel- oder Nutzdaten werden nicht in das Ledger kopiert. Die Hash-Kette verwendet Previous-Hash, HMAC-Signatur und Head-Prüfung.


## 12. Sicherheits- und Navigationszusatz 19. September 2026

### 12.1 Session- und Standortzustand

Web und Native registrieren verifizierte Sitzungen serverseitig nur als SHA-256-Hash. Die Registry kennt Anbieter, Gerät, letzte Aktivität, Ablauf und Widerruf, zeigt jedoch niemals Session-Token. Logout, Passwort-Reset und die explizite Aktion **Alle Geräte abmelden** widerrufen Sitzungen. Der Gerätebezeichner ist optional und darf keine E-Mail-Adresse oder freien personenbezogenen Text enthalten.

Wetter darf nach einer ausdrücklich gespeicherten `location_processing`-Freigabe angefragt werden. Die aktuelle Position wird vor dem Request auf ungefähr Kilometerpräzision gerundet, ausschließlich per POST übertragen und mit `Cache-Control: no-store, private` ausgeliefert. Koordinaten werden weder in URLs noch in Telemetrie, Fehlertexten oder öffentlichen Profilantworten gespeichert. Wird die Freigabe widerrufen, zeigt die Oberfläche einen handlungsfähigen Zustand statt Wetterdaten.

### 12.2 Verbindliche Primärnavigation

Die globale Primärnavigation besteht auf beiden Clients aus genau fünf Zielen: **Entdecken**, **Karte**, **Erfassen**, **Katalog** und **Profil**. Marktplatz, Community, Benachrichtigungen, Heute, Live, Wissen, Händlerportal und Builder sind kontextuelle oder geschützte Ziele und dürfen nicht als zusätzliche globale Tabs erscheinen. Desktop nutzt dafür die linke Observatory-Seitenleiste; Mobile nutzt eine feste untere Leiste. Der aktive Punkt erhält genau eine Lime-Markierung und eine Unterstreichung beziehungsweise rechte Akzentkante.

Die Native-Zuordnung ist identisch: Entdecken führt zur Startfläche, Karte zum Explore-/Kartenmodul, Erfassen zum Foto-/Live-Einstieg, Katalog zur Suche und Profil zum geschützten Profil. Der Admin-Builder bleibt über seinen geschützten Pfad erreichbar, verlässt aber die globale Tab-Leiste.


## 13. Karte-/Liste-Fläche und bereichsübergreifende Beobachtungen

Die Karte-/Liste-Fläche ist ein gemeinsames Observatory-Modul für **Botanik, Aquaristik und Terraristik**. Die Bereichswahl steht als kleine, horizontale Filtergruppe über der Fläche; die Auswahl bleibt bei Karten- und Listenansicht synchron. Karte und Liste verwenden dieselbe serverseitige `observations.publicFeed`-Quelle. Es werden ausschließlich aktive öffentliche Beobachtungen geliefert. Private oder geschützte Orte, exakte Koordinaten und nicht freigegebene Medien werden nicht in die öffentliche Antwort aufgenommen.

Die Kartenfläche darf keine Pins als Dekoration simulieren. Existieren keine freigegebenen Beobachtungen mit zulässiger Ortsinformation, erscheint ein klarer Leerzustand: **„Keine Kartenpunkte freigegeben“** mit dem Hinweis, dass private Daten geschützt bleiben. Bei einem Fehler bleibt die Liste beziehungsweise der Katalogzugang benutzbar und zeigt einen handlungsfähigen Fehlertext. Lade-, Fehler-, Bereit- und Leerzustände sind visuell unterscheidbar. `Bereit` wird nur nach einer erfolgreichen aktuellen Serverantwort angezeigt.

Web und Native verwenden dieselbe Reihenfolge: Bereichskarten, Statuszeile, Bereichsfilter, Karte-/Liste-Schalter, Datenfläche und Quellen-/Evidenzzugang. Die Fachbereichsfarben bleiben verbindlich: Botanik Lime, Aquaristik Cyan und Terraristik Gold. Bilder aus Nutzerbeobachtungen sind von verifizierten Taxon-Bildern getrennt und dürfen niemals als Artbestätigung missverstanden werden.


## 14. Native-Erfassung, Offline-Outbox und private Beobachtungen

Der Native-Erfassungsfluss legt eine private Beobachtung zuerst mit einer RFC-konformen `clientId` in einer persistenten Geräte-Outbox an. Das Bild wird im privaten App-Speicher abgelegt; das tatsächliche ImagePicker-MIME wird erhalten. Erst danach versucht die App die Serverübertragung. Bei instabiler Verbindung bleiben Beobachtung und Bild kontrolliert ausstehend. Die Zustände **warten auf Synchronisierung**, **Bild ausstehend**, **Konflikt** und **synchronisiert** sind sichtbar und unterscheiden sich von einem Erfolg.

Ein erfolgreicher Text-/Beobachtungsschritt darf nicht als vollständiger Medienerfolg ausgegeben werden. Fehlt der Upload, wird nur der Bildschritt wiederholt; ein bereits angelegter Datensatz wird nicht blind doppelt angelegt. Bei Konflikten bleibt der Eintrag erhalten und wird nicht automatisch überschrieben. Beim erneuten Öffnen der App wird die Outbox sequenziell erneut verarbeitet. Private Beobachtungen werden zusätzlich zuletzt erfolgreich lokal gecacht, bleiben aber ausschließlich im authentifizierten PhotoScreen sichtbar. Der öffentliche Feed erhält diese Daten nicht.


## 15. Marktplatz-Hub und Händler-Shop-Parität

Web und Native zeigen im Marktplatz zuerst einen kompakten **Händler-Hub** mit Banner, Vertrauenshinweis und separaten Händlerkarten. Eine lange, vermischte Produktwand ist nicht zulässig. Die Aktion **SHOP ÖFFNEN** führt in den eigenständigen Bereich eines Händlers; dort erscheinen nur dessen freigegebene Angebote. Der Shop besitzt Kategoriechips, Unterkategorien beziehungsweise Produktgruppen und eine touchfreundliche Sortierung nach Aktualität, Name und Preis.

Partnerlogos oder offizielle Händlerbilder dürfen nur aus verifizierten Quellen übernommen werden. Preise, Verfügbarkeit, Zahlung, Versand, Rückgabe und Support bleiben beim Händler. BlackWaterLeaf speichert lediglich nachvollziehbare Klick- und Kaufinteressen-Attribution; es gibt in diesem Stand keinen BlackWaterLeaf-Checkout und keine Zahlungsabwicklung.


## 16. Community-Schutz, Meldungen und Benachrichtigungen

Community-Aktionen bleiben im Observatory-Kontext kompakt und eindeutig: Besitzer sehen Stift- und Löschaktion, andere Nutzer sehen **Gefällt mir**, **Melden** und **Blockieren**. Eine Meldung wird nie still verworfen, sondern als nachvollziehbarer Fall mit genau einem Ziel (Beitrag oder Kommentar), Grund und optionaler Notiz gespeichert. Sexualisierte Inhalte, Belästigung und andere Regelverstöße werden serverseitig geprüft; die Oberfläche darf diese Prüfung nicht umgehen.

Blockierte Konten verschwinden aus dem eigenen Community-Feed. Kommentare können vom Eigentümer bearbeitet oder entfernt werden; entfernte Kommentare bleiben für Zählung und Moderationsnachweis nachvollziehbar, werden aber nicht mehr öffentlich ausgegeben. Likes und Kommentare erzeugen nur dann eine Benachrichtigung, wenn der Akteur nicht der Eigentümer ist. Benachrichtigungen werden mit stabiler Cursor-Paginierung geladen, der Unread-Zähler basiert auf einer Datenbankzählung und Moderationsentscheidungen informieren den meldenden Nutzer.

Web und Native verwenden dieselben deutschen Begriffe und dieselben serverseitigen Mutationspfade. Jede privilegierte Moderationsentscheidung bleibt im Audit-Ledger. Es gibt keine Fake-Fälle, keine erfundenen Community-Inhalte und keine öffentliche Preisgabe privater Standort- oder Kontodaten.


## 17. Bereichsübergreifende Karte-/Liste-/Katalogfläche und Bildprovenienz

Botanik, Aquaristik und Terraristik verwenden dieselbe kompakte Informationsarchitektur: Bereichsheader, **Karte & Liste**, danach der fachliche Katalog. Die Akzentfarbe bleibt pro Bereich konstant: Portalgrün für Botanik, Aqua für Aquaristik und Gold für Terraristik. Die Kartenfläche darf keine erfundenen Pins oder Orte darstellen. Solange eine Beobachtung keine zulässige öffentliche Ortsangabe besitzt, wird ausschließlich der ehrliche Schutzstatus angezeigt; exakte private Standorte werden niemals ausgegeben.

Katalogkarten dürfen ein Bild nur als verifiziertes Taxonbild präsentieren, wenn Bild-URL, stabile Quellseite, Lizenz und Attribution vorhanden sind. Fehlt eine dieser Angaben, zeigt die Karte eine neutrale fachliche Platzhalterfläche und den Status **Bildprüfung ausstehend**. Nutzerbilder bleiben davon getrennt und werden nie als wissenschaftliches Katalogbild wiederverwendet.


## 13. Wissenschaftliche Katalogquellen und Bildwahrheit

BlackWaterLeaf verwendet **keine Inhalte, Bilder oder Bildprovenienzen von Wikipedia oder Wikimedia Commons**. Beide Quellen sind für den öffentlichen Taxon-Katalog ausgeschlossen. Ein Katalogdatensatz wird nur veröffentlicht, wenn seine Taxonomie, Verbreitungsangabe und gegebenenfalls sein Bild einer freigegebenen Fachquelle zugeordnet werden können.

Die zulässigen Katalogquellen sind zurzeit **Plants of the World Online von Kew Science**, **FishBase**, **GBIF**, die **Biodiversity Heritage Library** und **JSTOR Global Plants**. Ein Bild benötigt immer eine nachprüfbare Artzuordnung, eine Quellen-Seite, eine Lizenz- oder Nutzungsangabe, eine Attribution und einen Prüfzeitpunkt. Fehlt einer dieser Nachweise, zeigt die Anwendung bewusst den Zustand „Bildnachweis offen“ statt eines Ersatzbildes.

Fundort- und Verbreitungskarten verwenden ausschließlich veröffentlichte, quellengebundene Angaben aus dem Taxondatensatz. Sie stellen keine private Beobachtungsposition dar und dürfen weder genaue Koordinaten noch geschätzte Fundorte erfinden. Taxa aus noch nicht belegten manuellen Importen bleiben als Entwurf zur Fachprüfung erhalten und erscheinen nicht öffentlich.

## 18. Verbindliche Taxon-Bilddetailansicht

Jedes veröffentlichte Pflanzen- oder Fisch-Taxon mit einem verifizierten Katalogbild erhält auf **Web und Native** dieselbe explizite Aktion **„Detailansicht“**. Sie öffnet ein fokussiertes Bildmodal mit dem lokal gespeicherten Originalbild in maximal sinnvoller Bildschirmgröße. Das Bild wird vollständig dargestellt und nicht künstlich nachkoloriert, durch Beschnitt verfälscht oder durch eine dekorative Überlagerung verdeckt.

Die Detailansicht zeigt stets Fachbereich, wissenschaftlichen Namen, vollständige Bildattribution, Lizenz und die Aktion **„Quellbeobachtung öffnen“**. Der Nachweis bleibt damit auch in der größten Darstellung sichtbar und überprüfbar. Fehlen Bild-URL, Quelle, Lizenz, Attribution oder Prüfzeitpunkt, existiert keine Detailansicht; stattdessen gilt weiter der klare Zustand **„Bildnachweis offen“**.

Im Web ist das Modal als zugänglicher Dialog umgesetzt: sichtbarer Auslöser, Tastaturfokus, Escape zum Schließen, Fokus-Rückgabe zum Auslöser, Tab-Begrenzung, gesperrtes Hintergrundscrolling und Schließen per Klick außerhalb der Fläche. Native verwendet dieselben Begriffe, den gleichen lokalen Bildbestand, die gleiche Attribution und eine touchgerechte Vollbildansicht mit X- und Außenbereich-Schließen. Reduzierte Bewegung deaktiviert nicht essentielle Öffnungsanimationen.

## 19. Vollständige Observatory-Spezifikation – verbindlich ab Version 2.0

### 19.1 Zweck und Vorrang

Die Desktop- und Mobile-Referenzen vom 19. September 2026 definieren ab sofort die **vollständige visuelle Sprache**. Jede bestehende und neue Oberfläche wird in dieses System migriert. Es gibt keine parallele Altoberfläche, keinen Legacy-Fallback und keine Seite, die nur durch eine neue Farbe angepasst wird. Wenn eine Seite noch nicht migriert ist, wird sie als Abweichung behandelt und nicht als zulässige Variante.

Die Umsetzung bewahrt reale Datenquellen, Berechtigungen, Mutationen, Lade-, Fehler- und Leerzustände. Das Design darf niemals Ersatzdaten, erfundene Kartenpunkte, erfundene Bilder, simulierte Live-Werte oder nicht vorhandene Funktionen einführen.

### 19.2 Globaler Portalrahmen

| Bereich | Desktop-Observatory | Mobile-Observatory |
|---|---|---|
| Kopf | 70 px hohe, dunkle Top-Shell mit Marke links, globaler Suche mittig und kompakten Kontextaktionen rechts | Brand-Zeile mit Marke, Suche, Benachrichtigung und Profilaktion; keine nachgebildete Gerätestatusleiste |
| Navigation | Feste linke Leiste mit genau fünf Zielen: Entdecken, Karte, Erfassen, Katalog, Profil | Feste untere Leiste mit denselben fünf Zielen; jedes Ziel gleich breit, nur ein aktiver Punkt unterstrichen |
| Arbeitsfläche | Breite Inhaltsfläche rechts von der Navigation, äußerer Abstand 16–28 px, Panels im 8–14-px-Raster | Vertikale Inhaltsfläche mit 12–16 px Außenabstand, 8–12 px Lücken und sicherem Abstand zur unteren Navigation |
| Oberfläche | Tiefes Schwarzgrün, flache Waldgrün-Panels, feine Rahmen, zurückhaltende Schatten | Identische Farben und Informationshierarchie, jedoch einspaltig und touchgerecht |
| Bewegungen | Funktionale Übergänge dürfen kurz und dezent sein | Gleiches Verhalten; bei reduzierter Bewegung keine dekorativen Animationen |

Die Header-, Seitenleisten- und Navigationskomponenten werden je Client genau einmal gerendert. Bereichsseiten dürfen keine zweite Markenleiste, schwebende Tab-Leiste oder parallele globale Navigation erzeugen.

### 19.3 Token, Typografie und Icons

Das Hintergrundfeld verwendet `#020804` bis `#06160E`; Standardpanels verwenden `#06200F` bis `#0B2B16`. Haupttext ist warmes Weiß, Metadaten sind entsättigtes Salbeigrün. **Lime** ist der Portal- und Botanik-Akzent. **Aqua** markiert ausschließlich echte Aquaristik-, Wasser- und Live-Semantik. **Gold** markiert ausschließlich Terraristik. Marktplatzhinweise bleiben zurückhaltend warm und dürfen nicht wie wissenschaftliche Evidenz wirken.

Überschriften sind kompakt und informationsorientiert. Überdimensionierte Display-Typografie ist untersagt; die Hierarchie besteht aus Eyebrow, Titel, Kurzsatz und Faktenzeile. Icons sind dünn, eindeutig und funktional: Kompass für Entdecken, Karte für Karte, Kamera für Erfassen, Buch für Katalog, Nutzer für Profil, Schild für Evidenz und Schutz, Pfeil für echte Navigation. Jeder interaktive Icon-Button hat einen zugänglichen Namen und ein Ziel von mindestens 44 px.

### 19.4 Gemeinsame visuelle Bausteine

| Baustein | Verbindliche Struktur | Einsatz |
|---|---|---|
| Kontextkopf | Eyebrow, kompakter Titel, ein erklärender Satz, optionales Statuslabel und zurückhaltender Bildstreifen | Jede Hauptseite, Bereichsseite und private Arbeitsfläche |
| Kontextaktionszeile | Dichte Zeilen mit Icon, Titel, Erklärung, klarer Zielaktion oder ehrlichem Nichtverfügbarkeitsstatus | Erfassen, KI, Bereichsaktionen, Profilwerkzeuge |
| Datenpanel | Flache, dunkle Fläche mit Header, Trennlinien, Faktenzeilen und realem Status | Karten/Listen, Katalog, Wissen, Pflege, Händler, Admin |
| Faktenzeile | Typ/Realm, Quelle/Autor, Zeit, Sichtbarkeit, Evidenz oder Status; keine dekorativen Scheinwerte | Beobachtungen, Community, Benachrichtigungen, Merkliste, Marktplatz |
| Segmentleiste | Zugängliche, horizontal scrollbare Auswahl mit einem klaren aktiven Zustand | Filter, Suche, Karte/Liste, KI-Werkzeugwahl, Händlerfilter |
| Bildbeleg | Begrenztes, scharfes Bild mit korrekter Quelle, Attribution und Lizenz; bei fehlendem Nachweis neutraler Zustand | Taxa, Community-Medien, Händlerbilder, Detailansicht |
| Zustandsfläche | Dieselbe Panelgeometrie wie Daten, aber mit klarer Lade-, Fehler-, Leer-, Offline- oder Sperrstatuskommunikation | Alle Datenrouten |

### 19.5 Verbindliche Seitenarchitektur

**Entdecken** zeigt einen kompakten Observatory-Kontext, drei gleichwertige Bereichskarten, dann Karte & Liste, Katalogzugang und Quellen-/Offline-Hinweise. Die Startseite darf keine zweite, konkurrierende Landing-Page-Architektur verwenden.

**Karte** zeigt Bereichsfilter, Karte-/Liste-Umschalter und denselben serverseitigen Beobachtungsbestand. Solange keine zulässigen generalisierten Ortsdaten vorliegen, erscheint ausschließlich **„Keine Kartenpunkte freigegeben“**. Dekorative Pins, Konturen oder Kartenhintergründe zählen nicht als Karte und sind ausgeschlossen.

**Erfassen** verwendet einen Bild- oder Kamera-Kontext mit kompakten Aktionen. Foto, Live, Beobachtung und Community bleiben reale Zielwege. Nicht verbundene Kamera-, Video-, Smart-Device- oder KI-Funktionen sind sichtbar als **„Nicht verfügbar“**, nie als attraktive Pseudofunktion.

**Katalog, Suche, Wissen und Taxa** verwenden eine Arbeitsfläche mit Suche oder Kontextkopf, Segmenten, dichten Faktenzeilen und Quellen. Taxondetails zeigen zuerst Bild/Platzhalter und Identität, danach Evidenz, Fakten und Quellen. Verbreitung wird nur bei explizit quellengebundener Geometrie gezeigt; Bildquellen sind keine Verbreitungsquellen.

**KI** verwendet genau eine Werkzeugwahl mit Chat, Pflanzenbestimmung und Aquarium. Die jeweils aktive Arbeitsfläche zeigt echte Upload-, Consent-, Sperr-, Fehler- und Ergebnismodule. Doppelten Werkzeugschalter, Bildkachelwand und KI-Show-Hero gibt es nicht.

**Community** bleibt ein moderierter, vertikaler Fachfeed. Jeder Beitrag beginnt mit realem Medium oder einer klaren Textfläche und zeigt Autor, Zeit, Bereich, Sichtbarkeit und Interaktionen als Faktenzeile. Eigentümer- und Fremdaktionen bleiben getrennt. Ein Kopieren eines Links darf nicht als gespeicherter Beitrag aussehen.

**Profil** reduziert die sichtbare Hauptfläche auf Identität, Bio, Score, sichtbare Anlagen und eigene öffentliche Beiträge. Datenschutz, Sprache, Einheiten, Sitzungen, Kontoschluss und weitere Werkzeuge bleiben private Kontextseiten. Öffentliche Profile geben nie Standort- oder private Anlagendaten aus.

**Marktplatz und Händler** bleiben klar kommerziell: Start als Händlerauswahl, Shop als isolierter Händlerbereich und Produktdetail mit Bild, Offenlegung, Preis, Händler, Produktart und ausgehender Aktion. Bilder dürfen nur zum jeweiligen Händler gehören. Weiterleitungen, Kaufinteressen und bestätigte Verkäufe werden getrennt und ehrlich dargestellt.

**Pflege, Ranking und Admin** verwenden keine Dashboard-Showflächen. Pflege zeigt echte Aufgaben und Zustände, Ranking nur bestätigte oder klar nicht verfügbare Werte. Die Händlerfreigabe zeigt in verbindlicher Reihenfolge **Profil → Autorisierung → Platzierung → Produkte**.

### 19.6 Entfernte Legacy-Sprache

Die folgenden Muster sind vollständig entfernt und dürfen weder neu verwendet noch als CSS-Fallback belassen werden: `ReferenceHero`, `ReferenceActionGrid`, `ReferenceEmptyState`, `reference-page`, `reference-hero`, `reference-action-grid`, bildgestützte Aktionskachelwände, `glitch-title`, Glas-Scan-Effekte, Scanlines, Ambient-Grids, schwebende Mobile-Pills, radiale Capture-Wheels, dekorative Kartenpins, übersteigerte Aqua- oder Lila-Glows und statische Synchronisierungsbehauptungen wie „vor 2 Min.“.

Bestehende Styles mit diesen Namen werden entfernt, nachdem ihre Seiten auf die neuen Observatory-Primitives migriert wurden. Ein visueller Patch, der eine alte Klasse nur überlagert, gilt nicht als vollständige Migration.

### 19.7 Abnahmeregel für die Gesamtmigration
Vor einem Gesamtcheckpoint werden alle öffentlichen und privaten Routen auf Desktop und Mobile geöffnet. Eine Route besteht nur, wenn sie den gemeinsamen Portalrahmen nutzt, keinen Legacy-Selektor oder Legacy-Overlay enthält, reale Daten und Berechtigungen wahrt, einen sichtbaren Lade-/Fehler-/Leerzustand besitzt, sichere Bild- und Standortregeln einhält und keine zweite Navigation erzeugt. Die sechs Primärziele bleiben überall erreichbar und genau eines ist aktiv markiert.
---
## 19.8 Umsetzungssperre und Migrationsstand (19. September 2026)

**Dieser Abschnitt ist verbindlich.** Das Observatory-System in diesem Dokument ersetzt die vorherige Reference-Overlay-Sprache vollständig. Neue oder überarbeitete Screens dürfen keine großformatigen Legacy-Promokacheln, abstrakten Effektflächen, unbelegten Kartenpunkte, simulierten Live-Zustände oder das frühere Overlay-Komponentensystem erneut einführen.

Die Web-Routen für Start, Entdecken, Fachbereiche, Suche, Taxa, Wissen, Community, KI-Arbeitsbereich, Profile, Pflege, Ranking, Benachrichtigungen, Merkliste, Händlerflächen, Marketplace und Fehlerzustände sind auf den gemeinsamen Shell-, Kontextkopf-, Datenpanel- und Zustandsflächenstandard migriert. Nicht mehr geroutete Mockup-Seiten sowie die Legacy-Komponente `ReferenceOverlay` wurden entfernt. Der mobile Client verwendet dieselben Begriffe und denselben Informationsrhythmus; seine früheren Referenz-Komponenten wurden in `ObservatoryContextHeader`, `ObservatoryActionCluster` und `ObservatoryActionRow` überführt und aus großen Bildkacheln in kompakte Arbeitszeilen überführt.

Die verbindliche visuelle Hierarchie lautet damit auf beiden Plattformen: **Route/Shell → kompakter Kontextkopf → Daten- oder Aktionsfläche → expliziter Zustand**. Bildmaterial dient ausschließlich der Identität, der Katalogbestimmung oder einer klar zugeordneten Fachinformation. Es darf weder Datenzustände vortäuschen noch den Bedienkontext überdecken. Der Kartenmodus bleibt, solange keine ausdrücklich zulässigen generalisierten Ortsdaten vorliegen, eine erklärte Schutzfläche ohne erfundene Punkte.


### 19.9 Community-Feed und direkte Navigation

**Community ist ein gleichwertiges Primärziel.** Die Web- und Native-Navigation führen deshalb in identischer Reihenfolge die sechs Ziele **Entdecken, Karte, Erfassen, Katalog, Community und Profil**. Marketplace, KI, Pflege und weitere Werkzeuge bleiben kontextbezogene Wege; Community ist jedoch kein Unterpunkt von Entdecken und erhält einen eigenen aktiven Navigationszustand.

Der Community-Screen ist ein **angemeldeter**, moderierter Fachfeed und keine Social-Media-Showfläche. Ein gemeinsamer Kontextkopf erklärt die Daten- und Moderationsgrenzen. Darunter bleibt der bereits vorhandene Bereichswähler erhalten: **Feed, Botanik, Aquaristik und Terraristik**. Er filtert ausschließlich serverseitig veröffentlichte Beiträge aktiver Konten für aktive, angemeldete Betrachter:innen. Ohne Sitzung erscheint ein echter Sperrzustand; bei einem leeren Bereich ein echter Leerzustand. Ersatzbeiträge und simulierte Interaktionen sind ausgeschlossen.

Beitragskarten folgen der Reihenfolge **Autor und Zeit → Bereich/Sichtbarkeit → Inhalt → optionales echtes Medium → Interaktionen**. Jede Karte verweist auf eine eigene Detailansicht mit moderierter Diskussion. Eigentümeraktionen, Melden, Folgen und Blockieren bleiben getrennt; Blockierungen lösen gegenseitige aktive Folgebeziehungen und blenden das Konto aus Community- und Live-Ansichten aus. Web und Native verwenden dieselben Filterwerte, Moderationssprache, Aktualisierungs- und Leerzustände sowie die gleiche direkte Community-Navigation.

### 19.10 Live Hub und Fachvorträge

Der Live Hub ist ein angemeldeter Kontextweg aus der Community. Er trennt **Community Live** und **Fachvorträge** sichtbar und inhaltlich. Fachvorträge dürfen nur von aktivem Staff angelegt werden und müssen eine dokumentierte Qualifikationsangabe führen. Sitzungen zeigen ausschließlich die servergesicherten Zustände geplant, live, beendet oder abgebrochen. Für aktive Sitzungen kann Staff eine validierte **YouTube-Live-Video-ID** oder einen **Twitch-Kanal** hinterlegen; der Player bleibt direkt im Hub sichtbar und bietet zusätzlich einen transparenten Anbieterlink. Beliebige iframe-URLs, Stream-Keys und Zugangsdaten sind verboten. Ohne freigegebene Anbieterreferenz gibt es kein Platzhaltervideo. Der Chat wird nur während einer aktiven Sitzung geöffnet, ist konto-gebunden, unterliegt einer engen Nachrichtenrate und filtert blockierte Konten.


### 19.11 Eigenes Live-Control-Deck und IONOS-Wiedergabe

**Eigenes Live ist ein gleichwertiger Videoweg.** Im Staff-Planer steht neben YouTube Live und Twitch der Weg **BLACKWATERLEAF / IONOS**. Seine Darstellung folgt dem Observatory-System: ein kompakter, dokumentierter Zustandsbereich erzeugt Einspielpfad und einmal sichtbaren Schlüssel; Sitzungsdetail und Live-Hub zeigen die Wiedergabe ausschließlich innerhalb einer angemeldeten Mitgliederansicht. Ein Schlüssel darf weder dauerhaft im UI noch im Klartext in der Datenbank erscheinen.

Die visuelle Sprache trennt klar zwischen drei Zuständen: *einrichten* (Control Deck und Schlüssel), *live* (echte, geschützte Wiedergabe) und *nicht verfügbar* (keine Videofiktion). Die eigene IONOS-Quelle erhält den türkisfarbenen technischen Akzent des Observatory-Systems; externe Anbieter bleiben als vorhandene, sekundäre Quellen sichtbar.


### 19.12 Live-Control-Deck: Status und aktuelle Zuschauende

Die Sitzungsansicht zeigt für verantwortlichen Staff ein kompaktes **Control Deck** direkt unter dem Kontextkopf. Es verdichtet drei reale Zustände in gleich große Observatory-Metriken: **Live-Status**, **aktuelle Zuschauende** und **Chat-Status**. Ein roter Punkt markiert ausschließlich eine tatsächlich als `live` geführte Sitzung; geplante und beendete Zustände bleiben eindeutig von einer aktiven Übertragung unterscheidbar. Die Live-Karten im Hub zeigen bei aktiven Sitzungen dieselbe Zuschauerzahl.

Die Zuschauerzahl ist keine Reichweiten- oder Aufrufmetrik. Sie zählt ausschließlich aktive, angemeldete Mitglieder mit einem höchstens 45 Sekunden alten Sitzungs-Heartbeat; Host-Konten werden nicht einbezogen. Für nicht aktive Sitzungen wird der Wert als `0` ausgegeben. Die Oberfläche benennt dies sichtbar als **aktive Mitglieder**, damit keine präzise Zuschauer- oder Analysebehauptung über vergangene Aufrufe entsteht.


### 19.13 Stream-Deck-Aktionen

Staff sieht die drei direkten Aktionen **Stream starten**, **Stream beenden** und – nur bei einer eigenen IONOS-Quelle – **Schlüssel rotieren** als zusammenhängende Kontrollgruppe im Control Deck, nicht verstreut im Seitenkopf. Start trägt den Lime-Akzent, Ende den kontrollierten Warnrot-Akzent; Rotation bleibt eine sekundäre technische Aktion mit Refresh-Symbol. Deaktivierte Aktionen erklären keinen falschen Übertragungsstatus, sondern sind nur verfügbar, wenn ihr serverseitiger Vorzustand erfüllt ist. Laufende Aktionen ersetzen ihren Text durch einen klaren Vorgangsstatus.


### 19.14 Kartenroute: echte Kartenbasis und ehrlicher Datenzustand

Die Webroute `/explore` verwendet für die Kartenansicht eine echte interaktive Kartenbasis mit Europa als neutralem Ausgangsbereich. Die Kartenansicht darf nur ausdrücklich freigegebene, generalisierte Beobachtungsorte darstellen; private oder nicht vorhandene Ortsdaten werden niemals als Pins simuliert. Wenn die Kartenbasis technisch nicht erreichbar oder noch nicht konfiguriert ist, bleibt eine visuell erkennbare Kartenfläche mit verständlichem Status, erneuter Ladeaktion und vollständig nutzbarer Listenansicht sichtbar. Ein leerer Datenbestand wird getrennt vom technischen Kartenfehler erklärt.

Die Beobachtungsliste bleibt die autoritative Datenansicht. Aktuell enthält die Datenbank keine öffentlichen Beobachtungen und die Beobachtungstabelle keine Koordinatenfelder; deshalb werden keine künstlichen Beispielpunkte angezeigt. Sobald veröffentlichte generalisierte Ortsdaten vorliegen, werden diese in derselben Karte neben der Liste dargestellt. Diese Regel gilt für Desktop und Mobile.


## 15. Paritätsnachtrag 20. September 2026

### 15.1 Live-Hub und geschützte Wiedergabe

Der Live-Hub bleibt auf Web und Native ein geschützter Mitgliederbereich. Beide Clients laden ausschließlich serverseitig veröffentlichte Sitzungen und unterscheiden sichtbar zwischen **Community Live** und **Fachvortrag**. Sitzungen enthalten Host, Track, Status, Startzeit, echte Quelle und datensparsame Zuschauerzahl; nicht vorhandene Quellen werden niemals durch ein Video oder einen Zuschauerwert simuliert.

Web bettet geprüfte YouTube-Live- und Twitch-Quellen direkt im Hub ein und verwendet für IONOS/MediaMTX eine kurzlebige, geschützte Wiedergabe-URL. Native verwendet für die geschützte IONOS-Quelle den Expo-HLS-Player mit einem autorisierten Bearer-Request. Externe YouTube-/Twitch-Quellen werden in Native als solche gekennzeichnet und über die geprüfte Anbieter-URL geöffnet; ein WebView-Screenshot oder ein nicht autorisierter Medienaufruf ist nicht zulässig.

Die Sitzung enthält auf beiden Plattformen Member-Chat, Moderationshinweis und einen 45-Sekunden-Heartbeat für aktive Zuschauer. Der Host wird nicht in der Zuschauerzahl gezählt. Staff-Aktionen zum Starten, Beenden und Rotieren eines IONOS-Einspielschlüssels bleiben serverautoritativ, auditierbar und ohne konfigurierte Quelle deaktiviert.

### 15.2 Community-Diskussion

Ein Community-Beitrag ist auf Web und Native nicht nur eine Feed-Karte. Jede Karte bietet eine eigene **Detailansicht** mit vollständigem Inhalt, Medien, Autor, Zeit, Moderationsaktionen, Kommentarzahl, verschachtelten Antworten und sicherem Kommentar-Editor. Sichtbarkeit, Blocklisten, Melden, owner-scoped Löschen und Authentifizierung bleiben identisch; blockierte Konten werden serverseitig aus Feed, Detailansicht, Kommentaren und Live-Chat ausgeschlossen.

### 15.3 Erkennen und Katalog-Navigation

Die Botanikaktion **Pflanze bestimmen** führt auf beiden Plattformen in den vorhandenen KI-Bestimmungsworkflow. Der Webpfad `/assistant#plant` öffnet direkt das Pflanzenwerkzeug; `/catalog` ist ein stabiler Alias für den quellengebundenen Katalog-/Suchzugang. Ein Eintrag darf nicht als „nicht verfügbar“ markiert werden, wenn bereits ein echter, geschützter Workflow existiert.


### 15.4 Privates Postfach und Benachrichtigungen
Das Postfach ist ein geschützter, persönlicher Bereich unter `/messages`. Web und Native verwenden denselben serverseitigen Vertrag für Unterhaltungen, Nachrichten, Lesestatus und ungelesene Zähler. Eine Unterhaltung enthält ausschließlich zwei aktive Konten; Selbstnachrichten, suspendierte Empfänger und Gespräche zwischen gegenseitig blockierten Konten werden abgewiesen. Feed, Profil, Notification-Center und Header müssen jeweils in diesen Bereich führen, ohne private Inhalte öffentlich zu rendern.

Nachrichten werden serverseitig auf Sichtbarkeit, Moderationsregeln und eine kontobezogene Rate-Grenze geprüft. Jede eingehende Nachricht erzeugt einen privaten Notification-Eintrag vom Typ `message`; ein Klick öffnet das Postfach. Native zeigt zusätzlich die aktuellen ungelesenen Werte als kompakte Header-Badges. Empty-, locked-, loading- und error-Zustände bleiben echt und enthalten keine Ersatznachrichten.

Der vollständige Nachrichteninhalt darf nur in der autorisierten Unterhaltung erscheinen. Öffentliche Profile dürfen lediglich den Einstieg `NACHRICHT` anbieten; private Anlagen, Care-Daten, exakte Standorte und unveröffentlichte Community-Inhalte dürfen niemals in das Postfach oder eine Notification kopiert werden.

### 15.5 Bewusst nicht aktivierte Infrastruktur
Eine Funktion darf nicht als aktiv erscheinen, solange ihre externe Infrastruktur fehlt. Das gilt derzeit für die produktive IONOS/MediaMTX-Origin, für Community-Video-Uploads und für externe Smart-Device-Herstellerfreigaben. Diese Zustände müssen sichtbar, technisch wahr und ohne Fake-Daten bleiben. Bereits implementierte Wege – Pflanzenbestimmung, Benachrichtigungen, Community-Diskussionen, Postfach und externe Live-Provider – dürfen dagegen nicht länger als „vorbereitet“ oder „nicht verfügbar“ markiert werden.


### 15.5 Community-Video und Smart Devices
Community-Beiträge dürfen optional genau ein Video im Format MP4 oder WebM bis 16 MB enthalten. Web und Native zeigen Medien mit kontrolliertem Playback ohne Autoplay; Upload, Verarbeitung und Veröffentlichung bleiben getrennte, ausdrücklich bestätigte Schritte. Der Server validiert Container-Signatur und MIME-Typ und speichert Videos unter demselben geschützten Medienkontext wie Bilder.

Smart-Device-Auswahl, private Aquarium-Zuordnung und manuelle Messwerte sind echte Funktionen. Ohne konkrete Herstellerfreigabe darf die Oberfläche jedoch keine Verbindung, Synchronisierung oder Herstellerdaten behaupten. Der verbindliche Status bleibt `awaiting_authorization`, bis OAuth-/Webhook-Vertrag, Secret-Verwaltung und Hersteller-API geprüft und aktiviert sind.


### 15.6 Sicherheits- und Herkunftsnachtrag 23. September 2026

Community-Aktionen sind beidseitig blockbewusst. Feed, Suche, Detail, Like, Kommentar, Meldung und Live-Chat dürfen eine blockierte Beziehung nicht wieder sichtbar oder interaktiv machen. Ein Like ist ein echter Umschalter und darf nicht als einmalige, nicht rückgängig machbare UI-Aktion erscheinen. Eigene Kommentare müssen auf Web und Native bearbeitbar und löschbar sein; fremde Kommentare dürfen gemeldet werden.

Consent-Widerrufe sind serverseitige Zustandsänderungen. Der Widerruf von Beobachtungs-, Community- oder Medienverarbeitungseinwilligungen setzt betroffene öffentliche Sichtbarkeit atomar zurück; die UI darf keine erfolgreiche Veröffentlichung vortäuschen. Die Migrationsbaseline dokumentiert Repository- und Zielumgebungsstand getrennt. Ohne isolierten Backup-/Restore-Nachweis wird keine Zielmigration behauptet.

Taxon-Herkunftskarten sind keine dekorativen Punktkarten. Sie dürfen nur geprüfte Herkunftsregionen, Habitat- und Haltungsfelder aus den Quellen zeigen und müssen kenntlich machen, dass keine exakten Wildfundkoordinaten ausgegeben werden. Fehlt ein strukturiertes Feld, wird „Verbreitung noch offen“ angezeigt. Bildquelle und Verbreitungsquelle bleiben getrennte Provenienzfelder.

### Profilmenü-Gruppierung 26. September 2026

Das Drei-Striche-Profilmenü verwendet keine flache Liste mit gleichrangigen Aktionen. „Profil öffnen“ steht als Identitäts-Einstieg oben. Die übrigen Ziele werden in **Pflege & Anlagen**, **Kommunikation**, **Fortschritt & Merkliste** und ein einklappbares **Einstellungen**-Untermenü mit Profil/Privatbereich, Datenschutz/Freigaben, Sprache/Einheiten und weiteren Werkzeugen geordnet. Alle Gruppen verweisen auf echte bestehende Routen; kein Menüpunkt darf als reine Dekoration oder nicht verbundene Aktion erscheinen.


### 15.7 Kartenanbieter-Fallback und Taxonmedien

Die Kartenflächen bevorzugen die konfigurierte Google-Kartenbasis. Fehlt der Provider-Schlüssel oder kann Google nicht geladen werden, zeigt die Oberfläche automatisch eine echte OpenStreetMap-Karte über Leaflet statt eines dekorativen Hintergrunds oder eines leeren roten Containers. Die OpenStreetMap-Attribution bleibt sichtbar. Taxonkarten dürfen regionale Marker nur aus vorhandenen, quellengebundenen Habitat-/Herkunftsfeldern ableiten; sie dürfen keine exakten oder erfundenen Wildfundorte suggerieren. Öffentliche Beobachtungskarten zeigen ausschließlich ausdrücklich freigegebene generalisierte Ortsdaten.

Verifizierte Katalogbilder werden lokal mit Quellenlink, Lizenz, Attribution und Prüfzeitpunkt dargestellt und bleiben responsiv mit stabiler Bildfläche. Fehlende Bildnachweise bleiben als offener Evidenzzustand sichtbar; unlizenzierte oder erfundene Ersatzbilder sind ausgeschlossen.


## 17. Verbindliche Design-Book-Ersetzung: Management, Profil und Karte · 26. September 2026

Dieser Abschnitt **ersetzt alle früheren Profilmenü-, Einstellungen-, Profil-Home- und Kartenlayout-Regeln**, sofern sie diesem Abschnitt widersprechen. Frühere Einzelkarten, lange Profil-Popover-Listen, doppelte Einstellungswege und verstreute Profilaktionen sind nicht mehr autoritativ.

### 17.1 Einheitlicher Management-Hub

Web und Native verwenden denselben Management-Hub unter **Verwalten**. Der Hub zeigt zwei klar beschriftete Gruppen mit jeweils einem **2×2-Raster**:

**Konto & Alltag:** Konto & Profil · Anlagen & Pflege · Kommunikation · Datenschutz & Sicherheit.
**Weitere Einstellungen:** Sprache & Barrierefreiheit · Fortschritt & Merkliste · Host-Dashboard · Hilfe, Daten & Werkzeuge.

Jede Kachel besitzt ein semantisches Icon, Titel, Unterzeile, Status/Schutzinformation und eine vollständig antippbare Fläche. Die Detailrouten bleiben technisch bestehen, werden aber ausschließlich über die passende Hub-Kachel geöffnet. Die alte Zusammenstellung „Profil öffnen / Profil bearbeiten / Privatbereich / Weitere Werkzeuge“ darf nicht als parallele zweite Navigation erscheinen.

Das **Host-Dashboard** wird ausschließlich für das serverseitig geprüfte Eigentümerkonto `blackwaterleaf@gmail.com` und die Domain `blackwaterleaf.com` angezeigt. Normale Nutzer und andere Staff-Konten erhalten keine Host-Dashboard-Kachel. Die Kennzahlen bleiben datensparsam und zeigen nur aggregierte Reichweite, registrierte Konten, Besuche, Seitenaufrufe, Logins und Moderationsstatus.

### 17.2 Professionelles Profil

Das Profil ist eine sichtbare Fach-/Creator-Profilseite und kein Einstellungsformular. Direkt sichtbar sind:

- verifiziert geladenes Profilbild oder ein klarer leerer Bildzustand,
- Anzeigename und Benutzername,
- Bio,
- E-Mail als bewusst sichtbarer `mailto:`-Kontakt nur im eigenen geschützten Profil,
- verknüpfte Instagram-, TikTok-, YouTube-, Facebook- und Website-Links,
- XP/Level/Anlagen als kompakte Kennzahlen,
- private Fachbereiche,
- ein direkt sichtbares Raster der freigegebenen eigenen Beiträge und Bilder.

Private Entwürfe, private Anlagen, genaue Standorte und private Nachrichten dürfen nie in diesem Raster erscheinen. Medien werden nur aus serverseitig als öffentlich freigegebenen Assets geladen. Fehlende Medien erhalten einen ehrlichen Text-/Iconzustand und keine erfundene Bildquelle.

### 17.3 Eigenständige Karten-Seite

Die Karte ist ein eigener primärer Modus und nicht länger ein dekorativer Abschnitt im Profil oder Realm. Das Zielmodell ist **2×1**: eine dominante echte Kartenfläche plus eine synchronisierte Filter-/Listenfläche. Mobil werden beide Flächen untereinander gezeigt, die Karte bleibt zuerst sichtbar. Karte und Liste verwenden denselben serverseitig freigegebenen Datensatz.

Standorte bleiben privacy-preserving: private oder nicht freigegebene Orte werden nicht als exakte Marker ausgegeben. Taxon-Herkunftskarten dürfen nur quellengebundene regionale Daten, Habitatfakten und echte Kartenpunkte anzeigen. Es dürfen keine Koordinaten aus Namen, Regionen oder Vermutungen erfunden werden.

### 17.4 Einstellbarkeit

Alle für Nutzer relevanten Bereiche müssen konfigurierbar sein: Profil, Benachrichtigungen, Postfachpräferenzen, Community-Sichtbarkeit, Medienverarbeitung, KI-Verarbeitung, Standortfreigabe, Sprache, Einheiten, Barrierefreiheit, Ruhezeiten, Datenexport, Sitzungen und Kontosicherheit. Eine Funktion mit noch fehlender Infrastruktur wird als ehrlich deaktiviert bzw. „noch nicht verbunden“ angezeigt und nicht als scheinbar aktive Einstellung präsentiert.

## 17. Verbindlicher Creatorprofil- und Management-Standard · 26. September 2026

Die Profilstartseite ist eine sichtbare Identitäts- und Creatorfläche, nicht nur ein Zugang zu Einstellungen. Sie zeigt Avatar, Namen, Username, Bio, E-Mail- beziehungsweise Social-Link-Chips, Fortschrittskennzahlen und freigegebene Medien direkt im ersten Profilfluss. Öffentliche Medien werden in einem responsiven Raster dargestellt; private Entwürfe, private Anlagen, Nachrichteninhalte und genaue Orte erscheinen niemals in diesem Raster.

Der primäre Einstieg **Verwalten** öffnet einen zentralen Management-Hub. Konto/Profil, Anlagen/Pflege, Kommunikation, Datenschutz/Sicherheit, Sprache/Barrierefreiheit, Fortschritt/Merkliste und Werkzeuge werden in verständlichen 2×2-Gruppen gebündelt. Das Host-Dashboard ist ausschließlich für das verifizierte Eigentümerkonto sichtbar. Diese Fassung ersetzt frühere flache Profilmenüs und frühere reine Textauszüge als verbindlicher Web-/Native-Standard.


### 15.8 Kategorie- und Anlagenmedien

Private Anlagen- und Profilmedien werden nicht als kleine Einzelsymbole dargestellt. Web verwendet auf breiten Ansichten bis zu drei große quadratische Bilder nebeneinander und auf schmalen Ansichten zwei Spalten. Native verwendet dieselbe Priorität mit bis zu drei großen quadratischen Medienflächen. Es werden nur echte, gespeicherte Bilder gerendert; fehlende Medien erhalten keinen erfundenen Ersatz. Jede Bildfläche bleibt antippbar und öffnet die vorhandene Detailansicht, sofern diese für den jeweiligen Datentyp vorgesehen ist.


## 15.9 Vollständige Fachkataloge

Der Einstieg **„Mehr anzeigen“** aus Botanik, Aquaristik und Terraristik öffnet eine eigene Fachkatalogseite und nicht die allgemeine Suche. Diese Seite lädt alle veröffentlichten Datensätze des gewählten Bereichs aus `catalogByRealm` und ordnet sie alphabetisch nach akzeptiertem wissenschaftlichem Namen, anschließend nach wissenschaftlichem Namen.

Jede Katalogkarte folgt dem Screenshot-Raster: ein großes, scharfes, quellengebundenes Bild, darunter der gebräuchliche Name in großer Schrift und der botanische beziehungsweise wissenschaftliche Name als eigene Zeile. Web nutzt drei Spalten auf breiten Ansichten und zwei Spalten auf schmalen Ansichten; Native verwendet dasselbe zweispaltige Kartenprinzip. Botanik bleibt lime/grün, Aquaristik aqua/cyan und Terraristik naturgold. Fehlende verifizierte Bilder werden nicht erfunden; der Datensatz bleibt sichtbar mit einem ehrlichen Bildnachweis-Zustand. Die Native-App besitzt dafür einen eigenen Vollkatalogscreen mit identischen Daten, Begriffen und Zuständen.
