import { queryClient } from "@/context/query";
import { useDB } from "@/hooks/db";
import { Account, accountsTable } from "@/lib/db/schema/accounts";
import { useMutation } from "@tanstack/react-query";
import { eq } from "drizzle-orm";

export function useDeleteAccount() {
  const { db } = useDB();
  if (!db) throw new Error("Database is not initialized");

  return useMutation({
    mutationFn: async (accountId: Account["id"]) => {
      await db.delete(accountsTable).where(eq(accountsTable.id, accountId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listAccounts"] });
    },
  });
}
