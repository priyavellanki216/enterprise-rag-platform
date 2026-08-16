CREATE TABLE `agent_traces` (
	`id` int AUTO_INCREMENT NOT NULL,
	`queryEventId` int NOT NULL,
	`nodeName` varchar(80) NOT NULL,
	`status` enum('completed','failed') NOT NULL DEFAULT 'completed',
	`durationMs` int NOT NULL DEFAULT 0,
	`detail` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agent_traces_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`knowledgeBaseId` int,
	`title` varchar(200) NOT NULL,
	`messageCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`knowledgeBaseId` int NOT NULL,
	`ownerId` int NOT NULL,
	`filename` varchar(255) NOT NULL,
	`documentType` varchar(32) NOT NULL,
	`sourceUrl` text,
	`storageKey` text,
	`storageUrl` text,
	`status` enum('queued','processing','ready','failed') NOT NULL DEFAULT 'queued',
	`chunkCount` int NOT NULL DEFAULT 0,
	`extractedText` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`processedAt` timestamp,
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`messageId` int NOT NULL,
	`ownerId` int NOT NULL,
	`rating` enum('up','down') NOT NULL,
	`hallucinationFlag` int NOT NULL DEFAULT 0,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ingestion_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`documentId` int NOT NULL,
	`ownerId` int NOT NULL,
	`status` enum('queued','processing','completed','failed') NOT NULL DEFAULT 'queued',
	`progress` int NOT NULL DEFAULT 0,
	`errorMessage` text,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ingestion_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `knowledge_bases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`description` text,
	`tags` json,
	`ownerId` int NOT NULL,
	`documentCount` int NOT NULL DEFAULT 0,
	`status` enum('active','processing','archived') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `knowledge_bases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `llm_usage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`model` varchar(120) NOT NULL,
	`inputTokens` int NOT NULL DEFAULT 0,
	`outputTokens` int NOT NULL DEFAULT 0,
	`estimatedCost` float NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `llm_usage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`citations` json,
	`confidence` float,
	`latencyMs` int,
	`tokenUsage` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `query_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`query` text NOT NULL,
	`status` enum('success','error') NOT NULL DEFAULT 'success',
	`latencyMs` int,
	`retrievedCount` int NOT NULL DEFAULT 0,
	`hitRate` float,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `query_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','analyst') NOT NULL DEFAULT 'user';