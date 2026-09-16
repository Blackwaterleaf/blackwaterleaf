CREATE TABLE `studio_mobile_devices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`expoPushToken` varchar(255) NOT NULL,
	`platform` enum('android','ios','web') NOT NULL,
	`status` enum('active','revoked') NOT NULL DEFAULT 'active',
	`lastSeenAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `studio_mobile_devices_id` PRIMARY KEY(`id`),
	CONSTRAINT `studio_mobile_devices_expoPushToken_unique` UNIQUE(`expoPushToken`)
);
