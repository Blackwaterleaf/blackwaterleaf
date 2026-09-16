CREATE TABLE `local_auth_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`purpose` enum('email_verification','password_reset') NOT NULL,
	`tokenHash` varchar(64) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`usedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `local_auth_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `local_auth_tokens_hash_unique` UNIQUE(`tokenHash`)
);
--> statement-breakpoint
CREATE TABLE `local_credentials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`normalizedEmail` varchar(320) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`emailVerifiedAt` timestamp,
	`passwordChangedAt` timestamp NOT NULL DEFAULT (now()),
	`lastSignedInAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `local_credentials_id` PRIMARY KEY(`id`),
	CONSTRAINT `local_credentials_user_unique` UNIQUE(`userId`),
	CONSTRAINT `local_credentials_normalized_email_unique` UNIQUE(`normalizedEmail`)
);
--> statement-breakpoint
ALTER TABLE `local_auth_tokens` ADD CONSTRAINT `local_auth_tokens_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `local_credentials` ADD CONSTRAINT `local_credentials_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `local_auth_tokens_user_purpose_expires_idx` ON `local_auth_tokens` (`userId`,`purpose`,`expiresAt`);