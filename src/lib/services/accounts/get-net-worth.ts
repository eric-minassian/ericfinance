import { useDB } from "@/hooks/db";
import { listTransactionsByDate } from "@/lib/dao/transactions/list-transactions-by-date";
import { Account } from "@/lib/db/schema/accounts";
import { useQuery } from "@tanstack/react-query";

interface UseListNetWorthProps {
  accountId?: Account["id"];
}

export function useListNetWorth({ accountId }: UseListNetWorthProps) {
  const { db } = useDB();
  if (!db) throw new Error("Database is not initialized");

  return useQuery({
    queryKey: ["listNetWorth", accountId],
    queryFn: async () => {
      const transactionsTotalByDate = await listTransactionsByDate(db, {
        accountId,
      });

      let cumulativeValueInCents = 0;

      const historicalValues = transactionsTotalByDate.map(
        (transactionsTotal) => {
          cumulativeValueInCents += transactionsTotal.total;

          return {
            date: transactionsTotal.date,
            newtWorth: cumulativeValueInCents,
          };
        }
      );

      return historicalValues;
    },
  });
}
