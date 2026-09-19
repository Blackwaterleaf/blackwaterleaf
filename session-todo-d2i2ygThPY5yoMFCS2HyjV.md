# BlackWaterLeaf taxonomy expansion tracker

- [x] Audit the active taxonomy module, source policy, record quality and existing plant/fish counts.
- [x] Verify Kew/POWO, GBIF and FishBase as scientific sources and record licences, identifiers and operational constraints.
- [x] Add source-record provenance, source licence, retrieval time, taxonomic status and match-confidence fields with an additive migration.
- [x] Resolve curated plant and freshwater-fish targets through the GBIF official API using an exact accepted-species and minimum-confidence gate.
- [x] Generate idempotent import batches that omit unresolved candidates, pre-existing legacy scientific names and all unverified images.
- [x] Apply reviewed batches and validate final database totals and provenance coverage.
- [x] Complete AI catalogue-retrieval wiring, unit tests and full validation.
- [ ] Save the completed state as a version checkpoint.
