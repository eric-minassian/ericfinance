CREATE TABLE `security_prices` (
	`id` text PRIMARY KEY NOT NULL,
	`date` integer NOT NULL,
	`price` integer NOT NULL,
	`ticker` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`alpha_vantage_key` text
);
