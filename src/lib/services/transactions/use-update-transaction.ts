import { queryClient } from "@/context/query";
import { useDB } from "@/hooks/db";
import { Transaction, transactionsTable } from "@/lib/db/schema/transactions";
import { useMutation } from "@tanstack/react-query";
import { eq } from "drizzle-orm";

interface UpdateTransactionParams {
  transactionId: Transaction["id"];
  categoryId: Transaction["categoryId"];
}

export function useUpdateTransaction() {
  const { db } = useDB();
  if (!db) throw new Error("Database is not initialized");

  return useMutation({
    mutationFn: async ({ transactionId, categoryId }: UpdateTransactionParams) => {
      await db
        .update(transactionsTable)
        .set({ categoryId })
        .where(eq(transactionsTable.id, transactionId));
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["listTransactions"] });
      queryClient.invalidateQueries({ queryKey: ["listTransactionsByDate"] });
      queryClient.invalidateQueries({ queryKey: ["getTotalFilteredTransactions"] });
    },
  });
}
