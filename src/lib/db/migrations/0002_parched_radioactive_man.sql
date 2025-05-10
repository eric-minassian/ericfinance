CREATE TABLE `securities` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`import_id` text,
	`date` integer NOT NULL,
	`ticker` text NOT NULL,
	`amount` integer NOT NULL,
	`raw_data` text,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`import_id`) REFERENCES `imports`(`id`) ON UPDATE no action ON DELETE cascade
);
