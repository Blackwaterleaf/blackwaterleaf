ALTER TABLE `assistant_usage` ADD `promptTokens` int;--> statement-breakpoint
ALTER TABLE `assistant_usage` ADD `completionTokens` int;--> statement-breakpoint
ALTER TABLE `assistant_usage` ADD `totalTokens` int;--> statement-breakpoint
ALTER TABLE `assistant_usage` ADD `requestOutcome` enum('reserved','completed','failed','timeout','quota_exceeded') DEFAULT 'reserved' NOT NULL;--> statement-breakpoint
ALTER TABLE `assistant_usage` ADD `provider` varchar(64);--> statement-breakpoint
ALTER TABLE `assistant_usage` ADD `tariffVersion` varchar(64);--> statement-breakpoint
ALTER TABLE `assistant_usage` ADD `plantnetEngineVersion` varchar(96);--> statement-breakpoint
ALTER TABLE `assistant_usage` ADD `plantnetRateLimitRemaining` int;--> statement-breakpoint
ALTER TABLE `assistant_usage` ADD `plantnetRateLimitResetAt` timestamp;