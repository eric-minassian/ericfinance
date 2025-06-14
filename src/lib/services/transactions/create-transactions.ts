import { queryClient } from "@/context/query";
import { useDB } from "@/hooks/db";
import { importsTable } from "@/lib/db/schema/imports";
import {
  InsertTransaction,
  transactionsTable,
} from "@/lib/db/schema/transactions";
import { useMutation } from "@tanstack/react-query";

export function useCreateTransactions() {
  const { db } = useDB();
  if (!db) throw new Error("Database is not initialized");

  return useMutation({
    mutationFn: async (transactions: InsertTransaction[]) => {
      await db.transaction(async (tx) => {
        const [{ insertId }] = await tx
          .insert(importsTable)
          .values({})
          .returning({ insertId: importsTable.id });

        await tx.insert(transactionsTable).values(
          transactions.map((transaction) => ({
            ...transaction,
            importId: insertId,
          }))
        );
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listTransactions"] });
    },
  });
}
