import { TransactionsDao } from "@/lib/dao/transactions";
import { Transaction, transactionsTable } from "@/lib/db/schema/transactions";
import { Database } from "@/lib/types";
import { eq } from "drizzle-orm";
import { listRules } from "./list-rules";

interface ApplyRulesRequest {
  db: Database;
  transactionIds?: Transaction["id"][];
}

type ApplyRulesResponse = void;

function getFieldValue(
  transaction: Awaited<
    ReturnType<typeof TransactionsDao.listTransactions>
  >[number],
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
  transaction: Awaited<
    ReturnType<typeof TransactionsDao.listTransactions>
  >[number],
  statement: Awaited<ReturnType<typeof listRules>>[number]["statements"][number]
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
  transaction: Awaited<
    ReturnType<typeof TransactionsDao.listTransactions>
  >[number],
  rule: Awaited<ReturnType<typeof listRules>>[number]
): boolean {
  return rule.statements.every((statement) =>
    evaluateStatement(transaction, statement)
  );
}

export async function applyRules({
  db,
  transactionIds,
}: ApplyRulesRequest): Promise<ApplyRulesResponse> {
  const rules = await listRules({ db });

  if (rules.length === 0) {
    return;
  }

  const transactions = await TransactionsDao.listTransactions(db, {
    transactionIds,
  });

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
