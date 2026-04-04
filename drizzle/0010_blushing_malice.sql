CREATE TABLE `stripeCustomers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stripeCustomerId` varchar(100) NOT NULL,
	`email` varchar(320) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stripeCustomers_id` PRIMARY KEY(`id`),
	CONSTRAINT `stripeCustomers_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `stripeCustomers_stripeCustomerId_unique` UNIQUE(`stripeCustomerId`)
);
--> statement-breakpoint
CREATE TABLE `stripeInvoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stripeInvoiceId` varchar(100) NOT NULL,
	`stripeSubscriptionId` varchar(100),
	`amount` int NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'usd',
	`status` enum('draft','open','paid','uncollectible','void') NOT NULL,
	`pdfUrl` text,
	`hostedInvoiceUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stripeInvoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `stripeInvoices_stripeInvoiceId_unique` UNIQUE(`stripeInvoiceId`)
);
--> statement-breakpoint
CREATE TABLE `stripePaymentIntents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stripePaymentIntentId` varchar(100) NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'usd',
	`status` enum('requires_payment_method','requires_confirmation','requires_action','processing','requires_capture','canceled','succeeded') NOT NULL,
	`metadata` json DEFAULT ('{}'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stripePaymentIntents_id` PRIMARY KEY(`id`),
	CONSTRAINT `stripePaymentIntents_stripePaymentIntentId_unique` UNIQUE(`stripePaymentIntentId`)
);
--> statement-breakpoint
CREATE TABLE `stripePrices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stripePriceId` varchar(100) NOT NULL,
	`stripeProductId` varchar(100) NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'usd',
	`billingCycle` enum('one_time','month','year') NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stripePrices_id` PRIMARY KEY(`id`),
	CONSTRAINT `stripePrices_stripePriceId_unique` UNIQUE(`stripePriceId`)
);
--> statement-breakpoint
CREATE TABLE `stripeProducts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stripeProductId` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`type` enum('product','subscription') NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`metadata` json DEFAULT ('{}'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stripeProducts_id` PRIMARY KEY(`id`),
	CONSTRAINT `stripeProducts_stripeProductId_unique` UNIQUE(`stripeProductId`)
);
--> statement-breakpoint
CREATE TABLE `stripeSubscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stripeSubscriptionId` varchar(100) NOT NULL,
	`stripePriceId` varchar(100) NOT NULL,
	`status` enum('trialing','active','past_due','canceled','unpaid','incomplete','incomplete_expired') NOT NULL,
	`currentPeriodStart` timestamp,
	`currentPeriodEnd` timestamp,
	`cancelledAt` timestamp,
	`endedAt` timestamp,
	`metadata` json DEFAULT ('{}'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stripeSubscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `stripeSubscriptions_stripeSubscriptionId_unique` UNIQUE(`stripeSubscriptionId`)
);
--> statement-breakpoint
ALTER TABLE `stripeCustomers` ADD CONSTRAINT `stripeCustomers_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stripeInvoices` ADD CONSTRAINT `stripeInvoices_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stripePaymentIntents` ADD CONSTRAINT `stripePaymentIntents_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stripeSubscriptions` ADD CONSTRAINT `stripeSubscriptions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;