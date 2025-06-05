import { createId } from "@paralleldrive/cuid2";
import { type InferSelectModel } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { z } from "zod";
import { accountsTable } from "./accounts";
import { categoriesTable } from "./categories";
import { importsTable } from "./imports";
import { lifecycleDates } from "./utils";

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
  date: text("date").notNull(),
  payee: text("payee").notNull(),
  notes: text("notes"),
  rawData: text("raw_data", { mode: "json" }),
  ...lifecycleDates,
});

export const transactionSchema = z.object({
  id: z.string().cuid2(),
  accountId: z.string().cuid2(),
  importId: z.string().cuid2().optional(),
  amount: z.number().int(),
  date: z.date(),
  payee: z.string(),
  notes: z.string().optional(),
  rawData: z.string().optional(),
});
export const transactionFormSchema = z.object({
  id: z.string().cuid2(),
  accountId: z.string().cuid2(),
  importId: z.string().cuid2().optional(),
  amount: z
    .string()
    .refine(
      (val) => {
        const [int, decimal = ""] = val.split(".");
        return (
          int.length > 0 &&
          decimal.length <= 2 &&
          !isNaN(parseInt(int)) &&
          !isNaN(parseInt(decimal)) &&
          parseInt(decimal) >= 0 &&
          parseInt(decimal) <= 99
        );
      },
      { message: "Invalid amount" }
    )
    .transform((val) => {
      const [int, decimal = ""] = val.split(".");
      const decimalPad = decimal.padEnd(2, "0");
      return parseInt(int + decimalPad);
    }),
  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" })
    .transform((val) => new Date(val)),
  payee: z.string().min(1, { message: "Payee is required" }),
  notes: z.string().transform((val) => (val === "" ? undefined : val)),
  rawData: z.string().optional(),
});
export type Transaction = InferSelectModel<typeof transactionsTable>;
