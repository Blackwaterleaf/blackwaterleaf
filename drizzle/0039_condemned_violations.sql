CREATE TABLE `terrarium_taxa` (
	`id` int AUTO_INCREMENT NOT NULL,
	`source` varchar(96) NOT NULL,
	`sourceVersion` varchar(96) NOT NULL,
	`sourceRecordId` varchar(160) NOT NULL,
	`sourceRecordUrl` varchar(1000),
	`sourceLicense` varchar(128),
	`sourceCitation` text,
	`sourceRetrievedAt` timestamp,
	`taxonomicStatus` varchar(48),
	`matchConfidence` int,
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
	`imageSourceUrl` varchar(1000),
	`imageLicense` varchar(128),
	`imageAttribution` text,
	`imageVerifiedAt` timestamp,
	`evidenceState` enum('confirmed','contextual','unverified','conflicting','insufficient') NOT NULL DEFAULT 'confirmed',
	`status` enum('draft','published','retired') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `terrarium_taxa_id` PRIMARY KEY(`id`),
	CONSTRAINT `terrarium_taxa_source_record_unique` UNIQUE(`source`,`sourceVersion`,`sourceRecordId`)
);
--> statement-breakpoint
CREATE INDEX `terrarium_taxa_scientific_name_idx` ON `terrarium_taxa` (`scientificName`);--> statement-breakpoint
CREATE INDEX `terrarium_taxa_genus_family_idx` ON `terrarium_taxa` (`status`,`genus`,`family`);--> statement-breakpoint
CREATE INDEX `terrarium_taxa_published_rank_updated_idx` ON `terrarium_taxa` (`status`,`rank`,`updatedAt`);