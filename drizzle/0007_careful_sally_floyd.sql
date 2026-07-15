CREATE TABLE `ai_hallucination_blacklist` (
	`id` int AUTO_INCREMENT NOT NULL,
	`term` varchar(255) NOT NULL,
	`reason` text,
	`correctAlternative` varchar(255),
	`addedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_hallucination_blacklist_id` PRIMARY KEY(`id`),
	CONSTRAINT `ai_hallucination_blacklist_term_unique` UNIQUE(`term`)
);
--> statement-breakpoint
CREATE TABLE `taxonomy_species` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scientificName` varchar(255) NOT NULL,
	`cultivar` varchar(255),
	`genus` varchar(100) NOT NULL,
	`family` varchar(100),
	`commonNames` json,
	`synonyms` json,
	`keyFeatures` json,
	`habitat` varchar(255),
	`careLevel` enum('einfach','mittel','anspruchsvoll'),
	`light` varchar(100),
	`water` varchar(100),
	`category` enum('alocasia','philodendron','monstera','aquatic','channa','other') NOT NULL DEFAULT 'other',
	`source` varchar(255),
	`sourceId` varchar(255),
	`verified` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `taxonomy_species_id` PRIMARY KEY(`id`),
	CONSTRAINT `taxonomy_species_scientificName_unique` UNIQUE(`scientificName`)
);
