ALTER TABLE `observations` ADD `reviewNote` text;--> statement-breakpoint
ALTER TABLE `observations` ADD `reviewedByUserId` int;--> statement-breakpoint
ALTER TABLE `observations` ADD `reviewedAt` timestamp;--> statement-breakpoint
ALTER TABLE `observations` ADD CONSTRAINT `observations_reviewedByUserId_users_id_fk` FOREIGN KEY (`reviewedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;