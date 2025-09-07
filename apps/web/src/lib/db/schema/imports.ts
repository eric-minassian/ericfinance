import { createId } from "@paralleldrive/cuid2";
import { type InferSelectModel } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { z } from "zod";
import { lifecycleDates } from "./utils";

export const importsTable = sqliteTable("imports", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  ...lifecycleDates,
});

export const importSchema = z.object({
  id: z.string().cuid2(),
  createdAt: z.date(),
});
export type Import = InferSelectModel<typeof importsTable>;
