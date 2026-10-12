CREATE TABLE `live_session_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`userId` int NOT NULL,
	`content` varchar(2000) NOT NULL,
	`status` enum('visible','hidden','removed') NOT NULL DEFAULT 'visible',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `live_session_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `live_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`hostUserId` int NOT NULL,
	`track` enum('community','expert') NOT NULL,
	`title` varchar(180) NOT NULL,
	`description` text NOT NULL,
	`realm` enum('botany','aquarium','terrarium'),
	`presenterName` varchar(160) NOT NULL,
	`presenterCredential` varchar(160),
	`streamUrl` varchar(1000),
	`status` enum('scheduled','live','ended','cancelled') NOT NULL DEFAULT 'scheduled',
	`startsAt` timestamp NOT NULL,
	`endsAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `live_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `live_session_messages` ADD CONSTRAINT `live_session_messages_sessionId_live_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `live_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `live_session_messages` ADD CONSTRAINT `live_session_messages_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `live_sessions` ADD CONSTRAINT `live_sessions_hostUserId_users_id_fk` FOREIGN KEY (`hostUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `live_session_messages_session_status_created_idx` ON `live_session_messages` (`sessionId`,`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `live_session_messages_user_created_idx` ON `live_session_messages` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `live_sessions_member_feed_idx` ON `live_sessions` (`status`,`track`,`startsAt`);--> statement-breakpoint
CREATE INDEX `live_sessions_host_status_idx` ON `live_sessions` (`hostUserId`,`status`,`updatedAt`);