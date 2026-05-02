CREATE TABLE `apiUsageMetrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`endpoint` varchar(255) NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`requests` int NOT NULL DEFAULT 0,
	`successfulRequests` int NOT NULL DEFAULT 0,
	`failedRequests` int NOT NULL DEFAULT 0,
	`avgLatency` int NOT NULL DEFAULT 0,
	`minLatency` int NOT NULL DEFAULT 0,
	`maxLatency` int NOT NULL DEFAULT 0,
	`errors` int NOT NULL DEFAULT 0,
	`timeouts` int NOT NULL DEFAULT 0,
	`throttled` int NOT NULL DEFAULT 0,
	`bytes` bigint NOT NULL DEFAULT 0,
	`cost` decimal(10,4) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `apiUsageMetrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`status` enum('success','failure','partial','pending') NOT NULL DEFAULT 'success',
	`severity` enum('info','warning','critical') NOT NULL DEFAULT 'info',
	`resourceType` varchar(100) NOT NULL,
	`resourceId` varchar(255) NOT NULL,
	`resourceName` varchar(255),
	`details` json DEFAULT ('{}'),
	`ipAddress` varchar(45),
	`userAgent` text,
	`duration` int,
	`errorMessage` text,
	`changedFields` json DEFAULT ('{}'),
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dashboardLayouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`layoutId` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`widgets` json DEFAULT ('[]'),
	`isDefault` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dashboardLayouts_id` PRIMARY KEY(`id`),
	CONSTRAINT `dashboardLayouts_layoutId_unique` UNIQUE(`layoutId`)
);
--> statement-breakpoint
CREATE TABLE `notificationDeliveries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`notificationId` varchar(100) NOT NULL,
	`channels` varchar(255) NOT NULL,
	`recipient` varchar(255) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`status` enum('pending','sent','failed','retrying','bounced') NOT NULL DEFAULT 'pending',
	`attempts` int NOT NULL DEFAULT 0,
	`lastAttemptAt` timestamp,
	`metadata` json DEFAULT ('{}'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notificationDeliveries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reportHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportId` varchar(100) NOT NULL,
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	`data` json DEFAULT ('{}'),
	`status` enum('success','failed','partial') NOT NULL DEFAULT 'success',
	`errorMessage` text,
	CONSTRAINT `reportHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scheduledReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`reportId` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`reportType` enum('activity','revenue','performance','team','custom') NOT NULL,
	`frequency` enum('once','daily','weekly','monthly','quarterly') NOT NULL,
	`recipients` json DEFAULT ('[]'),
	`metrics` json DEFAULT ('[]'),
	`filters` json DEFAULT ('{}'),
	`template` varchar(255),
	`isActive` boolean NOT NULL DEFAULT true,
	`lastGeneratedAt` timestamp,
	`nextScheduledAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scheduledReports_id` PRIMARY KEY(`id`),
	CONSTRAINT `scheduledReports_reportId_unique` UNIQUE(`reportId`)
);
--> statement-breakpoint
ALTER TABLE `apiUsageMetrics` ADD CONSTRAINT `apiUsageMetrics_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `auditLogs` ADD CONSTRAINT `auditLogs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dashboardLayouts` ADD CONSTRAINT `dashboardLayouts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notificationDeliveries` ADD CONSTRAINT `notificationDeliveries_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reportHistory` ADD CONSTRAINT `reportHistory_reportId_scheduledReports_reportId_fk` FOREIGN KEY (`reportId`) REFERENCES `scheduledReports`(`reportId`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `scheduledReports` ADD CONSTRAINT `scheduledReports_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;