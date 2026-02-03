CREATE TABLE `conversationShares` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`shareToken` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	CONSTRAINT `conversationShares_id` PRIMARY KEY(`id`),
	CONSTRAINT `conversationShares_shareToken_unique` UNIQUE(`shareToken`)
);
--> statement-breakpoint
ALTER TABLE `conversationShares` ADD CONSTRAINT `conversationShares_conversationId_conversations_id_fk` FOREIGN KEY (`conversationId`) REFERENCES `conversations`(`id`) ON DELETE cascade ON UPDATE no action;