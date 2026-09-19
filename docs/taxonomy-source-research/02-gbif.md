# Evidenzbericht: GBIF Backbone Taxonomy und Occurrence-Daten

**Scope.** Für den BlackWaterLeaf-Katalog (Erweiterung von 84 Pflanzen- und 15 Fisch-Datensätzen) wurde ausschließlich GBIF als Fachquelle geprüft. Wikimedia/Wikipedia wurden nicht verwendet. Es wurden keine Datenbank- oder Codeänderungen ausgeführt.

## Quelle und Eignung

Die [GBIF Backbone Taxonomy](https://www.gbif.org/dataset/d7dddbf4-2cf0-4f39-9b2a-bb099caae36c) ist ein registriertes Checklist-Dataset des GBIF Secretariat, DOI [10.15468/39omei](https://doi.org/10.15468/39omei), Lizenz [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/legalcode). Sie ist eine synthetische Managementklassifikation für GBIF-Namen und unterstützt konsistente taxonomische Suche, Browsing und Crosswalks. Die Backbone-Erstellung ist laut [offizieller Taxonomie-Dokumentation](https://techdocs.gbif.org/en/data-processing/taxonomy-interpretation) eingestellt; die Taxonomie bleibt aus Gründen der Rückwärtskompatibilität verfügbar, und ihre Identifikatoren werden in der API unterstützt. Für neue Katalogdaten ist deshalb die explizite Fixierung von Backbone-`checklistKey` und Abrufdatum wichtig; taxonomische Aktualität darf nicht vorausgesetzt werden.

## Offizielle Zugänge

| Zweck | Konkret nutzbarer offizieller Zugang |
|---|---|
| Name anhand wissenschaftlichem Namen matchen | [Species API-Dokumentation](https://techdocs.gbif.org/en/openapi/v1/species), v2 `GET /v2/species/match` (laut Dokumentation); `checklistKey=d7dddbf4-2cf0-4f39-9b2a-bb099caae36c` für Backbone. Die Dokumentation nennt auch Identifier-Matching über `taxonID`, `scientificNameID` oder `taxonConceptID`. |
| Taxon per stabilem Schlüssel lesen | `GET /v1/species/{usageKey}` sowie dokumentierte Unterressourcen wie `/synonyms`, `/parents`, `/children`, `/vernacularNames`, `/references`, `/media`, `/identifier`; Basis [https://api.gbif.org/](https://api.gbif.org/). Backbone-Namensverwendungen haben `key == nubKey`. |
| Occurrence-Suche | [Occurrence API-Dokumentation](https://techdocs.gbif.org/en/openapi/v1/occurrence), `GET /v1/occurrence/search`; einzelne Datensätze über `/occurrence/{gbifId}` oder `/occurrence/{datasetKey}/{occurrenceId}`. Für Backbone-Taxonomie `checklistKey=d7dddbf4-2cf0-4f39-9b2a-bb099caae36c`. |
| Reproduzierbarer Bulk-Export | [API Downloads](https://techdocs.gbif.org/en/data-use/api-downloads), `POST /v1/occurrence/download/request`; authentifiziertes GBIF-Konto erforderlich. `SIMPLE_CSV` (TSV), `DWCA`, `SPECIES_LIST` und weitere Formate sind offiziell dokumentiert. Ein erfolgreicher Download erhält eine zitierfähige DOI. |
| Statischer Backbone-Download | Vom offiziellen Dataset-Eintrag verlinkter [Darwin-Core-Archive-Endpunkt](https://hosted-datasets.gbif.org/datasets/backbone/current/backbone.zip); zusätzlich sind frühere Versionen im offiziellen Backbone-Archiv angegeben. |

## Stabile Identifikatoren

Für Taxa ist der Backbone-`usageKey`/`taxonKey` der zentrale GBIF-Schlüssel; bei Vorkommen ist `gbifID` der GBIF-Schlüssel und `datasetKey` die UUID des Quelldatensatzes. `occurrenceID` ist der vom Publisher gelieferte Darwin-Core-Bezeichner und kann fehlen. GBIF dokumentiert, dass `gbifID` möglichst stabil gehalten wird, dies aber nicht in jedem Fall garantiert werden kann. Für zitierfähige Reproduzierbarkeit sind daher zusätzlich Backbone-DOI, Download-DOI (bei Bulk-Export), `datasetKey`, Abrufdatum und verwendete Filter zu speichern. Synonyme sind über `taxonKey` und `acceptedTaxonKey` bzw. im Taxon-Endpunkt über `synonyms`/`accepted` abzubilden.

## Strukturierte Felder für BlackWaterLeaf

**Taxonomie (Backbone):** `taxonKey`/`usageKey`, `acceptedTaxonKey`, `scientificName`, `acceptedScientificName`, `verbatimScientificName`, `taxonRank`, `kingdom`, `phylum`, `class`, `order`, `family`, `genus`, `species`, `specificEpithet`, `infraspecificEpithet`, `scientificNameAuthorship`, `taxonomicStatus`, `synonym`, `parentKey`/Klassifikation, `nameType`, `taxonomicStatus` sowie `matchType`, `confidence` und `issues` aus Species Match. Für menschenlesbare Katalogsuche zusätzlich nur offiziell gelieferte `vernacularNames` verwenden.

**Occurrence/Provenienz:** `gbifID`, `datasetKey`, `occurrenceID`, `datasetName`, `publishingOrgKey`, `institutionCode`, `collectionCode`, `catalogNumber`, `basisOfRecord`, `occurrenceStatus`, `recordedBy`, `eventDate`, `year`, `country`, `countryCode`, `locality`, `waterBody`, `decimalLatitude`, `decimalLongitude`, `coordinateUncertaintyInMeters`, `georeferencedBy`, `hasCoordinate`, `hasGeospatialIssues`, `issue`, `lastInterpreted`, `license`, `rightsHolder`, `recordedBy`, `identifiedBy`, `references` sowie `occurrence`-URL. Für Süßwasserfische sind `waterBody`, Geokoordinaten, Datum, Nachweisart und Unsicherheits-/Issue-Felder besonders relevant; sie sind optional und müssen auf Nullwerte geprüft werden.

**Medien:** Ein Occurrence-Record kann `media`/`identifier`, `type`, `format`, `created`, `creator`, `publisher`, `license`, `rightsHolder`, `references` und `description` enthalten. `mediaType` im Simple-Export zeigt nur die Medientypen; die ausführlicheren Medienangaben kommen aus Occurrence-API bzw. `multimedia.txt` im DWCA.

Die [offiziellen Downloadformate](https://techdocs.gbif.org/en/data-use/download-formats) definieren insbesondere `gbifID`, `datasetKey`, `occurrenceID`, taxonomische Backbone-Felder, `taxonKey`, `acceptedTaxonKey`, `scientificName`, `acceptedScientificName`, `issue`, `mediaType` und `lastInterpreted`. `DWCA` enthält interpretierte `occurrence.txt`, Publisher-Originaldaten `verbatim.txt` und Medienbezüge `multimedia.txt`.

## Lizenz, Attribution und Bilder

Die Backbone-Checklist selbst ist CC BY 4.0. Occurrence-Daten behalten jedoch die vom jeweiligen Publisher gewählte Lizenz; laut [GBIF Data User Agreement](https://www.gbif.org/terms/data-user) müssen Eigentümer-/Provenienz-Identifier in jedem weitergegebenen Record erhalten bleiben, Publisher müssen angemessen zitiert werden, und die jeweilige Publisher-Lizenz ist einzuhalten. Die [GBIF Citation Guidelines](https://www.gbif.org/citation-guidelines) verlangen bei Downloads die Download-DOI und die Mitführung der beitragenden Datensätze; bei API-Suchergebnissen ohne DOI wird ein abgeleitetes Dataset oder eine vollständige Attribution der Dataset-Publisher empfohlen.

**Bildregel für BlackWaterLeaf:** Bilder dürfen nur importiert werden, wenn der konkrete Medien-Record eine nachweisbare, passende Lizenz und die nötigen Attribution-Informationen enthält. GBIF weist ausdrücklich darauf hin, dass Medien ihre eigenen Lizenzen und Nutzungsbedingungen haben. Fehlen `license`/Rechte-Nachweis, Urheber oder eine belastbare Medienreferenz, darf das Bild nicht importiert werden. Die bloße Existenz eines GBIF-Occurrence-Records ist kein Bildrecht.

## Betriebsgrenzen und Risiken

Die Occurrence-Suche liefert maximal 300 Records pro Seite und hat eine harte Abfragegrenze von 100.000 Records (`offset + limit`); darüber ist der asynchrone Download-Service zu verwenden. Downloads erfordern GBIF-Registrierung und HTTP-Authentifizierung. Download-Predicates dürfen höchstens 101.000 Elemente (z. B. Taxon Keys) und höchstens 10.000 Polygonpunkte enthalten. Bei Plattformlast werden laufende Downloads begrenzt: Die Dokumentation nennt maximal drei unvollständige Downloads pro Nutzer, wenn insgesamt weniger als 100 unvollständig sind, und maximal einen, wenn insgesamt weniger als 1.000 Downloads laufen. GBIF garantiert weder Datenvollständigkeit/-qualität noch ununterbrochenen Dienst; API-Nutzung darf keinen DoS, keine Störung und keine Beeinträchtigung des Normalbetriebs verursachen. Ein konkretes öffentliches Requests-per-second-Limit wird in den geprüften offiziellen Dokumenten nicht genannt; daher keine erfundene Rate-Angabe. Caching, Backoff und paginierte bzw. DOI-basierte Downloads sind für einen Katalogbetrieb vorzusehen.

## Gesamturteil

**Geeignet mit Bedingungen.** GBIF Backbone ist eine belastbare, offiziell dokumentierte Taxonomie- und Identifikationsquelle für Pflanzen und Süßwasserfische; Occurrence-Daten sind als nachweisbezogene Ergänzung geeignet. Für BlackWaterLeaf sollten Name-Matches mit `checklistKey` und Match-Diagnostik gespeichert, Occurrences über `gbifID` plus `datasetKey`/`occurrenceID` verknüpft und Bulk-Abzüge mit Download-DOI und Abrufdatum archiviert werden. Die Quelle ersetzt keine fachliche Plausibilitätsprüfung: Backbone ist nicht mehr fortgeschrieben, Occurrence-Qualität ist heterogen, und Verbreitungs-/Vorkommensaussagen sollten aus einem zeitgestempelten Download stammen. Bilder sind standardmäßig auszuschließen, sofern die Rechte nicht je Medium nachweisbar sind.

### Offizielle Primärlinks

- [GBIF Backbone Taxonomy (Dataset, DOI, Lizenz, DCA)](https://www.gbif.org/dataset/d7dddbf4-2cf0-4f39-9b2a-bb099caae36c)
- [Species API](https://techdocs.gbif.org/en/openapi/v1/species)
- [Occurrence API](https://techdocs.gbif.org/en/openapi/v1/occurrence)
- [API Downloads](https://techdocs.gbif.org/en/data-use/api-downloads)
- [Occurrence download formats](https://techdocs.gbif.org/en/data-use/download-formats)
- [Taxonomy interpretation](https://techdocs.gbif.org/en/data-processing/taxonomy-interpretation)
- [GBIF Citation Guidelines](https://www.gbif.org/citation-guidelines)
- [GBIF Data User Agreement](https://www.gbif.org/terms/data-user)
- [Offizieller aktueller Backbone-DCA](https://hosted-datasets.gbif.org/datasets/backbone/current/backbone.zip)

**Stand der Recherche:** 19.09.2026.

## Kurzstruktur (für Katalogmodell)

```text
source: GBIF Backbone Taxonomy + GBIF Occurrence Store
taxonomy: checklistKey=d7dddbf4-2cf0-4f39-9b2a-bb099caae36c
source_doi: https://doi.org/10.15468/39omei
stable_taxon_id: taxonKey/usageKey
stable_occurrence_id: gbifID (mit datasetKey und occurrenceID aufbewahren)
required_provenance: datasetKey, publisher, license, rightsHolder, download/access date
preferred_bulk_access: authenticated occurrence download + download DOI
image_policy: nur Medium mit expliziter Lizenz/Rechte- und Attributionserfassung
```

## Quellenbasis und Abgrenzung

Dieser Bericht verwendet ausschließlich offizielle GBIF-Dokumentation, GBIF-API-Referenz, GBIF-Dataset-/Taxonomie-Primärseiten und den von GBIF verlinkten offiziellen Download-Endpunkt. Wikimedia und Wikipedia wurden nicht als Quellen verwendet.

---

## Quellen

[1]: https://www.gbif.org/dataset/d7dddbf4-2cf0-4f39-9b2a-bb099caae36c "GBIF Backbone Taxonomy"
[2]: https://techdocs.gbif.org/en/openapi/v1/species "GBIF Species API"
[3]: https://techdocs.gbif.org/en/openapi/v1/occurrence "GBIF Occurrence API"
[4]: https://techdocs.gbif.org/en/data-use/api-downloads "GBIF API Downloads"
[5]: https://techdocs.gbif.org/en/data-use/download-formats "GBIF Occurrence download formats"
[6]: https://techdocs.gbif.org/en/data-processing/taxonomy-interpretation "GBIF Taxonomy interpretation"
[7]: https://www.gbif.org/citation-guidelines "GBIF Citation guidelines"
[8]: https://www.gbif.org/terms/data-user "GBIF Data user agreement"
[9]: https://hosted-datasets.gbif.org/datasets/backbone/current/backbone.zip "GBIF Backbone current DCA"
[10]: https://doi.org/10.15468/39omei "GBIF Backbone DOI"
[11]: https://creativecommons.org/licenses/by/4.0/legalcode "CC BY 4.0"

<!-- Die Referenzen [1]–[11] sind die im Text verlinkten offiziellen Primärquellen. -->
