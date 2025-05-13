import { SQLJsDatabase } from "drizzle-orm/sql-js";
import { schema } from "./db/schema";

export type Database = SQLJsDatabase<typeof schema>;
