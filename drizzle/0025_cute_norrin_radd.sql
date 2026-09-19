CREATE TABLE `aquarium_taxa` (
	`id` int AUTO_INCREMENT NOT NULL,
	`source` varchar(96) NOT NULL,
	`sourceVersion` varchar(96) NOT NULL,
	`sourceRecordId` varchar(160) NOT NULL,
	`scientificName` varchar(240) NOT NULL,
	`acceptedScientificName` varchar(240),
	`rank` varchar(48),
	`family` varchar(160),
	`genus` varchar(160),
	`commonNames` json NOT NULL,
	`synonyms` json NOT NULL,
	`summary` text,
	`careProfile` json,
	`imageUrl` varchar(1000),
	`evidenceState` enum('confirmed','contextual','unverified','conflicting','insufficient') NOT NULL DEFAULT 'confirmed',
	`status` enum('draft','published','retired') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aquarium_taxa_id` PRIMARY KEY(`id`),
	CONSTRAINT `aquarium_taxa_source_record_unique` UNIQUE(`source`,`sourceVersion`,`sourceRecordId`)
);
--> statement-breakpoint
ALTER TABLE `saved_items` MODIFY COLUMN `targetType` enum('post','knowledge','plant_taxon','aquarium_taxon','product','profile') NOT NULL;--> statement-breakpoint
CREATE INDEX `aquarium_taxa_scientific_name_idx` ON `aquarium_taxa` (`scientificName`);--> statement-breakpoint
CREATE INDEX `aquarium_taxa_published_rank_updated_idx` ON `aquarium_taxa` (`status`,`rank`,`updatedAt`);