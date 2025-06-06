import {
  RuleStatement,
  ruleStatementsTable,
} from "@/lib/db/schema/rule-statements";
import { Rule, rulesTable } from "@/lib/db/schema/rules";
import { Database } from "@/lib/types";
import { eq, sql } from "drizzle-orm";

type Return = (Pick<Rule, "id" | "updateField" | "updateValue"> & {
  statements: Pick<RuleStatement, "id" | "field" | "operator" | "value">[];
})[];

export async function listRules(db: Database): Promise<Return> {
  const results = await db
    .select({
      id: rulesTable.id,
      updateField: rulesTable.updateField,
      updateValue: rulesTable.updateValue,
      statements: sql<string>`json_group_array(
      json_object(
        'id', ${ruleStatementsTable.id},
        'field', ${ruleStatementsTable.field},
        'operator', ${ruleStatementsTable.operator},
        'value', ${ruleStatementsTable.value}
      )
    )`,
    })
    .from(rulesTable)
    .leftJoin(
      ruleStatementsTable,
      eq(rulesTable.id, ruleStatementsTable.ruleId)
    )
    .groupBy(rulesTable.id);

  return results.map((row) => ({
    ...row,
    statements: JSON.parse(row.statements),
  }));
}
