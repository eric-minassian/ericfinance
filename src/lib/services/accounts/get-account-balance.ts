import { useDB } from "@/hooks/db";
import { getTransactionsAccountBalance } from "@/lib/dao/accounts/get-transactions-account-balance";
import { Account } from "@/lib/db/schema/accounts";
import { useQuery } from "@tanstack/react-query";

interface UseGetAccountBalanceProps {
  accountId: Account["id"];
  accountVariant: Account["variant"];
}

export function useGetAccountBalance({
  accountId,
  accountVariant,
}: UseGetAccountBalanceProps) {
  const { db } = useDB();

  if (!db) {
    throw new Error("Database is not initialized");
  }

  return useQuery({
    queryKey: ["getAccountBalance", accountId, accountVariant],
    queryFn: async () => {
      switch (accountVariant) {
        case "transactions":
          return await getTransactionsAccountBalance(db, { accountId });
        case "securities":
          return 23;
        default:
          throw new Error(`Unsupported account variant: ${accountVariant}`);
      }
    },
  });
}
