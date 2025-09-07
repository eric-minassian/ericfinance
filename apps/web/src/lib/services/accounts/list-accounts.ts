import { useDB } from "@/hooks/db";
import {
  listAccounts,
  ListAccountsResult,
} from "@/lib/dao/accounts/list-accounts";
import { Database } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

export async function listAccountsService(
  db: Database
): Promise<ListAccountsResult[]> {
  return listAccounts(db);
}

export function useListAccounts() {
  const { db } = useDB();

  if (!db) {
    throw new Error("Database is not initialized");
  }

  return useQuery({
    queryKey: ["listAccounts"],
    queryFn: () => listAccountsService(db),
  });
}
