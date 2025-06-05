PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_securities` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`import_id` text,
	`date` text NOT NULL,
	`ticker` text NOT NULL,
	`amount` integer NOT NULL,
	`raw_data` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`import_id`) REFERENCES `imports`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_securities`("id", "account_id", "import_id", "date", "ticker", "amount", "raw_data", "created_at", "updated_at") SELECT "id", "account_id", "import_id", "date", "ticker", "amount", "raw_data", "created_at", "updated_at" FROM `securities`;--> statement-breakpoint
DROP TABLE `securities`;--> statement-breakpoint
ALTER TABLE `__new_securities` RENAME TO `securities`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `accounts` ADD `variant` text DEFAULT 'transactions' NOT NULL;--> statement-breakpoint
ALTER TABLE `accounts` ADD `created_at` integer NOT NULL DEFAULT 0;--> statement-breakpoint
UPDATE `accounts` SET `created_at` = unixepoch();--> statement-breakpoint
ALTER TABLE `accounts` ADD `updated_at` integer NOT NULL DEFAULT 0;--> statement-breakpoint
UPDATE `accounts` SET `updated_at` = unixepoch();--> statement-breakpoint
ALTER TABLE `categories` ADD `created_at` integer NOT NULL DEFAULT 0;--> statement-breakpoint
UPDATE `categories` SET `created_at` = unixepoch();--> statement-breakpoint
ALTER TABLE `categories` ADD `updated_at` integer NOT NULL DEFAULT 0;--> statement-breakpoint
UPDATE `categories` SET `updated_at` = unixepoch();--> statement-breakpoint
ALTER TABLE `imports` ADD `updated_at` integer NOT NULL DEFAULT 0;--> statement-breakpoint
UPDATE `imports` SET `updated_at` = unixepoch();--> statement-breakpoint
ALTER TABLE `rule_statements` ADD `created_at` integer NOT NULL DEFAULT 0;--> statement-breakpoint
UPDATE `rule_statements` SET `created_at` = unixepoch();--> statement-breakpoint
ALTER TABLE `rule_statements` ADD `updated_at` integer NOT NULL DEFAULT 0;--> statement-breakpoint
UPDATE `rule_statements` SET `updated_at` = unixepoch();--> statement-breakpoint
ALTER TABLE `rules` ADD `created_at` integer NOT NULL DEFAULT 0;--> statement-breakpoint
UPDATE `rules` SET `created_at` = unixepoch();--> statement-breakpoint
ALTER TABLE `rules` ADD `updated_at` integer NOT NULL DEFAULT 0;--> statement-breakpoint
UPDATE `rules` SET `updated_at` = unixepoch();--> statement-breakpoint
ALTER TABLE `security_prices` ADD `created_at` integer NOT NULL DEFAULT 0;--> statement-breakpoint
UPDATE `security_prices` SET `created_at` = unixepoch();--> statement-breakpoint
ALTER TABLE `security_prices` ADD `updated_at` integer NOT NULL DEFAULT 0;--> statement-breakpoint
UPDATE `security_prices` SET `updated_at` = unixepoch();--> statement-breakpoint
ALTER TABLE `transactions` ADD `created_at` integer NOT NULL DEFAULT 0;--> statement-breakpoint
UPDATE `transactions` SET `created_at` = unixepoch();--> statement-breakpoint
ALTER TABLE `transactions` ADD `updated_at` integer NOT NULL DEFAULT 0;--> statement-breakpoint
UPDATE `transactions` SET `updated_at` = unixepoch();