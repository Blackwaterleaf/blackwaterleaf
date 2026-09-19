# BlackWaterLeaf – Chat-Übergabe

## Aktueller Stand

BlackWaterLeaf ist auf dem Observatory-Portalstand mit gemeinsamer Web-/Native-Navigation, Sicherheits-Gates, Community-Schutz, Händler-Shops, Katalogsuche, Offline-Outbox und quellengebundener KI-Struktur. Der aktuelle WebDev-Checkpoint vor diesem Quellen-Audit war `f062ef9f`.

## Quellenentscheidung des Nutzers

Wikimedia Commons und Wikipedia werden nicht als Bild- oder Quellenpartner für BlackWaterLeaf verwendet. Wikimedia Commons ist zwar nicht Wikipedia, gehört aber zur Wikimedia-Organisation; beide sind für diesen Katalog ausdrücklich ausgeschlossen.

Umgesetzt:

- Alle 76 gefundenen Wikimedia-/Wikipedia-Bildnachweise aus `plant_taxa` und `aquarium_taxa` entfernt.
- Taxon-Datensätze selbst erhalten; nur nicht erlaubte Bild- und Provenienzfelder wurden neutralisiert.
- Resolver-, Kandidaten- und Provenienzartefakte für Wikimedia entfernt.
- Neue Katalogimporte werden serverseitig blockiert, wenn Wikimedia/Wikipedia auftaucht.
- Zusätzlich ist eine wissenschaftliche Medien-Allowlist aktiv: POWO/Kew, FishBase, GBIF, Biodiversity Heritage Library und JSTOR Plants.
- Es werden nur geprüfte Quellen und belegbare Bilder zugelassen; keine generischen Suchbilder und keine erfundenen Artzuordnungen.

## Web-Abgleich gegen Referenzbilder

Konform beziehungsweise beibehalten:

- Schwarzgrüne Observatory-Grundfläche.
- Lime als Portal-/Bestätigungsakzent.
- Aqua-Cyan ausschließlich für Aquaristik und Live-Kontext.
- Naturgold für Terraristik.
- Dünne funktionale Lucide-Icons: Suche, Marktplatz, Glocke, Menü, Karte, Kamera, Katalog und Profil.
- Desktop mit linker Fünfernavigation; Mobile mit unterer Fünfernavigation.
- Botanik, Aquaristik und Terraristik öffnen eigene Fachpfade.
- Leere Benachrichtigungen bleiben ehrlich leer und zeigen keinen erfundenen Feed.

Korrigiert:

- Die nicht referenzkonforme Wetter-/Messwertleiste wurde aus der Startscreen-Hierarchie entfernt. Wetter bleibt als eigener Fachpfad verfügbar.
- Typografie und Feldinhalte wurden durch einen einheitlichen linken Innenabstand besser lesbar ausgerichtet.
- Pflanzen- und Fischdetailseiten besitzen eine gemeinsame, quellengebundene Fundort-/Verbreitungskarte. Sie verwendet nur vorhandene Lebensraumangaben und erfindet keine privaten Koordinaten.

Bewusste Sicherheitsgrenze:

- Community-Live aus dem Mockup ist nicht als öffentlicher Einstieg freigeschaltet, solange die separate Safety-Abnahme nicht vollständig nachgewiesen ist.
- Mockup-Namen, Zuschauerzahlen, Expertenprofile und Quellenkacheln aus den Screenshots werden nicht als echte Daten übernommen.

## Noch offen für den nächsten Auftrag

1. Neue geprüfte Bildquellen pro Taxon einzeln freigeben und importieren; bis dahin bleiben betroffene Katalogbilder leer statt falsch.
2. Fundortangaben aus strukturierten Katalogfeldern beziehen, sobald die freigegebenen wissenschaftlichen Quellen vorliegen; Kurzprofil-Parsing ist nur ein sicherer Übergang.
3. Den finalen Quellen-Audit mit TypeScript, Testlauf, Produktionsbuild, Screenshot-Abnahme und neuem Checkpoint abschließen.
