CREATE TABLE `partner_offer_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` varchar(96) NOT NULL,
	`partnerId` int NOT NULL,
	`productId` int NOT NULL,
	`eventType` enum('outbound_click','purchase_intent') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `partner_offer_events_id` PRIMARY KEY(`id`),
	CONSTRAINT `partner_offer_events_event_id_unique` UNIQUE(`eventId`)
);
--> statement-breakpoint
ALTER TABLE `partner_offer_events` ADD CONSTRAINT `partner_offer_events_partnerId_partner_profiles_id_fk` FOREIGN KEY (`partnerId`) REFERENCES `partner_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `partner_offer_events` ADD CONSTRAINT `partner_offer_events_productId_partner_products_id_fk` FOREIGN KEY (`productId`) REFERENCES `partner_products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `partner_offer_events_partner_product_type_created_idx` ON `partner_offer_events` (`partnerId`,`productId`,`eventType`,`createdAt`);