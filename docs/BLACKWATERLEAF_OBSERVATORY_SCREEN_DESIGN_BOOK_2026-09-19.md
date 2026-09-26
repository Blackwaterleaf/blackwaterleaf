

## 15.19 Phase 7 · Native Shell, Home und Realm-Karten

Die Native-App übernimmt jetzt die Phase-4-Designvorgaben in den drei sichtbaren Primärbereichen. Die Shell ist auf Suche, Benachrichtigungen und Profil als kompakte Kopfaktionen reduziert; Postfach, Marketplace und Pflege bleiben erreichbar, aber konkurrieren nicht länger mit der Hauptnavigation. Die untere Primärnavigation verwendet vier Ziele: Home, Entdecken, Community und Profil.

Der Home-Einstieg verwendet einen großen, bildstarken Observatory-Hero, einen ehrlichen Statusstreifen ohne erfundene Messwerte sowie ein 2×2-Kartenraster. Botanik, Aquaristik und Terraristik besitzen eigene Bild- und Akzentfarben; KI bleibt als eigener Bereich mit dem reservierten Indigo-/Violett-Akzent sichtbar. Realm- und Home-Aktionskarten verwenden große Medienflächen, dunkle Leseschicht, Bereichs-Glow, klare Labels und eine vollständige Tastatur-/Screenreader-Aktion.

Die Karten verwenden eine opake bzw. getönte Fallbackstruktur und keine dauerhafte Vollflächen-Unschärfe. Medien werden durch eine lokale Abdunklung hinter Text lesbar; der Native-Style nutzt die kompatible `StyleSheet.absoluteFill`-Definition. Die Migration wurde mit Native-TypeScript, Web-TypeScript, Produktionsbuild und `git diff --check` validiert.

## 15.20 Native-Host-Dashboard und Inhaltsabstand

Das Host-Dashboard ist in Web und Native ausschließlich für das serverseitig geprüfte Eigentümerkonto `blackwaterleaf@gmail.com` zugänglich. Der Native-Management-Hub öffnet keine externe Web-Weiterleitung mehr, sondern eine eigene Dashboard-Ansicht mit denselben aggregierten Analytics-Daten wie Web: registrierte Konten, Seitenaufrufe, Besuche, Logins, Aufenthaltsdauer, Absprungrate und Top-Seiten. Diagramme werden als sparsame, zugängliche Balken dargestellt; Werte werden niemals simuliert.

Native-Seiten mit fester Observatory-Bottom-Navigation reservieren ausreichend unteren Inhaltsabstand. Upload-Fortschritt, Medieneditor, Communitykarten und weitere Inhaltsflächen dürfen nicht hinter der Navigation liegen. Marketplace- und andere Leerzustände bleiben klar sichtbar und quellengetreu; es werden keine Platzhalterangebote oder erfundenen Grafiken ergänzt.
