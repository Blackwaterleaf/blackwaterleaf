CREATE TABLE `partner_placements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`partnerId` int NOT NULL,
	`placement` enum('home') NOT NULL DEFAULT 'home',
	`status` enum('draft','active','paused','expired','removed') NOT NULL DEFAULT 'draft',
	`startsAt` timestamp,
	`endsAt` timestamp,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partner_placements_id` PRIMARY KEY(`id`),
	CONSTRAINT `partner_placements_partner_placement_unique` UNIQUE(`partnerId`,`placement`)
);
--> statement-breakpoint
CREATE TABLE `partner_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`displayName` varchar(160) NOT NULL,
	`partyType` enum('person','company') NOT NULL,
	`destinationUrl` varchar(500),
	`disclosureLabel` varchar(80) NOT NULL DEFAULT 'Werbung',
	`authorizationConfirmedAt` timestamp,
	`status` enum('draft','approved','paused','removed') NOT NULL DEFAULT 'draft',
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partner_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `partner_placements` ADD CONSTRAINT `partner_placements_partnerId_partner_profiles_id_fk` FOREIGN KEY (`partnerId`) REFERENCES `partner_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `partner_placements` ADD CONSTRAINT `partner_placements_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `partner_profiles` ADD CONSTRAINT `partner_profiles_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `partner_placements_public_idx` ON `partner_placements` (`placement`,`status`,`startsAt`,`endsAt`);--> statement-breakpoint
CREATE INDEX `partner_profiles_status_idx` ON `partner_profiles` (`status`,`updatedAt`);