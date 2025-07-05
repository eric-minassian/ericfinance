import { useDB } from "@/hooks/db";
import { listTransactionsByDate } from "@/lib/dao/transactions/list-transactions-by-date";
import { DateString } from "@/lib/date";
import { Account } from "@/lib/db/schema/accounts";
import { Database } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

interface GetNetWorthParams {
  accountId?: Account["id"];
}

interface ListNetWorthResult {
  date: DateString;
  newtWorth: number;
}

export async function listNetWorthService(
  db: Database,
  params: GetNetWorthParams
): Promise<ListNetWorthResult[]> {
  const transactionsTotalByDate = await listTransactionsByDate(db, {
    accountId: params.accountId,
  });

  let cumulativeValueInCents = 0;

  const historicalValues = transactionsTotalByDate.map((transactionsTotal) => {
    cumulativeValueInCents += transactionsTotal.total;

    return {
      date: transactionsTotal.date,
      newtWorth: cumulativeValueInCents,
    };
  });

  return historicalValues;
}

export function useListNetWorth(params: GetNetWorthParams) {
  const { db } = useDB();
  if (!db) throw new Error("Database is not initialized");

  return useQuery({
    queryKey: ["listNetWorth", params.accountId],
    queryFn: async () => listNetWorthService(db, params),
  });
}
