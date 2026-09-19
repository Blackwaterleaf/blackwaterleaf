ALTER TABLE `aquarium_taxa` ADD `sourceRecordUrl` varchar(1000);--> statement-breakpoint
ALTER TABLE `aquarium_taxa` ADD `sourceLicense` varchar(128);--> statement-breakpoint
ALTER TABLE `aquarium_taxa` ADD `sourceCitation` text;--> statement-breakpoint
ALTER TABLE `aquarium_taxa` ADD `sourceRetrievedAt` timestamp;--> statement-breakpoint
ALTER TABLE `aquarium_taxa` ADD `taxonomicStatus` varchar(48);--> statement-breakpoint
ALTER TABLE `aquarium_taxa` ADD `matchConfidence` int;--> statement-breakpoint
ALTER TABLE `plant_taxa` ADD `sourceRecordUrl` varchar(1000);--> statement-breakpoint
ALTER TABLE `plant_taxa` ADD `sourceLicense` varchar(128);--> statement-breakpoint
ALTER TABLE `plant_taxa` ADD `sourceCitation` text;--> statement-breakpoint
ALTER TABLE `plant_taxa` ADD `sourceRetrievedAt` timestamp;--> statement-breakpoint
ALTER TABLE `plant_taxa` ADD `taxonomicStatus` varchar(48);--> statement-breakpoint
ALTER TABLE `plant_taxa` ADD `matchConfidence` int;