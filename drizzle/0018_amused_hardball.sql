CREATE TABLE `ai_identification_corrections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`assistant_usage_id` int,
	`original_answer` text NOT NULL,
	`corrected_name` varchar(255) NOT NULL,
	`correction_note` text,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`reviewed_by_user_id` int,
	`reviewed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_identification_corrections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `ai_identification_corrections` ADD CONSTRAINT `ai_identification_corrections_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_identification_corrections` ADD CONSTRAINT `ai_identification_corrections_assistant_usage_id_assistant_usage_id_fk` FOREIGN KEY (`assistant_usage_id`) REFERENCES `assistant_usage`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_identification_corrections` ADD CONSTRAINT `ai_identification_corrections_reviewed_by_user_id_users_id_fk` FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `ai_corrections_user_created_idx` ON `ai_identification_corrections` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `ai_corrections_status_created_idx` ON `ai_identification_corrections` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `ai_corrections_usage_idx` ON `ai_identification_corrections` (`assistant_usage_id`);