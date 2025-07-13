import { useDB } from "@/hooks/db";
import {
  createRule,
  CreateRuleParams,
  CreateRuleResult,
} from "@/lib/dao/rules/create-rule";
import { Database } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { applyRules } from "./apply-rules";

export async function createRuleService(
  db: Database,
  params: CreateRuleParams
): Promise<CreateRuleResult> {
  const result = await createRule(db, params);

  await applyRules({ db });

  return result;
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
      queryClient.invalidateQueries({ queryKey: ["listRules"] });
      queryClient.invalidateQueries({ queryKey: ["listTransactions"] });
      queryClient.invalidateQueries({
        queryKey: ["listTransactionsGroupedByDate"],
      });
      queryClient.invalidateQueries({
        queryKey: ["infiniteListTransactionsGroupedByDate"],
      });
      queryClient.invalidateQueries({
        queryKey: ["totalFilteredTransactions"],
      });
    },
  });
}
