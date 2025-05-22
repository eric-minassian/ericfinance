import { createId } from "@paralleldrive/cuid2";
import { type InferSelectModel } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { rulesTable } from "./rules";

export const ruleStatementsTable = sqliteTable("rule_statements", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  ruleId: text("rule_id")
    .references(() => rulesTable.id)
    .notNull(),

  field: text("field").notNull(),
  operator: text("operator", {
    enum: [
      "equals",
      "not_equals",
      "greater_than",
      "less_than",
      "greater_than_or_equals",
      "less_than_or_equals",
      "contains",
      "not_contains",
      "starts_with",
      "ends_with",
    ],
  }).notNull(),
  value: text("value").notNull(),
});

export type RuleStatement = InferSelectModel<typeof ruleStatementsTable>;
