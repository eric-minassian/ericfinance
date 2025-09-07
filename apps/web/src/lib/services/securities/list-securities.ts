import { useDB } from "@/hooks/db";
import {
  listSecurities,
  ListSecuritiesParams,
  ListSecuritiesResult,
} from "@/lib/dao/securities/list-securities";
import { Account } from "@/lib/db/schema/accounts";
import { Database } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

interface UseListSecuritiesProps {
  accountId?: Account["id"];
}

export async function listSecuritiesService(
  db: Database,
  params: ListSecuritiesParams
): Promise<ListSecuritiesResult[]> {
  return listSecurities(db, params);
}

export function useListSecurities({ accountId }: UseListSecuritiesProps) {
  const { db } = useDB();
  if (!db) throw new Error("Database is not initialized");

  return useQuery({
    queryKey: ["listSecurities", accountId],
    queryFn: async () => listSecuritiesService(db, { accountId }),
  });
}
