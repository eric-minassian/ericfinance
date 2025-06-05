import { useDB } from "@/hooks/db";
import { listAccounts } from "@/lib/dao/accounts/list-accounts";
import { useQuery } from "@tanstack/react-query";

export function useListAccounts() {
  const { db } = useDB();

  if (!db) {
    throw new Error("Database is not initialized");
  }

  return useQuery({
    queryKey: ["listAccounts"],
    queryFn: () => listAccounts(db),
  });
}
