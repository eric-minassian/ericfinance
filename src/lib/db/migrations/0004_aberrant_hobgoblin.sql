PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`import_id` text,
	`category_id` text,
	`amount` integer NOT NULL,
	`date` text NOT NULL,
	`payee` text NOT NULL,
	`notes` text,
	`raw_data` text,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`import_id`) REFERENCES `imports`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_transactions`("id", "account_id", "import_id", "category_id", "amount", "date", "payee", "notes", "raw_data") SELECT "id", "account_id", "import_id", "category_id", "amount", strftime('%Y-%m-%d', "date", 'unixepoch'), "payee", "notes", "raw_data" FROM `transactions`;--> statement-breakpoint
DROP TABLE `transactions`;--> statement-breakpoint
ALTER TABLE `__new_transactions` RENAME TO `transactions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;