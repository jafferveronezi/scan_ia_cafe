CREATE TABLE `diagnoses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`imageUrl` text NOT NULL,
	`imageKey` varchar(512),
	`disease` varchar(255) NOT NULL,
	`diseaseSlug` varchar(64) NOT NULL,
	`confidence` float NOT NULL,
	`riskLevel` enum('low','medium','high') NOT NULL,
	`description` text,
	`recommendations` text,
	`isHealthy` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `diagnoses_id` PRIMARY KEY(`id`)
);
