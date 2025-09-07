import { queryClient } from "@/context/query";
import { useDB } from "@/hooks/db";
import { deleteRule, DeleteRuleParams } from "@/lib/dao/rules/delete-rule";
import { Database } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";

export async function deleteRuleService(
  db: Database,
  params: DeleteRuleParams
): Promise<void> {
  await deleteRule(db, params);
  queryClient.invalidateQueries({ queryKey: ["listRules"] });
}

export function useDeleteRule() {
  const { db } = useDB();
  if (!db) {
    throw new Error("Database connection is not available");
  }

  return useMutation({
    mutationFn: async (params: DeleteRuleParams) =>
      deleteRuleService(db, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listRules"] });
    },
  });
}
