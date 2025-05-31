import { TransactionsDao } from "@/lib/dao/transactions";
import { DateString } from "@/lib/date";
import { Account } from "@/lib/db/schema/accounts";
import { Database } from "@/lib/types";

interface GetHistoricalNetWorthRequest {
  db: Database;
  accountId?: Account["id"];
}

type GetHistoricalNetWorthResponse = Array<{
  netWorthInCents: number;
  date: DateString;
}>;

export async function getHistoricalNetWorth({
  db,
  accountId,
}: GetHistoricalNetWorthRequest): Promise<GetHistoricalNetWorthResponse> {
  const transactionsTotalByDate = await TransactionsDao.listTransactionsByDate(
    db,
    {
      accountId,
    }
  );

  let cumulativeValueInCents = 0;

  const historicalValues = transactionsTotalByDate.map((transactionsTotal) => {
    cumulativeValueInCents += transactionsTotal.total;

    return {
      date: transactionsTotal.date,
      netWorthInCents: cumulativeValueInCents,
    };
  });

  return historicalValues;
}
