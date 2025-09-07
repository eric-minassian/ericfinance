import { createId } from "@paralleldrive/cuid2";
import { type InferSelectModel } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { lifecycleDates } from "./utils";

export const categoriesTable = sqliteTable("categories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  name: text("name").notNull(),
  ...lifecycleDates,
});

export type Category = InferSelectModel<typeof categoriesTable>;
