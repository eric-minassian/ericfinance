import { createId } from "@paralleldrive/cuid2";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const accountsTable = sqliteTable("accounts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  name: text("name").notNull(),
});

export const transactionsTable = sqliteTable("transactions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  accountId: text("account_id")
    .notNull()
    .references(() => accountsTable.id, { onDelete: "cascade" }),

  amount: text("amount").notNull(),
  date: text("date").notNull(),
  payee: text("payee").notNull(),
  notes: text("notes"),
});
