import { useDB } from "@/hooks/db";
import { listRules, ListRulesResult } from "@/lib/dao/rules/list-rules";
import { Database } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

export async function listRulesService(
  db: Database
): Promise<ListRulesResult[]> {
  return listRules(db);
}

export function useListRules() {
  const { db } = useDB();
  if (!db) {
    throw new Error("Database is not initialized");
  }

  return useQuery({
    queryKey: ["listRules"],
    queryFn: () => listRulesService(db),
  });
}
