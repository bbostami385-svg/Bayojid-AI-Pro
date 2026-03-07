CREATE TABLE `paymentInvoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`transactionId` int NOT NULL,
	`invoiceNumber` varchar(50) NOT NULL,
	`invoiceDate` timestamp NOT NULL DEFAULT (now()),
	`dueDate` timestamp,
	`amount` decimal(10,2) NOT NULL,
	`taxAmount` decimal(10,2) DEFAULT '0',
	`totalAmount` decimal(10,2) NOT NULL,
	`pdfUrl` text,
	`status` enum('draft','sent','viewed','paid','overdue') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `paymentInvoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `paymentInvoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`)
);
--> statement-breakpoint
CREATE TABLE `sslcommerzTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`transactionId` varchar(100) NOT NULL,
	`plan` enum('free','pro','premium') NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'BDT',
	`status` enum('pending','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
	`paymentMethod` varchar(50),
	`sslcommerzRef` varchar(100),
	`bankTransactionId` varchar(100),
	`cardBrand` varchar(50),
	`cardNumber` varchar(20),
	`customerName` varchar(255),
	`customerEmail` varchar(320),
	`customerPhone` varchar(20),
	`ipAddress` varchar(50),
	`userAgent` text,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sslcommerzTransactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `sslcommerzTransactions_transactionId_unique` UNIQUE(`transactionId`)
);
--> statement-breakpoint
CREATE TABLE `subscriptionPlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`price` decimal(10,2) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'BDT',
	`billingCycle` enum('monthly','yearly') NOT NULL,
	`features` json DEFAULT ('[]'),
	`videoLimit` int DEFAULT 0,
	`videoDuration` int DEFAULT 0,
	`videoQuality` varchar(20) DEFAULT '480p',
	`imageLimit` int DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptionPlans_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscriptionPlans_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `userSubscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`planId` int NOT NULL,
	`transactionId` int,
	`status` enum('active','cancelled','expired','suspended') NOT NULL DEFAULT 'active',
	`startDate` timestamp NOT NULL DEFAULT (now()),
	`endDate` timestamp,
	`autoRenew` boolean NOT NULL DEFAULT true,
	`nextBillingDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userSubscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `userSubscriptions_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `paymentInvoices` ADD CONSTRAINT `paymentInvoices_transactionId_sslcommerzTransactions_id_fk` FOREIGN KEY (`transactionId`) REFERENCES `sslcommerzTransactions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sslcommerzTransactions` ADD CONSTRAINT `sslcommerzTransactions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userSubscriptions` ADD CONSTRAINT `userSubscriptions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userSubscriptions` ADD CONSTRAINT `userSubscriptions_planId_subscriptionPlans_id_fk` FOREIGN KEY (`planId`) REFERENCES `subscriptionPlans`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userSubscriptions` ADD CONSTRAINT `userSubscriptions_transactionId_sslcommerzTransactions_id_fk` FOREIGN KEY (`transactionId`) REFERENCES `sslcommerzTransactions`(`id`) ON DELETE no action ON UPDATE no action;