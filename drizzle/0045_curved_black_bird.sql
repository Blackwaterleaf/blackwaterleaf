ALTER TABLE `observations` ADD `userStatus` enum('draft','saved','help_requested','question_open','proposal_received','queued_for_review') DEFAULT 'saved' NOT NULL;--> statement-breakpoint
ALTER TABLE `observations` ADD `aiCandidates` json;--> statement-breakpoint
ALTER TABLE `observations` ADD `aiModel` varchar(128);--> statement-breakpoint
ALTER TABLE `observations` ADD `aiCatalogVersion` varchar(128);