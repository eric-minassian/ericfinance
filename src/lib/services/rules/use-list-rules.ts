import { useDB } from "@/hooks/db";
import {
  RuleStatement,
  ruleStatementsTable,
} from "@/lib/db/schema/rule-statements";
import { Rule, rulesTable } from "@/lib/db/schema/rules";
import { useQuery } from "@tanstack/react-query";
import { eq, sql } from "drizzle-orm";

type ListRulesResponse = Array<
  Pick<Rule, "id" | "updateField" | "updateValue"> & {
    statements: Array<
      Pick<RuleStatement, "id" | "field" | "operator" | "value" | "ruleId">
    >;
  }
>;

export function useListRules() {
  const { db } = useDB();
  if (!db) throw new Error("Database is not initialized");

  return useQuery({
    queryKey: ["listRules"],
    queryFn: async (): Promise<ListRulesResponse> => {
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
    },
  });
}
