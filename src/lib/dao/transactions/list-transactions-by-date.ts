import { DateString } from "@/lib/date";
import { Category } from "@/lib/db/schema/categories";
import { Transaction, transactionsTable } from "@/lib/db/schema/transactions";
import { Database } from "@/lib/types";
import { and, asc, desc, eq, gte, lte, sql, sum } from "drizzle-orm";

type Options = {
  accountId?: string;
  startDate?: DateString;
  endDate?: DateString;
  categoryId?: Category["id"];
  page?: number;
  pageSize?: number;
  order?: "asc" | "desc";
  includeTransactions?: boolean;
};

type ReturnWithoutTransactions = {
  date: DateString;
  total: number;
};
type ReturnWithTransactions = ReturnWithoutTransactions & {
  transactions: Pick<Transaction, "id" | "amount" | "payee" | "categoryId">[];
};
type Return<T extends boolean | undefined> = (T extends true
  ? ReturnWithTransactions
  : ReturnWithoutTransactions)[];

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
  }: Options
): Promise<Return<T>> {
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
    date: DateString.fromString(row.date),
    total: row.total ? Number(row.total) : 0,
    transactions: row.transactions ? JSON.parse(row.transactions) : undefined,
  })) as Return<T>;
}
