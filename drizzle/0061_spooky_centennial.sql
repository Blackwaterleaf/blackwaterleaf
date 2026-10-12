ALTER TABLE `assistant_usage` ADD `estimatedInputCostUsd` decimal(14,8);--> statement-breakpoint
ALTER TABLE `assistant_usage` ADD `estimatedOutputCostUsd` decimal(14,8);--> statement-breakpoint
ALTER TABLE `assistant_usage` ADD `estimatedTotalCostUsd` decimal(14,8);--> statement-breakpoint
ALTER TABLE `assistant_usage` ADD `costCurrency` varchar(8);