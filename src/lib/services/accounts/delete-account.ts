import { queryClient } from "@/context/query";
import { useDB } from "@/hooks/db";
import {
  deleteAccount,
  DeleteAccountParams,
} from "@/lib/dao/accounts/delete-account";
import { Database } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";

export async function deleteAccountService(
  db: Database,
  params: DeleteAccountParams
): Promise<void> {
  return deleteAccount(db, params);
}

export function useDeleteAccount() {
  const { db } = useDB();
  if (!db) {
    throw new Error("Database connection is not available");
  }

  return useMutation({
    mutationFn: async (params: DeleteAccountParams) =>
      deleteAccountService(db, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listAccounts"] });
    },
  });
}
