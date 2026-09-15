CREATE TABLE `studio_approval_decisions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`approvalRequestId` int NOT NULL,
	`decidedBy` int NOT NULL,
	`decision` enum('approved','denied') NOT NULL,
	`reason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `studio_approval_decisions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `studio_approval_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskId` int NOT NULL,
	`requestedBy` int NOT NULL,
	`actionType` enum('file_read','network_access','sandbox_execute','publish','delete','role_change') NOT NULL,
	`resourceScope` text NOT NULL,
	`riskSummary` text NOT NULL,
	`requestingService` varchar(120) NOT NULL,
	`status` enum('pending','approved','denied','expired','cancelled') NOT NULL DEFAULT 'pending',
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `studio_approval_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `studio_artifacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`taskId` int,
	`storageKey` varchar(500) NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`mediaType` varchar(160) NOT NULL,
	`sizeBytes` int NOT NULL,
	`sha256` varchar(64) NOT NULL,
	`purpose` enum('input','output','intermediate') NOT NULL,
	`status` enum('pending_upload','scanning','available','quarantined','deleted') NOT NULL DEFAULT 'pending_upload',
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `studio_artifacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `studio_audit_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`taskId` int,
	`actorType` enum('user','system','agent') NOT NULL,
	`actorId` int,
	`eventType` varchar(160) NOT NULL,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `studio_audit_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `studio_context_grants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskId` int NOT NULL,
	`sourceApp` varchar(120) NOT NULL,
	`resourceType` varchar(120) NOT NULL,
	`resourceId` varchar(160) NOT NULL,
	`scope` text NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`revokedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `studio_context_grants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `studio_sandbox_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskId` int NOT NULL,
	`runnerType` enum('agent_control_plane','isolated_worker') NOT NULL,
	`status` enum('requested','provisioning','ready','running','stopping','closed','failed','expired') NOT NULL,
	`imageDigest` varchar(255),
	`runtimeLimitSeconds` int NOT NULL,
	`memoryLimitMb` int NOT NULL,
	`networkPolicy` varchar(120) NOT NULL,
	`filePolicy` varchar(160) NOT NULL,
	`startedAt` timestamp,
	`endedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `studio_sandbox_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `studio_task_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskId` int NOT NULL,
	`role` enum('user','assistant','system') NOT NULL,
	`content` text NOT NULL,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `studio_task_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `studio_task_steps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskId` int NOT NULL,
	`sequence` int NOT NULL,
	`kind` enum('planning','analysis','execution','result') NOT NULL,
	`title` varchar(255) NOT NULL,
	`status` enum('pending','running','blocked','succeeded','failed','skipped') NOT NULL DEFAULT 'pending',
	`startedAt` timestamp,
	`finishedAt` timestamp,
	`errorCode` varchar(120),
	CONSTRAINT `studio_task_steps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `studio_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`createdBy` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`goal` text NOT NULL,
	`status` enum('draft','ready','queued','running','waiting_for_approval','succeeded','failed','cancelled','expired') NOT NULL DEFAULT 'draft',
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`startedAt` timestamp,
	`finishedAt` timestamp,
	CONSTRAINT `studio_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `studio_tool_invocations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskStepId` int NOT NULL,
	`toolName` varchar(120) NOT NULL,
	`inputDigest` varchar(64) NOT NULL,
	`status` enum('requested','succeeded','failed','denied') NOT NULL,
	`outputArtifactId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`finishedAt` timestamp,
	CONSTRAINT `studio_tool_invocations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `studio_workspace_memberships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('owner','admin','operator','reviewer','viewer') NOT NULL,
	`status` enum('active','suspended') NOT NULL DEFAULT 'active',
	`grantedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `studio_workspace_memberships_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `studio_workspaces` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`status` enum('active','archived') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `studio_workspaces_id` PRIMARY KEY(`id`)
);
