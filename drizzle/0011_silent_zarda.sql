CREATE TABLE `smart_device_connections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`habitatId` int,
	`provider` enum('home_assistant','aquarium_controller','water_monitor','zigbee_matter','other') NOT NULL,
	`modelLabel` varchar(128),
	`requestedMetrics` json NOT NULL,
	`status` enum('selected','awaiting_authorization','connected','disabled') NOT NULL DEFAULT 'selected',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `smart_device_connections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `smart_device_connections` ADD CONSTRAINT `smart_device_connections_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `smart_device_connections` ADD CONSTRAINT `smart_device_connections_habitatId_private_habitats_id_fk` FOREIGN KEY (`habitatId`) REFERENCES `private_habitats`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `smart_device_connections_user_updated_idx` ON `smart_device_connections` (`userId`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `smart_device_connections_habitat_idx` ON `smart_device_connections` (`habitatId`);