CREATE TABLE `partner_authorizations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` varchar(64) NOT NULL,
	`partnerId` int NOT NULL,
	`authorizationVersion` varchar(32) NOT NULL,
	`state` enum('granted','revoked') NOT NULL,
	`confirmedByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `partner_authorizations_id` PRIMARY KEY(`id`),
	CONSTRAINT `partner_authorizations_event_id_unique` UNIQUE(`eventId`)
);
--> statement-breakpoint
ALTER TABLE `partner_authorizations` ADD CONSTRAINT `partner_authorizations_partnerId_partner_profiles_id_fk` FOREIGN KEY (`partnerId`) REFERENCES `partner_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `partner_authorizations` ADD CONSTRAINT `partner_authorizations_confirmedByUserId_users_id_fk` FOREIGN KEY (`confirmedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `partner_authorizations_partner_created_idx` ON `partner_authorizations` (`partnerId`,`createdAt`);