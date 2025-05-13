import { createId } from "@paralleldrive/cuid2";
import { InferSelectModel } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const securityPricesTable = sqliteTable("security_prices", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  date: int("date", { mode: "timestamp" }).notNull(),
  price: int("price").notNull(),
  ticker: text("ticker").notNull(),
});

export type SecurityPrice = InferSelectModel<typeof securityPricesTable>;
