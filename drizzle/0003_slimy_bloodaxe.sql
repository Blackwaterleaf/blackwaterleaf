-- The legacy xp_events journal already exists in staging and is represented in
-- drizzle/schema.ts. This migration intentionally adds only the missing AI audit table.
CREATE TABLE IF NOT EXISTS `assistant_usage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`clientRequestId` varchar(96) NOT NULL,
	`realm` enum('botany','aquarium','terrarium'),
	`model` varchar(96) NOT NULL,
	`promptChars` int NOT NULL,
	`completionChars` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assistant_usage_id` PRIMARY KEY(`id`),
	CONSTRAINT `assistant_usage_user_request_unique` UNIQUE(`userId`,`clientRequestId`),
	CONSTRAINT `assistant_usage_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX `assistant_usage_user_created_idx` ON `assistant_usage` (`userId`,`createdAt`);
