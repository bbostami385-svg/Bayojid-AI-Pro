CREATE TABLE `bookmarks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`messageId` int NOT NULL,
	`title` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bookmarks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fileUploads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`messageId` int,
	`fileName` varchar(255) NOT NULL,
	`fileUrl` text NOT NULL,
	`fileSize` int NOT NULL,
	`mimeType` varchar(100) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fileUploads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `groupChatMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`groupChatId` int NOT NULL,
	`userId` int NOT NULL,
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `groupChatMembers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `groupChatMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`groupChatId` int NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `groupChatMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `groupChats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`creatorId` int NOT NULL,
	`isPublic` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `groupChats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `bookmarks` ADD CONSTRAINT `bookmarks_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bookmarks` ADD CONSTRAINT `bookmarks_messageId_messages_id_fk` FOREIGN KEY (`messageId`) REFERENCES `messages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fileUploads` ADD CONSTRAINT `fileUploads_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fileUploads` ADD CONSTRAINT `fileUploads_messageId_messages_id_fk` FOREIGN KEY (`messageId`) REFERENCES `messages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `groupChatMembers` ADD CONSTRAINT `groupChatMembers_groupChatId_groupChats_id_fk` FOREIGN KEY (`groupChatId`) REFERENCES `groupChats`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `groupChatMembers` ADD CONSTRAINT `groupChatMembers_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `groupChatMessages` ADD CONSTRAINT `groupChatMessages_groupChatId_groupChats_id_fk` FOREIGN KEY (`groupChatId`) REFERENCES `groupChats`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `groupChatMessages` ADD CONSTRAINT `groupChatMessages_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `groupChats` ADD CONSTRAINT `groupChats_creatorId_users_id_fk` FOREIGN KEY (`creatorId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;