CREATE TABLE `ai_credit_purchases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stripeCheckoutSessionId` varchar(128) NOT NULL,
	`packKey` varchar(48) NOT NULL,
	`credits` int NOT NULL,
	`status` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_credit_purchases_id` PRIMARY KEY(`id`),
	CONSTRAINT `ai_credit_purchases_session_unique` UNIQUE(`stripeCheckoutSessionId`)
);
--> statement-breakpoint
CREATE TABLE `ai_credit_wallets` (
	`userId` int NOT NULL,
	`credits` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_credit_wallets_userId` PRIMARY KEY(`userId`)
);
--> statement-breakpoint
CREATE TABLE `ai_global_usage_days` (
	`dayKey` varchar(10) NOT NULL,
	`plantIdentifications` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_global_usage_days_dayKey` PRIMARY KEY(`dayKey`)
);
--> statement-breakpoint
CREATE TABLE `ai_usage_policies` (
	`id` int NOT NULL,
	`freeDailyIdentifications` int NOT NULL DEFAULT 2,
	`proMonthlyIdentifications` int NOT NULL DEFAULT 60,
	`globalDailyIdentifications` int NOT NULL DEFAULT 100,
	`updatedByUserId` int,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_usage_policies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_user_usage_days` (
	`userId` int NOT NULL,
	`dayKey` varchar(10) NOT NULL,
	`freeIdentifications` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_user_usage_days_pk` UNIQUE(`userId`,`dayKey`)
);
--> statement-breakpoint
CREATE TABLE `ai_user_usage_months` (
	`userId` int NOT NULL,
	`monthKey` varchar(7) NOT NULL,
	`proIdentifications` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_user_usage_months_pk` UNIQUE(`userId`,`monthKey`)
);
--> statement-breakpoint
CREATE TABLE `billing_accounts` (
	`userId` int NOT NULL,
	`stripeCustomerId` varchar(128),
	`stripeSubscriptionId` varchar(128),
	`plan` enum('free','pro') NOT NULL DEFAULT 'free',
	`status` enum('inactive','active','past_due','canceled') NOT NULL DEFAULT 'inactive',
	`currentPeriodEnd` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `billing_accounts_userId` PRIMARY KEY(`userId`)
);
--> statement-breakpoint
ALTER TABLE `assistant_usage` ADD `creditSource` enum('free','pro','purchased') DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE `assistant_usage` ADD `creditsConsumed` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `ai_credit_purchases` ADD CONSTRAINT `ai_credit_purchases_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_credit_wallets` ADD CONSTRAINT `ai_credit_wallets_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_usage_policies` ADD CONSTRAINT `ai_usage_policies_updatedByUserId_users_id_fk` FOREIGN KEY (`updatedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_user_usage_days` ADD CONSTRAINT `ai_user_usage_days_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_user_usage_months` ADD CONSTRAINT `ai_user_usage_months_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `billing_accounts` ADD CONSTRAINT `billing_accounts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `ai_credit_purchases_user_created_idx` ON `ai_credit_purchases` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `ai_user_usage_months_user_idx` ON `ai_user_usage_months` (`userId`,`monthKey`);--> statement-breakpoint
INSERT INTO `ai_usage_policies` (`id`, `freeDailyIdentifications`, `proMonthlyIdentifications`, `globalDailyIdentifications`) VALUES (1, 2, 60, 100) ON DUPLICATE KEY UPDATE `id` = `id`;
CREATE INDEX `ai_user_usage_months_user_idx` ON `ai_user_usage_months` (`userId`,`monthKey`);
