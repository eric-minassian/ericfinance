import { DateString } from "@/lib/date";
import { sql } from "drizzle-orm";
import { customType, int } from "drizzle-orm/sqlite-core";

export const lifecycleDates = {
  createdAt: int("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: int("updated_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .$onUpdate(() => sql`(unixepoch())`)
    .notNull(),
};

export const dateString = customType<{ data: DateString; driverData: string }>({
  dataType() {
    return "text";
  },
  toDriver(value) {
    return value.toISOString();
  },
  fromDriver(value) {
    return DateString.fromString(value);
  },
});
