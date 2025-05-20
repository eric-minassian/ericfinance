import { Account } from "@/lib/db/schema/accounts";
import { transactionsTable } from "@/lib/db/schema/transactions";
import { Database } from "@/lib/types";
import { asc, eq, sum } from "drizzle-orm";

interface GetHistoricalNetWorthRequest {
  db: Database;
  accountId?: Account["id"];
}

type GetHistoricalNetWorthResponse = Array<{
  netWorthInCents: number;
  date: string;
}>;

export async function getHistoricalNetWorth({
  db,
  accountId,
}: GetHistoricalNetWorthRequest): Promise<GetHistoricalNetWorthResponse> {
  const transactionsTotalByDate = await db
    .select({
      date: transactionsTable.date,
      total: sum(transactionsTable.amount),
    })
    .from(transactionsTable)
    .where(accountId ? eq(transactionsTable.accountId, accountId) : undefined)
    .groupBy(transactionsTable.date)
    .orderBy(asc(transactionsTable.date));

  let cumulativeValueInCents = 0;

  const historicalValues = transactionsTotalByDate.map((transactionsTotal) => {
    const change = Number(transactionsTotal.total) || 0;
    cumulativeValueInCents += change;

    return {
      date: transactionsTotal.date.toISOString(),
      netWorthInCents: cumulativeValueInCents,
    };
  });

  return historicalValues;
}
