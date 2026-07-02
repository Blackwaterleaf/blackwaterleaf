CREATE TABLE `featured_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`tagline` varchar(160),
	`platform` enum('instagram','tiktok','facebook','whatsapp','youtube','website') NOT NULL,
	`url` text NOT NULL,
	`imageUrl` text,
	`imageKey` text,
	`showOnHome` boolean NOT NULL DEFAULT false,
	`showInCommunity` boolean NOT NULL DEFAULT true,
	`active` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`isPaid` boolean NOT NULL DEFAULT false,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `featured_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `socialInstagram` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `socialTiktok` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `socialYoutube` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `socialFacebook` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `socialWebsite` varchar(255);