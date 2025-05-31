import { TransactionsDao } from "@/lib/dao/transactions";
import { DateString } from "@/lib/date";
import { Account } from "@/lib/db/schema/accounts";
import { Transaction } from "@/lib/db/schema/transactions";
import { Database } from "@/lib/types";

interface ListTransactionsGroupedByDateRequest {
  db: Database;
  accountId?: Account["id"];
}

type ListTransactionsGroupedByDateResponse = Array<{
  date: DateString;
  transactions: Array<TransactionDetails>;
  total: number;
}>;

type TransactionDetails = Pick<
  Transaction,
  "id" | "amount" | "payee" | "categoryId"
>;

export async function listTransactionsGroupedByDate({
  db,
  accountId,
}: ListTransactionsGroupedByDateRequest): Promise<ListTransactionsGroupedByDateResponse> {
  return await TransactionsDao.listTransactionsByDate(db, { accountId });
}
