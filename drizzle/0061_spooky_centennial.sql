ALTER TABLE `assistant_usage` ADD `estimatedInputCostUsd` decimal(16,8);--> statement-breakpoint
ALTER TABLE `assistant_usage` ADD `estimatedOutputCostUsd` decimal(16,8);--> statement-breakpoint
ALTER TABLE `assistant_usage` ADD `estimatedTotalCostUsd` decimal(16,8);--> statement-breakpoint
ALTER TABLE `assistant_usage` ADD `costCurrency` varchar(3);
