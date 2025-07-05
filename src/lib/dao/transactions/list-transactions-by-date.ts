import { DateString } from "@/lib/date";
import { Category } from "@/lib/db/schema/categories";
import { Transaction, transactionsTable } from "@/lib/db/schema/transactions";
import { Database } from "@/lib/types";
import { and, asc, desc, eq, gte, lte, sql, sum } from "drizzle-orm";

export interface ListTransactionsByDateParams {
  accountId?: string;
  startDate?: DateString;
  endDate?: DateString;
  categoryId?: Category["id"];
  page?: number;
  pageSize?: number;
  order?: "asc" | "desc";
  includeTransactions?: boolean;
}

export interface TransactionsByDateWithoutTransactions {
  date: DateString;
  total: number;
}

export interface TransactionsByDateWithTransactions
  extends TransactionsByDateWithoutTransactions {
  transactions: Pick<Transaction, "id" | "amount" | "payee" | "categoryId">[];
}

export type ListTransactionsByDateResult<T extends boolean | undefined> =
  (T extends true
    ? TransactionsByDateWithTransactions
    : TransactionsByDateWithoutTransactions)[];

export async function listTransactionsByDate<T extends boolean | undefined>(
  db: Database,
  {
    accountId,
    startDate,
    endDate,
    categoryId,
    page,
    pageSize,
    order = "asc",
    includeTransactions,
  }: ListTransactionsByDateParams
): Promise<ListTransactionsByDateResult<T>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectFields: Record<string, any> = {
    date: transactionsTable.date,
    total: sum(transactionsTable.amount),
  };
  if (includeTransactions) {
    selectFields.transactions = sql<string>`json_group_array(
        json_object(
            'id', ${transactionsTable.id},
            'amount', ${transactionsTable.amount},
            'payee', ${transactionsTable.payee},
            'categoryId', ${transactionsTable.categoryId}
        )
    )`;
  }

  const query = db
    .select(selectFields)
    .from(transactionsTable)
    .where(
      and(
        accountId ? eq(transactionsTable.accountId, accountId) : undefined,
        startDate ? gte(transactionsTable.date, startDate) : undefined,
        endDate ? lte(transactionsTable.date, endDate) : undefined,
        categoryId ? eq(transactionsTable.categoryId, categoryId) : undefined
      )
    )
    .groupBy(transactionsTable.date)
    .orderBy(
      order === "asc"
        ? asc(transactionsTable.date)
        : desc(transactionsTable.date)
    );

  if (pageSize) query.limit(pageSize);
  if (page && pageSize) query.offset((page - 1) * pageSize);
  const result = await query;

  return result.map((row) => ({
    date: row.date,
    total: row.total ? Number(row.total) : 0,
    transactions: row.transactions ? JSON.parse(row.transactions) : undefined,
  })) as ListTransactionsByDateResult<T>;
}
