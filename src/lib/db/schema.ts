import { createId } from "@paralleldrive/cuid2";
import { type InferSelectModel } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { z } from "zod";

export const accountsTable = sqliteTable("accounts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  name: text("name").notNull(),
});

export const accountSchema = z.object({
  id: z.string().cuid2(),
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters long" }),
});
export type Account = InferSelectModel<typeof accountsTable>;

export const transactionsTable = sqliteTable("transactions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  accountId: text("account_id")
    .notNull()
    .references(() => accountsTable.id, { onDelete: "cascade" }),

  amount: int("amount").notNull(),
  date: int("date", { mode: "timestamp" }).notNull(),
  payee: text("payee").notNull(),
  notes: text("notes"),
});

export const transactionSchema = z.object({
  id: z.string().cuid2(),
  accountId: z.string().cuid2(),
  amount: z.number().int(),
  date: z.date(),
  payee: z.string(),
  notes: z.string().optional(),
});
export type Transactions = InferSelectModel<typeof transactionsTable>;
