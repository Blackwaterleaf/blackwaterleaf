CREATE TABLE `community_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`realm` enum('botany','aquarium','terrarium'),
	`visibility` enum('private','unlisted','public') NOT NULL DEFAULT 'private',
	`status` enum('draft','published','hidden','removed') NOT NULL DEFAULT 'draft',
	`likesCount` int NOT NULL DEFAULT 0,
	`commentsCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `community_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `knowledge_articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(160) NOT NULL,
	`locale` enum('de','en') NOT NULL,
	`title` varchar(200) NOT NULL,
	`excerpt` varchar(500) NOT NULL,
	`content` text NOT NULL,
	`realm` enum('botany','aquarium','terrarium'),
	`evidenceState` enum('confirmed','contextual','unverified','conflicting','insufficient') NOT NULL,
	`sources` json NOT NULL,
	`isPublished` boolean NOT NULL DEFAULT false,
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `knowledge_articles_id` PRIMARY KEY(`id`),
	CONSTRAINT `knowledge_slug_locale_unique` UNIQUE(`slug`,`locale`)
);
--> statement-breakpoint
CREATE TABLE `media_assets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`observationId` int,
	`postId` int,
	`kind` enum('avatar','observation_image','post_image') NOT NULL,
	`mimeType` enum('image/jpeg','image/png','image/webp') NOT NULL,
	`byteSize` int NOT NULL,
	`width` int,
	`height` int,
	`accessUrl` text NOT NULL,
	`storageKey` varchar(512) NOT NULL,
	`visibility` enum('private','unlisted','public') NOT NULL DEFAULT 'private',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `media_assets_id` PRIMARY KEY(`id`),
	CONSTRAINT `media_assets_storage_key_unique` UNIQUE(`storageKey`)
);
--> statement-breakpoint
CREATE TABLE `moderation_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actorId` int NOT NULL,
	`action` varchar(64) NOT NULL,
	`targetType` varchar(32) NOT NULL,
	`targetId` int NOT NULL,
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `moderation_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `observations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` varchar(128) NOT NULL,
	`userId` int NOT NULL,
	`realm` enum('botany','aquarium','terrarium') NOT NULL,
	`subject` varchar(128),
	`scientificName` varchar(160),
	`note` text,
	`metrics` json NOT NULL,
	`evidenceState` enum('confirmed','contextual','unverified','conflicting','insufficient') NOT NULL DEFAULT 'unverified',
	`visibility` enum('private','unlisted','public') NOT NULL DEFAULT 'private',
	`syncState` enum('local_only','queued_for_review','synced','sync_failed','conflict') NOT NULL DEFAULT 'synced',
	`revision` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `observations_id` PRIMARY KEY(`id`),
	CONSTRAINT `observations_user_client_unique` UNIQUE(`userId`,`clientId`)
);
--> statement-breakpoint
CREATE TABLE `post_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`userId` int NOT NULL,
	`parentId` int,
	`content` text NOT NULL,
	`status` enum('visible','hidden','removed') NOT NULL DEFAULT 'visible',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `post_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `post_likes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`postId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `post_likes_id` PRIMARY KEY(`id`),
	CONSTRAINT `post_likes_user_post_unique` UNIQUE(`userId`,`postId`)
);
--> statement-breakpoint
CREATE TABLE `user_consents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`purpose` enum('terms','privacy','profile_publication','media_processing','community_publishing','location_processing','ai_processing') NOT NULL,
	`policyVersion` varchar(32) NOT NULL,
	`granted` boolean NOT NULL DEFAULT false,
	`grantedAt` timestamp,
	`revokedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_consents_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_consents_user_purpose_version_unique` UNIQUE(`userId`,`purpose`,`policyVersion`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','moderator','admin') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `username` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `status` enum('active','suspended','banned') DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `locale` enum('de','en') DEFAULT 'de' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `unitSystem` enum('metric','imperial') DEFAULT 'metric' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `profileVisibility` enum('private','unlisted','public') DEFAULT 'private' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `avatarUrl` text;--> statement-breakpoint
ALTER TABLE `users` ADD `avatarStorageKey` text;--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;--> statement-breakpoint
ALTER TABLE `users` ADD `location` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `socialInstagram` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `socialTiktok` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `socialYoutube` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `socialFacebook` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `socialWebsite` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_username_unique` UNIQUE(`username`);--> statement-breakpoint
ALTER TABLE `community_posts` ADD CONSTRAINT `community_posts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media_assets` ADD CONSTRAINT `media_assets_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media_assets` ADD CONSTRAINT `media_assets_observationId_observations_id_fk` FOREIGN KEY (`observationId`) REFERENCES `observations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media_assets` ADD CONSTRAINT `media_assets_postId_community_posts_id_fk` FOREIGN KEY (`postId`) REFERENCES `community_posts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `moderation_logs` ADD CONSTRAINT `moderation_logs_actorId_users_id_fk` FOREIGN KEY (`actorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `observations` ADD CONSTRAINT `observations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `post_comments` ADD CONSTRAINT `post_comments_postId_community_posts_id_fk` FOREIGN KEY (`postId`) REFERENCES `community_posts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `post_comments` ADD CONSTRAINT `post_comments_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `post_likes` ADD CONSTRAINT `post_likes_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `post_likes` ADD CONSTRAINT `post_likes_postId_community_posts_id_fk` FOREIGN KEY (`postId`) REFERENCES `community_posts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_consents` ADD CONSTRAINT `user_consents_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `community_posts_feed_idx` ON `community_posts` (`status`,`visibility`,`createdAt`);--> statement-breakpoint
CREATE INDEX `knowledge_public_locale_idx` ON `knowledge_articles` (`isPublished`,`locale`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `media_assets_owner_idx` ON `media_assets` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `moderation_logs_target_idx` ON `moderation_logs` (`targetType`,`targetId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `observations_owner_realm_updated_idx` ON `observations` (`userId`,`realm`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `observations_visibility_updated_idx` ON `observations` (`visibility`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `post_comments_post_status_idx` ON `post_comments` (`postId`,`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `users_status_idx` ON `users` (`status`);