import { DateString } from "@/lib/date";
import { Category } from "@/lib/db/schema/categories";
import { transactionsTable } from "@/lib/db/schema/transactions";
import { Database } from "@/lib/types";
import { and, asc, desc, eq, gte, lte } from "drizzle-orm";

interface ListTransactionsProps {
  accountId?: string;
  startDate?: DateString;
  endDate?: DateString;
  categoryId?: Category["id"];
  pageSize: number;
  page: number;
  order?: "asc" | "desc";
}

export async function listTransactions(
  db: Database,
  {
    accountId,
    startDate,
    endDate,
    categoryId,
    pageSize,
    page,
    order,
  }: ListTransactionsProps
) {
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
        startDate ? gte(transactionsTable.date, startDate) : undefined,
        endDate ? lte(transactionsTable.date, endDate) : undefined,
        categoryId ? eq(transactionsTable.categoryId, categoryId) : undefined
      )
    )
    .limit(pageSize)
    .offset(page * pageSize)
    .orderBy(
      order === "asc"
        ? asc(transactionsTable.date)
        : desc(transactionsTable.date)
    );
}
