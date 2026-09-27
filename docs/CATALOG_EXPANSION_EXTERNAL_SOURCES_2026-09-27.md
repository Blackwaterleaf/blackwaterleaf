# Quellenprotokoll Katalogerweiterung

## GBIF
- Species API: https://techdocs.gbif.org/en/openapi/v1/species
- Production API: https://api.gbif.org/
- GBIF Backbone DOI: https://doi.org/10.15468/39omei
- GBIF ist ein taxonomischer Index. Für den Import müssen Artenrang, akzeptierter Status, Bereichsklassifikation und GBIF-Quell-URL geprüft werden.
- Achtung: naive `species/search`-Filterparameter wie `kingdom`/`class` liefern nicht zuverlässig die gewünschte taxonomische Teilmenge; Datensätze müssen anhand der zurückgegebenen `kingdom`, `class`, `order`, `family`, `rank` und `taxonomicStatus` Felder lokal validiert werden.

## Wikimedia Commons / Wikipedia
- Commons API-Dokumentation: https://commons.wikimedia.org/wiki/Commons:API/MediaWiki
- Imageinfo-API liefert Bild-URL, Maße und Dateiseitenmetadaten; `extmetadata` enthält Lizenz-/Urheberinformationen.
- Dateiseiten-Lizenz muss je Bild geprüft werden. Wikipedia/Wikimedia wird nicht automatisch als Lizenzfreigabe behandelt.
- Nur Bilder mit klarer Lizenz, Autor/Attribution, ausreichender Auflösung und exakter Taxon-Übereinstimmung dürfen als Katalogbild veröffentlicht werden.

## Bestehende Projektregeln
- `shared/taxon-source-policy.ts` erlaubt derzeit offizielle Taxonomiequellen GBIF, POWO, FishBase, BHL und JSTOR Plants; Wikimedia/Wikipedia ist aktuell als direkte Katalogquelle ausgeschlossen.
- Katalogtabellen enthalten `summary`, `careProfile`, `sourceRecordUrl`, `sourceCitation`, `imageUrl`, `imageSourceUrl`, `imageLicense`, `imageAttribution`, `imageVerifiedAt`, `evidenceState` und `status`.
- Keine Pflege-/Haltungsangabe darf aus einer bloßen KI-Erzeugung veröffentlicht werden. Nicht ausreichend belegte Felder bleiben leer oder `draft`/`insufficient`.
