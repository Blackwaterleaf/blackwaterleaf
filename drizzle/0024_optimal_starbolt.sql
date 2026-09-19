CREATE TABLE `challenge_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`challengeId` int NOT NULL,
	`userId` int NOT NULL,
	`progress` int NOT NULL DEFAULT 0,
	`status` enum('joined','completed','withdrawn') NOT NULL DEFAULT 'joined',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `challenge_progress_id` PRIMARY KEY(`id`),
	CONSTRAINT `challenge_progress_pair_unique` UNIQUE(`challengeId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `challenges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(180) NOT NULL,
	`description` text NOT NULL,
	`realm` enum('botany','aquarium','terrarium'),
	`ruleText` text NOT NULL,
	`startsAt` timestamp NOT NULL,
	`endsAt` timestamp NOT NULL,
	`rewardPoints` int NOT NULL DEFAULT 0,
	`status` enum('draft','published','closed') NOT NULL DEFAULT 'draft',
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `challenges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `plant_taxa` (
	`id` int AUTO_INCREMENT NOT NULL,
	`source` varchar(96) NOT NULL,
	`sourceVersion` varchar(96) NOT NULL,
	`sourceRecordId` varchar(160) NOT NULL,
	`scientificName` varchar(240) NOT NULL,
	`acceptedScientificName` varchar(240),
	`rank` varchar(48),
	`family` varchar(160),
	`genus` varchar(160),
	`commonNames` json NOT NULL,
	`synonyms` json NOT NULL,
	`summary` text,
	`careProfile` json,
	`imageUrl` varchar(1000),
	`evidenceState` enum('confirmed','contextual','unverified','conflicting','insufficient') NOT NULL DEFAULT 'confirmed',
	`status` enum('draft','published','retired') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `plant_taxa_id` PRIMARY KEY(`id`),
	CONSTRAINT `plant_taxa_source_record_unique` UNIQUE(`source`,`sourceVersion`,`sourceRecordId`)
);
--> statement-breakpoint
CREATE TABLE `saved_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`targetType` enum('post','knowledge','plant_taxon','product','profile') NOT NULL,
	`targetId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `saved_items_id` PRIMARY KEY(`id`),
	CONSTRAINT `saved_items_user_target_unique` UNIQUE(`userId`,`targetType`,`targetId`)
);
--> statement-breakpoint
CREATE TABLE `user_blocks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`blockerId` int NOT NULL,
	`blockedId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_blocks_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_blocks_pair_unique` UNIQUE(`blockerId`,`blockedId`)
);
--> statement-breakpoint
CREATE TABLE `user_follows` (
	`id` int AUTO_INCREMENT NOT NULL,
	`followerId` int NOT NULL,
	`followingId` int NOT NULL,
	`status` enum('active','removed') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_follows_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_follows_pair_unique` UNIQUE(`followerId`,`followingId`)
);
--> statement-breakpoint
ALTER TABLE `challenge_progress` ADD CONSTRAINT `challenge_progress_challengeId_challenges_id_fk` FOREIGN KEY (`challengeId`) REFERENCES `challenges`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `challenge_progress` ADD CONSTRAINT `challenge_progress_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `challenges` ADD CONSTRAINT `challenges_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `saved_items` ADD CONSTRAINT `saved_items_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_blocks` ADD CONSTRAINT `user_blocks_blockerId_users_id_fk` FOREIGN KEY (`blockerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_blocks` ADD CONSTRAINT `user_blocks_blockedId_users_id_fk` FOREIGN KEY (`blockedId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_follows` ADD CONSTRAINT `user_follows_followerId_users_id_fk` FOREIGN KEY (`followerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_follows` ADD CONSTRAINT `user_follows_followingId_users_id_fk` FOREIGN KEY (`followingId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `challenge_progress_user_status_idx` ON `challenge_progress` (`userId`,`status`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `challenges_status_window_idx` ON `challenges` (`status`,`startsAt`,`endsAt`);--> statement-breakpoint
CREATE INDEX `plant_taxa_scientific_name_idx` ON `plant_taxa` (`scientificName`);--> statement-breakpoint
CREATE INDEX `plant_taxa_published_rank_updated_idx` ON `plant_taxa` (`status`,`rank`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `saved_items_user_created_idx` ON `saved_items` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `user_blocks_blocked_idx` ON `user_blocks` (`blockedId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `user_follows_following_status_idx` ON `user_follows` (`followingId`,`status`,`createdAt`);