import { createId } from "@paralleldrive/cuid2";
import { z } from "@zod/mini";
import { type InferSelectModel } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const accountsTable = sqliteTable("accounts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  name: text("name").notNull(),
});

export const accountsSchema = z.object({
  id: z.cuid2(),
  name: z.string().check(z.minLength(1, { error: "Account name is required" })),
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

export const transactionsSchema = z.object({
  id: z.cuid2(),
  accountId: z.cuid2(),
  amount: z
    .number()
    .check(z.minimum(0, { error: "Amount must be a positive number" })),
  date: z.date({ error: "Date is required" }),
  payee: z.string().check(z.minLength(1, { error: "Payee is required" })),
  notes: z.optional(z.string()),
});
export type Transactions = InferSelectModel<typeof transactionsTable>;
