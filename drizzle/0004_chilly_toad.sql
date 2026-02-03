CREATE TABLE `premiumSubscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`plan` enum('free','pro','premium') NOT NULL DEFAULT 'free',
	`messageLimit` int NOT NULL DEFAULT 50,
	`messagesUsed` int NOT NULL DEFAULT 0,
	`customPromptAllowed` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `premiumSubscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `premiumSubscriptions` ADD CONSTRAINT `premiumSubscriptions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;