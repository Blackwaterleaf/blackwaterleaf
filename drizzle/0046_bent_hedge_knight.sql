CREATE TABLE `observation_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`observationId` int NOT NULL,
	`authorUserId` int NOT NULL,
	`parentId` int,
	`kind` enum('confirm','taxon_suggestion','question','answer') NOT NULL,
	`proposedScientificName` varchar(160),
	`taxonRank` varchar(32),
	`content` varchar(2000),
	`status` enum('visible','hidden','removed') NOT NULL DEFAULT 'visible',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `observation_responses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `notifications` ADD `observationId` int;--> statement-breakpoint
ALTER TABLE `notifications` ADD `observationResponseId` int;--> statement-breakpoint
ALTER TABLE `observation_responses` ADD CONSTRAINT `observation_responses_observationId_observations_id_fk` FOREIGN KEY (`observationId`) REFERENCES `observations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `observation_responses` ADD CONSTRAINT `observation_responses_authorUserId_users_id_fk` FOREIGN KEY (`authorUserId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `observation_responses` ADD CONSTRAINT `observation_responses_parentId_observation_responses_id_fk` FOREIGN KEY (`parentId`) REFERENCES `observation_responses`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `observation_responses_observation_created_idx` ON `observation_responses` (`observationId`,`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `observation_responses_parent_idx` ON `observation_responses` (`parentId`,`createdAt`);--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_observationId_observations_id_fk` FOREIGN KEY (`observationId`) REFERENCES `observations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_observationResponseId_observation_responses_id_fk` FOREIGN KEY (`observationResponseId`) REFERENCES `observation_responses`(`id`) ON DELETE cascade ON UPDATE no action;