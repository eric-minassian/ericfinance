import { createId } from "@paralleldrive/cuid2";
import { type InferSelectModel } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { z } from "zod";
import { accountsTable } from "./accounts";
import { importsTable } from "./imports";

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

  date: int("date", { mode: "timestamp" }).notNull(),
  ticker: text("ticker").notNull(),
  amount: int("amount").notNull(),
  rawData: text("raw_data", { mode: "json" }),
});

export const securitiesSchema = z.object({
  id: z.string().cuid2(),
  accountId: z.string().cuid2(),
  importId: z.string().cuid2().optional(),
  date: z.date(),
  ticker: z.string().min(1, { message: "Ticker is required" }),
  amount: z.number().int(),
  rawData: z.string().optional(),
});
export type Security = InferSelectModel<typeof securitiesTable>;
