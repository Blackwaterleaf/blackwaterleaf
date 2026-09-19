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
