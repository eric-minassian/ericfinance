import { queryClient } from "@/context/query";
import {
  RuleStatement,
  ruleStatementsTable,
} from "@/lib/db/schema/rule-statements";
import { Rule, rulesTable } from "@/lib/db/schema/rules";
import { Database } from "@/lib/types";
import { applyRules } from "./apply-rules";

interface CreateRuleRequest {
  db: Database;
  rule: Omit<Rule, "id" | "createdAt" | "updatedAt"> & {
    statements: Array<
      Omit<RuleStatement, "id" | "ruleId" | "createdAt" | "updatedAt">
    >;
  };
}

type CreateRuleResponse = void;

export async function createRule({
  db,
  rule,
}: CreateRuleRequest): Promise<CreateRuleResponse> {
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

  queryClient.invalidateQueries({ queryKey: ["rules"] });
}
