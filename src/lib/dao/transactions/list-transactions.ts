import { Transaction, transactionsTable } from "@/lib/db/schema/transactions";
import { Database } from "@/lib/types";
import { and, asc, eq, inArray } from "drizzle-orm";

export interface ListTransactionsParams {
  accountId?: string;
  transactionIds?: Transaction["id"][];
}

export interface ListTransactionsResult {
  id: Transaction["id"];
  date: Transaction["date"];
  amount: Transaction["amount"];
  payee: Transaction["payee"];
  categoryId: Transaction["categoryId"];
  rawData: Transaction["rawData"];
}

export async function listTransactions(
  db: Database,
  { accountId, transactionIds }: ListTransactionsParams
): Promise<ListTransactionsResult[]> {
  return await db
    .select({
      id: transactionsTable.id,
      date: transactionsTable.date,
      amount: transactionsTable.amount,
      payee: transactionsTable.payee,
      categoryId: transactionsTable.categoryId,
      rawData: transactionsTable.rawData,
    })
    .from(transactionsTable)
    .where(
      and(
        accountId ? eq(transactionsTable.accountId, accountId) : undefined,
        transactionIds
          ? inArray(transactionsTable.id, transactionIds)
          : undefined
      )
    )
    .orderBy(asc(transactionsTable.date));
}
