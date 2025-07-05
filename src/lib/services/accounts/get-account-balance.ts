import { useDB } from "@/hooks/db";
import { getTransactionsAccountBalance } from "@/lib/dao/accounts/get-transactions-account-balance";
import { Account } from "@/lib/db/schema/accounts";
import { Database } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

interface GetAccountBalanceParams {
  accountId: Account["id"];
  accountVariant: Account["variant"];
}

export async function getAccountBalanceService(
  db: Database,
  params: GetAccountBalanceParams
): Promise<number> {
  switch (params.accountVariant) {
    case "transactions":
      return await getTransactionsAccountBalance(db, {
        accountId: params.accountId,
      });
    case "securities":
      return 23; // TODO: Implement securities balance calculation
    default:
      throw new Error(`Unsupported account variant: ${params.accountVariant}`);
  }
}

export function useGetAccountBalance(params: GetAccountBalanceParams) {
  const { db } = useDB();

  if (!db) {
    throw new Error("Database is not initialized");
  }

  return useQuery({
    queryKey: ["getAccountBalance", params.accountId, params.accountVariant],
    queryFn: async () => getAccountBalanceService(db, params),
  });
}
