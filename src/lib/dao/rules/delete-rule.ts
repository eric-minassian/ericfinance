import { ruleStatementsTable } from "@/lib/db/schema/rule-statements";
import { Rule, rulesTable } from "@/lib/db/schema/rules";
import { Database } from "@/lib/types";
import { eq } from "drizzle-orm";

export interface DeleteRuleParams {
  ruleId: Rule["id"];
}

export async function deleteRule(
  db: Database,
  params: DeleteRuleParams
): Promise<void> {
  await db.transaction(async (tx) => {
    await tx
      .delete(ruleStatementsTable)
      .where(eq(ruleStatementsTable.ruleId, params.ruleId));

    await tx.delete(rulesTable).where(eq(rulesTable.id, params.ruleId));
  });
}
