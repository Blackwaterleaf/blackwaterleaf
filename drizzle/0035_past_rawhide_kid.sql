CREATE TABLE `direct_conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`participantOneId` int NOT NULL,
	`participantTwoId` int NOT NULL,
	`lastMessageAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `direct_conversations_id` PRIMARY KEY(`id`),
	CONSTRAINT `direct_conversations_participants_unique` UNIQUE(`participantOneId`,`participantTwoId`)
);
--> statement-breakpoint
CREATE TABLE `direct_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`senderId` int NOT NULL,
	`content` varchar(2000) NOT NULL,
	`status` enum('visible','removed') NOT NULL DEFAULT 'visible',
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `direct_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `notifications` MODIFY COLUMN `type` enum('comment','like','report','moderation','system','message') NOT NULL;--> statement-breakpoint
ALTER TABLE `direct_conversations` ADD CONSTRAINT `direct_conversations_participantOneId_users_id_fk` FOREIGN KEY (`participantOneId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `direct_conversations` ADD CONSTRAINT `direct_conversations_participantTwoId_users_id_fk` FOREIGN KEY (`participantTwoId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `direct_messages` ADD CONSTRAINT `direct_messages_conversationId_direct_conversations_id_fk` FOREIGN KEY (`conversationId`) REFERENCES `direct_conversations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `direct_messages` ADD CONSTRAINT `direct_messages_senderId_users_id_fk` FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `direct_conversations_participant_one_updated_idx` ON `direct_conversations` (`participantOneId`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `direct_conversations_participant_two_updated_idx` ON `direct_conversations` (`participantTwoId`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `direct_messages_conversation_created_idx` ON `direct_messages` (`conversationId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `direct_messages_conversation_read_idx` ON `direct_messages` (`conversationId`,`readAt`);--> statement-breakpoint
CREATE INDEX `direct_messages_sender_created_idx` ON `direct_messages` (`senderId`,`createdAt`);