CREATE TABLE `partner_products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`partnerId` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`description` text,
	`destinationUrl` varchar(500) NOT NULL,
	`priceLabel` varchar(80),
	`status` enum('draft','active','paused','removed') NOT NULL DEFAULT 'draft',
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partner_products_id` PRIMARY KEY(`id`),
	CONSTRAINT `partner_products_partner_destination_unique` UNIQUE(`partnerId`,`destinationUrl`)
);
--> statement-breakpoint
ALTER TABLE `partner_products` ADD CONSTRAINT `partner_products_partnerId_partner_profiles_id_fk` FOREIGN KEY (`partnerId`) REFERENCES `partner_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `partner_products` ADD CONSTRAINT `partner_products_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `partner_products_partner_status_updated_idx` ON `partner_products` (`partnerId`,`status`,`updatedAt`);