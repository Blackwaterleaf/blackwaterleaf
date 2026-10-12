ALTER TABLE `feedback_entries` ADD `adminNote` text;--> statement-breakpoint
ALTER TABLE `feedback_entries` ADD `responseMessage` text;--> statement-breakpoint
ALTER TABLE `notifications` ADD `feedbackId` int;--> statement-breakpoint
ALTER TABLE `notifications` ADD `partnerInquiryId` int;--> statement-breakpoint
ALTER TABLE `partner_inquiries` ADD `adminNote` text;--> statement-breakpoint
ALTER TABLE `partner_inquiries` ADD `responseMessage` text;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_feedbackId_feedback_entries_id_fk` FOREIGN KEY (`feedbackId`) REFERENCES `feedback_entries`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_partnerInquiryId_partner_inquiries_id_fk` FOREIGN KEY (`partnerInquiryId`) REFERENCES `partner_inquiries`(`id`) ON DELETE cascade ON UPDATE no action;