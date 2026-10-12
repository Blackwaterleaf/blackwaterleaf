CREATE INDEX `aquarium_taxa_public_status_updated_idx` ON `aquarium_taxa` (`status`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `knowledge_public_realm_updated_idx` ON `knowledge_articles` (`isPublished`,`locale`,`realm`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `plant_taxa_public_status_updated_idx` ON `plant_taxa` (`status`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `terrarium_taxa_public_status_updated_idx` ON `terrarium_taxa` (`status`,`updatedAt`);