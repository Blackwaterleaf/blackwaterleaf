CREATE TABLE `external_auth_identities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`provider` enum('google') NOT NULL,
	`issuer` varchar(255) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`normalizedEmail` varchar(320) NOT NULL,
	`emailVerified` boolean NOT NULL DEFAULT false,
	`lastSignedInAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `external_auth_identities_id` PRIMARY KEY(`id`),
	CONSTRAINT `external_auth_identities_provider_issuer_subject_unique` UNIQUE(`provider`,`issuer`,`subject`),
	CONSTRAINT `external_auth_identities_user_provider_unique` UNIQUE(`userId`,`provider`)
);
--> statement-breakpoint
ALTER TABLE `user_sessions` MODIFY COLUMN `provider` enum('manus','local','google') NOT NULL;--> statement-breakpoint
ALTER TABLE `external_auth_identities` ADD CONSTRAINT `external_auth_identities_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `external_auth_identities_email_idx` ON `external_auth_identities` (`normalizedEmail`);