import { Account } from "@/lib/db/schema/accounts";
import { transactionsTable } from "@/lib/db/schema/transactions";
import { Database } from "@/lib/types";
import { eq, sum } from "drizzle-orm";

export interface GetTransactionsAccountBalanceParams {
  accountId: Account["id"];
}

export async function getTransactionsAccountBalance(
  db: Database,
  { accountId }: GetTransactionsAccountBalanceParams
): Promise<number> {
  const result = await db
    .select({
      balance: sum(transactionsTable.amount),
    })
    .from(transactionsTable)
    .where(eq(transactionsTable.accountId, accountId));

  return result[0]?.balance ? Number(result[0].balance) : 0;
}
