import { useDB } from "@/hooks/db";
import {
  getTotalFilteredTransactions,
  GetTotalFilteredTransactionsParams,
} from "@/lib/dao/transactions/get-total-filtered-transactions";
import { DateString } from "@/lib/date";
import { Account } from "@/lib/db/schema/accounts";
import { Category } from "@/lib/db/schema/categories";
import { Database } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

interface UseTotalFilteredTransactionsProps {
  accountId?: Account["id"];
  startDate?: DateString;
  endDate?: DateString;
  categoryId?: Category["id"];
  enabled?: boolean;
}

export async function getTotalFilteredTransactionsService(
  db: Database,
  params: GetTotalFilteredTransactionsParams
): Promise<number> {
  return getTotalFilteredTransactions(db, params);
}

export function useTotalFilteredTransactions({
  accountId,
  startDate,
  endDate,
  categoryId,
  enabled = true,
}: UseTotalFilteredTransactionsProps) {
  const { db } = useDB();

  if (!db) {
    throw new Error("Database is not initialized");
  }

  return useQuery({
    queryKey: [
      "totalFilteredTransactions",
      accountId,
      startDate,
      endDate,
      categoryId,
    ],
    queryFn: async () => {
      return getTotalFilteredTransactionsService(db, {
        accountId,
        startDate,
        endDate,
        categoryId,
      });
    },
    enabled: enabled && db !== null,
  });
}
