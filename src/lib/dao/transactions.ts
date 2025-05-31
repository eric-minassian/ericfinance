import { and, asc, eq, inArray, InferInsertModel } from "drizzle-orm";
import { DateString } from "../date";
import { Transaction, transactionsTable } from "../db/schema/transactions";
import { Database } from "../types";

interface ListTransactionsByDateResponseBase {
  date: DateString;
  total: number;
}
interface ListTransactionsByDateResponseWithTransactions
  extends ListTransactionsByDateResponseBase {
  transactions: Pick<Transaction, "id" | "amount" | "payee" | "categoryId">[];
}

export type ListTransactionsByDateResponse =
  | ListTransactionsByDateResponseWithTransactions
  | ListTransactionsByDateResponseBase;

export class TransactionsDao {
  static async listTransactions(
    db: Database,
    {
      accountId,
      transactionIds,
    }: { accountId?: string; transactionIds?: Transaction["id"][] }
  ) {
    const result = await db
      .select({
        id: transactionsTable.id,
        date: transactionsTable.date,
        amount: transactionsTable.amount,
        payee: transactionsTable.payee,
        notes: transactionsTable.notes,
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

    return result.map((row) => ({
      ...row,
      date: DateString.fromString(row.date),
    }));
  }

  static async insertTransactions(
    db: Database,
    {
      transactions,
    }: {
      transactions: (Omit<
        InferInsertModel<typeof transactionsTable>,
        "date"
      > & {
        date: DateString;
      })[];
    }
  ) {
    if (transactions.length === 0) {
      return [];
    }

    const validTransactions = transactions.map((transaction) => ({
      ...transaction,
      date: transaction.date.toISOString(),
    }));

    return await db
      .insert(transactionsTable)
      .values(validTransactions)
      .returning({
        id: transactionsTable.id,
      });
  }
}
