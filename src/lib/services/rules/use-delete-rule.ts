import { queryClient } from "@/context/query";
import { useDB } from "@/hooks/db";
import { ruleStatementsTable } from "@/lib/db/schema/rule-statements";
import { Rule, rulesTable } from "@/lib/db/schema/rules";
import { useMutation } from "@tanstack/react-query";
import { eq } from "drizzle-orm";

export function useDeleteRule() {
  const { db } = useDB();
  if (!db) throw new Error("Database is not initialized");

  return useMutation({
    mutationFn: async (id: Rule["id"]) => {
      await db.transaction(async (tx) => {
        await tx
          .delete(ruleStatementsTable)
          .where(eq(ruleStatementsTable.ruleId, id));

        await tx.delete(rulesTable).where(eq(rulesTable.id, id));
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listRules"] });
    },
  });
}
