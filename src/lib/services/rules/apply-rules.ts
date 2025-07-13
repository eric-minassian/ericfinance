import { useDB } from "@/hooks/db";
import { listRules, ListRulesResult } from "@/lib/dao/rules/list-rules";
import {
  listTransactions,
  ListTransactionsResult,
} from "@/lib/dao/transactions/list-transactions";
import { Transaction, transactionsTable } from "@/lib/db/schema/transactions";
import { Database } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eq } from "drizzle-orm";

interface ApplyRulesRequest {
  db: Database;
  transactionIds?: Transaction["id"][];
}

type ApplyRulesResponse = void;

type RuleStatement = ListRulesResult["statements"][number];

function getFieldValue(
  transaction: ListTransactionsResult,
  field: string
): string | null {
  // Check if field exists as a direct column on the transaction
  switch (field.toLowerCase()) {
    case "amount":
      return transaction.amount?.toString() || null;
    case "date":
      return transaction.date?.toISOString() || null;
    case "payee":
      return transaction.payee || null;
    case "categoryid":
      return transaction.categoryId || null;
    default:
      // If not a direct column, check rawData JSON
      if (transaction.rawData) {
        try {
          return (transaction.rawData as Record<string, string>)[field] || null;
        } catch {
          return null;
        }
      }
      return null;
  }
}

function evaluateStatement(
  transaction: ListTransactionsResult,
  statement: RuleStatement
): boolean {
  const fieldValue = getFieldValue(transaction, statement.field);

  // Skip if field value is not found
  if (fieldValue === null) {
    return false;
  }

  const statementValue = statement.value;

  switch (statement.operator) {
    case "equals":
      return fieldValue === statementValue;
    case "not_equals":
      return fieldValue !== statementValue;
    case "contains":
      return fieldValue.includes(statementValue);
    case "not_contains":
      return !fieldValue.includes(statementValue);
    case "starts_with":
      return fieldValue.startsWith(statementValue);
    case "ends_with":
      return fieldValue.endsWith(statementValue);
    case "greater_than":
      return Number(fieldValue) > Number(statementValue);
    case "less_than":
      return Number(fieldValue) < Number(statementValue);
    case "greater_than_or_equals":
      return Number(fieldValue) >= Number(statementValue);
    case "less_than_or_equals":
      return Number(fieldValue) <= Number(statementValue);
    default:
      return false;
  }
}

function evaluateRule(
  transaction: ListTransactionsResult,
  rule: ListRulesResult
): boolean {
  return rule.statements.every((statement: RuleStatement) =>
    evaluateStatement(transaction, statement)
  );
}

export async function applyRules({
  db,
  transactionIds,
}: ApplyRulesRequest): Promise<ApplyRulesResponse> {
  const rules = await listRules(db);

  if (rules.length === 0) {
    return;
  }

  const transactions = await listTransactions(db, { transactionIds });

  for (const transaction of transactions) {
    for (const rule of rules) {
      if (evaluateRule(transaction, rule)) {
        const updateData: Partial<Transaction> = {};

        if (rule.updateField === "categoryId") {
          updateData.categoryId = rule.updateValue;
        } else if (rule.updateField === "payee") {
          updateData.payee = rule.updateValue;
        }

        if (Object.keys(updateData).length > 0) {
          await db
            .update(transactionsTable)
            .set(updateData)
            .where(eq(transactionsTable.id, transaction.id));
        }

        break;
      }
    }
  }
}

export async function applyRulesService(db: Database): Promise<void> {
  await applyRules({ db });
}

export function useApplyRules() {
  const { db } = useDB();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!db) throw new Error("Database not available");
      return await applyRulesService(db);
    },
    onSuccess: () => {
      // Invalidate all transaction-related queries to refresh UI
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
