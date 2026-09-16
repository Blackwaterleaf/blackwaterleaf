CREATE TABLE `audit_ledger_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` varchar(64) NOT NULL,
	`actorId` int NOT NULL,
	`action` varchar(64) NOT NULL,
	`targetType` varchar(32) NOT NULL,
	`targetId` int NOT NULL,
	`payloadHash` varchar(64) NOT NULL,
	`previousHash` varchar(64),
	`entryHash` varchar(64) NOT NULL,
	`signature` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_ledger_entries_id` PRIMARY KEY(`id`),
	CONSTRAINT `audit_ledger_event_id_unique` UNIQUE(`eventId`),
	CONSTRAINT `audit_ledger_entry_hash_unique` UNIQUE(`entryHash`)
);
--> statement-breakpoint
CREATE TABLE `audit_ledger_heads` (
	`id` int NOT NULL,
	`lastEntryHash` varchar(64),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `audit_ledger_heads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `audit_ledger_entries` ADD CONSTRAINT `audit_ledger_entries_actorId_users_id_fk` FOREIGN KEY (`actorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `audit_ledger_target_idx` ON `audit_ledger_entries` (`targetType`,`targetId`,`createdAt`);