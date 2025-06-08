import { createId } from "@paralleldrive/cuid2";
import { InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { accountsTable } from "./accounts";
import { categoriesTable } from "./categories";
import { importsTable } from "./imports";
import { dateString, lifecycleDates } from "./utils";

export const transactionsTable = sqliteTable("transactions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  accountId: text("account_id")
    .notNull()
    .references(() => accountsTable.id, { onDelete: "cascade" }),
  importId: text("import_id").references(() => importsTable.id, {
    onDelete: "cascade",
  }),
  categoryId: text("category_id").references(() => categoriesTable.id, {
    onDelete: "set null",
  }),

  amount: int("amount").notNull(),
  date: dateString("date").notNull(),
  payee: text("payee").notNull(),
  rawData: text("raw_data", { mode: "json" }),
  ...lifecycleDates,
});

export type Transaction = InferSelectModel<typeof transactionsTable>;
export type InsertTransaction = InferInsertModel<typeof transactionsTable>;
