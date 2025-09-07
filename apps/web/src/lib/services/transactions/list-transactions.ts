import { useDB } from "@/hooks/db";
import {
  listTransactions,
  ListTransactionsParams,
  ListTransactionsResult,
} from "@/lib/dao/transactions/list-transactions";
import { Account } from "@/lib/db/schema/accounts";
import { Database } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

interface UseListTransactionsProps {
  accountId?: Account["id"];
}

export async function listTransactionsService(
  db: Database,
  params: ListTransactionsParams
): Promise<ListTransactionsResult[]> {
  return listTransactions(db, params);
}

export function useListTransactions({ accountId }: UseListTransactionsProps) {
  const { db } = useDB();
  if (!db) throw new Error("Database is not initialized");

  return useQuery({
    queryKey: ["listTransactions", accountId],
    queryFn: async () => listTransactionsService(db, { accountId }),
  });
}
