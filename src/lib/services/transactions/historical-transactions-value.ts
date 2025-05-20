// TODO: FIX

import { transactionsTable } from "@/lib/db/schema/transactions";
import { Database } from "@/lib/types";
import { asc, sum } from "drizzle-orm";

type HistoricalTransactionsValueRequest = {
  db: Database;
};

type HistoricalTransactionsValueResponse = Map<Date, number>;

export async function historicalTransactionsValue({
  db,
}: HistoricalTransactionsValueRequest): Promise<HistoricalTransactionsValueResponse> {
  const dailySummaries = await db
    .select({
      date: transactionsTable.date,
      valueInCents: sum(transactionsTable.amount),
    })
    .from(transactionsTable)
    .groupBy(transactionsTable.date)
    .orderBy(asc(transactionsTable.date));

  let cumulativeValueInCents = 0;

  const historicalValues: HistoricalTransactionsValueResponse = new Map();
  dailySummaries.forEach((dailySummary) => {
    const dailyValueInCents = Number(dailySummary.valueInCents) || 0;
    cumulativeValueInCents += dailyValueInCents;
    historicalValues.set(dailySummary.date, cumulativeValueInCents);
  });

  return historicalValues;
}
