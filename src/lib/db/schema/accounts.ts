import { createId } from "@paralleldrive/cuid2";
import { type InferSelectModel } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
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
