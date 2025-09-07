import {
  RuleStatement,
  ruleStatementsTable,
} from "@/lib/db/schema/rule-statements";
import { Rule, rulesTable } from "@/lib/db/schema/rules";
import { Database } from "@/lib/types";

export interface CreateRuleParams {
  updateField: Rule["updateField"];
  updateValue: Rule["updateValue"];
  statements: Array<{
    field: RuleStatement["field"];
    operator: RuleStatement["operator"];
    value: RuleStatement["value"];
  }>;
}

export interface CreateRuleResult {
  id: Rule["id"];
}

export async function createRule(
  db: Database,
  { updateField, updateValue, statements }: CreateRuleParams
): Promise<CreateRuleResult> {
  return await db.transaction(async (tx) => {
    // Insert the rule
    const [rule] = await tx
      .insert(rulesTable)
      .values({
        updateField,
        updateValue,
      })
      .returning({ id: rulesTable.id });

    // Insert the rule statements
    if (statements.length > 0) {
      await tx.insert(ruleStatementsTable).values(
        statements.map((statement) => ({
          ruleId: rule.id,
          field: statement.field,
          operator: statement.operator,
          value: statement.value,
        }))
      );
    }

    return rule;
  });
}
