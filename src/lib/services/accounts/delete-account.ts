import { queryClient } from "@/context/query";
import { useDB } from "@/hooks/db";
import { Account, accountsTable } from "@/lib/db/schema/accounts";
import { Database } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";
import { eq } from "drizzle-orm";

interface DeleteAccountParams {
  accountId: Account["id"];
}

export async function deleteAccount(db: Database, params: DeleteAccountParams) {
  await db.delete(accountsTable).where(eq(accountsTable.id, params.accountId));
  return;
}

export function useDeleteAccount() {
  const { db } = useDB();
  if (!db) {
    throw new Error("Database connection is not available");
  }

  return useMutation({
    mutationFn: async (params: DeleteAccountParams) =>
      deleteAccount(db, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listAccounts"] });
    },
  });
}
