import { queryClient } from "@/context/query";
import { useDB } from "@/hooks/db";
import {
  updateTransaction,
  UpdateTransactionParams,
} from "@/lib/dao/transactions/update-transaction";
import { Database } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";

export async function updateTransactionService(
  db: Database,
  params: UpdateTransactionParams
): Promise<void> {
  await updateTransaction(db, params);
  // Invalidate related queries
  queryClient.invalidateQueries({
    queryKey: ["listTransactionsGroupedByDate"],
  });
  queryClient.invalidateQueries({
    queryKey: ["infiniteListTransactionsGroupedByDate"],
  });
  queryClient.invalidateQueries({ queryKey: ["totalFilteredTransactions"] });
}

export function useUpdateTransaction() {
  const { db } = useDB();
  if (!db) {
    throw new Error("Database connection is not available");
  }

  return useMutation({
    mutationFn: async (params: UpdateTransactionParams) =>
      updateTransactionService(db, params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["listTransactionsGroupedByDate"],
      });
      queryClient.invalidateQueries({
        queryKey: ["infiniteListTransactionsGroupedByDate"],
      });
      queryClient.invalidateQueries({
        queryKey: ["totalFilteredTransactions"],
      });
      queryClient.invalidateQueries({ queryKey: ["infiniteListTransactions"] });
    },
  });
}
