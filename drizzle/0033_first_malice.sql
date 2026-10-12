ALTER TABLE `live_sessions` ADD `selfHostedIngestKeyHash` varchar(128);--> statement-breakpoint
ALTER TABLE `live_sessions` ADD `selfHostedKeyVersion` int DEFAULT 0 NOT NULL;