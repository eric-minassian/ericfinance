import { Account } from "@/lib/db/schema/accounts";
import { transactionsTable } from "@/lib/db/schema/transactions";
import { Database } from "@/lib/types";
import { eq, sum } from "drizzle-orm";

type Options = {
  accountId: Account["id"];
};

type Return = number;

export async function getTransactionsAccountBalance(
  db: Database,
  { accountId }: Options
): Promise<Return> {
  const result = await db
    .select({
      balance: sum(transactionsTable.amount),
    })
    .from(transactionsTable)
    .where(eq(transactionsTable.accountId, accountId));

  return result[0]?.balance ? Number(result[0].balance) : 0;
}
