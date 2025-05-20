// TODO: FIX

import { getOnlyDateString } from "@/lib/date";
import { Database } from "@/lib/types";
import { historicalSecuritiesValue } from "../securities/historical-securities-value";
import { historicalTransactionsValue } from "../transactions/historical-transactions-value";

type HistoricalPortfolioValueRequest = {
  db: Database;
};

type HistoricalPortfolioValueResponse = Array<{
  date: Date;
  valueInCents: number;
}>;

export async function historicalPortfolioValue({
  db,
}: HistoricalPortfolioValueRequest): Promise<HistoricalPortfolioValueResponse> {
  const [transactions, securities] = await Promise.all([
    historicalTransactionsValue({ db }),
    historicalSecuritiesValue({ db }),
  ]);

  const historicalValues = new Map<string, number>(); // Use string for date keys for easier Map usage

  const latestTransactions = new Map<string, number>();
  transactions.forEach((value, date) => {
    latestTransactions.set(getOnlyDateString(date), value);
  });

  latestTransactions.forEach((value, date) => {
    historicalValues.set(date, (historicalValues.get(date) || 0) + value);
  });

  securities.forEach((value, date) => {
    historicalValues.set(
      getOnlyDateString(date),
      (historicalValues.get(getOnlyDateString(date)) || 0) + value
    );
  });

  const combinedValues = Array.from(historicalValues.entries()).map(
    ([dateString, valueInCents]) => ({
      date: new Date(dateString),
      valueInCents,
    })
  );

  combinedValues.sort((a, b) => a.date.getTime() - b.date.getTime());

  return combinedValues;

  // return Array.from(transactions.entries()).map(([date, valueInCents]) => ({
  //   date,
  //   valueInCents,
  // }));
}
