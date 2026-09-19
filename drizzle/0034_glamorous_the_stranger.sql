CREATE TABLE `live_session_viewers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`userId` int NOT NULL,
	`lastSeenAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `live_session_viewers_id` PRIMARY KEY(`id`),
	CONSTRAINT `live_session_viewers_session_user_unique` UNIQUE(`sessionId`,`userId`)
);
--> statement-breakpoint
ALTER TABLE `live_session_viewers` ADD CONSTRAINT `live_session_viewers_sessionId_live_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `live_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `live_session_viewers` ADD CONSTRAINT `live_session_viewers_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `live_session_viewers_session_seen_idx` ON `live_session_viewers` (`sessionId`,`lastSeenAt`);