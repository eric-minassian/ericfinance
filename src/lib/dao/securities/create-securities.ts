import { InsertSecurity, securitiesTable } from "@/lib/db/schema/securities";
import { Database } from "@/lib/types";

export interface CreateSecuritiesParams {
  securities: InsertSecurity[];
}

export async function createSecurities(
  db: Database,
  { securities }: CreateSecuritiesParams
): Promise<void> {
  await db.insert(securitiesTable).values(securities);
}
