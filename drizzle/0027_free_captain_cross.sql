ALTER TABLE `aquarium_taxa` ADD `imageSourceUrl` varchar(1000);--> statement-breakpoint
ALTER TABLE `aquarium_taxa` ADD `imageLicense` varchar(128);--> statement-breakpoint
ALTER TABLE `aquarium_taxa` ADD `imageAttribution` text;--> statement-breakpoint
ALTER TABLE `aquarium_taxa` ADD `imageVerifiedAt` timestamp;--> statement-breakpoint
ALTER TABLE `plant_taxa` ADD `imageSourceUrl` varchar(1000);--> statement-breakpoint
ALTER TABLE `plant_taxa` ADD `imageLicense` varchar(128);--> statement-breakpoint
ALTER TABLE `plant_taxa` ADD `imageAttribution` text;--> statement-breakpoint
ALTER TABLE `plant_taxa` ADD `imageVerifiedAt` timestamp;