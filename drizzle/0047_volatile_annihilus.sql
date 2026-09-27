CREATE TABLE `feedback_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`kind` enum('feedback','problem','wish') NOT NULL,
	`message` text NOT NULL,
	`page` varchar(255),
	`status` enum('received','reviewing','resolved') NOT NULL DEFAULT 'received',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `feedback_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`community` boolean NOT NULL DEFAULT true,
	`messages` boolean NOT NULL DEFAULT true,
	`moderation` boolean NOT NULL DEFAULT true,
	`system` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `notification_preferences_user_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `feedback_entries` ADD CONSTRAINT `feedback_entries_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notification_preferences` ADD CONSTRAINT `notification_preferences_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `feedback_entries_user_created_idx` ON `feedback_entries` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `feedback_entries_status_created_idx` ON `feedback_entries` (`status`,`createdAt`);