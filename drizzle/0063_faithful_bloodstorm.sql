CREATE TABLE `promo_code_redemptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`promoCodeId` int NOT NULL,
	`userId` int NOT NULL,
	`premiumDays` int NOT NULL,
	`bonusPoints` int NOT NULL,
	`entitlementExpiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `promo_code_redemptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `promo_code_redemptions_code_user_unique` UNIQUE(`promoCodeId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `promo_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`codeDigest` varchar(64) NOT NULL,
	`codeLabel` varchar(32) NOT NULL,
	`premiumDays` int NOT NULL,
	`bonusPoints` int NOT NULL DEFAULT 0,
	`maxRedemptions` int NOT NULL DEFAULT 1,
	`redemptionCount` int NOT NULL DEFAULT 0,
	`createdByUserId` int NOT NULL,
	`expiresAt` timestamp,
	`revokedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `promo_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `promo_codes_digest_unique` UNIQUE(`codeDigest`)
);
--> statement-breakpoint
ALTER TABLE `xp_events` MODIFY COLUMN `eventType` enum('daily_login','photo_upload','ai_use','donation_support','promo_code') NOT NULL;--> statement-breakpoint
ALTER TABLE `xp_events` MODIFY COLUMN `sourceType` enum('session','media_asset','ai_request','stripe_donation','promo_code') NOT NULL;--> statement-breakpoint
ALTER TABLE `promo_code_redemptions` ADD CONSTRAINT `promo_code_redemptions_promoCodeId_promo_codes_id_fk` FOREIGN KEY (`promoCodeId`) REFERENCES `promo_codes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `promo_code_redemptions` ADD CONSTRAINT `promo_code_redemptions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `promo_codes` ADD CONSTRAINT `promo_codes_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `promo_code_redemptions_user_created_idx` ON `promo_code_redemptions` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `promo_codes_active_idx` ON `promo_codes` (`revokedAt`,`expiresAt`);