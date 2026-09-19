# Autoritativer Taxonomieausbau – 19. September 2026

## Ergebnis

Der BlackWaterLeaf-Katalog wurde **quellengebunden und ohne unklare Bilder** erweitert. Die Datenbank enthält nun **174 Pflanzendatensätze** und **89 Süßwasserfischdatensätze**. Davon sind 156 Pflanzen und alle 89 Fische veröffentlicht; 18 historische, manuell gepflegte Pflanzen bleiben unverändert im Entwurfsstatus. Der neue Bestand umfasst **90 Pflanzen** und **74 Fische**, die jeweils einen exakten, akzeptierten Arttreffer aus dem GBIF Backbone mit mindestens 95 % Abgleichkonfidenz besitzen.

| Katalog | Vorher | Neu importiert | Nachher | Veröffentlichter Bestand | Neue Fachquellen-Provenienz |
| --- | ---: | ---: | ---: | ---: | ---: |
| Pflanzen | 84 | 90 | 174 | 156 | 90 |
| Süßwasserfische | 15 | 74 | 89 | 89 | 74 |

Die Erweiterung beschränkt sich bewusst auf die Taxonomieebene. Sie enthält wissenschaftlichen Namen, akzeptierten Namen, Rang, Familie, Gattung, verfügbare Volksnamen und Synonyme sowie eine Quelle, Lizenz, Abrufzeit, taxonomischen Status und Abgleichkonfidenz. Pflege-, Haltungs- und Verbreitungsbehauptungen wurden nicht künstlich erzeugt. Alle neu importierten Bildfelder sind `NULL`; die bestehende Regel für nachweisbare Bildrechte bleibt unverändert wirksam.

## Fachquellen und Rollen

| Quelle | Rolle im Modul | Identifikator und Nachweis | Lizenz-/Nutzungshinweis |
| --- | --- | --- | --- |
| Plants of the World Online, Royal Botanic Gardens, Kew | Fachlicher Pflanzen-Namensabgleich und spätere WCVP/POWO-Review-Stufe | IPNI Life Sciences Identifier bzw. WCVP-Referenz | Taxonomische und Bildinhalte getrennt behandeln; Bilder benötigen einen eigenständigen Rechtebeleg. [1] |
| GBIF Backbone Taxonomy | Aktueller, programmgesteuerter Import für akzeptierte Artennamen, Synonyme und kontrollierte Katalog-IDs | `GBIF:<usageKey>`, öffentliche Artseite, Backbone-DOI `10.15468/39omei` | CC BY 4.0; Quelle und DOI werden pro neuem Datensatz gespeichert. GBIF ist kein Bildhost. [2] [3] |
| FishBase | Fachliche zweite Review-Stufe für Fische, Ökologie und Literatur | FishBase Speccode bzw. Artenseite | Text-/Zahlen- und Bildrechte werden getrennt geprüft; ohne eindeutige Medienlizenz kein Bildimport. [4] |

## Validierungs- und Importregel

Der Resolver akzeptiert nur Datensätze, die gleichzeitig `EXACT`, `ACCEPTED`, `SPECIES`, namensgleich zum kuratierten Ziel und mindestens zu 95 % sicher sind. Von 120 Pflanzenzielen wurden 108 aufgelöst; 18 Namen waren bereits im Legacy-Bestand und wurden nicht dupliziert. Von 76 Fischzielen wurden 74 aufgelöst. Vierzehn unsichere, synonymisierte, zweifelhafte oder nicht erreichbare Ziele wurden als Ablehnungen mit Ursache im Importmanifest gespeichert und **nicht** veröffentlicht.

Der Import ist idempotent: Der technische Schlüssel besteht aus Quelle, Quellversion und Quell-ID. Zusätzlich werden bereits vorhandene wissenschaftliche Namen aus dem historischen Bestand beim Erzeugen der Batches ausgeschlossen. Jeder neue Datensatz enthält `sourceRecordUrl`, `sourceLicense`, `sourceCitation`, `sourceRetrievedAt`, `taxonomicStatus` und `matchConfidence`.

## KI-Katalogabgleich

Der Assistenzdienst kann nun veröffentlichte Katalogeinträge anhand von Namen und Familien abrufen. Im Chat werden höchstens sechs quellengebundene Treffer als Kontext bereitgestellt. Bei einer Pflanzenbildbestimmung werden passende veröffentlichte Katalogeinträge nach der Modellantwort abgeglichen und explizit als **BlackWaterLeaf-Katalogabgleich** ausgegeben. Der Katalog ist dabei eine Verifikationshilfe und keine Diagnosequelle; ohne exakten Treffer bleibt die Antwort ausdrücklich offen.

## Ausdrückliche Grenzen

Wikimedia, Wikipedia und deren Bildhosts bleiben ausgeschlossen. GBIF-Medien werden nicht als direkte Bildquellen genutzt. Nichtkommerzielle, unklare oder rechtevorbehaltene Bildlizenzen werden serverseitig blockiert. Der Katalog soll in einer nächsten Fachreview-Stufe mit Kew/WCVP für Pflanzen und FishBase für Fische auf anwendungsspezifische Detailfelder ergänzt werden; diese Felder dürfen erst nach je Datensatz dokumentierter Quelle veröffentlicht werden.

## Referenzen

[1]: https://powo.science.kew.org/ "Plants of the World Online – Kew Science"
[2]: https://techdocs.gbif.org/en/openapi/v1/species "GBIF Species API"
[3]: https://doi.org/10.15468/39omei "GBIF Backbone Taxonomy"
[4]: https://www.fishbase.se/summary/citation.php "FishBase citation and copyright statement"
