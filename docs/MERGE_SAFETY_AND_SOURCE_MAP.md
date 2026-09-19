# BlackWaterLeaf: sichere Zusammenführung der Web-Stände

## Ausgangslage

Der aktuelle WebDev-Stand `blackwaterleaf-parity-staging` ist der führende Produktstand für die neue Web-/Native-Parität. Der ursprüngliche GitHub-Stand `Blackwaterleaf/blackwaterleaf` enthält ältere, wertvolle Pflanzen- und KI-Funktionen. Beide Stände wurden vor der Zusammenführung unverändert gesichert.

Der aktuelle Stand verwendet die neue Tabelle `plant_taxa`; sie enthält derzeit keine Datensätze. Der ältere Stand verwendet `taxonomy_species` und enthält eine versionierte Taxonomiequelle in `scripts/seed-taxonomy.sql` sowie einen älteren PlantNet-Validierungsfluss.

## Sicherungsstand

- Aktueller Stand: Commit `37bc073`
- Alter Produktstand: Commit `bbe27ba`
- Lokale Git-Bundles und Manifest: `/home/ubuntu/blackwaterleaf-merge-safety-20260919/`
- Die aktuelle Datenbank wurde bei diesem Arbeitsschritt nicht verändert.

## Übernommene Quelle

Die alte Seed-Datei wurde unverändert unter `data/imports/legacy-seed-taxonomy.sql` abgelegt. Der SHA-256-Hash und die Herkunft stehen in `data/imports/legacy-source-manifest.txt`.

`convert-legacy-taxonomy.mjs` erzeugt daraus ein Import-JSON für `plant_taxa`. Die Konvertierung ist deterministisch, dedupliziert nur anhand der Quellkennung und bewahrt wissenschaftlichen Namen, Synonyme, deutsche/englische Namen, Familie, Gattung, Merkmale, Lebensraum, Pflegeparameter, Quellenangabe und Verifikationsstatus.

Der vorbereitete Katalog enthält 99 eindeutige Datensätze:

| Kategorie | Datensätze |
|---|---:|
| Alocasia | 30 |
| Philodendron | 24 |
| Aquatic | 20 |
| Channa | 15 |
| Monstera | 10 |

Der Import wurde noch nicht in die Datenbank geschrieben. Dadurch bleiben bestehende Nutzerdaten und der aktuelle Datenbankstand unverändert, bis die Feldzuordnung und die Abgrenzung zwischen Pflanzen- und Aquaristik-Taxa abschließend geprüft sind.

## Zusammenführungsregeln

Der neue Stand bleibt die führende Oberfläche, Navigation, Authentifizierung, Datenbankstruktur und Web-/Native-Paritätsbasis. Alte Pflanzen-/KI-Funktionen werden additiv übernommen, nicht durch Ersetzen der aktuellen App. Öffentliche Taxa werden nur mit Quellen- und Verifikationsmetadaten veröffentlicht. Private Anlagen, Beobachtungen und Community-Daten werden nicht als Taxonomiequelle verwendet.

Als nächster technischer Schritt folgt die serverseitige PlantNet-Anbindung mit sicherer Schlüsselkonfiguration. Der Schlüssel wird nicht in Git, Client-Code oder Importdateien gespeichert. Danach wird der vorbereitete Katalog in einer kontrollierten, idempotenten Migration importiert und mit Suche, Detailseite sowie Bestimmungs- und Korrekturworkflow validiert.

## Externe Referenz

Die spätere API-Integration richtet sich nach der offiziellen [Pl@ntNet OpenAPI-Dokumentation](https://my.plantnet.org/doc/api/openapi) und dem offiziellen [Single-species-Identification-Endpunkt](https://my.plantnet.org/doc/api/identify). Die API ist für Bildbestimmung und Arteninformationen gedacht; sie wird nicht als unkontrollierter Voll-Datenbankexport in die App kopiert.
