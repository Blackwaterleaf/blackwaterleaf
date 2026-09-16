CREATE TABLE `private_habitats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`kind` enum('aquarium','plant','terrarium') NOT NULL,
	`name` varchar(128) NOT NULL,
	`details` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `private_habitats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `private_habitats` ADD CONSTRAINT `private_habitats_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `private_habitats_user_kind_updated_idx` ON `private_habitats` (`userId`,`kind`,`updatedAt`);