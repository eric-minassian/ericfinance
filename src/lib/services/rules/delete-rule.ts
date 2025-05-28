import { queryClient } from "@/context/query";
import { ruleStatementsTable } from "@/lib/db/schema/rule-statements";
import { Rule, rulesTable } from "@/lib/db/schema/rules";
import { Database } from "@/lib/types";
import { eq } from "drizzle-orm";

interface DeleteRuleRequest {
  db: Database;
  id: Rule["id"];
}

type DeleteRuleResponse = void;

export async function deleteRule({
  db,
  id,
}: DeleteRuleRequest): Promise<DeleteRuleResponse> {
  await db.transaction(async (tx) => {
    await tx
      .delete(ruleStatementsTable)
      .where(eq(ruleStatementsTable.ruleId, id));

    await tx.delete(rulesTable).where(eq(rulesTable.id, id));
  });

  queryClient.invalidateQueries({ queryKey: ["rules"] });

  return;
}
