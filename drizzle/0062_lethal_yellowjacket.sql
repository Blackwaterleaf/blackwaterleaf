CREATE TABLE `assistant_result_cache` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fingerprint` varchar(64) NOT NULL,
	`model` varchar(96) NOT NULL,
	`identification` json NOT NULL,
	`plantnetValidation` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	CONSTRAINT `assistant_result_cache_id` PRIMARY KEY(`id`),
	CONSTRAINT `assistant_result_cache_fingerprint_unique` UNIQUE(`fingerprint`)
);
--> statement-breakpoint
CREATE INDEX `assistant_result_cache_expiry_idx` ON `assistant_result_cache` (`expiresAt`);