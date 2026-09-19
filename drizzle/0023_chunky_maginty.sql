CREATE TABLE `care_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`taskId` int NOT NULL,
	`eventType` enum('created','completed','snoozed','skipped','reopened') NOT NULL,
	`reason` varchar(160),
	`occurredAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `care_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `care_journal` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`habitatId` int,
	`taskId` int,
	`note` text NOT NULL,
	`observedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `care_journal_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `care_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`habitatId` int,
	`realm` enum('botany','aquarium','terrarium') NOT NULL,
	`title` varchar(160) NOT NULL,
	`timezone` varchar(64) NOT NULL DEFAULT 'Europe/Berlin',
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `care_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `care_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`planId` int NOT NULL,
	`habitatId` int,
	`title` varchar(160) NOT NULL,
	`dueAt` timestamp NOT NULL,
	`status` enum('open','done','snoozed','skipped') NOT NULL DEFAULT 'open',
	`skipReason` varchar(160),
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `care_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `care_events` ADD CONSTRAINT `care_events_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `care_events` ADD CONSTRAINT `care_events_taskId_care_tasks_id_fk` FOREIGN KEY (`taskId`) REFERENCES `care_tasks`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `care_journal` ADD CONSTRAINT `care_journal_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `care_journal` ADD CONSTRAINT `care_journal_habitatId_private_habitats_id_fk` FOREIGN KEY (`habitatId`) REFERENCES `private_habitats`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `care_journal` ADD CONSTRAINT `care_journal_taskId_care_tasks_id_fk` FOREIGN KEY (`taskId`) REFERENCES `care_tasks`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `care_plans` ADD CONSTRAINT `care_plans_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `care_plans` ADD CONSTRAINT `care_plans_habitatId_private_habitats_id_fk` FOREIGN KEY (`habitatId`) REFERENCES `private_habitats`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `care_tasks` ADD CONSTRAINT `care_tasks_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `care_tasks` ADD CONSTRAINT `care_tasks_planId_care_plans_id_fk` FOREIGN KEY (`planId`) REFERENCES `care_plans`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `care_tasks` ADD CONSTRAINT `care_tasks_habitatId_private_habitats_id_fk` FOREIGN KEY (`habitatId`) REFERENCES `private_habitats`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `care_events_user_occurred_idx` ON `care_events` (`userId`,`occurredAt`);--> statement-breakpoint
CREATE INDEX `care_journal_user_observed_idx` ON `care_journal` (`userId`,`observedAt`);--> statement-breakpoint
CREATE INDEX `care_plans_user_active_updated_idx` ON `care_plans` (`userId`,`active`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `care_tasks_user_status_due_idx` ON `care_tasks` (`userId`,`status`,`dueAt`);--> statement-breakpoint
CREATE INDEX `care_tasks_plan_due_idx` ON `care_tasks` (`planId`,`dueAt`);