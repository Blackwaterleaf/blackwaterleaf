CREATE TABLE `account_entitlements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`featureKey` varchar(64) NOT NULL,
	`status` enum('active','revoked') NOT NULL DEFAULT 'active',
	`grantedByUserId` int NOT NULL,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `account_entitlements_id` PRIMARY KEY(`id`),
	CONSTRAINT `account_entitlements_user_feature_unique` UNIQUE(`userId`,`featureKey`)
);
--> statement-breakpoint
ALTER TABLE `account_entitlements` ADD CONSTRAINT `account_entitlements_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `account_entitlements` ADD CONSTRAINT `account_entitlements_grantedByUserId_users_id_fk` FOREIGN KEY (`grantedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `account_entitlements_user_status_idx` ON `account_entitlements` (`userId`,`status`);