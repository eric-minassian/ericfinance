import { InferSelectModel } from "drizzle-orm";
import { int, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const securityPricesTable = sqliteTable(
  "security_prices",
  {
    date: text("date").notNull(),
    price: int("price").notNull(),
    ticker: text("ticker").notNull(),
  },
  (table) => [primaryKey({ columns: [table.date, table.ticker] })]
);

export type SecurityPrice = InferSelectModel<typeof securityPricesTable>;
