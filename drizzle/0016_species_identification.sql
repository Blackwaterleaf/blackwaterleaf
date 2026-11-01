-- Add request lifecycle metadata without changing or deleting the existing AI audit journal.
-- Historical rows are classified from their persisted completion length before new
-- calls start using explicit reservations and quota slots.
ALTER TABLE `assistant_usage` ADD `operation` enum('chat','plant_identify','species_identify','aquarium_analyze') NOT NULL DEFAULT 'chat';
--> statement-breakpoint
ALTER TABLE `assistant_usage` ADD `requestStatus` enum('reserved','completed','failed') NOT NULL DEFAULT 'failed';
--> statement-breakpoint
ALTER TABLE `assistant_usage` ADD `quotaDay` varchar(10);
--> statement-breakpoint
ALTER TABLE `assistant_usage` ADD `quotaSlot` int;
--> statement-breakpoint
UPDATE `assistant_usage`
SET `requestStatus` = CASE WHEN `completionChars` > 0 THEN 'completed' ELSE 'failed' END,
    `quotaDay` = DATE_FORMAT(`createdAt`, '%Y-%m-%d');
--> statement-breakpoint
ALTER TABLE `assistant_usage` MODIFY COLUMN `requestStatus` enum('reserved','completed','failed') NOT NULL DEFAULT 'reserved';
--> statement-breakpoint
CREATE UNIQUE INDEX `assistant_usage_user_day_slot_unique` ON `assistant_usage` (`userId`,`quotaDay`,`quotaSlot`);
--> statement-breakpoint
CREATE INDEX `assistant_usage_user_day_status_idx` ON `assistant_usage` (`userId`,`quotaDay`,`requestStatus`);
--> statement-breakpoint
CREATE TABLE `species_identification_feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`usageId` int NOT NULL,
	`userId` int NOT NULL,
	`satisfied` boolean,
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `species_identification_feedback_id` PRIMARY KEY(`id`),
	CONSTRAINT `species_ident_feedback_usage_user_unique` UNIQUE(`usageId`,`userId`)
);
--> statement-breakpoint
ALTER TABLE `species_identification_feedback` ADD CONSTRAINT `species_ident_feedback_usageId_assistant_usage_id_fk` FOREIGN KEY (`usageId`) REFERENCES `assistant_usage`(`id`) ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `species_identification_feedback` ADD CONSTRAINT `species_ident_feedback_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX `species_ident_feedback_user_satisfied_idx` ON `species_identification_feedback` (`userId`,`satisfied`,`updatedAt`);
