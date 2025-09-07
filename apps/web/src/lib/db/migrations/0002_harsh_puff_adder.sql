CREATE TABLE `rule_statements` (
	`id` text PRIMARY KEY NOT NULL,
	`rule_id` text NOT NULL,
	`field` text NOT NULL,
	`operator` text NOT NULL,
	`value` text NOT NULL,
	FOREIGN KEY (`rule_id`) REFERENCES `rules`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `rules` (
	`id` text PRIMARY KEY NOT NULL,
	`update_field` text NOT NULL,
	`update_value` text NOT NULL
);
