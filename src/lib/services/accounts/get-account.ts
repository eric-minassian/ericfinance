import { useDB } from "@/hooks/db";
import {
  getAccount,
  GetAccountParams,
  GetAccountResult,
} from "@/lib/dao/accounts/get-account";
import { Database } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

export async function getAccountService(
  db: Database,
  params: GetAccountParams
): Promise<GetAccountResult | null> {
  return getAccount(db, params);
}

export function useGetAccount(params: GetAccountParams) {
  const { db } = useDB();
  if (!db) throw new Error("Database is not initialized");

  return useQuery({
    queryKey: ["getAccount", params],
    queryFn: async () => getAccountService(db, params),
  });
}
