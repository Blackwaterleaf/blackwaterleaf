ALTER TABLE `observations` ADD `taxonRank` varchar(32);--> statement-breakpoint
ALTER TABLE `observations` ADD `observedAt` timestamp;--> statement-breakpoint
ALTER TABLE `observations` ADD `basisOfRecord` enum('human_observation','machine_observation','material_sample') DEFAULT 'human_observation' NOT NULL;--> statement-breakpoint
ALTER TABLE `observations` ADD `wildStatus` enum('wild','cultivated','captive','unknown') DEFAULT 'unknown' NOT NULL;--> statement-breakpoint
ALTER TABLE `observations` ADD `latitude` decimal(10,7);--> statement-breakpoint
ALTER TABLE `observations` ADD `longitude` decimal(10,7);--> statement-breakpoint
ALTER TABLE `observations` ADD `coordinateUncertaintyM` decimal(12,2);--> statement-breakpoint
ALTER TABLE `observations` ADD `publicLatitude` decimal(10,7);--> statement-breakpoint
ALTER TABLE `observations` ADD `publicLongitude` decimal(10,7);--> statement-breakpoint
ALTER TABLE `observations` ADD `geoprivacy` enum('private','obscured','public','embargoed') DEFAULT 'private' NOT NULL;--> statement-breakpoint
ALTER TABLE `observations` ADD `embargoUntil` timestamp;--> statement-breakpoint
CREATE INDEX `observations_public_geo_idx` ON `observations` (`visibility`,`geoprivacy`,`observedAt`);