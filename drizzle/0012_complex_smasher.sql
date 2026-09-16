CREATE TABLE `smart_device_measurements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`habitatId` int NOT NULL,
	`deviceConnectionId` int,
	`metric` enum('temperatureC','ph','gh','kh','nitriteMgL','nitrateMgL','conductivityUs') NOT NULL,
	`valueDecimal` decimal(12,4) NOT NULL,
	`unit` varchar(32) NOT NULL,
	`source` enum('manual','smart_device') NOT NULL,
	`quality` enum('reported','estimated','rejected') NOT NULL DEFAULT 'reported',
	`observedAt` timestamp NOT NULL,
	`receivedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `smart_device_measurements_id` PRIMARY KEY(`id`),
	CONSTRAINT `smart_device_measurements_device_metric_observed_unique` UNIQUE(`deviceConnectionId`,`metric`,`observedAt`)
);
--> statement-breakpoint
CREATE TABLE `user_consent_current` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`purpose` enum('terms','privacy','profile_publication','observation_publishing','media_processing','community_publishing','location_processing','ai_processing') NOT NULL,
	`policyVersion` varchar(32) NOT NULL,
	`granted` boolean NOT NULL DEFAULT false,
	`grantedAt` timestamp,
	`revokedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_consent_current_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_consent_current_user_purpose_unique` UNIQUE(`userId`,`purpose`)
);
--> statement-breakpoint
CREATE TABLE `user_consent_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`purpose` enum('terms','privacy','profile_publication','observation_publishing','media_processing','community_publishing','location_processing','ai_processing') NOT NULL,
	`policyVersion` varchar(32) NOT NULL,
	`granted` boolean NOT NULL,
	`eventType` enum('baseline','member_update') NOT NULL,
	`occurredAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_consent_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
-- Adopt the most recently changed legacy policy row per user and purpose as the enforceable current state.
INSERT INTO `user_consent_current` (`userId`, `purpose`, `policyVersion`, `granted`, `grantedAt`, `revokedAt`, `createdAt`, `updatedAt`)
SELECT legacy.`userId`, legacy.`purpose`, legacy.`policyVersion`, legacy.`granted`, legacy.`grantedAt`, legacy.`revokedAt`, legacy.`createdAt`, legacy.`updatedAt`
FROM `user_consents` AS legacy
LEFT JOIN `user_consents` AS newer
  ON newer.`userId` = legacy.`userId`
  AND newer.`purpose` = legacy.`purpose`
  AND (newer.`updatedAt` > legacy.`updatedAt` OR (newer.`updatedAt` = legacy.`updatedAt` AND newer.`id` > legacy.`id`))
WHERE newer.`id` IS NULL;
--> statement-breakpoint
-- Preserve each pre-existing versioned choice as a baseline history event without rewriting legacy rows.
INSERT INTO `user_consent_events` (`userId`, `purpose`, `policyVersion`, `granted`, `eventType`, `occurredAt`)
SELECT `userId`, `purpose`, `policyVersion`, `granted`, 'baseline', `updatedAt`
FROM `user_consents`;
--> statement-breakpoint
ALTER TABLE `smart_device_measurements` ADD CONSTRAINT `smart_device_measurements_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `smart_device_measurements` ADD CONSTRAINT `smart_device_measurements_habitatId_private_habitats_id_fk` FOREIGN KEY (`habitatId`) REFERENCES `private_habitats`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `smart_device_measurements` ADD CONSTRAINT `smart_meas_device_fk` FOREIGN KEY (`deviceConnectionId`) REFERENCES `smart_device_connections`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_consent_current` ADD CONSTRAINT `user_consent_current_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_consent_events` ADD CONSTRAINT `user_consent_events_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `smart_device_measurements_habitat_metric_observed_idx` ON `smart_device_measurements` (`habitatId`,`metric`,`observedAt`);--> statement-breakpoint
CREATE INDEX `smart_device_measurements_user_observed_idx` ON `smart_device_measurements` (`userId`,`observedAt`);--> statement-breakpoint
CREATE INDEX `user_consent_current_authorization_idx` ON `user_consent_current` (`userId`,`purpose`,`granted`);--> statement-breakpoint
CREATE INDEX `user_consent_events_user_purpose_occurred_idx` ON `user_consent_events` (`userId`,`purpose`,`occurredAt`);--> statement-breakpoint
ALTER TABLE `post_comments` ADD CONSTRAINT `post_comments_parentId_post_comments_id_fk` FOREIGN KEY (`parentId`) REFERENCES `post_comments`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `community_posts_user_updated_idx` ON `community_posts` (`userId`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `media_assets_post_user_visibility_idx` ON `media_assets` (`postId`,`userId`,`visibility`);--> statement-breakpoint
CREATE INDEX `media_assets_observation_user_created_idx` ON `media_assets` (`observationId`,`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `observations_user_updated_idx` ON `observations` (`userId`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `post_comments_parent_idx` ON `post_comments` (`postId`,`parentId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `private_habitats_user_updated_idx` ON `private_habitats` (`userId`,`updatedAt`);
