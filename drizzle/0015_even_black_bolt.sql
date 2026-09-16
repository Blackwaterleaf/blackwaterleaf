CREATE TABLE `partner_product_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`position` int NOT NULL,
	`sourceUrl` varchar(1000) NOT NULL,
	`storageKey` varchar(512),
	`mimeType` enum('image/jpeg','image/png','image/webp'),
	`byteSize` int,
	`altText` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partner_product_images_id` PRIMARY KEY(`id`),
	CONSTRAINT `partner_product_images_product_position_unique` UNIQUE(`productId`,`position`)
);
--> statement-breakpoint
ALTER TABLE `partner_product_images` ADD CONSTRAINT `partner_product_images_productId_partner_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `partner_products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `partner_product_images_product_position_idx` ON `partner_product_images` (`productId`,`position`);