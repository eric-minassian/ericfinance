import { queryClient } from "@/context/query";
import { useDB } from "@/hooks/db";
import {
  RuleStatement,
  ruleStatementsTable,
} from "@/lib/db/schema/rule-statements";
import { Rule, rulesTable } from "@/lib/db/schema/rules";
import { useMutation } from "@tanstack/react-query";
import { applyRules } from "./apply-rules";

interface CreateRuleParams {
  rule: Omit<Rule, "id" | "createdAt" | "updatedAt"> & {
    statements: Array<
      Omit<RuleStatement, "id" | "ruleId" | "createdAt" | "updatedAt">
    >;
  };
}

export function useCreateRule() {
  const { db } = useDB();
  if (!db) throw new Error("Database is not initialized");

  return useMutation({
    mutationFn: async ({ rule }: CreateRuleParams) => {
      const { statements, ...ruleData } = rule;

      await db.transaction(async (tx) => {
        const [newRule] = await tx
          .insert(rulesTable)
          .values(ruleData)
          .returning({ id: rulesTable.id });

        await tx.insert(ruleStatementsTable).values(
          statements.map((statement) => ({
            ...statement,
            ruleId: newRule.id,
          }))
        );
      });

      await applyRules({ db });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listRules"] });
    },
  });
}
