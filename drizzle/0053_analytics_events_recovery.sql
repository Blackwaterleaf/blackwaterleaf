CREATE TABLE IF NOT EXISTS `analytics_events` (
  `id` int AUTO_INCREMENT NOT NULL,
  `sessionKey` varchar(128) NOT NULL,
  `eventType` enum('page_view','page_view_end','session_start','login_success') NOT NULL,
  `path` varchar(255),
  `countryCode` varchar(2),
  `durationSeconds` int NOT NULL DEFAULT 0,
  `occurredAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `analytics_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `analytics_events_occurred_idx` ON `analytics_events` (`occurredAt`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `analytics_events_type_occurred_idx` ON `analytics_events` (`eventType`,`occurredAt`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `analytics_events_country_occurred_idx` ON `analytics_events` (`countryCode`,`occurredAt`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `analytics_events_session_occurred_idx` ON `analytics_events` (`sessionKey`,`occurredAt`);
