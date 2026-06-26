CREATE TABLE `ai_corrections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`kind` varchar(32) NOT NULL,
	`topic` varchar(255),
	`originalAnswer` text,
	`correctedText` text NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'approved',
	`upvotes` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_corrections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `posts` ADD `videoUrl` text;--> statement-breakpoint
ALTER TABLE `posts` ADD `videoStorageKey` text;--> statement-breakpoint
ALTER TABLE `posts` ADD `mediaType` enum('none','image','video') DEFAULT 'none' NOT NULL;