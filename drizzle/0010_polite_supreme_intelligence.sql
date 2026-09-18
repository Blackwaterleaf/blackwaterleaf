ALTER TABLE `partner_products` ADD `imageStorageKey` varchar(512);--> statement-breakpoint
ALTER TABLE `partner_products` ADD `imageMimeType` enum('image/jpeg','image/png','image/webp');--> statement-breakpoint
ALTER TABLE `partner_products` ADD `imageByteSize` int;