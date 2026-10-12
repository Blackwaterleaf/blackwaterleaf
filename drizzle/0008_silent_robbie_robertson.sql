CREATE TABLE `studio_usage_ledger` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`userId` int NOT NULL,
	`kind` enum('llm','video','worker','storage','adjustment') NOT NULL,
	`provider` varchar(120) NOT NULL,
	`units` int NOT NULL,
	`unitCostCents` int NOT NULL,
	`totalCostCents` int NOT NULL,
	`status` enum('estimated','reserved','settled','voided') NOT NULL DEFAULT 'estimated',
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `studio_usage_ledger_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `studio_video_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`createdBy` int NOT NULL,
	`status` enum('estimated','awaiting_approval','queued','running','succeeded','failed','cancelled') NOT NULL DEFAULT 'estimated',
	`durationSeconds` int NOT NULL,
	`quality` enum('draft','standard','high') NOT NULL,
	`voice` enum('none','synthetic','premium') NOT NULL,
	`music` boolean NOT NULL DEFAULT false,
	`clips` int NOT NULL DEFAULT 1,
	`provider` varchar(120) NOT NULL DEFAULT 'not_configured',
	`estimatedCredits` int NOT NULL,
	`estimatedCostCents` int NOT NULL,
	`artifactId` int,
	`errorCode` varchar(160),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `studio_video_jobs_id` PRIMARY KEY(`id`)
);
