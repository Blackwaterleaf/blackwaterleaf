CREATE TABLE `user_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionHash` varchar(64) NOT NULL,
	`provider` enum('manus','local') NOT NULL,
	`deviceId` varchar(128),
	`userAgent` varchar(512),
	`issuedAt` timestamp,
	`expiresAt` timestamp NOT NULL,
	`lastSeenAt` timestamp NOT NULL DEFAULT (now()),
	`revokedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_sessions_hash_unique` UNIQUE(`sessionHash`)
);
--> statement-breakpoint
ALTER TABLE `user_sessions` ADD CONSTRAINT `user_sessions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `user_sessions_user_active_idx` ON `user_sessions` (`userId`,`revokedAt`,`expiresAt`);