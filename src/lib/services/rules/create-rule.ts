import {
  RuleStatement,
  ruleStatementsTable,
} from "@/lib/db/schema/rule-statements";
import { Rule, rulesTable } from "@/lib/db/schema/rules";
import { Database } from "@/lib/types";

interface CreateRuleRequest {
  db: Database;
  rule: Omit<Rule, "id"> & {
    statements: Array<Omit<RuleStatement, "id" | "ruleId">>;
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
}
