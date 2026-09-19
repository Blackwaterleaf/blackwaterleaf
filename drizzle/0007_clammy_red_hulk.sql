CREATE TABLE `studio_project_briefs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`targetUsers` text NOT NULL,
	`platforms` text NOT NULL,
	`dataSensitivity` enum('public','internal','confidential','regulated') NOT NULL,
	`integrations` text NOT NULL,
	`deliveryScope` text NOT NULL,
	`budgetCents` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `studio_project_briefs_id` PRIMARY KEY(`id`),
	CONSTRAINT `studio_project_briefs_projectId_unique` UNIQUE(`projectId`)
);
--> statement-breakpoint
CREATE TABLE `studio_project_environment_approvals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`environment` enum('preview','staging') NOT NULL,
	`requestedBy` int NOT NULL,
	`decidedBy` int,
	`status` enum('pending','approved','denied','expired') NOT NULL DEFAULT 'pending',
	`reason` text,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`decidedAt` timestamp,
	CONSTRAINT `studio_project_environment_approvals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `studio_project_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`version` int NOT NULL DEFAULT 1,
	`status` enum('draft','approved','superseded') NOT NULL DEFAULT 'draft',
	`requirements` text NOT NULL,
	`architecture` text NOT NULL,
	`testPlan` text NOT NULL,
	`risks` text NOT NULL,
	`estimatedBudgetCents` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `studio_project_plans_id` PRIMARY KEY(`id`)
);
