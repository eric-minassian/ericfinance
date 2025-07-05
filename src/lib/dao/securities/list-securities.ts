import { Account } from "@/lib/db/schema/accounts";
import { Security, securitiesTable } from "@/lib/db/schema/securities";
import { Database } from "@/lib/types";
import { eq } from "drizzle-orm";

export interface ListSecuritiesParams {
  accountId?: Account["id"];
}

export interface ListSecuritiesResult {
  id: Security["id"];
  amount: Security["amount"];
  date: Security["date"];
  ticker: Security["ticker"];
}

export async function listSecurities(
  db: Database,
  { accountId }: ListSecuritiesParams
): Promise<ListSecuritiesResult[]> {
  return await db
    .select({
      id: securitiesTable.id,
      amount: securitiesTable.amount,
      date: securitiesTable.date,
      ticker: securitiesTable.ticker,
    })
    .from(securitiesTable)
    .where(accountId ? eq(securitiesTable.accountId, accountId) : undefined);
}
