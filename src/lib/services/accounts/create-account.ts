import { queryClient } from "@/context/query";
import { useDB } from "@/hooks/db";
import { Account, accountsTable } from "@/lib/db/schema/accounts";
import { useMutation } from "@tanstack/react-query";

type CreateAccountParams = Pick<Account, "name" | "variant">;

export function useCreateAccount() {
  const { db } = useDB();
  if (!db) {
    throw new Error("Database connection is not available");
  }

  return useMutation({
    mutationFn: async (params: CreateAccountParams) => {
      const [createdAccount] = await db
        .insert(accountsTable)
        .values(params)
        .returning({ id: accountsTable.id });

      return createdAccount;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listAccounts"] });
    },
  });
}
