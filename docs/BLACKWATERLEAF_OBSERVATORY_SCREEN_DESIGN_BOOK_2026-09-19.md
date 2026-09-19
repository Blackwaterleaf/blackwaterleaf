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

## 9. Web-/Native-Parität

Web und Native benutzen dieselben Begriffe, Icons, Bilder, Farbtöne, Kartenhierarchien und Zustände. Native wird als echte Expo-Oberfläche umgesetzt. WebView, Screenshot-Hülle und abweichende Navigationslogik sind ausgeschlossen. Desktop erhält die linke Navigation; Mobile erhält die feste untere Navigation. Die Daten- und Berechtigungslogik bleibt identisch.

## 10. Abnahme vor Veröffentlichung

Vor jedem Checkpoint werden Desktop und Mobile für mindestens Entdecken, Karte, Erfassen, Katalog, Profil, Botanik, Aquaristik, Terraristik, KI, Community und Marktplatz einzeln geöffnet. Abgenommen wird nur, wenn kein alter Hero, kein altes Kartenraster, kein altes Menü, keine unlesbare Farbe, kein Fake-Eintrag und kein unverbundener Button sichtbar ist. Erst danach folgen Volltests, Produktionsbuild, Checkpoint und Veröffentlichung.
