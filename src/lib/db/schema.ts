import { createId } from "@paralleldrive/cuid2";
import { type InferSelectModel } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const accountsTable = sqliteTable("accounts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  name: text("name").notNull(),
});

export type Accounts = InferSelectModel<typeof accountsTable>;

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

export type Transactions = InferSelectModel<typeof transactionsTable>;
