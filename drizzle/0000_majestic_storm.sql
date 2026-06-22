CREATE TABLE `ai_chats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`contextType` enum('general','plant','aquarium'),
	`contextId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_chats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aquarium_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`aquariumId` int NOT NULL,
	`userId` int NOT NULL,
	`type` enum('water_change','feeding','fertilizing','maintenance','measurement','new_inhabitant','health_issue','other') NOT NULL,
	`title` varchar(128) NOT NULL,
	`description` text,
	`data` json,
	`occurredAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aquarium_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aquarium_photos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`aquariumId` int NOT NULL,
	`userId` int NOT NULL,
	`imageUrl` text NOT NULL,
	`storageKey` text NOT NULL,
	`caption` text,
	`takenAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aquarium_photos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aquariums` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(128) NOT NULL,
	`description` text,
	`coverImageUrl` text,
	`type` enum('freshwater','saltwater','blackwater','planted','biotope','other') NOT NULL DEFAULT 'freshwater',
	`volumeLiters` float,
	`lengthCm` float,
	`widthCm` float,
	`heightCm` float,
	`phValue` float,
	`ghValue` float,
	`khValue` float,
	`temperatureCelsius` float,
	`conductivity` float,
	`nitrate` float,
	`nitrite` float,
	`ammonia` float,
	`filterType` varchar(128),
	`lightingType` varchar(128),
	`substrate` varchar(128),
	`inhabitants` text,
	`plants` text,
	`setupDate` timestamp,
	`isPublic` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aquariums_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`postId` int NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `likes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`postId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `likes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('like','comment','follow','care_reminder','system') NOT NULL,
	`title` varchar(128) NOT NULL,
	`message` text NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`relatedPostId` int,
	`relatedUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `plant_photos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`plantId` int NOT NULL,
	`userId` int NOT NULL,
	`imageUrl` text NOT NULL,
	`storageKey` text NOT NULL,
	`caption` text,
	`takenAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `plant_photos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `plants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(128) NOT NULL,
	`scientificName` varchar(128),
	`category` enum('aquatic','tropical','alocasia','monstera','philodendron','other') NOT NULL DEFAULT 'other',
	`description` text,
	`coverImageUrl` text,
	`lightRequirement` enum('low','medium','high'),
	`wateringFrequency` varchar(64),
	`humidity` enum('low','medium','high'),
	`temperature` varchar(64),
	`substrate` varchar(128),
	`fertilizing` varchar(128),
	`difficulty` enum('beginner','intermediate','expert'),
	`isPublic` boolean NOT NULL DEFAULT true,
	`acquiredAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `plants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`imageUrl` text,
	`storageKey` text,
	`category` enum('plant','aquarium','question','tip','showcase','other') NOT NULL DEFAULT 'other',
	`plantId` int,
	`aquariumId` int,
	`likesCount` int NOT NULL DEFAULT 0,
	`commentsCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`avatarUrl` text,
	`bio` text,
	`location` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
