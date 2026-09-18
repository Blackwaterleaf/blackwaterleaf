ALTER TABLE `partner_products` ADD `sourceDescriptionHtml` text;--> statement-breakpoint
ALTER TABLE `partner_products` ADD `sourceHandle` varchar(255);--> statement-breakpoint
ALTER TABLE `partner_products` ADD `sourceVendor` varchar(160);--> statement-breakpoint
ALTER TABLE `partner_products` ADD `marketplaceCategory` varchar(64);--> statement-breakpoint
ALTER TABLE `partner_products` ADD `sourceProductCategory` varchar(1000);--> statement-breakpoint
ALTER TABLE `partner_products` ADD `productType` varchar(160);--> statement-breakpoint
ALTER TABLE `partner_products` ADD `sourceTags` text;--> statement-breakpoint
ALTER TABLE `partner_products` ADD `variantSummary` varchar(1000);--> statement-breakpoint
ALTER TABLE `partner_products` ADD `variantCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `partner_products` ADD `sourceVariants` json;--> statement-breakpoint
ALTER TABLE `partner_products` ADD `sourceImageUrl` varchar(1000);--> statement-breakpoint
ALTER TABLE `partner_products` ADD `imageAltText` varchar(512);--> statement-breakpoint
ALTER TABLE `partner_products` ADD `seoTitle` varchar(160);--> statement-breakpoint
ALTER TABLE `partner_products` ADD `seoDescription` varchar(320);--> statement-breakpoint
ALTER TABLE `partner_products` ADD CONSTRAINT `partner_products_partner_source_handle_unique` UNIQUE(`partnerId`,`sourceHandle`);--> statement-breakpoint
CREATE INDEX `partner_products_catalog_category_idx` ON `partner_products` (`partnerId`,`marketplaceCategory`,`status`,`updatedAt`);