ALTER TABLE `ai_chats` MODIFY COLUMN `contextType` enum('general','plant','aquarium','channa');--> statement-breakpoint
ALTER TABLE `knowledge_articles` ADD `genus` varchar(64) DEFAULT null;