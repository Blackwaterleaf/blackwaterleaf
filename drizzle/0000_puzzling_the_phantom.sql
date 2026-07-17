DROP TABLE `ai_chats`;--> statement-breakpoint
DROP TABLE `ai_corrections`;--> statement-breakpoint
DROP TABLE `ai_hallucination_blacklist`;--> statement-breakpoint
DROP TABLE `aquarium_events`;--> statement-breakpoint
DROP TABLE `aquarium_photos`;--> statement-breakpoint
DROP TABLE `aquariums`;--> statement-breakpoint
DROP TABLE `badges`;--> statement-breakpoint
DROP TABLE `challenges`;--> statement-breakpoint
DROP TABLE `comment_likes`;--> statement-breakpoint
DROP TABLE `comments`;--> statement-breakpoint
DROP TABLE `conversation_participants`;--> statement-breakpoint
DROP TABLE `conversations`;--> statement-breakpoint
DROP TABLE `featured_accounts`;--> statement-breakpoint
DROP TABLE `follows`;--> statement-breakpoint
DROP TABLE `group_members`;--> statement-breakpoint
DROP TABLE `groups`;--> statement-breakpoint
DROP TABLE `knowledge_articles`;--> statement-breakpoint
DROP TABLE `likes`;--> statement-breakpoint
DROP TABLE `messages`;--> statement-breakpoint
DROP TABLE `moderation_logs`;--> statement-breakpoint
DROP TABLE `notifications`;--> statement-breakpoint
DROP TABLE `plant_photos`;--> statement-breakpoint
DROP TABLE `plants`;--> statement-breakpoint
DROP TABLE `posts`;--> statement-breakpoint
DROP TABLE `reports`;--> statement-breakpoint
DROP TABLE `taxonomy_species`;--> statement-breakpoint
DROP TABLE `user_badges`;--> statement-breakpoint
DROP TABLE `user_stats`;--> statement-breakpoint
ALTER TABLE `users` DROP INDEX `users_username_unique`;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `username`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `status`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `plan`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `experienceLevel`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `interests`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `avatarUrl`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `bio`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `location`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `socialInstagram`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `socialTiktok`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `socialYoutube`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `socialFacebook`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `socialWebsite`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `followersCount`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `followingCount`;