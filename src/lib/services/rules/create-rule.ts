import { useDB } from "@/hooks/db";
import {
  createRule,
  CreateRuleParams,
  CreateRuleResult,
} from "@/lib/dao/rules/create-rule";
import { Database } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export async function createRuleService(
  db: Database,
  params: CreateRuleParams
): Promise<CreateRuleResult> {
  return await createRule(db, params);
}

export function useCreateRule() {
  const { db } = useDB();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateRuleParams) => {
      if (!db) throw new Error("Database not available");
      return await createRuleService(db, params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
    },
  });
}
