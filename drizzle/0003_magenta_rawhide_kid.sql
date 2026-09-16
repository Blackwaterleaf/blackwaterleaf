CREATE TABLE `assistant_usage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`clientRequestId` varchar(96) NOT NULL,
	`realm` enum('botany','aquarium','terrarium'),
	`model` varchar(96) NOT NULL,
	`promptChars` int NOT NULL,
	`completionChars` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assistant_usage_id` PRIMARY KEY(`id`),
	CONSTRAINT `assistant_usage_user_request_unique` UNIQUE(`userId`,`clientRequestId`)
);
--> statement-breakpoint
CREATE TABLE `xp_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`eventType` enum('daily_check_in','observation_photo','assistant_response') NOT NULL,
	`eventKey` varchar(160) NOT NULL,
	`amount` int NOT NULL,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `xp_events_id` PRIMARY KEY(`id`),
	CONSTRAINT `xp_events_user_event_key_unique` UNIQUE(`userId`,`eventKey`)
);
--> statement-breakpoint
ALTER TABLE `assistant_usage` ADD CONSTRAINT `assistant_usage_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `xp_events` ADD CONSTRAINT `xp_events_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `assistant_usage_user_created_idx` ON `assistant_usage` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `xp_events_user_type_created_idx` ON `xp_events` (`userId`,`eventType`,`createdAt`);