-- BlackWaterLeaf-curated aquarium profile and owner-media patch.
-- Images are company-owned BlackWaterLeaf media; no third-party image license is asserted.

SET NAMES utf8mb4;

INSERT INTO aquarium_taxa (
  source, sourceVersion, sourceRecordId, sourceRecordUrl, sourceLicense, sourceCitation, sourceRetrievedAt,
  taxonomicStatus, matchConfidence, scientificName, acceptedScientificName, `rank`, family, genus,
  commonNames, synonyms, summary, careProfile, imageUrl, imageSourceUrl, imageLicense, imageAttribution,
  imageVerifiedAt, evidenceState, status
) VALUES (
  'BlackWaterLeaf', 'curated-aquarium-2026-11', 'Badis badis', 'https://blackwaterleaf.com/', 'proprietary-owner-approved',
  'Taxonomy and biology checked against FishBase (https://fishbase.se/summary/Badis-badis); aquarium husbandry and breeding context supplemented by TFH Magazine (https://www.tfhmagazine.com/articles/freshwater/breeding-the-blue-dwarf-badis-badis-full-article).',
  '2026-11-01 00:00:00', 'accepted', 100, 'Badis badis', 'Badis badis', 'species', 'Badidae', 'Badis',
  '["Blaubarsch","Blue Badis","Dwarf Chameleonfish"]', '[]',
  'Kleiner Badidae aus dem Ganges- und angrenzenden Flusssystemen. Die Art bleibt mit dokumentierten 7,1 cm Gesamtlänge klein, lebt benthopelagisch und nimmt in der Natur Würmer, kleine Krebstiere und Insekten auf. Männchen zeigen in Balz- und Dominanzsituationen häufig deutlich intensivere Blau- und Kontrastfärbung; Weibchen wirken meist voller und farblich zurückhaltender. Die Färbung ist jedoch abhängig von Stimmung, Umgebung und Kondition und darf nicht als alleinige Geschlechtsdiagnose verwendet werden.',
  '{"category":"badis","careLevel":"mittel","adultSizeCm":"7.1","documentedTemperatureC":"14-30","documentedPh":"6.0-8.0","documentedHardnessDh":"5-19","recommendedAquarium":"Strukturiertes, ruhiges Arten- oder sorgfältig zusammengestelltes Gesellschaftsaquarium mit dunklem Bodengrund, Laub, Pflanzen und kleinen Höhlen","flow":"sanft bis moderat","diet":"kleine carnivore Nahrung; Würmer, kleine Krebstiere, Insekten, geeignete Frost- und Lebendfutter; Trockenfutter nicht als alleinige Basis","compatibility":"friedlich gegenüber passenden ruhigen Mitbewohnern; während der Fortpflanzung territorialer","sexing":"Männchen meist farbintensiver und schlanker; Weibchen meist voller; sichere Bestimmung über mehrere Merkmale und Verhalten","breeding":"Höhlenlaicher; FishBase dokumentiert 30-100 Eier und Paarung mit Umklammerung; Gelege- und Brutpflegebereich strukturieren","welfare":"keine Vergesellschaftung mit deutlich größeren oder hektischen Arten; abwechslungsreich füttern und Rückzug ermöglichen","media":[{"sex":"male","label":"Männchen, blau gefärbt","imageUrl":"/manus-storage/catalog/taxa/aquarium/900001/bwl-owner_013fb400.jpg"},{"sex":"female","label":"Weibchen, zurückhaltende Färbung","imageUrl":"/manus-storage/catalog/taxa/aquarium/900001/bwl-owner_7bca6d29.jpg"}]}',
  '/manus-storage/catalog/taxa/aquarium/900001/bwl-owner_013fb400.jpg', 'https://blackwaterleaf.com/', 'blackwaterleaf-owner-approved', '© BlackWaterLeaf; firmeneigene Nutzeraufnahme; männliche blaue Färbung',
  '2026-11-01 00:00:00', 'confirmed', 'published'
)
ON DUPLICATE KEY UPDATE
  summary = VALUES(summary), careProfile = VALUES(careProfile), imageUrl = VALUES(imageUrl), imageSourceUrl = VALUES(imageSourceUrl), imageLicense = VALUES(imageLicense), imageAttribution = VALUES(imageAttribution), imageVerifiedAt = VALUES(imageVerifiedAt), updatedAt = CURRENT_TIMESTAMP, status = 'published';

UPDATE aquarium_taxa
SET
  sourceCitation = 'Taxonomy and size checked against FishBase (https://www.fishbase.se/summary/Channa-andrao); habitat and aquarium context supplemented by Seriously Fish (https://www.seriouslyfish.com/species/channa-andrao).',
  sourceRetrievedAt = '2026-11-01 00:00:00',
  summary = 'Kleiner Schlangenkopf aus dem Brahmaputra-Becken im Nordosten Indiens. FishBase dokumentiert 14,2 cm maximale Gesamtlänge und obligatorische Luftatmung. In der Aquaristik braucht die Art einen absolut ausbruchsicheren Deckel mit feuchter Luftschicht, saisonale Temperaturvariation und strukturreiche, eher gedämpfte Einrichtung. Das Tier ist räuberisch; adulte Tiere können innerartlich territorial werden.',
  careProfile = '{"category":"channa","careLevel":"anspruchsvoll","adultSizeCm":"14.2","temperatureC":"14-28","ph":"6.0-8.0","hardnessDh":"2-20","minimumFootprint":"80 x 30 cm für ein Paar als Aquaristik-Richtwert; für Gruppen größer planen","waterDepth":"über 30 cm","cover":"dichter Deckel ohne Fluchtspalten; feuchte Luftschicht über der Wasseroberfläche","layout":"gedämpftes Licht, Oberflächenpflanzen, Unterwasserdeckung und Laub","seasonality":"keine konstante Jahrestemperatur; definierte kühlere und wärmere Perioden","diet":"obligater Räuber; Insekten, Würmer, Garnelen, Muscheln und geeignete carnivore Futtermittel; kein Säuger-/Vogelfleisch und keine riskanten Futterfische","compatibility":"am sichersten im Artenbecken; Paarbildung kann funktionieren, fremde Artgenossen können aggressiv behandelt werden","sexing":"Weibchen meist größer und kräftiger mit mehr Rotanteil; Männchen mit stärkerer irisierender Blaufärbung an unpaarigen Flossen; keine sichere Bestimmung nur per Foto","breeding":"paternaler Maulbrüter; Brutpflege und Paarverhalten sind dokumentiert","airBreathing":true,"media":[{"sex":"unknown","label":"BlackWaterLeaf-Nutzeraufnahme","imageUrl":"/manus-storage/catalog/taxa/aquarium/900002/bwl-owner_06e2a97c.jpg"}]}',
  imageUrl = '/manus-storage/catalog/taxa/aquarium/900002/bwl-owner_06e2a97c.jpg',
  imageSourceUrl = 'https://blackwaterleaf.com/',
  imageLicense = 'blackwaterleaf-owner-approved',
  imageAttribution = '© BlackWaterLeaf; firmeneigene Nutzeraufnahme; Geschlecht nicht aus dem Bild abgeleitet',
  imageVerifiedAt = '2026-11-01 00:00:00',
  evidenceState = 'confirmed',
  updatedAt = CURRENT_TIMESTAMP,
  status = 'published'
WHERE scientificName = 'Channa andrao' AND status <> 'retired';
