import { queryClient } from "@/context/query";
import { useDB } from "@/hooks/db";
import { createTransactions } from "@/lib/dao/transactions/create-transactions";
import { importsTable } from "@/lib/db/schema/imports";
import { InsertTransaction } from "@/lib/db/schema/transactions";
import { Database } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";

export async function createTransactionsService(
  db: Database,
  transactions: InsertTransaction[]
): Promise<void> {
  await db.transaction(async (tx) => {
    const [{ insertId }] = await tx
      .insert(importsTable)
      .values({})
      .returning({ insertId: importsTable.id });

    await createTransactions(tx, {
      transactions: transactions.map((transaction) => ({
        ...transaction,
        importId: insertId,
      })),
    });
  });
}

export function useCreateTransactions() {
  const { db } = useDB();
  if (!db) throw new Error("Database is not initialized");

  return useMutation({
    mutationFn: async (transactions: InsertTransaction[]) =>
      createTransactionsService(db, transactions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listTransactions"] });
      queryClient.invalidateQueries({
        queryKey: ["listTransactionsGroupedByDate"],
      });
      queryClient.invalidateQueries({
        queryKey: ["infiniteListTransactionsGroupedByDate"],
      });
      queryClient.invalidateQueries({
        queryKey: ["totalFilteredTransactions"],
      });
      queryClient.invalidateQueries({ queryKey: ["listNetWorth"] });
      queryClient.invalidateQueries({ queryKey: ["getAccountBalance"] });
    },
  });
}
