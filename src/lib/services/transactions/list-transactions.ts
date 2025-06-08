import { useDB } from "@/hooks/db";
import { Account } from "@/lib/db/schema/accounts";
import { transactionsTable } from "@/lib/db/schema/transactions";
import { useQuery } from "@tanstack/react-query";
import { eq } from "drizzle-orm";

interface UseListTransactionsProps {
  accountId?: Account["id"];
}

export function useListTransactions({ accountId }: UseListTransactionsProps) {
  const { db } = useDB();
  if (!db) throw new Error("Database is not initialized");

  return useQuery({
    queryKey: ["listTransactions", accountId],
    queryFn: async () => {
      return await db
        .select({
          id: transactionsTable.id,
          amount: transactionsTable.amount,
          date: transactionsTable.date,
          payee: transactionsTable.payee,
        })
        .from(transactionsTable)
        .where(
          accountId ? eq(transactionsTable.accountId, accountId) : undefined
        );
    },
  });
}
