CREATE TABLE `community_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reporterId` int NOT NULL,
	`postId` int,
	`commentId` int,
	`reason` enum('sexual_content','harassment','misinformation','copyright','other') NOT NULL,
	`note` varchar(1000),
	`status` enum('pending','reviewed','dismissed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `community_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `notifications` MODIFY COLUMN `type` enum('comment','like','report','moderation','system') NOT NULL;--> statement-breakpoint
ALTER TABLE `community_reports` ADD CONSTRAINT `community_reports_reporterId_users_id_fk` FOREIGN KEY (`reporterId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `community_reports` ADD CONSTRAINT `community_reports_postId_community_posts_id_fk` FOREIGN KEY (`postId`) REFERENCES `community_posts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `community_reports` ADD CONSTRAINT `community_reports_commentId_post_comments_id_fk` FOREIGN KEY (`commentId`) REFERENCES `post_comments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `community_reports_status_created_idx` ON `community_reports` (`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `community_reports_reporter_created_idx` ON `community_reports` (`reporterId`,`createdAt`);