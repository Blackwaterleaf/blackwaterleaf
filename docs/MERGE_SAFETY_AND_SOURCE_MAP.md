# BlackWaterLeaf: sichere Zusammenführung der Web-Stände

## Ausgangslage

Der aktuelle WebDev-Stand `blackwaterleaf-parity-staging` ist der führende Produktstand für die neue Web-/Native-Parität. Der ursprüngliche GitHub-Stand `Blackwaterleaf/blackwaterleaf` enthält ältere, wertvolle Pflanzen- und KI-Funktionen. Beide Stände wurden vor der Zusammenführung unverändert gesichert.

Der aktuelle Stand verwendet die neue Tabelle `plant_taxa`; die alte Quelle wird dafür deterministisch aufbereitet. Der ältere Stand verwendet `taxonomy_species` und enthält eine versionierte Taxonomiequelle in `scripts/seed-taxonomy.sql` sowie einen älteren PlantNet-Validierungsfluss.

## Sicherungsstand

- Aktueller Stand: Commit `37bc073`
- Alter Produktstand: Commit `bbe27ba`
- Lokale Git-Bundles und Manifest: `/home/ubuntu/blackwaterleaf-merge-safety-20260919/`
- Die aktuelle Datenbank wurde ausschließlich additiv über idempotente SQL-Batches erweitert; bestehende Nutzer-, Community- und Care-Daten wurden nicht verändert.

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

Für den aktuellen `plant_taxa`-Vertrag wurden 84 Pflanzen- und Aquaristikpflanzen-Datensätze in fünf idempotenten SQL-Batches importiert und verifiziert: 84 veröffentlichte Datensätze, davon 20 Aquaristikpflanzen und 64 Land-/Zimmerpflanzen, mit 84 eindeutigen Quellkennungen. Die 15 Channa-Fischdatensätze bleiben separat archiviert, weil `plant_taxa` keine Organismen-Kategorie besitzt.

## Zusammenführungsregeln

Der neue Stand bleibt die führende Oberfläche, Navigation, Authentifizierung, Datenbankstruktur und Web-/Native-Paritätsbasis. Alte Pflanzen-/KI-Funktionen werden additiv übernommen, nicht durch Ersetzen der aktuellen App. Öffentliche Taxa werden nur mit Quellen- und Verifikationsmetadaten veröffentlicht. Private Anlagen, Beobachtungen und Community-Daten werden nicht als Taxonomiequelle verwendet.

Die serverseitige PlantNet-Anbindung ist jetzt im aktuellen Assistant-Router aktiv und verwendet die sicher hinterlegte Variable `PLANTNET_API_KEY`. Die Prüfung ist eine unabhängige Zweitmeinung, bleibt bei Upstream-Fehlern ausfallsicher und wird im Ergebnis transparent ausgewiesen. Als nächster technischer Schritt folgt der kontrollierte, idempotente Katalogimport mit Suche, Detailseite sowie Bestimmungs- und Korrekturworkflow.

## Externe Referenz

Die spätere API-Integration richtet sich nach der offiziellen [Pl@ntNet OpenAPI-Dokumentation](https://my.plantnet.org/doc/api/openapi) und dem offiziellen [Single-species-Identification-Endpunkt](https://my.plantnet.org/doc/api/identify). Die API ist für Bildbestimmung und Arteninformationen gedacht; sie wird nicht als unkontrollierter Voll-Datenbankexport in die App kopiert.
