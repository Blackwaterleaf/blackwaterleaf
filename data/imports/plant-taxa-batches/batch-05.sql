INSERT INTO plant_taxa (source, sourceVersion, sourceRecordId, scientificName, acceptedScientificName, `rank`, family, genus, commonNames, synonyms, summary, careProfile, imageUrl, evidenceState, status) VALUES
('POWO', 'legacy-taxonomy-2024', 'Pogostemon helferi', 'Pogostemon helferi', 'Pogostemon helferi', 'species', 'Lamiaceae', 'Pogostemon', '["Downoi, Kleiner Stern","Downoi, Little Star Plant"]', '["Downoi"]', 'Lebensraum: Thailand, Myanmar
Merkmale: sternförmige Blätter, Vordergrundpflanze, gewellte Blattränder', '{"cultivar":null,"careLevel":"mittel","light":"stark","water":"weiches, saures Wasser","category":"aquatic"}', NULL, 'confirmed', 'published'),
('POWO', 'legacy-taxonomy-2024', 'Hygrophila pinnatifida', 'Hygrophila pinnatifida', 'Hygrophila pinnatifida', 'species', 'Acanthaceae', 'Hygrophila', '["Fiederspaltige Hygrophila","Pinnatifida Hygrophila"]', '[]', 'Lebensraum: Indien
Merkmale: tief eingeschnittene Blätter, braun-rötliche Farbe, auf Steinen/Holz befestigbar', '{"cultivar":null,"careLevel":"mittel","light":"mittel bis stark","water":"variabel","category":"aquatic"}', NULL, 'confirmed', 'published'),
('POWO', 'legacy-taxonomy-2024', 'Bolbitis heudelotii', 'Bolbitis heudelotii', 'Bolbitis heudelotii', 'species', 'Dryopteridaceae', 'Bolbitis', '["Afrikanischer Wasserfarn","African Water Fern"]', '[]', 'Lebensraum: Westafrika
Merkmale: dunkelgrüner Farn, auf Steinen/Holz befestigbar, langsames Wachstum', '{"cultivar":null,"careLevel":"mittel","light":"schwach bis mittel","water":"weiches, saures Wasser","category":"aquatic"}', NULL, 'confirmed', 'published'),
('POWO', 'legacy-taxonomy-2024', 'Vallisneria spiralis', 'Vallisneria spiralis', 'Vallisneria spiralis', 'species', 'Hydrocharitaceae', 'Vallisneria', '["Schraubenvallisnerie","Straight Vallisneria"]', '[]', 'Lebensraum: Europa, Asien, Afrika
Merkmale: lange bandförmige Blätter, Hintergrundpflanze, robust, schnelles Wachstum', '{"cultivar":null,"careLevel":"einfach","light":"mittel bis stark","water":"hartes Wasser","category":"aquatic"}', NULL, 'confirmed', 'published')
ON DUPLICATE KEY UPDATE
  scientificName = VALUES(scientificName),
  acceptedScientificName = VALUES(acceptedScientificName),
  `rank` = VALUES(`rank`),
  family = VALUES(family),
  genus = VALUES(genus),
  commonNames = VALUES(commonNames),
  synonyms = VALUES(synonyms),
  summary = VALUES(summary),
  careProfile = VALUES(careProfile),
  imageUrl = VALUES(imageUrl),
  evidenceState = VALUES(evidenceState),
  status = VALUES(status),
  updatedAt = CURRENT_TIMESTAMP;
