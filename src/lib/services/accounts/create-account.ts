import { queryClient } from "@/context/query";
import { useDB } from "@/hooks/db";
import {
  createAccount,
  CreateAccountParams,
  CreateAccountResult,
} from "@/lib/dao/accounts/create-account";
import { Database } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";

export async function createAccountService(
  db: Database,
  params: CreateAccountParams
): Promise<CreateAccountResult> {
  return createAccount(db, params);
}

export function useCreateAccount() {
  const { db } = useDB();
  if (!db) {
    throw new Error("Database connection is not available");
  }

  return useMutation({
    mutationFn: async (params: CreateAccountParams) =>
      createAccountService(db, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listAccounts"] });
    },
  });
}
