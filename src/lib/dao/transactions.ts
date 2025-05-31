import {
  and,
  asc,
  eq,
  gte,
  inArray,
  InferInsertModel,
  lte,
  sql,
  sum,
} from "drizzle-orm";
import { DateString } from "../date";
import { Category } from "../db/schema/categories";
import { Transaction, transactionsTable } from "../db/schema/transactions";
import { Database } from "../types";

export class TransactionsDao {
  static async listTransactionsByDate(
    db: Database,
    {
      accountId,
      startDate,
      endDate,
      categoryId,
    }: {
      accountId?: string;
      startDate?: DateString;
      endDate?: DateString;
      categoryId?: Category["id"];
    }
  ) {
    const result = await db
      .select({
        date: transactionsTable.date,
        transactions: sql<string>`json_group_array(
              json_object(
                'id', ${transactionsTable.id},
                'amount', ${transactionsTable.amount},
                'payee', ${transactionsTable.payee},
                'categoryId', ${transactionsTable.categoryId}
              )
            )`,
        total: sum(transactionsTable.amount),
      })
      .from(transactionsTable)
      .where(
        and(
          accountId ? eq(transactionsTable.accountId, accountId) : undefined,
          startDate
            ? gte(transactionsTable.date, startDate.toString())
            : undefined,
          endDate ? lte(transactionsTable.date, endDate.toString()) : undefined,
          categoryId ? eq(transactionsTable.categoryId, categoryId) : undefined
        )
      )
      .groupBy(transactionsTable.date)
      .orderBy(asc(transactionsTable.date));

    return result.map((row) => ({
      date: DateString.fromString(row.date),
      transactions: JSON.parse(row.transactions) as Pick<
        Transaction,
        "id" | "amount" | "payee" | "categoryId"
      >[],
      total: row.total ? Number(row.total) : 0,
    }));
  }

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
