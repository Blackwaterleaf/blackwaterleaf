CREATE TABLE `comment_likes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`commentId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `comment_likes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversation_participants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`userId` int NOT NULL,
	`lastReadAt` timestamp,
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conversation_participants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`kind` enum('direct','group') NOT NULL DEFAULT 'direct',
	`title` varchar(128),
	`createdBy` int NOT NULL,
	`lastMessageAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `follows` (
	`id` int AUTO_INCREMENT NOT NULL,
	`followerId` int NOT NULL,
	`followingId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `follows_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `group_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`groupId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('member','moderator','owner') NOT NULL DEFAULT 'member',
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `group_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `groups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(96) NOT NULL,
	`name` varchar(128) NOT NULL,
	`description` text,
	`coverImageUrl` text,
	`topic` enum('plants','aquaristics','terraristics','general') NOT NULL DEFAULT 'general',
	`visibility` enum('public','private') NOT NULL DEFAULT 'public',
	`createdBy` int NOT NULL,
	`membersCount` int NOT NULL DEFAULT 0,
	`postsCount` int NOT NULL DEFAULT 0,
	`isOfficial` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `groups_id` PRIMARY KEY(`id`),
	CONSTRAINT `groups_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`senderId` int NOT NULL,
	`content` text NOT NULL,
	`imageUrl` text,
	`storageKey` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
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
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reporterId` int NOT NULL,
	`targetType` enum('post','comment','user','message','group') NOT NULL,
	`targetId` int NOT NULL,
	`reason` enum('spam','harassment','misinformation','inappropriate','illegal','other') NOT NULL,
	`details` text,
	`status` enum('open','reviewing','resolved','dismissed') NOT NULL DEFAULT 'open',
	`handledBy` int,
	`resolutionNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `notifications` MODIFY COLUMN `type` enum('like','comment','reply','follow','mention','message','group_invite','group_post','moderation','care_reminder','system') NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','moderator','admin') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `comments` ADD `parentId` int;--> statement-breakpoint
ALTER TABLE `comments` ADD `likesCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `comments` ADD `repliesCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `notifications` ADD `relatedCommentId` int;--> statement-breakpoint
ALTER TABLE `notifications` ADD `relatedGroupId` int;--> statement-breakpoint
ALTER TABLE `notifications` ADD `relatedConversationId` int;--> statement-breakpoint
ALTER TABLE `posts` ADD `groupId` int;--> statement-breakpoint
ALTER TABLE `users` ADD `username` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `status` enum('active','suspended','banned') DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `plan` enum('free','premium','pro') DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `experienceLevel` enum('beginner','intermediate','expert');--> statement-breakpoint
ALTER TABLE `users` ADD `interests` json;--> statement-breakpoint
ALTER TABLE `users` ADD `followersCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `followingCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_username_unique` UNIQUE(`username`);