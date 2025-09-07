CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `transactions` ADD `category_id` text REFERENCES categories(id);