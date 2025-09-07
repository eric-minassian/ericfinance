import { type InferSelectModel } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { z } from "zod";

export const settingsTable = sqliteTable("settings", {
  alphaVantageKey: text("alpha_vantage_key"),
});

export const settingsSchema = z.object({
  alphaVantageKey: z.string(),
});
export type Setting = InferSelectModel<typeof settingsTable>;
