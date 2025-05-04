import { createId } from "@paralleldrive/cuid2";
import { sql, type InferSelectModel } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { z } from "zod";

export const importsTable = sqliteTable("imports", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  createdAt: int("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

export const importSchema = z.object({
  id: z.string().cuid2(),
  createdAt: z.date(),
});
export type Import = InferSelectModel<typeof importsTable>;
