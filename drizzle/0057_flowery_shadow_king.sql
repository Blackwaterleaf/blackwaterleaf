CREATE TABLE `donations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`stripeCheckoutSessionId` varchar(128) NOT NULL,
	`amountCents` int NOT NULL,
	`anonymous` boolean NOT NULL DEFAULT false,
	`displayName` varchar(160),
	`status` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `donations_id` PRIMARY KEY(`id`),
	CONSTRAINT `donations_session_unique` UNIQUE(`stripeCheckoutSessionId`)
);
--> statement-breakpoint
ALTER TABLE `xp_events` MODIFY COLUMN `eventType` enum('daily_login','photo_upload','ai_use','donation_support') NOT NULL;--> statement-breakpoint
ALTER TABLE `xp_events` MODIFY COLUMN `sourceType` enum('session','media_asset','ai_request','stripe_donation') NOT NULL;--> statement-breakpoint
ALTER TABLE `donations` ADD CONSTRAINT `donations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `donations_public_completed_idx` ON `donations` (`status`,`anonymous`,`completedAt`);--> statement-breakpoint
CREATE INDEX `donations_user_created_idx` ON `donations` (`userId`,`createdAt`);