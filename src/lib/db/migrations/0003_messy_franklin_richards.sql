PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_rule_statements` (
	`id` text PRIMARY KEY NOT NULL,
	`rule_id` text NOT NULL,
	`field` text NOT NULL,
	`operator` text NOT NULL,
	`value` text NOT NULL,
	FOREIGN KEY (`rule_id`) REFERENCES `rules`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_rule_statements`("id", "rule_id", "field", "operator", "value") SELECT "id", "rule_id", "field", "operator", "value" FROM `rule_statements`;--> statement-breakpoint
DROP TABLE `rule_statements`;--> statement-breakpoint
ALTER TABLE `__new_rule_statements` RENAME TO `rule_statements`;--> statement-breakpoint
PRAGMA foreign_keys=ON;