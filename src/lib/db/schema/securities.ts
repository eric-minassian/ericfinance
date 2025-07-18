import { createId } from "@paralleldrive/cuid2";
import { InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { accountsTable } from "./accounts";
import { importsTable } from "./imports";
import { dateString, lifecycleDates } from "./utils";

export const securitiesTable = sqliteTable("securities", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  accountId: text("account_id")
    .notNull()
    .references(() => accountsTable.id, { onDelete: "cascade" }),
  importId: text("import_id").references(() => importsTable.id, {
    onDelete: "cascade",
  }),

  date: dateString("date").notNull(),
  ticker: text("ticker").notNull(),
  amount: int("amount").notNull(),
  rawData: text("raw_data", { mode: "json" }),
  ...lifecycleDates,
});

export type Security = InferSelectModel<typeof securitiesTable>;
export type InsertSecurity = InferInsertModel<typeof securitiesTable>;
