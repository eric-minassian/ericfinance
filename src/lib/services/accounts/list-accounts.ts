import { Account, accountsTable } from "@/lib/db/schema/accounts";
import { transactionsTable } from "@/lib/db/schema/transactions";
import { Database } from "@/lib/types";
import { asc, eq, sum } from "drizzle-orm";

interface ListAccountsRequest {
  db: Database;
}

type ListAccountsResponse = Array<
  Pick<Account, "id" | "name"> & {
    balance: number;
  }
>;

export async function listAccounts({
  db,
}: ListAccountsRequest): Promise<ListAccountsResponse> {
  const accounts = await db
    .select({
      id: accountsTable.id,
      name: accountsTable.name,
      balance: sum(transactionsTable.amount),
    })
    .from(accountsTable)
    .leftJoin(
      transactionsTable,
      eq(transactionsTable.accountId, accountsTable.id)
    )
    .orderBy(asc(accountsTable.name))
    .groupBy(accountsTable.id);

  return accounts.map((account) => ({
    id: account.id,
    name: account.name,
    balance: account.balance ? Number(account.balance) : 0,
  }));
}
