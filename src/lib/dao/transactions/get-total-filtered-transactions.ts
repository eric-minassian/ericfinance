import { DateString } from "@/lib/date";
import { Category } from "@/lib/db/schema/categories";
import { transactionsTable } from "@/lib/db/schema/transactions";
import { Database } from "@/lib/types";
import { and, eq, gte, lte, sum } from "drizzle-orm";

type Options = {
  accountId?: string;
  startDate?: DateString;
  endDate?: DateString;
  categoryId?: Category["id"];
};

export async function getTotalFilteredTransactions(
  db: Database,
  { accountId, startDate, endDate, categoryId }: Options
): Promise<number> {
  const result = await db
    .select({
      total: sum(transactionsTable.amount),
    })
    .from(transactionsTable)
    .where(
      and(
        accountId ? eq(transactionsTable.accountId, accountId) : undefined,
        startDate ? gte(transactionsTable.date, startDate) : undefined,
        endDate ? lte(transactionsTable.date, endDate) : undefined,
        categoryId ? eq(transactionsTable.categoryId, categoryId) : undefined
      )
    );

  return result[0]?.total ? Number(result[0].total) : 0;
}
