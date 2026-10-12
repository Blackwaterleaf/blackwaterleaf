ALTER TABLE `partner_inquiries` MODIFY COLUMN `userId` int;--> statement-breakpoint
ALTER TABLE `partner_inquiries` ADD `organizationName` varchar(220);--> statement-breakpoint
ALTER TABLE `partner_inquiries` ADD `contactName` varchar(160);--> statement-breakpoint
ALTER TABLE `partner_inquiries` ADD `organizationType` varchar(80);--> statement-breakpoint
ALTER TABLE `partner_inquiries` ADD `website` varchar(500);