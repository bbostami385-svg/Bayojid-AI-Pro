CREATE TABLE `chatTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`category` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chatTemplates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `chatTemplates` ADD CONSTRAINT `chatTemplates_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userProfiles` DROP COLUMN `language`;--> statement-breakpoint
ALTER TABLE `userProfiles` DROP COLUMN `theme`;--> statement-breakpoint
ALTER TABLE `userProfiles` DROP COLUMN `createdAt`;--> statement-breakpoint
ALTER TABLE `userProfiles` DROP COLUMN `updatedAt`;