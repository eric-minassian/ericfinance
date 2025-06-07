import { TransactionsDao } from "@/lib/dao/transactions";
import { DateString } from "@/lib/date";
import { Account } from "@/lib/db/schema/accounts";
import { Transaction } from "@/lib/db/schema/transactions";
import { Database } from "@/lib/types";

interface ListTransactionsRequest {
  db: Database;
  accountId?: Account["id"];
  transactionIds?: Transaction["id"][];
}

type ListTransactionsResponse = Array<
  Pick<Transaction, "id" | "amount" | "payee" | "categoryId" | "rawData"> & {
    date: DateString;
  }
>;

export async function listTransactions({
  db,
  accountId,
  transactionIds,
}: ListTransactionsRequest): Promise<ListTransactionsResponse> {
  return await TransactionsDao.listTransactions(db, {
    accountId,
    transactionIds,
  });
}
