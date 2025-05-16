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

  const historicalValues = transactions;

  securities.forEach((value, date) => {
    historicalValues.set(date, (historicalValues.get(date) || 0) + value);
  });

  return Array.from(historicalValues.entries()).map(([date, valueInCents]) => ({
    date,
    valueInCents,
  }));
}
