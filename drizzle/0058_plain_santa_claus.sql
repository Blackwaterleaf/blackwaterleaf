CREATE TABLE `profile_social_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`platform` enum('instagram','tiktok','youtube','facebook','website') NOT NULL,
	`label` varchar(80) NOT NULL,
	`url` varchar(255) NOT NULL,
	`position` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profile_social_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `profile_social_accounts_user_url_unique` UNIQUE(`userId`,`url`)
);
--> statement-breakpoint
ALTER TABLE `profile_social_accounts` ADD CONSTRAINT `profile_social_accounts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `profile_social_accounts_user_position_idx` ON `profile_social_accounts` (`userId`,`position`);