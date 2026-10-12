CREATE TABLE `partner_inquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contactEmail` varchar(320) NOT NULL,
	`message` text NOT NULL,
	`status` enum('received','reviewing','accepted','declined') NOT NULL DEFAULT 'received',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partner_inquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `notifications` MODIFY COLUMN `type` enum('comment','like','report','moderation','feedback','partner_inquiry','system','message') NOT NULL;--> statement-breakpoint
ALTER TABLE `partner_inquiries` ADD CONSTRAINT `partner_inquiries_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `partner_inquiries_user_created_idx` ON `partner_inquiries` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `partner_inquiries_status_created_idx` ON `partner_inquiries` (`status`,`createdAt`);