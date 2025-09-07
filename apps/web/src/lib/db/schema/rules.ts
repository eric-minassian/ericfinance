import { createId } from "@paralleldrive/cuid2";
import { type InferSelectModel } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { lifecycleDates } from "./utils";

export const rulesTable = sqliteTable("rules", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  updateField: text("update_field", {
    enum: ["categoryId", "payee", "notes"],
  }).notNull(),
  updateValue: text("update_value").notNull(),
  ...lifecycleDates,
});

export type Rule = InferSelectModel<typeof rulesTable>;
