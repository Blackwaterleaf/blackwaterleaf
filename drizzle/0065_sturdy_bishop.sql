CREATE TABLE `assistant_result_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionHash` varchar(64) NOT NULL,
	`subject` enum('plant','fish') NOT NULL,
	`payload` json NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assistant_result_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `assistant_result_sessions_hash_unique` UNIQUE(`sessionHash`)
);
--> statement-breakpoint
ALTER TABLE `assistant_result_sessions` ADD CONSTRAINT `assistant_result_sessions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `assistant_result_sessions_user_created_idx` ON `assistant_result_sessions` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `assistant_result_sessions_expiry_idx` ON `assistant_result_sessions` (`expiresAt`);