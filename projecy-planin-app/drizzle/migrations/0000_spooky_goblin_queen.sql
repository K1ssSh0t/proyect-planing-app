CREATE TABLE `tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'todo',
	`priority` text DEFAULT 'medium',
	`assignee` text,
	`start_date` text,
	`end_date` text,
	`created_at` text DEFAULT '2025-01-28T22:39:47.250Z'
);
--> statement-breakpoint
CREATE INDEX `status_idx` ON `tasks` (`status`);--> statement-breakpoint
CREATE INDEX `priority_idx` ON `tasks` (`priority`);