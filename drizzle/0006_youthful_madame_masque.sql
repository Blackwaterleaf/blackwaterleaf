CREATE TABLE `studio_project_changes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`createdBy` int NOT NULL,
	`kind` enum('draft_patch','commit','revert') NOT NULL,
	`summary` varchar(500) NOT NULL,
	`patch` text NOT NULL,
	`status` enum('draft','approved','applied','rejected') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `studio_project_changes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `studio_project_environments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`environment` enum('preview','staging') NOT NULL,
	`status` enum('not_ready','awaiting_approval','ready','expired','blocked') NOT NULL DEFAULT 'not_ready',
	`buildSha` varchar(64),
	`previewUrl` varchar(500),
	`expiresAt` timestamp,
	`approvedBy` int,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `studio_project_environments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `studio_project_files` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`path` varchar(500) NOT NULL,
	`content` text NOT NULL,
	`contentHash` varchar(64) NOT NULL,
	`version` int NOT NULL DEFAULT 1,
	`updatedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `studio_project_files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `studio_projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`createdBy` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`slug` varchar(180) NOT NULL,
	`target` enum('web','web_native') NOT NULL,
	`status` enum('draft','active','archived') NOT NULL DEFAULT 'draft',
	`brief` text NOT NULL,
	`defaultBranch` varchar(120) NOT NULL DEFAULT 'main',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `studio_projects_id` PRIMARY KEY(`id`)
);
