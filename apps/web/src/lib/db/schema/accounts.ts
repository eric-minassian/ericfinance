import { createId } from "@paralleldrive/cuid2";
import { type InferSelectModel } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { z } from "zod";
import { lifecycleDates } from "./utils";

export const accountsTable = sqliteTable("accounts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  name: text("name").notNull(),
  variant: text("variant", { enum: ["transactions", "securities"] })
    .notNull()
    .default("transactions"),
  ...lifecycleDates,
});

export const accountSchema = z.object({
  id: z.string().cuid2(),
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters long" }),
  variant: z.enum(["transactions", "securities"]),
});
export type Account = InferSelectModel<typeof accountsTable>;
