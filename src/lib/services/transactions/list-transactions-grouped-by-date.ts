import { Account } from "@/lib/db/schema/accounts";
import { Transaction, transactionsTable } from "@/lib/db/schema/transactions";
import { Database } from "@/lib/types";
import { desc, eq, sql, sum } from "drizzle-orm";

interface ListTransactionsGroupedByDateRequest {
  db: Database;
  accountId?: Account["id"];
}

type ListTransactionsGroupedByDateResponse = Array<{
  date: Date;
  transactions: Array<TransactionDetails>;
  total: number;
}>;

type TransactionDetails = Pick<Transaction, "id" | "amount" | "payee">;

export async function listTransactionsGroupedByDate({
  db,
  accountId,
}: ListTransactionsGroupedByDateRequest): Promise<ListTransactionsGroupedByDateResponse> {
  const results = await db
    .select({
      date: transactionsTable.date,
      total: sum(transactionsTable.amount).mapWith(Number),
      transactions: sql<string>`json_group_array(
        json_object(
          'id', ${transactionsTable.id},
          'amount', ${transactionsTable.amount},
          'payee', ${transactionsTable.payee}
        )
      )`,
    })
    .from(transactionsTable)
    .where(accountId ? eq(transactionsTable.accountId, accountId) : undefined)
    .groupBy(transactionsTable.date)
    .orderBy(desc(transactionsTable.date));

  return results.map((row) => ({
    ...row,
    transactions: JSON.parse(row.transactions),
  }));
}
