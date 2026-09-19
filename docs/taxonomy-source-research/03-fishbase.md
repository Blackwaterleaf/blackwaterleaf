# FishBase – Evidenzbericht für BlackWaterLeaf

**Prüfumfang:** ausschließlich FishBase als wissenschaftliche Fachquelle; Wikimedia/Wikipedia wurden nicht verwendet. Es wurden keine Datenbank- oder Codeänderungen ausgeführt.

## Quelle und Eignung

[FishBase](https://www.fishbase.se/home.htm) ist ein globales Informationssystem zu Fischen. Die Primärseite beschreibt Inhalte zu Taxonomie, Biologie, trophischer Ökologie, Lebensgeschichte, Nutzung, Verbreitung und Literatur; sie nennt tägliche interne Updates und eine zweimonatliche Web-Veröffentlichung. Damit ist FishBase für den Ausbau des Süßwasserfisch-Katalogs fachlich geeignet, insbesondere als zitierbare Sekundärdatenbank mit Verweisen auf die zugrunde liegenden Primärpublikationen. Es ist **keine Pflanzenquelle** und darf daher nur für Fisch-Datensätze verwendet werden.

## Offizielle Zugänge, nicht erfundene Endpunkte

Die offizielle [FishBase-Hinweisseite](https://www.fishbase.se/hints.htm) dokumentiert Weblinks und XML-Webservices. Sie nennt außerdem ausdrücklich eine **unabhängig gepflegte** API unter [fishbase.ropensci.org](https://fishbase.ropensci.org/); diese API ist deshalb kein von FishBase selbst betriebener/offizieller API-Dienst und sollte nur nach separater Verfügbarkeits- und Nutzungsprüfung eingesetzt werden.

Auf einer offiziellen, konkreten [FishBase-Artenseite](https://fishbase.se/summary/SpeciesSummary.php?genusname=Betta&speciesname=mahachaiensis) sind folgende verlinkte, konkret nutzbare FishBase-Webservices sichtbar:

- [Summary-XML](https://fishbase.se/webservice/summary/fb/showXML.php?identifier=FB-66633&ProviderDbase=03)
- [Common-names-XML](https://fishbase.se/webservice/comnames/ComNamesXML.php?Genus=Betta&Species=mahachaiensis)
- [Photo-Liste](https://fishbase.se/webservice/photos/FishPicsList.php?Genus=Betta&Species=mahachaiensis&type=)
- [Point data](https://fishbase.se/webservice/Occurrence/PointData.php?Genus=Betta&Species=mahachaiensis)

Die Hinweisseite dokumentiert zusätzlich die [Freshwater-Liste als XML-Webservice](https://www.fishbase.se/country/CountrySearchListXML.php?c_code=608&group=freshwater), sowie taxonomische Primärseiten für [wissenschaftliche Namen](https://www.fishbase.se/Nomenclature/ScientificNameSearchList.php?Genus=Gadus&Species=morhua), [Familienlisten](https://www.fishbase.se/Nomenclature/FamilySearchList.php?Family=Achiridae&group=species) und [Artenseiten](https://www.fishbase.se/summary/Gadus-morhua.html). Die XML-Antworten sind praktisch abrufbar, aber nicht als modernes JSON-Schema dokumentiert; Feldmapping und Stabilität müssen vor einer produktiven Integration je Endpunkt getestet werden.

## Stabiler Identifikator

Der wichtigste FishBase-Schlüssel ist **Speccode** (Beispiel: `66633` für *Betta mahachaiensis*), verwendet als `FB-66633` im Summary-XML-Identifier und als `ID=66633` in Arten-, Bild- und Unterseiten. Zusätzlich sind `Genus` und `Species` als lesbarer Namensschlüssel vorhanden. Speccode sollte als quelleninterner Primärschlüssel gespeichert werden; wissenschaftlicher Name und Synonyme sind separate, veränderliche Taxonomieattribute. Die Artenseite zeigt außerdem den FishBase-Artenlink `.../summary/SpeciesSummary.php?id=66633`.

## Nutzbare strukturierte Felder

Aus Artenseite und den verlinkten XML-Diensten ergeben sich mindestens:

- `source`, `fishbase_speccode`, `identifier` (`FB-<Speccode>`), `source_url`
- `genus`, `species`, vollständiger wissenschaftlicher Name, Autor/Jahr, `synonyms`
- taxonomische Hierarchie (z. B. Klasse, Ordnung, Familie, Unterfamilie)
- `common_name`, Sprache, Land/Gebiet (Common-names-XML)
- Umwelt/Milieu: `freshwater`, `brackish`, `marine`, Lebensraum-/Ökologieangaben, Klima-/Tiefen-/pH-Bereich
- Verbreitung: Kontinent/Land/Gebiet, FAO-Gebiet, Ökosystem, Vorkommen/Point data
- Größe/Gewicht/Alter, Reife, Morphologie/Meristik und diagnostische Beschreibung
- Biologie/Lebenszyklus, Ernährung/trophische Angaben, Nutzung/Aquakultur, Gefährdungsstatus (jeweils mit FishBase-Referenznummern)
- `reference_id`, Literaturzitat und ggf. Originalquelle des Datensatzes
- bei Textobjekten im Summary-XML zusätzlich Objekttyp/Abschnitt, Ersteller, Erstellungs-/Änderungsdatum und Lizenz-URL (z. B. `http://creativecommons.org/licenses/by-nc/3.0/`)
- für Bilder: `image_id`/Speccode, Dateiname, Vollbild-/Thumbnail-URL, Fotograf/Organisation; **eine belastbare Bildlizenz ist nicht in der Photo-Listen-Antwort enthalten**.

## Lizenz, Attribution und Bilder

Die offizielle FishBase-[Such-/Disclaimer-Seite](https://fishbase.se/search.php?lang=German) erklärt: Text, Zahlen und Karten dürfen für **nicht-kommerzielle** Webseiten unter [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) übernommen werden, sofern sie klar als FishBase gekennzeichnet sind und auf die jeweilige Quellseite zurückverlinkt wird. Für einzelne Daten soll zusätzlich die jeweilige Hauptreferenz zitiert werden; FishBase nennt als Zitierform Froese und Pauly, Herausgeber, *FishBase*, Web-Publikation, Versionsdatum.

Fotos und Zeichnungen gehören laut derselben Seite den jeweils angegebenen Personen/Organisationen und haben eigene Copyright-Angaben. Nur Medien, die ausdrücklich **CC-BY oder CC-BY-NC** tragen, dürfen ohne weitere Erlaubnis mit vollständiger Attribution und dem Hinweis „from FishBase“ verwendet werden. Die [FishBase-Seite für Bildbeiträge](https://fishbase.se/contribu.htm) bestätigt, dass das Copyright bei beitragenden Fotografen verbleibt und Name/Kontakt/URL zugeordnet werden. Konsequenz für BlackWaterLeaf: **keine FishBase-Bilder importieren, wenn Lizenz/Erlaubnis und Rechteinhaber nicht pro Bild nachweisbar sind**; reine FishBase-Photo-Listen mit Dateiname und Fotograf reichen nicht als Rechtebeleg.

## Betriebsgrenzen und Eignungsurteil

FishBase dokumentiert auf den geprüften offiziellen Seiten **kein konkretes Rate-Limit, kein SLA und keine garantierte API-Verfügbarkeit**. Die Seite beschreibt den Webzugang als kostenlos und nennt eine zweimonatliche Web-Aktualisierung; die unabhängig gepflegte rOpenSci-API ist daher ein zusätzlicher Betriebs-/Stabilitätsrisiko. Für eine verantwortbare Nutzung: geringe, gecachte Abrufrate; Backoff und Fehlerbehandlung; Speichern der Abruf-/Versionszeit; keine Annahme, dass HTML- oder XML-Feldnamen unverändert bleiben; Quell-URL und FishBase-Referenznummer pro Wert aufbewahren. Der alte [Installations-/Datenbankleitfaden](https://fishbase.se/manual/fishbasegetting_started.htm) beschreibt historische CD-/Microsoft-Access-Versionen und ist kein aktueller Bulk-Downloadvertrag. Ein aktueller, offiziell dokumentierter vollständiger Datenbankdownload oder ein offiziell zugesichertes JSON-API-Angebot wurde nicht nachgewiesen.

**Urteil:** FishBase ist für 15+ Süßwasserfisch-Datensätze als fachliche, quellenverknüpfte Katalogquelle **geeignet**, vorzugsweise über die dokumentierten Arten-/XML-Seiten mit `Speccode` und Referenzen. Für automatisierten Massendownload nur bedingt geeignet, weil kein offizielles Rate-Limit/SLA und keine aktuelle vollständige Download-Spezifikation belegt sind. Für Bilder gilt ein striktes Opt-in je eindeutig lizenzierter Datei; andernfalls nur verlinken oder ohne Bild bleiben.

## Quellen

1. [FishBase home / Umfang und Aktualisierung](https://www.fishbase.se/home.htm)
2. [FishBase hints / dokumentierte Webservices, API-Hinweis, Zitierung](https://www.fishbase.se/hints.htm)
3. [Beispiel-Artenseite *Betta mahachaiensis*](https://fishbase.se/summary/SpeciesSummary.php?genusname=Betta&speciesname=mahachaiensis)
4. [Beispiel Summary-XML](https://fishbase.se/webservice/summary/fb/showXML.php?identifier=FB-66633&ProviderDbase=03)
5. [Lizenz-/Copyright-Hinweise](https://fishbase.se/search.php?lang=German)
6. [Bildbeiträge und Rechteinhaber](https://fishbase.se/contribu.htm)
7. [Historischer Installations-/Datenbankleitfaden](https://fishbase.se/manual/fishbasegetting_started.htm)
8. [Unabhängig gepflegte rOpenSci-API](https://fishbase.ropensci.org/)
9. [Dokumentation der rOpenSci-API](https://ropensci.github.io/fishbaseapidocs/)

**Stand der Prüfung:** 2026-09-19.

## Strukturierte Rückgabe

```yaml
source: FishBase
official_access: "FishBase-Artenseiten und dokumentierte XML-Webservices; rOpenSci-API ausdrücklich unabhängig gepflegt"
stable_identifier: "Speccode, z. B. 66633; API/Seitenformen FB-<Speccode> und ID=<Speccode>"
useful_fields:
  - source
  - fishbase_speccode
  - identifier
  - genus
  - species
  - author_year
  - taxonomy_hierarchy
  - synonyms
  - common_name
  - common_name_language
  - common_name_country
  - environment
  - habitat_ecology
  - pH_range
  - distribution
  - occurrences
  - point_data
  - size_weight_age
  - morphology
  - life_cycle
  - trophic_ecology
  - human_use
  - threat_status
  - reference_id
  - reference_citation
  - record_license_url
  - image_filename
  - image_url
  - thumbnail_url
  - photographer
licensing_and_attribution: "Text/Zahlen/Karten nicht-kommerziell CC BY-NC 4.0 mit FishBase-Kennzeichnung und Rücklink; Primärreferenz zusätzlich zitieren. Bilder nur bei explizitem CC-BY/CC-BY-NC oder individueller Erlaubnis; Rechteinhaber/Fotograf vollständig nennen."
operational_limits: "Kein offizielles Rate-Limit, SLA oder aktueller vollständiger Bulk-Download nachgewiesen; rOpenSci-API unabhängig. Caching, Backoff, Versions-/Abrufzeit und Quell-URLs erforderlich."
suitability: "Geeignet für taxonomische und ökologische Fischdatensätze; bedingt für Massensynchronisation; Bilder standardmäßig nicht importieren."
```
