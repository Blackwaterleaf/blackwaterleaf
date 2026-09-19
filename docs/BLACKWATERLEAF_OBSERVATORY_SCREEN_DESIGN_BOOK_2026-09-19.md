# BlackWaterLeaf Observatory Screen Design Book

**Version:** 1.0 · **Datum:** 19. September 2026 · **Gültigkeit:** Web und Native

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
